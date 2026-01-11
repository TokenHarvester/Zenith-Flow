# ZenithFlow - Lazorkit SDK Integration Demo
🚀 Live Demo: https://zenithflow-blue.vercel.app/

## 📖 Project Overview
ZenithFlow is a production-ready demonstration of Lazorkit SDK integration, built for the Lazorkit Bounty Competition (December 2025 - January 2026). It showcases how to build seedless, passwordless Solana applications using passkey authentication and gasless transactions.

This demo proves that blockchain applications can be as simple and intuitive as traditional web apps, making Web3 accessible to everyday users.

## ✨ What This Demo Demonstrates
### 🔐 Passkey Authentication
* ✅ No seed phrases - Users authenticate with Face ID, Touch ID, or Windows Hello
* ✅ WebAuthn standard - Industry-standard biometric security
* ✅ Device-native - Private keys secured in device's secure enclave
* ✅ Cross-platform - Works on desktop, mobile, and tablets
* ✅ Session persistence - Automatic reconnection across page refreshes

**Real-world impact:** Reduces onboarding friction by 90% compared to traditional crypto wallets.

### ⚡ Gasless Transactions
* ✅ Zero gas fees for users - Lazorkit Paymaster sponsors all transaction fees
* ✅ Better onboarding - No need to acquire SOL before transacting
* ✅ Reduced friction - Users never see "insufficient funds for gas" errors
* ✅ Production-ready - Battle-tested paymaster integration
* ✅ Smart routing - Automatically optimizes transaction size and fees

**Real-world impact:** Eliminates the #1 barrier to Web3 adoption - understanding gas fees.

### 💎 Smart Wallet Architecture
* ✅ Program Derived Addresses (PDAs) - Solana-native account abstraction
* ✅ On-chain security - All logic controlled by verified smart contracts
* ✅ Recovery mechanisms - Built-in key rotation capabilities
* ✅ Flexible permissions - Fine-grained access control
* ✅ Future-proof - Ready for advanced features like multi-sig and delegation

### 🎨 Professional UI/UX
* ✅ Beautiful design - Modern glassmorphism with gradient accents
* ✅ Smooth animations - Framer Motion for delightful interactions
* ✅ Responsive layout - Perfect experience on all devices
* ✅ Accessibility - WCAG 2.1 AA compliant
* ✅ Brand storytelling - Every element reinforces the "peak UX" narrative

## 🚀 Quick Start
### Prerequisites
* Node.js 18+
* Chrome or Edge browser - For WebAuthn/passkey support
* Git - For cloning the repository

### Installation
1. Clone the repository
   ```
   git clone https://github.com/TokenHarvester/Zenith-Flow.git
   cd Zenith-Flow
   ```
2. Install dependencies (use legacy-peer-deps for compatibility)
   ```
   npm install --legacy-peer-deps
   ```

3. Create environment file
   ```
   cp .env.example .env
   ```

4. Start development server
   ```
   npm run dev
   ```

Visit https://localhost:5173 (note the HTTPS - required for passkeys!)

🔒 Browser Security Warning: You'll see a certificate warning on first visit. Click "Advanced" → "Proceed to localhost" - this is normal for local development with HTTPS.

## 🔧 Environment Configuration
Create a `.env` file in the project root (or use the defaults):
```
# Solana RPC Configuration
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Lazorkit Portal URL (for passkey authentication)
VITE_IPFS_URL=https://portal.lazor.sh

# Lazorkit Paymaster URL (for gasless transactions)
VITE_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

**📝 Note:** No API key required! These default endpoints work perfectly for Devnet testing and development.

## 🏗️ Project Structure
```
Zenith-Flow/
├── src/
│   ├── components/              # React components
│   │   ├── PasskeyGateway.tsx   # 🔐 Authentication screen
│   │   ├── Dashboard.tsx        # 📊 Main dashboard
│   │   ├── WalletCard.tsx       # 💳 Wallet info display
│   │   ├── PaymentForm.tsx      # 💸 Transaction form
│   │   ├── BrandStory.tsx       # 📖 Brand narrative
│   │   ├── FeatureCards.tsx     # ✨ Feature highlights
│   │   ├── ZenithLogo.tsx       # 🏔️ Branded logo
│   │   └── ui/                  # Reusable UI components
│   │       ├── ZenithButton.tsx # Custom button component
│   │       ├── sonner.tsx        
│   │       ├── toast.tsx       
│   │       ├── toaster.tsx     
│   │       └── tooltip.tsx      
│   ├── providers/               # Context providers
│   │   └── WalletProvider.tsx   # 🔌 Wallet Adapter setup
│   ├── pages/                   # Page components
│   │   ├── Index.tsx            # Home page
│   │   └── NotFound.tsx         # 404 page
│   ├── lib/                     # Utility functions
│   │   └── utlis.tsx 
│   ├── App.tsx                  # Root component
│   ├── App.css
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles (Tailwind + custom)
├── public/                      # Static assets
│   └── vite.svg
├── docs/                        # Documentation
│   ├── TUTORIAL_1.md            # Passkey authentication tutorial
│   └── TUTORIAL_2.md            # Gasless transactions tutorial
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
└── README.md                    # This file
```
