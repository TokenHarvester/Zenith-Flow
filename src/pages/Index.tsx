import { useWallet } from "@lazorkit/wallet";
import { PasskeyGateway } from "../components/PasskeyGateway";
import { Dashboard } from "../components/Dashboard";

export default function Index() {
    const { isConnected } = useWallet()

    // Show PasskeyGateway if not connected, Dashboard if connected
    if(!isConnected) {
        return <PasskeyGateway />;
    }

    return <Dashboard />;
}