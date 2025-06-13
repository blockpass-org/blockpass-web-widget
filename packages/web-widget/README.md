## Usage

### Installation

First, install the package in your project:

```bash
# npm install @blockpass/web-widget
bun add @blockpass/web-widget
```

### Basic Usage

Here's how to integrate the Blockpass Web Widget into your React application:

```tsx
import { BlockpassKYCConnect } from "@blockpass/web-widget";

// Create a component that uses the widget
const ConnectBtn = ({ clientId }: { clientId: string }) => {
  const [webSdk, setWebSdk] = useState<BlockpassKYCConnect | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initialize the widget with your client ID
    const webSdk = new BlockpassKYCConnect({
      clientId,
      mainColor: "black", // Optional: customize the widget's main color
    });
    setWebSdk(webSdk);

    // Set up event listeners
    webSdk.on("KYCConnectLoad", () => {
      setIsLoading(false);
    });
    webSdk.on("KYCConnectData", (data) => {
      console.log("KYC data received:", data);
    });
  }, [clientId]);

  const onClick = () => {
    webSdk?.startKYCConnect();
    setIsLoading(true);
  };

  return (
    <button onClick={onClick} disabled={isLoading}>
      {isLoading ? "Loading..." : "Start KYC"}
    </button>
  );
};
```

### Configuration Options

The `BlockpassKYCConnect` constructor accepts the following options:

- `clientId` (required): Your Blockpass client ID
- `mainColor` (optional): Customize the widget's main color (default: "black")
- `refId`: (optional): Merchant reference ID
- `email`: (optional): Prefilled email change

### Event Handlers

The widget provides several event handlers that you can listen to:

- `KYCConnectLoad`: Triggered when the widget is fully loaded
- `KYCConnectData`: Triggered when KYC data is received from the user
