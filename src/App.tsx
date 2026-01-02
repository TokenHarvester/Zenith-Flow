import { useWallet } from "@lazorkit/wallet";
import { PasskeyGateway } from "./components/PasskeyGateway";
import { Dashboard } from "./components/Dashboard";

function App() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      {!isConnected ? <PasskeyGateway /> : <Dashboard />}
    </div>
  );
}

export default App;