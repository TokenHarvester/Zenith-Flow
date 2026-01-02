import { useWallet } from "@solana/wallet-adapter-react";
import { PasskeyGateway } from "../components/PasskeyGateway";
import { Dashboard } from "../components/Dashboard";

export default function Index() {
    const { connected } = useWallet()

    // Show PasskeyGateway if not connected, Dashboard if connected
    if(!connected) {
        return <PasskeyGateway />;
    }

    return <Dashboard />;
}