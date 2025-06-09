import { useEffect, useState } from "react";
import "./index.css";

import { BlockpassKYCConnect } from "@blockpass/web-widget/src";

const ConnectBtn = ({ clientId }: { clientId: string }) => {
  const [webSdk, setWebSdk] = useState<BlockpassKYCConnect | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const webSdk = new BlockpassKYCConnect({
      clientId,
      mainColor: "black",
    });
    setWebSdk(webSdk);

    webSdk.on("KYCConnectLoad", () => {
      setIsLoading(false);
    });
    webSdk.on("KYCConnectData", (data) =>
      console.log("onData", clientId, data)
    );
  }, [setWebSdk, clientId, setIsLoading]);

  const onClick = () => {
    webSdk?.startKYCConnect();
    setIsLoading(true);
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: isLoading ? "#6c757d" : "#007bff",
        color: "white",
        cursor: isLoading ? "not-allowed" : "pointer",
        margin: "5px",
      }}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : `ClientId: ${clientId}`}
    </button>
  );
};

export function App() {
  return (
    <div className="app">
      <h1>KYCC Web Demo</h1>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <ConnectBtn clientId="blockpass_sales_demo" />
        <ConnectBtn clientId="andq_production_service_8de94" />
      </div>
    </div>
  );
}

export default App;
