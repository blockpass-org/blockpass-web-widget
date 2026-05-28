// Types for the widget parameters
export interface BlockpassKYCConnectParams {
  clientId: string;
  url?: string;
  refId?: string;
  mainColor?: string;
  email?: string;
  token?: string;
}

export type BlockpassConnectData = {
  refId: string | null;
  blockPassID: string | null;
  status:
    | "notFound"
    | "incomplete"
    | "waiting"
    | "inreview"
    | "approve"
    | "review_requested"
    | "blocked";
};

export type WebSDKEvent =
  | "KYCConnectSuccess"
  | "KYCConnectCancel"
  | "KYCConnectClose"
  | "KYCConnectLoad"
  | "KYCConnectData";

// Types for event callbacks
export type KYCConnectCallback = () => void;
export type KYCConnectCallbackWithData = (data: BlockpassConnectData) => void;

type WebSDKEventMapType = {
  ["KYCConnectSuccess"]: KYCConnectCallback;
  ["KYCConnectCancel"]: KYCConnectCallback;
  ["KYCConnectClose"]: KYCConnectCallback;
  ["KYCConnectLoad"]: KYCConnectCallback;
  ["KYCConnectData"]: KYCConnectCallbackWithData;
};

export class BlockpassKYCConnect {
  private clientId: string;
  private refId: string;
  private url: string;
  private source: string;
  private container: HTMLDivElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private callbackKYCConnectSuccess:
    | WebSDKEventMapType["KYCConnectSuccess"]
    | null = null;
  private callbackKYCConnectCancel:
    | WebSDKEventMapType["KYCConnectCancel"]
    | null = null;
  private callbackKYCConnectClose:
    | WebSDKEventMapType["KYCConnectClose"]
    | null = null;
  private callbackKYCConnectLoad: WebSDKEventMapType["KYCConnectLoad"] | null =
    null;
  private callbackKYCConnectData: WebSDKEventMapType["KYCConnectData"] | null =
    null;

  constructor(params: BlockpassKYCConnectParams) {
    this.clientId = params.clientId;
    this.refId = params.refId ?? "";

    this.url = params.url ?? "https://identity.blockpass.org";
    this.source = this.url + `/?clientId=${this.clientId}&refId=${this.refId}`;

    if (params.mainColor !== undefined && params.mainColor !== "")
      this.source = this.source + `&mainColor=${params.mainColor}`;
    if (params.email !== undefined && params.email !== "")
      this.source = this.source + `&email=${encodeURIComponent(params.email)}`;
    if (params.token !== undefined && params.token !== "")
      this.source = this.source + `&token=${params.token}`;

    if (!this.clientId) throw new Error("missing clientId params");
  }

  startKYCConnect(): void {
    this._appendIframe();
    this._getEvents();
    this._deleteToken();
  }

  stopKYCConnect(): void {
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

  on<T extends WebSDKEvent>(event: T, callback: WebSDKEventMapType[T]): void {
    switch (event) {
      case "KYCConnectSuccess":
        this.callbackKYCConnectSuccess = callback as KYCConnectCallback;
        break;
      case "KYCConnectCancel":
        this.callbackKYCConnectCancel = callback as KYCConnectCallback;
        break;
      case "KYCConnectClose":
        this.callbackKYCConnectClose = callback as KYCConnectCallback;
        break;
      case "KYCConnectLoad":
        this.callbackKYCConnectLoad = callback as KYCConnectCallback;
        break;
      case "KYCConnectData":
        this.callbackKYCConnectData = callback;
        break;
    }
  }

  off(event: WebSDKEvent) {
    switch (event) {
      case "KYCConnectSuccess":
        this.callbackKYCConnectSuccess = null;
        break;
      case "KYCConnectCancel":
        this.callbackKYCConnectCancel = null;
        break;
      case "KYCConnectClose":
        this.callbackKYCConnectClose = null;
        break;
      case "KYCConnectLoad":
        this.callbackKYCConnectLoad = null;
        break;
      case "KYCConnectData":
        this.callbackKYCConnectData = null;
        break;
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
    this.source = this.url + "/?" + params;
  }

  private _onIframeMessageHandler = (event: MessageEvent) => {
    // Require the message to come from the exact iframe window we injected.
    // Object identity is harder to spoof than any origin string.
    if (!this.iframe || event.source !== this.iframe.contentWindow) {
      return;
    }

    const host = new URL("", event.origin).hostname;
    // Use a dot boundary so e.g. "evilblockpass.org" cannot pass the suffix check.
    if (host !== "blockpass.org" && !host.endsWith(".blockpass.org")) {
      console.warn(
        "Warning: A message from an unauthorized origin has been received"
      );
      return;
    }

    const data: WebSDKEvent | { event: WebSDKEvent } = event.data || {};

    if (data === "KYCConnectSuccess") {
      //trigger callback if exists
      if (typeof this.callbackKYCConnectSuccess === "function") {
        this.callbackKYCConnectSuccess();
      }
    }

    // Close iframe when user cancels
    else if (data === "KYCConnectCancel") {
      this.stopKYCConnect();
      //trigger callback if exists
      if (typeof this.callbackKYCConnectCancel === "function") {
        this.callbackKYCConnectCancel();
      }
    }

    // Close iframe when user closes
    else if (data === "KYCConnectClose") {
      this.stopKYCConnect();
      //trigger callback if exists
      if (typeof this.callbackKYCConnectClose === "function") {
        this.callbackKYCConnectClose();
      }
    }

    // Trigger iframe loaded callback
    else if (data === "KYCConnectLoad") {
      //trigger callback if exists
      if (typeof this.callbackKYCConnectLoad === "function") {
        this.callbackKYCConnectLoad();
      }
    }

    // Trigger iframe finished
    else if ((data as any).event === "KYCConnectData") {
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
