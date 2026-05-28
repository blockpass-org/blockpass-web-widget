import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { BlockpassKYCConnect } from "../src/widget";

describe("BlockpassKYCConnect", () => {
  let widget: BlockpassKYCConnect;
  let lastIframe: { setAttribute: ReturnType<typeof mock> };
  const mockClientId = "test-client-id";
  const mockRefId = "test-ref-id";
  const mockEmail = "test@example.com";
  const mockToken = "test-token";
  const mockMainColor = "#FF0000";
  const mockCustomUrl = "https://identity.blockpass.org";

  const getIframeSrc = (): string => {
    const srcCall = lastIframe.setAttribute.mock.calls.find(
      (c: any[]) => c[0] === "src"
    );
    if (!srcCall) throw new Error("iframe src was not set");
    return srcCall[1];
  };

  // The message handler checks event.source === this.iframe.contentWindow.
  // Tests that invoke the handler directly need to stub both sides.
  const stubIframeWindow = (w: BlockpassKYCConnect): object => {
    const fakeWindow = {};
    (w as any).iframe = { contentWindow: fakeWindow };
    return fakeWindow;
  };

  beforeEach(() => {
    // Mock window and document objects
    global.window = {
      ...global.window,
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      Error: Error,
    } as any;

    lastIframe = undefined as any;
    global.document = {
      ...global.document,
      createElement: mock((tagName: string) => {
        const element = {
          setAttribute: mock(() => {}),
          remove: mock(() => {}),
          focus: mock(() => {}),
          appendChild: mock(() => element),
        };
        if (tagName === "iframe") lastIframe = element as any;
        return element;
      }),
      querySelector: mock(() => null),
      querySelectorAll: mock(() => []),
      body: {
        appendChild: mock(() => {}),
      },
    } as any;
  });

  afterEach(() => {
    // Clean up any remaining iframes
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => iframe.remove());
  });

  test("should throw error when clientId is missing", () => {
    expect(() => new BlockpassKYCConnect({ clientId: "" })).toThrow(
      "missing clientId params"
    );
  });

  test("should build correct iframe URL with default parameters", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    widget.startKYCConnect();

    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(document.createElement).toHaveBeenCalledWith("iframe");
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function)
    );
  });

  test("should build correct iframe URL with all parameters", () => {
    widget = new BlockpassKYCConnect({
      clientId: mockClientId,
      refId: mockRefId,
      email: mockEmail,
      token: mockToken,
      mainColor: mockMainColor,
      url: mockCustomUrl,
    });
    widget.startKYCConnect();

    expect(document.createElement).toHaveBeenCalledWith("div");
    expect(document.createElement).toHaveBeenCalledWith("iframe");
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function)
    );
  });

  test("should include email in iframe src when provided", () => {
    widget = new BlockpassKYCConnect({
      clientId: mockClientId,
      email: mockEmail,
    });
    widget.startKYCConnect();

    expect(getIframeSrc()).toContain(
      `email=${encodeURIComponent(mockEmail)}`
    );
  });

  test("should include email when value is the literal string 'undefined'", () => {
    // Regression: a prior check `params.email != "undefined"` silently dropped
    // emails that happened to equal the string "undefined".
    widget = new BlockpassKYCConnect({
      clientId: mockClientId,
      email: "undefined",
    });
    widget.startKYCConnect();

    expect(getIframeSrc()).toContain("email=undefined");
  });

  test("should omit email param when not provided or empty", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    widget.startKYCConnect();
    expect(getIframeSrc()).not.toContain("email=");

    lastIframe = undefined as any;
    const widget2 = new BlockpassKYCConnect({
      clientId: mockClientId,
      email: "",
    });
    widget2.startKYCConnect();
    expect(getIframeSrc()).not.toContain("email=");
  });

  test("should include refId, mainColor and token in iframe src when provided", () => {
    widget = new BlockpassKYCConnect({
      clientId: mockClientId,
      refId: mockRefId,
      mainColor: mockMainColor,
      token: mockToken,
    });
    widget.startKYCConnect();

    const src = getIframeSrc();
    expect(src).toContain(`clientId=${mockClientId}`);
    expect(src).toContain(`refId=${mockRefId}`);
    expect(src).toContain(`mainColor=${mockMainColor}`);
    expect(src).toContain(`token=${mockToken}`);
  });

  test("should handle KYCConnectSuccess message", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    const fakeWindow = stubIframeWindow(widget);
    const successCallback = mock(() => {});
    widget.on("KYCConnectSuccess", successCallback);

    // Simulate message event
    const event = new MessageEvent("message", {
      origin: "https://identity.blockpass.org",
      data: "KYCConnectSuccess",
      source: fakeWindow as any,
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(successCallback).toHaveBeenCalledTimes(1);
  });

  test("should handle KYCConnectData message", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    const fakeWindow = stubIframeWindow(widget);
    const dataCallback = mock(() => {});
    widget.on("KYCConnectData", dataCallback);

    const mockData = {
      refId: "test-ref",
      blockPassID: "test-id",
      status: "approve",
    };

    // Simulate message event
    const event = new MessageEvent("message", {
      origin: "https://identity.blockpass.org",
      data: {
        event: "KYCConnectData",
        payload: mockData,
      },
      source: fakeWindow as any,
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(dataCallback).toHaveBeenCalledTimes(1);
    expect(dataCallback).toHaveBeenCalledWith(mockData);
  });

  test("should ignore messages from unauthorized origins", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    const fakeWindow = stubIframeWindow(widget);
    const successCallback = mock(() => {});
    widget.on("KYCConnectSuccess", successCallback);

    // Simulate message event from unauthorized origin (but with valid source)
    const event = new MessageEvent("message", {
      origin: "https://malicious-site.com",
      data: "KYCConnectSuccess",
      source: fakeWindow as any,
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(successCallback).not.toHaveBeenCalled();
  });

  test("should ignore messages from hosts that merely end with 'blockpass.org'", () => {
    // Regression: a prior check used endsWith("blockpass.org") with no dot
    // boundary, so e.g. "evilblockpass.org" would have passed.
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    const fakeWindow = stubIframeWindow(widget);
    const successCallback = mock(() => {});
    widget.on("KYCConnectSuccess", successCallback);

    const event = new MessageEvent("message", {
      origin: "https://evilblockpass.org",
      data: "KYCConnectSuccess",
      source: fakeWindow as any,
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(successCallback).not.toHaveBeenCalled();
  });

  test("should ignore messages whose source is not the iframe window", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    stubIframeWindow(widget);
    const successCallback = mock(() => {});
    widget.on("KYCConnectSuccess", successCallback);

    // Origin is fine, but source points at a different window object.
    const event = new MessageEvent("message", {
      origin: "https://identity.blockpass.org",
      data: "KYCConnectSuccess",
      source: {} as any,
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(successCallback).not.toHaveBeenCalled();
  });

  test("should clean up event listeners and iframe on stopKYCConnect", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    widget.startKYCConnect();

    widget.stopKYCConnect();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function)
    );
  });
});
