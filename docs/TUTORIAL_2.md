# Tutorial 2: Sending Gasless Transactions with Lazorkit
**Time to Complete:** 25-30 minutes

**Difficulty:** Intermediate

**Prerequisites:** Complete Tutorial 1 (Passkey Authentication)

## Table of Contents

1. Introduction
2. How Gasless Transactions Work
3. Architecture & Flow
4. Setup & Dependencies
5. Implementation Steps
6. Understanding the Code
7. Testing Transactions
8. Transaction Size Limits
9. Error Handling
10. Production Best Practices
11. Next Steps

##  Introduction
This tutorial teaches you how to send **gasless transactions** on Solana using Lazorkit's Paymaster service. Users will be able to send SOL and tokens without paying any gas fees!

### What You'll Learn:

* ✅ How Lazorkit Paymaster sponsors transaction fees
* ✅ Creating and sending Solana transactions
* ✅ Handling transaction confirmation and errors
* ✅ Working within transaction size limits
* ✅ Implementing production-ready payment forms

### Why Gasless Transactions Matter:

* **Eliminates #1 Web3 Adoption Barrier** - Understanding and paying gas fees
* **Enables Micro-Transactions** - Transactions under $0.01 become viable
* **Better Onboarding** - Users don't need SOL before transacting
* **90% Friction Reduction** - No "insufficient funds for gas" errors
* **Web2-like UX** - Users only see the amount they're sending

## How Gasless Transactions Work
### Traditional Solana Transaction
```
User Wants to Send 0.1 SOL
        ↓
Create Transaction Instruction
        ↓
Calculate Gas Fee (~0.000005 SOL)
        ↓
Check Balance:
  - Has 0.1 SOL? ❌ FAIL (need 0.100005)
  - Has 0.15 SOL? ✅ OK
        ↓
Deduct: 0.1 SOL (transfer) + 0.000005 SOL (gas)
        ↓
Final Balance: 0.049995 SOL
```

### Lazorkit Gasless Transaction
```
User Wants to Send 0.1 SOL
        ↓
Create Transaction Instruction
        ↓
Send to Lazorkit Paymaster
        ↓
Paymaster Adds Gas Fee Sponsor
  (Paymaster pays the 0.000005 SOL)
        ↓
Transaction Submitted to Solana
        ↓
Deduct: 0.1 SOL (transfer ONLY)
  Gas fee: $0 for user!
        ↓
Final Balance: 0.05 SOL (exactly 0.1 deducted)
```

### Economic Impact:

* Users save ~$0.000005 per transaction
* Apps can enable transactions < $0.01
* Better UX in developing markets
* Reduces onboarding complexity by 90%

## Architecture & Flow
### Complete Transaction Flow
```
┌─────────────────────────────────────────────────┐
│  1. User Initiates Transfer                     │
│     (Enter amount + recipient)                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Frontend Creates Transaction                │
│     (SystemProgram.transfer instruction)        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Wallet Adapter Requests Signature           │
│     (Triggers biometric confirmation)           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. User Approves with Face ID/Touch ID         │
│     (Private key signs in secure enclave)       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Transaction Sent to Lazorkit Paymaster      │
│     (Paymaster adds sponsor instruction)        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Transaction Submitted to Solana Network     │
│     (Paymaster pays gas, user pays transfer)    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  7. Transaction Confirmed On-Chain              │
│     (Returns signature for verification)        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  ✅ Success! User Paid $0 in Gas Fees!          │
└─────────────────────────────────────────────────┘
```

### Key Components

**1. Wallet Adapter** - Standard Solana wallet interface

**2. Lazorkit SDK** - Handles passkey signing

**3. Paymaster Service** - Sponsors gas fees

**4. Solana RPC** - Broadcasts transaction

**5. Smart Wallet (PDA)** - On-chain account

## Setup & Dependencies
### Required Imports
All these are already in your project, but here's what you need:
```
// Wallet integration
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Solana transaction building
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// UI components
import { useState } from 'react';
import { toast } from 'sonner';
```
### Environment Check
Ensure your `.env` includes the Paymaster URL:
```
# Lazorkit Paymaster (required for gasless transactions)
VITE_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

This should already be configured from Tutorial 1 in `WalletProvider.tsx:`
```
registerLazorkitWallet({
  rpcUrl: endpoint,
  portalUrl: import.meta.env.VITE_IPFS_URL,
  paymasterConfig: {
    paymasterUrl: import.meta.env.VITE_PAYMASTER_URL, // ← This enables gasless!
  },
});
```

## Implementation Steps
### Step 1: Create Payment Form Component
This component allows users to enter recipient address and amount.

**File:** `src/components/PaymentForm.tsx`
```
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { Send, Loader2, ExternalLink } from 'lucide-react';
import { ZenithButton } from './ui/ZenithButton';

export function PaymentForm() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  // Form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleSend = async () => {
    // Validation
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(recipient);
    } catch (error) {
      toast.error('Invalid recipient address');
      return;
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return;
    }

    // Warn about transaction size limits
    if (amountNum > 0.15) {
      toast.warning('Amounts over 0.15 SOL may fail due to size limits. Consider splitting into smaller transactions.');
    }

    setIsLoading(true);
    setTxSignature(null);

    try {
      // 1. Create transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports: amountNum * LAMPORTS_PER_SOL,
      });

      // 2. Create transaction
      const transaction = new Transaction().add(transferInstruction);

      // 3. Get latest blockhash (required for transaction)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // 4. Send transaction
      // Wallet Adapter automatically routes through Lazorkit Paymaster!
      const signature = await sendTransaction(transaction, connection);

      console.log('Transaction sent:', signature);
      toast.loading('Confirming transaction...');

      // 5. Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // 6. Success!
      setTxSignature(signature);
      toast.success('Transaction confirmed! Gas fee: $0 (sponsored by Lazorkit)');
      
      // Clear form
      setRecipient('');
      setAmount('');
      setMemo('');

    } catch (error: any) {
      console.error('Transaction error:', error);
      
      // User-friendly error messages
      if (error.message.includes('User rejected')) {
        toast.error('Transaction cancelled');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient balance');
      } else if (error.message.includes('Transaction too large')) {
        toast.error('Transaction too large. Try a smaller amount (< 0.15 SOL)');
      } else {
        toast.error('Transaction failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Send className="w-6 h-6 text-purple-400" />
        Send Payment (Gasless!)
      </h2>

      <div className="space-y-4">
        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address *
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (SOL) *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-400 mt-1">
            Recommended: 0.01 - 0.15 SOL (larger amounts may fail)
          </p>
        </div>

        {/* Memo (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment description"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
        </div>

        {/* Send Button */}
        <ZenithButton
          onClick={handleSend}
          disabled={isLoading || !recipient || !amount}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Payment (Gas Free!)
            </>
          )}
        </ZenithButton>

        {/* Success Message */}
        {txSignature && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">
              ✅ Transaction Confirmed!
            </p>
            <p className="text-sm text-gray-300 mb-3">
              Gas fee paid: <span className="text-green-400 font-bold">$0.00</span> (sponsored by Lazorkit)
            </p>
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              View on Solana Explorer
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <p className="text-sm text-purple-200">
            💡 <strong>Gasless Transactions:</strong> You only pay the amount you send. Gas fees are sponsored by Lazorkit Paymaster!
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Add to Dashboard
**File:** `src/components/Dashboard.tsx`
```
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletCard } from './WalletCard';
import { PaymentForm } from './PaymentForm';
import { BrandStory } from './BrandStory';
import { FeatureCards } from './FeatureCards';

export function Dashboard() {
  const { publicKey, disconnect } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Zenith<span className="text-purple-400">Flow</span> Dashboard
          </h1>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Wallet Info */}
          <WalletCard />
          
          {/* Payment Form */}
          <PaymentForm />
        </div>

        {/* Additional Sections */}
        <FeatureCards />
        <BrandStory />
      </div>
    </div>
  );
}
```
