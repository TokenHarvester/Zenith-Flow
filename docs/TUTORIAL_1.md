# Tutorial 1: Implementing Passkey Authentication with Lazorkit
**Time to Complete:** 20-25 minutes

**Difficulty:** Beginner to Intermediate

**Prerequisites:** Basic knowledge of React, TypeScript, and Solana concepts

## Table of Contents
1. Introduction
2. What Are Passkeys?
3. Architecture Overview
4. Setup & Configuration
5. Implementation Steps
6. Understanding the Code
7. Testing Your Implementation
8. Troubleshooting
9. Security Considerations
10. Next Steps

## Introduction
This tutorial teaches you how to implement passwordless authentication for Solana wallets using Lazorkit's passkey integration. By the end, you'll understand how to:

* ✅ Set up Lazorkit with Solana Wallet Adapter
* ✅ Create wallets using biometric authentication (Face ID/Touch ID/Windows Hello)
* ✅ Handle authentication flows and errors
* ✅ Manage wallet connection state
* ✅ Implement session persistence

### Why Passkeys Matter:
* 90% reduction in onboarding friction compared to seed phrases
* Hardware-level security via device secure enclave
* Web2-like UX with Web3-grade security
* No seed phrases to remember, lose, or steal

## What Are Passkeys?
### The Problem with Traditional Wallets
Traditional crypto wallets require users to:
1. Write down a 12-24 word seed phrase
2. Store it securely (often on paper)
3. Never lose it (can't be recovered)
4. Manually enter it to restore access

**Result:** Over 20% of crypto users have permanently lost access to their funds due to lost seed phrases.

### The Passkey Solution
Passkeys use the **WebAuthn standard** (the same technology banks use) to authenticate users:
```
┌─────────────────────────────────────────┐
│         User Wants to Connect           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│     Lazorkit Opens Biometric Prompt     │
│   (Face ID / Touch ID / Windows Hello)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Private Key Generated in Secure       │
│   Enclave (Never Leaves Device!)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Smart Wallet Created on Solana        │
│        (Program Derived Address)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           User Connected!               │
│     No Seed Phrase Required             │
└─────────────────────────────────────────┘
```

### Key Benefits:
* 🔐 Private keys stored in device secure enclave (hardware-level security)
* 👤 Familiar authentication (same as unlocking your phone)
* 🚫 Nothing to remember or write down
* ♻️ Built-in recovery mechanisms
* 🌍 Cross-platform (works on all modern devices)

## Architecture Overview
### The Integration Layers
ZenithFlow uses a layered architecture for maximum stability:
```
┌──────────────────────────────────────────────────┐
│         React Application (ZenithFlow)           │
├──────────────────────────────────────────────────┤
│    Solana Wallet Adapter (Standard Interface)    │
├──────────────────────────────────────────────────┤
│     Lazorkit Wallet Adapter (Our Integration)    │
├──────────────────────────────────────────────────┤
│        Lazorkit SDK (Passkey + Smart Wallet)     │
├──────────┬────────────┬──────────────────────────┤
│ WebAuthn │ Solana RPC │    Lazorkit Portal       │
│ Browser  │            │  (Authentication Server) │
└──────────┴────────────┴──────────────────────────┘
```

### Why Wallet Adapter?
We integrate Lazorkit through the Solana Wallet Adapter instead of using Lazorkit's direct provider because:
* ✅ Production Stability: Battle-tested by thousands of dApps
* ✅ Ecosystem Compatibility: Works with all Solana applications
* ✅ Extensibility: Easy to add other wallets (Phantom, Solflare, etc.)
* ✅ Future-Proof: Standard interface for the Solana ecosystem
* ✅ No Provider Bugs: Avoids initialization issues with direct integration

## Setup & Configuration
### 1. Install Dependencies

All dependencies are already included in `package.json`, but here's what you need:
```
{
  "dependencies": {
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/web3.js": "^1.95.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### 2. Environment Configuration

Create `.env` file (or use defaults):
```
# Solana RPC endpoint
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Lazorkit Portal (for passkey authentication)
VITE_IPFS_URL=https://portal.lazor.sh

# Lazorkit Paymaster (for gasless transactions)
VITE_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```
**Note:** No API key required! These endpoints work perfectly for development and testing.

### 3. HTTPS Setup (Critical!)

Passkeys only work over **HTTPS** or **localhost**. Your `vite.config.ts` should include:
```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(), // Required for Solana libraries
    basicSsl(),      // Enables HTTPS on localhost
  ],
  server: {
    https: true,     // Critical for passkeys!
  },
});
```

**Install SSL plugin:**
```
npm install -D @vitejs/plugin-basic-ssl
```

## Implementation Steps
### Step 1: Register Lazorkit as a Wallet Adapter
The first step is to register Lazorkit with the Wallet Adapter ecosystem. This makes it appear as an available wallet option.

**File:** `src/providers/WalletProvider.tsx`
```
import { useMemo, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Lazorkit registration function
import { registerLazorkitWallet } from '@lazorkit/wallet';

// Default CSS for wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  // 1. Configure Solana network (Devnet for development)
  const network = WalletAdapterNetwork.Devnet;
  
  // 2. Get RPC endpoint
  const endpoint = useMemo(
    () => import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl(network),
    [network]
  );

  // 3. Register Lazorkit wallet on component mount
  useEffect(() => {
    registerLazorkitWallet({
      rpcUrl: endpoint,
      portalUrl: import.meta.env.VITE_IPFS_URL || 'https://portal.lazor.sh',
      paymasterConfig: {
        paymasterUrl: import.meta.env.VITE_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
      },
      clusterSimulation: network,
    });
  }, [endpoint, network]);

  // 4. No need to explicitly list wallets - Lazorkit auto-registers
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### What's Happening Here:
