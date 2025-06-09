// Types for the widget parameters
export interface BlockpassKYCConnectParams {
  clientId: string;
  url?: string;
  refId?: string;
  elementId?: string;
  mainColor?: string;
  email?: string;
  token?: string;
}

// Types for event callbacks
export type KYCConnectCallback = (data?: any) => void;

export class BlockpassKYCConnect {
  private clientId: string;
  private refId: string;
  private elementId: string;
  private url: string;
  private source: string;
  private button: HTMLElement | null = null;
  private html: HTMLHtmlElement;
  private body: HTMLBodyElement;
  private header: HTMLHeadElement;
  private link: HTMLLinkElement;
  private container: HTMLDivElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private callbackKYCConnectSuccess: KYCConnectCallback | null = null;
  private callbackKYCConnectCancel: KYCConnectCallback | null = null;
  private callbackKYCConnectClose: KYCConnectCallback | null = null;
  private callbackKYCConnectLoad: KYCConnectCallback | null = null;
  private callbackKYCConnectData: KYCConnectCallback | null = null;

  constructor(
    params: BlockpassKYCConnectParams = {
      clientId: "",
      url: "https://identity.blockpass.org",
      refId: "",
      elementId: "blockpass-kyc-connect",
      mainColor: "",
      email: "",
      token: "",
    }
  ) {
    this.clientId = params.clientId;
    this.refId = params.refId ?? "r" + Date.now();

    this.elementId = params.elementId ?? "blockpass-kyc-connect";
    this.url = params.url ?? "https://identity.blockpass.org";
    this.source = this.url + `/?clientId=${this.clientId}&refId=${this.refId}`;

    if (params.mainColor !== undefined && params.mainColor !== "")
      this.source = this.source + `&mainColor=${params.mainColor}`;
    if (
      params.email != "undefined" &&
      params.email !== undefined &&
      params.email !== ""
    )
      this.source = this.source + `&email=${encodeURIComponent(params.email)}`;
    if (params.token !== undefined && params.token !== "")
      this.source = this.source + `&token=${params.token}`;

    if (!this.clientId) throw new Error("missing clientId params");

    this.button = document.getElementById(this.elementId);
    this.html = document.getElementsByTagName("html")[0] as HTMLHtmlElement;
    this.body = document.getElementsByTagName("body")[0] as HTMLBodyElement;

    // Prerender the web widget
    this.header = document.getElementsByTagName("head")[0] as HTMLHeadElement;
    this.link = document.createElement("link");
    this.link.setAttribute("rel", "prerender");
    this.link.setAttribute("href", this.source);
    this.header.appendChild(this.link);

    if (!this.button)
      throw new Error(
        'Cannot find the button with id="' +
          this.elementId +
          '". Please add it in your html <body>'
      );
  }

  startKYCConnect(): void {
    // remove previous listener if exists
    const button = document.getElementById(this.elementId);
    if (button) {
      button.removeEventListener("click", this._onBtnClickHandler);
      // open iframe when button is clicked
      button.addEventListener("click", this._onBtnClickHandler);
    }
  }

  stopKYCConnect(): void {
    // Revert style
    this.html.style.removeProperty("overflow");
    this.body.style.removeProperty("overflow");
    this.html.style.removeProperty("margin");
    this.body.style.removeProperty("margin");

    // Remove child
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    // Cleanup EventListener
    window.removeEventListener("message", this._onIframeMessageHandler);
  }

  on(event: string, callback: KYCConnectCallback): void {
    if (event === "KYCConnectSuccess") {
      this.callbackKYCConnectSuccess = callback;
    }
    if (event === "KYCConnectCancel") {
      this.callbackKYCConnectCancel = callback;
    }
    if (event === "KYCConnectClose") {
      this.callbackKYCConnectClose = callback;
    }
    if (event === "KYCConnectLoad") {
      this.callbackKYCConnectLoad = callback;
    }
    if (event === "KYCConnectData") {
      this.callbackKYCConnectData = callback;
    }
  }

  private _appendIframe(): void {
    this.container = document.createElement("div");
    this.container.setAttribute(
      "style",
      "z-index: 99999999999; width: 100%; height: 100%; overflow-y: auto; position: fixed; top: 0px; left: 0px; -webkit-overflow-scrolling: touch; line-height: 0;"
    );
    document.body.appendChild(this.container);

    this.iframe = document.createElement("iframe");
    this.html.style.overflow = "hidden";
    this.body.style.overflow = "hidden";
    this.body.style.margin = "0";

    this.iframe.setAttribute("src", this.source);
    this.iframe.setAttribute("allowtransparency", "true");
    this.iframe.setAttribute("frameborder", "none");
    this.iframe.setAttribute("allow", "camera");
    this.iframe.setAttribute("border", "0");
    this.iframe.setAttribute("resize", "none");
    this.iframe.setAttribute("id", "blockpass-kyc-web");
    this.iframe.setAttribute(
      "style",
      "z-index: 99999999999; width: 100%; height: 100%; overflow-x: hidden; overflow-y: auto; visibility: visible; margin: 0px; padding: 0px; border-color: transparent; border-width: 0; border-style: none; left: 0px; top: 0px; -webkit-tap-highlight-color: transparent;"
    );

    this.container.appendChild(this.iframe).focus();
  }

  private _getEvents(): void {
    window.addEventListener("message", this._onIframeMessageHandler);
  }

  private _deleteToken(): void {
    let new_url = new URL(this.source);
    let params = new URLSearchParams(new_url.search.slice(1));
    params.delete("token");
    new_url = this.url + "/?" + params;
    this.source = new_url.toString();
  }

  private _onBtnClickHandler = (event: MouseEvent) => {
    this._appendIframe();
    this._getEvents();
    this._deleteToken();
  };

  private _onIframeMessageHandler = (event: MessageEvent) => {
    const eventOrigin = new URL("", event.origin);
    if (!eventOrigin.hostname.endsWith("blockpass.org")) {
      console.warn(
        "Warning: A message from an unauthorized origin has been received"
      );
      return;
    }

    const data = event.data || {};

    if (data === "KYCConnectSuccess") {
      //trigger callback if exists
      if (typeof this.callbackKYCConnectSuccess === "function") {
        this.callbackKYCConnectSuccess(
          this.getProp(data, "payload.customData.extraData", {})
        );
      }
    }

    // Close iframe when user cancels
    if (data === "KYCConnectCancel") {
      this.stopKYCConnect();
      //trigger callback if exists
      if (typeof this.callbackKYCConnectCancel === "function") {
        this.callbackKYCConnectCancel();
      }
    }

    // Close iframe when user closes
    if (data === "KYCConnectClose") {
      this.stopKYCConnect();
      //trigger callback if exists
      if (typeof this.callbackKYCConnectClose === "function") {
        this.callbackKYCConnectClose();
      }
    }

    // Trigger iframe loaded callback
    if (data === "KYCConnectLoad") {
      //trigger callback if exists
      if (typeof this.callbackKYCConnectLoad === "function") {
        this.callbackKYCConnectLoad();
      }
    }

    if (data.event === "KYCConnectData") {
      const payload = this.getProp(data, "payload", {});
      if (typeof this.callbackKYCConnectData === "function") {
        this.callbackKYCConnectData(payload);
      }
    }
  };

  private getProp(object: any, keys: string | string[], defaultVal: any): any {
    keys = Array.isArray(keys) ? keys : keys.split(".");
    if (!object || typeof object !== "object") return defaultVal;
    const key = keys[0];
    if (key === undefined) return defaultVal;
    object = object[key];
    if (object && keys.length > 1) {
      return this.getProp(object, keys.slice(1), defaultVal);
    }
    return object === undefined ? defaultVal : object;
  }
}
