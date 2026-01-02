import React from "react";
import { LazorkitProvider } from "@lazorkit/wallet";

interface ZenithProviderProps {
    children: React.ReactNode;
}

export function ZenithProvider({ children }: ZenithProviderProps) {
    return (
        <LazorkitProvider
            rpcUrl={import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'}
            ipfsUrl={import.meta.env.VITE_IPFS_URL || 'https://portal.lazor.sh'}
            paymasterUrl={import.meta.env.VITE_PAYMASTER_URL || 'https://lazorkit-paymaster.onrender.com'}
        >
            {children}
        </LazorkitProvider>
    );
}