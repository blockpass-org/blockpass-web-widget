import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { BlockpassKYCConnect } from "../src/widget";

describe("BlockpassKYCConnect", () => {
  let widget: BlockpassKYCConnect;
  const mockClientId = "test-client-id";
  const mockRefId = "test-ref-id";
  const mockEmail = "test@example.com";
  const mockToken = "test-token";
  const mockMainColor = "#FF0000";
  const mockCustomUrl = "https://identity.blockpass.org";

  beforeEach(() => {
    // Mock window and document objects
    global.window = {
      ...global.window,
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      Error: Error,
    } as any;

    global.document = {
      ...global.document,
      createElement: mock((tagName: string) => {
        const element = {
          setAttribute: mock(() => {}),
          remove: mock(() => {}),
          focus: mock(() => {}),
          appendChild: mock(() => element),
        };
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

  test("should handle KYCConnectSuccess message", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    const successCallback = mock(() => {});
    widget.on("KYCConnectSuccess", successCallback);

    // Simulate message event
    const event = new MessageEvent("message", {
      origin: "https://identity.blockpass.org",
      data: "KYCConnectSuccess",
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(successCallback).toHaveBeenCalledTimes(1);
  });

  test("should handle KYCConnectData message", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
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
    });

    // @ts-ignore - accessing private method for testing
    widget._onIframeMessageHandler(event);

    expect(dataCallback).toHaveBeenCalledTimes(1);
    expect(dataCallback).toHaveBeenCalledWith(mockData);
  });

  test("should ignore messages from unauthorized origins", () => {
    widget = new BlockpassKYCConnect({ clientId: mockClientId });
    const successCallback = mock(() => {});
    widget.on("KYCConnectSuccess", successCallback);

    // Simulate message event from unauthorized origin
    const event = new MessageEvent("message", {
      origin: "https://malicious-site.com",
      data: "KYCConnectSuccess",
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
