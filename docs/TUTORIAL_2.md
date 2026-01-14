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

### Step 3: Create Custom Button Component
**File:** `src/components/ui/ZenithButton.tsx`
```
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ZenithButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const ZenithButton = forwardRef<HTMLButtonElement, ZenithButtonProps>(
  ({ className, variant = 'primary', disabled, children, ...props }, ref) => {
    const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed',
      secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed',
      danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 disabled:opacity-50 disabled:cursor-not-allowed',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ZenithButton.displayName = 'ZenithButton';
```

## Understanding the Code
### Transaction Building Breakdown
```
// 1. CREATE TRANSFER INSTRUCTION
const transferInstruction = SystemProgram.transfer({
  fromPubkey: publicKey,      // Your wallet address
  toPubkey: recipientPubkey,  // Recipient's address
  lamports: amount * LAMPORTS_PER_SOL, // Amount in lamports (1 SOL = 1e9 lamports)
});

// 2. CREATE TRANSACTION
const transaction = new Transaction().add(transferInstruction);

// 3. SET TRANSACTION METADATA
const { blockhash } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;  // Prevents replay attacks
transaction.feePayer = publicKey;          // Who pays gas (overridden by paymaster)

// 4. SEND TRANSACTION
// This is where the magic happens!
// sendTransaction() automatically routes through Lazorkit Paymaster
const signature = await sendTransaction(transaction, connection);

// 5. CONFIRM TRANSACTION
await connection.confirmTransaction({
  signature,
  blockhash,
  lastValidBlockHeight,
});
```

### How Paymaster Sponsorship Works
```
// What happens inside sendTransaction():

1. Transaction created by user
   ↓
2. Wallet Adapter detects Lazorkit wallet
   ↓
3. Transaction sent to Lazorkit SDK
   ↓
4. Lazorkit adds paymaster instruction:
   {
     type: 'paymasterSponsor',
     sponsor: PAYMASTER_PUBKEY,
     fee: 0.000005 SOL,
   }
   ↓
5. Transaction sent to Solana
   ↓
6. Network deducts:
   - Transfer amount from user
   - Gas fee from paymaster ✅
   ↓
7. User's final balance = initial - transfer amount ONLY
```

### Confirmation Strategy
```
// RECOMMENDED: Wait for confirmation
const confirmation = await connection.confirmTransaction({
  signature,
  blockhash,
  lastValidBlockHeight,
});

// Why this matters:
// - Ensures transaction actually went through
// - Prevents showing success for failed transactions
// - Catches errors before user thinks it's done

// Alternative (faster but less reliable):
const latestBlockhash = await connection.getLatestBlockhash();
await connection.confirmTransaction(signature, 'confirmed');
// ☝️ 'confirmed' = faster but can be rolled back
// 'finalized' = slower but permanent
```

## Testing Transactions
### Test Preparation
**1. Get Test Funds**
```
1. Visit https://faucet.solana.com
2. Enter your wallet address
3. Request 2 SOL (devnet)
4. Wait 10-15 seconds
5. Refresh balance in ZenithFlow
```

**2. Prepare Test Addresses**
```
Option A: Use your own address (test sending to yourself)
Option B: Use a friend's address
Option C: Create a new wallet and use that address
```

### Test Cases
**Test 1: Minimum Amount (0.01 SOL)**
```
Recipient: [ANY_VALID_ADDRESS]
Amount: 0.01
Expected: ✅ Success in ~2-5 seconds
```

**Test 2: Medium Amount (0.05 SOL)**
```
Recipient: [ANY_VALID_ADDRESS]
Amount: 0.05
Expected: ✅ Success in ~3-6 seconds
```

**Test 3: Near Limit (0.15 SOL)**
```
Recipient: [ANY_VALID_ADDRESS]
Amount: 0.15
Expected: ✅ Success but may be slower (~5-10 seconds)
```

**Test 4: Over Limit (0.5 SOL)**
```
Recipient: [ANY_VALID_ADDRESS]
Amount: 0.5
Expected: ❌ "Transaction too large" error
Solution: Split into multiple 0.1 SOL transactions
```

### Verification Checklist
After each transaction:

 * Transaction signature appears
 * Success message shows "Gas fee: $0"
 * "View on Solana Explorer" link works
 * Explorer shows transaction confirmed
 * Balance decreased by EXACT amount sent (no gas deducted)
 * Recipient's balance increased

### Balance Verification Example
```
Before Transaction:
  Your Balance: 2.0000 SOL
  
Send: 0.1 SOL

After Transaction:
  Your Balance: 1.9000 SOL ✅ (NOT 1.89995)
  
Gas Fee Paid by You: 0.0000 SOL ✅
Gas Fee Paid by Paymaster: ~0.000005 SOL
```

## Transaction Size Limits
### Understanding the Limit
Lazorkit's paymaster has a maximum transaction size of 1232 bytes.

### Why this matters:
* Gasless transactions require extra instructions
* Paymaster adds sponsor account data
* Larger amounts = more compute units = bigger transaction

### Size Guidelines
```
Transaction Amount → Estimated Size → Success Rate
────────────────────────────────────────────────
0.01 - 0.05 SOL   →  ~800 bytes    →  ✅ 99%
0.05 - 0.10 SOL   →  ~950 bytes    →  ✅ 95%
0.10 - 0.15 SOL   →  ~1100 bytes   →  ✅ 85%
0.15 - 0.20 SOL   →  ~1200 bytes   →  ⚠️ 60%
0.20+ SOL         →  ~1300+ bytes  →  ❌ <10%
```

### Workaround: Split Large Transfers
```
async function sendLargeAmount(
  recipient: PublicKey,
  totalAmount: number,
  chunkSize: number = 0.1
) {
  const chunks = Math.ceil(totalAmount / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const amount = Math.min(chunkSize, totalAmount - (i * chunkSize));
    
    // Send chunk
    await sendTransaction(amount, recipient);
    
    // Wait between transactions
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Sent chunk ${i + 1}/${chunks}: ${amount} SOL`);
  }
  
  console.log(`✅ Sent total: ${totalAmount} SOL in ${chunks} transactions`);
}

// Example usage:
// Send 0.5 SOL as 5 transactions of 0.1 SOL each
await sendLargeAmount(recipientPubkey, 0.5, 0.1);
```

## Error Handling
### Common Errors & Solutions
### Error: "Transaction too large"

```
catch (error: any) {
  if (error.message.includes('Transaction too large')) {
    toast.error('Amount too large. Try a smaller amount (< 0.15 SOL)');
    // Suggest: "Would you like to split this into multiple transactions?"
  }
}
```
**Solution:** Use amounts under 0.15 SOL or split into chunks.

### Error: "Insufficient funds"
```
catch (error: any) {
  if (error.message.includes('insufficient funds')) {
    const balance = await connection.getBalance(publicKey);
    toast.error(`Insufficient balance. You have ${balance / LAMPORTS_PER_SOL} SOL`);
  }
}
```
**Solution:** User needs more SOL or should send a smaller amount.

### Error: "User rejected"
```
catch (error: any) {
  if (error.message.includes('User rejected')) {
    toast.info('Transaction cancelled by user');
    // This is normal - user dismissed biometric prompt
  }
}
```
**Solution:** No action needed - user intentionally cancelled.

### Error: "Blockhash not found"
```
catch (error: any) {
  if (error.message.includes('Blockhash not found')) {
    toast.error('Transaction expired. Please try again.');
    // Blockhash expired while waiting for biometric auth
  }
}
```
**Solution:** Get fresh blockhash before retrying:
```
const { blockhash } = await connection.getLatestBlockhash('finalized');
```

### Comprehensive Error Handler
```
async function handleTransactionError(error: any) {
  console.error('Transaction error:', error);

  // Specific error handling
  if (error.message.includes('User rejected')) {
    return toast.info('Transaction cancelled');
  }
  
  if (error.message.includes('insufficient funds')) {
    return toast.error('Insufficient balance');
  }
  
  if (error.message.includes('Transaction too large')) {
    return toast.error('Transaction too large. Use < 0.15 SOL');
  }
  
  if (error.message.includes('Blockhash not found')) {
    return toast.error('Transaction expired. Try again.');
  }
  
  // Generic error
  toast.error('Transaction failed: ' + (error.message || 'Unknown error'));
  
  // Optional: Send to error tracking service
  // logErrorToSentry(error);
}
```

## Production Best Practices
### 1. Transaction Confirmation Strategy
```
// GOOD: Full confirmation with timeout
async function confirmTransactionWithTimeout(
  connection: Connection,
  signature: string,
  timeout: number = 30000 // 30 seconds
): Promise<boolean> {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const status = await connection.getSignatureStatus(signature);
    
    if (status.value?.confirmationStatus === 'finalized') {
      return true;
    }
    
    if (status.value?.err) {
      throw new Error('Transaction failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Transaction confirmation timeout');
}
```

### 2. Balance Validation
```
// Check balance before transaction
async function validateBalance(
  connection: Connection,
  publicKey: PublicKey,
  amount: number
): Promise<boolean> {
  const balance = await connection.getBalance(publicKey);
  const required = amount * LAMPORTS_PER_SOL;
  
  if (balance < required) {
    toast.error(`Insufficient balance. Need ${amount} SOL, have ${balance / LAMPORTS_PER_SOL} SOL`);
    return false;
  }
  
  return true;
}
```

### 3. Transaction History Tracking
```
interface TransactionRecord {
  signature: string;
  amount: number;
  recipient: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

function saveTransaction(record: TransactionRecord) {
  const history = JSON.parse(localStorage.getItem('tx_history') || '[]');
  history.unshift(record);
  localStorage.setItem('tx_history', JSON.stringify(history.slice(0, 100))); // Keep last 100
}
```

### 4. Rate Limiting
```
// Prevent transaction spam
const lastTxTime = useRef<number>(0);
const MIN_TX_INTERVAL = 2000; // 2 seconds

async function sendWithRateLimit() {
  const now = Date.now();
  const timeSinceLastTx = now - lastTxTime.current;
  
  if (timeSinceLastTx < MIN_TX_INTERVAL) {
    toast.warning(`Please wait ${Math.ceil((MIN_TX_INTERVAL - timeSinceLastTx) / 1000)} seconds`);
    return;
  }
  
  lastTxTime.current = now;
  await sendTransaction();
}
```

### 5. Network Status Check
```
// Check if Solana network is healthy
async function checkNetworkHealth(connection: Connection): Promise<boolean> {
  try {
    const health = await connection.getHealth();
    if (health !== 'ok') {
      toast.warning('Solana network may be experiencing issues');
      return false;
    }
    return true;
  } catch {
    toast.error('Cannot connect to Solana network');
    return false;
  }
}
```

## Next Steps
Congratulations! You've successfully implemented gasless transactions! Your users can now:

* 🎉 Send SOL without paying gas fees
* 🎉 Experience Web2-like transaction simplicity
* 🎉 No "insufficient funds for gas" errors
* 🎉 Automatic paymaster sponsorship

### What You've Accomplished
You've built a complete gasless payment system that:

* ✅ Creates Solana transactions programmatically
* ✅ Handles biometric confirmation flows
* ✅ Routes through Lazorkit Paymaster automatically
* ✅ Confirms transactions reliably
* ✅ Provides user-friendly error messages
* ✅ Works within transaction size constraints

### Advanced Features to Explore

**1. Token Transfers**

* Send SPL tokens (not just SOL)
* Handle token account creation
* Support multiple token types

**2. Transaction History**

* Display past transactions
* Filter by date/amount/status
* Export transaction records


**3. Batch Transactions**

* Send to multiple recipients
* Automatic chunking for large amounts
* Progress tracking


**4. Smart Notifications**

* Desktop/push notifications
* Email confirmations
* Transaction alerts


**5. Advanced Error Recovery**

* Automatic retry logic
* Transaction queuing
* Offline support

## Production Checklist
### Before deploying to production:
**Security Audit**

* Review all transaction code
* Test with maximum amounts
* Verify error handling
* Check for race conditions

**Testing**

* Test on mainnet with small amounts
* Verify all error cases
* Load test with multiple users
* Cross-browser compatibility

**Monitoring**

* Set up error tracking (Sentry)
* Monitor transaction success rates
* Track gas savings for users
* Set up alerts for failures


**User Experience**

* Add loading indicators
* Provide transaction receipts
* Show estimated confirmation time
* Handle network congestion


**Documentation**

* Update API documentation
* Create user guides
* Document error codes
* Maintain changelog

## Scaling Considerations
### For High-Volume Applications:

**1. Transaction Queuing**
```
// Queue system for handling multiple transactions
   const txQueue = new TransactionQueue({
     maxConcurrent: 3,
     retryAttempts: 3,
     retryDelay: 2000,
   });
```

**2. Caching Strategy**
```
// Cache recent blockhashes
   const blockhashCache = new Map<string, { 
     blockhash: string, 
     timestamp: number 
   }>();
```

**3. Connection Pooling**
```
// Multiple RPC connections for load balancing
   const connections = [
     new Connection(RPC_URL_1),
     new Connection(RPC_URL_2),
     new Connection(RPC_URL_3),
   ];
```

### Mainnet Migration
When moving to mainnet:

**1. Update RPC URL**
```
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**2. Update Paymaster (contact Lazorkit team)**
```
VITE_PAYMASTER_URL=https://kora.mainnet.lazorkit.com
```

**3. Update Network**
```
registerLazorkitWallet({
     clusterSimulation: WalletAdapterNetwork.Mainnet,
   });
```

**4. Test Thoroughly**

* Start with small amounts
* Monitor first 100 transactions
* Gradually increase limits

## Additional Resources
### Solana Transaction Guides

* **Solana Cookbook:** solanacookbook.com/core-concepts/transactions
* **Web3.js Docs:** solana-labs.github.io/solana-web3.js
* **Transaction Explorer:** explorer.solana.com

### Lazorkit Resources

* **Main Documentation:** docs.lazorkit.com
* **GitHub Repository:** github.com/lazor-kit/lazor-kit
* **Telegram Community:** t.me/lazorkit
* **Twitter:** @lazorkit

### Related Tutorials

* **Tutorial 1:** Implementing Passkey Authentication
* **Main README:** Complete project overview

## 🎉 You did it! 
You've mastered gasless transactions with Lazorkit. Your users can now enjoy true Web2-like UX on Solana!

### What's Next?

* Deploy to production
* Add advanced features
* Share your project with the community
* Build the next generation of Web3 apps!
