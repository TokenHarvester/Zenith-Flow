import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LazorkitProvider } from '@lazorkit/wallet';

// 🔥 FIX: Memoize the config to prevent re-renders
const lazorkitConfig = {
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  ipfsUrl: import.meta.env.VITE_IPFS_URL || 'https://portal.lazor.sh',
  paymasterUrl: import.meta.env.VITE_PAYMASTER_URL || 'https://lazorkit-paymaster.onrender.com',
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LazorkitProvider {...lazorkitConfig}>
      <App />
    </LazorkitProvider>
  </StrictMode>
);