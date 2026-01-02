import type { FC, ReactNode } from "react";
import { useMemo, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { registerLazorkitWallet } from "@lazorkit/wallet";
import '@solana/wallet-adapter-react-ui/styles.css'

// Lazorkit Configuration
const CONFIG = {
    RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    PORTAL_URL: import.meta.env.VITE_IPFS_URL || "https://portal.lazor.sh",
    PAYMASTER: {
        paymasterUrl: import.meta.env.VITE_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
    },
    CLUSTER: 'devnet' as const,
};

interface WalletContextProviderProps {
    children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
    // Register lazorkit once on mount
    useEffect(() => {
        console.log('Registering Lazorkit Wallet...');
        try {
            registerLazorkitWallet({
                rpcUrl: CONFIG.RPC_URL,
                portalUrl: CONFIG.PORTAL_URL,
                paymasterConfig: CONFIG.PAYMASTER,
                clusterSimulation: CONFIG.CLUSTER,
            });
            console.log('✅ Lazorkit registered successfully');
        } catch (error) {
            console.error('❌ Falied to register Lazorkit:', error);    
        }
    }, []);

    // Wallet array- Lazorkit will be automatically detected
    const wallets = useMemo(() => [], []);

    return (
        <ConnectionProvider endpoint={CONFIG.RPC_URL}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};