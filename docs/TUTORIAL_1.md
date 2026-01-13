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
1. `registerLazorkitWallet()`: This function registers Lazorkit as an available wallet in the Wallet Adapter system. It needs to run once when your app starts.
2. `paymasterConfig`: Enables gasless transactions (covered in Tutorial 2)
3. `autoConnect: true`: Automatically reconnects users if they have an existing session
4. Empty `wallets` array: Lazorkit self-registers, so we don't need to manually add it to the list

### Step 2: Wrap Your App with WalletProvider
**File:** `src/App.tsx`
```
import { AppWalletProvider } from './providers/WalletProvider';
import { Index } from './pages/Index';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AppWalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </Router>
    </AppWalletProvider>
  );
}

export default App;
```

### Step 3: Create Authentication Component
This is the main component users interact with to connect their wallet.

**File:** src/components/PasskeyGateway.tsx
```
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { Mountain, Shield, Zap, Users } from 'lucide-react';
import { ZenithLogo } from './ZenithLogo';

export function PasskeyGateway({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { connected, connecting, wallet } = useWallet();
  const [isChecking, setIsChecking] = useState(true);

  // Check connection status and redirect if connected
  useEffect(() => {
    if (connected) {
      // User is authenticated, transition to dashboard
      onAuthenticated();
    }
    setIsChecking(false);
  }, [connected, onAuthenticated]);

  if (isChecking || connecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <ZenithLogo className="w-24 h-24" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ZenithFlow</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Experience the peak of Web3 UX. No seed phrases. No gas fees. Just seamless blockchain interactions.
          </p>

          {/* Connect Button */}
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-pink-600 hover:!from-purple-600 hover:!to-pink-700 !rounded-xl !px-8 !py-4 !text-lg !font-semibold !transition-all !duration-300 !shadow-lg hover:!shadow-xl" />
          </div>

          <p className="text-sm text-gray-400 mt-4">
            🔐 Secured by {wallet ? wallet.adapter.name : 'Lazorkit'} • No seed phrases required
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-purple-400" />}
            title="Passkey Security"
            description="Face ID, Touch ID, or Windows Hello authentication"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-400" />}
            title="Gasless Transactions"
            description="Zero gas fees for all transactions"
          />
          <FeatureCard
            icon={<Mountain className="w-8 h-8 text-blue-400" />}
            title="Peak UX"
            description="Web2 simplicity meets Web3 power"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-green-400" />}
            title="For Everyone"
            description="No technical knowledge required"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
```
