import { useWallet } from "@lazorkit/wallet";
import { useMemo } from "react";

export function useZenithWallet() {
    const wallet = useWallet();

    // Enhanced wallet state with ZenithFlow branding
    const zenithState = useMemo(() => ({
        // Core wallet state 
        smartWalletPubkey: wallet.smartWalletPubkey,
        isConnected: wallet.isConnected,
        isLoading: wallet.isLoading || wallet.isConnecting,
        isSigning: wallet.isSigning,
        error: wallet.error,

        // Wallet actions
        connect: wallet.connect,
        disconnect: wallet.disconnect,
        signTransaction: wallet.signTransaction,
        signAndSendTransaction: wallet.signAndSendTransaction
    }), [wallet]);

    return zenithState;
}