import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { ZenithButton } from "./ui/ZenithButton";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

export function PaymentForm() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setError(null);
    setSuccess(false);
    setIsProcessing(true);
    setTxSignature(null);

    try {
      // Validate recipient
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch (err) {
        throw new Error('Invalid recipient address format');
      }

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }
      if (amountNum > 0.5) {
        throw new Error('Maximum 0.5 SOL for demo purposes');
      }
      
      const lamports = Math.floor(amountNum * LAMPORTS_PER_SOL);

      console.log('🚀 Creating transaction...');
      console.log('From:', publicKey.toBase58());
      console.log('To:', recipient);
      console.log('Amount:', amountNum, 'SOL');

      // 🔥 FIX: Create transaction instruction (but don't add blockhash yet)
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports: lamports,
      });

      console.log('✍️ Sending transaction...');
      
      try {
        // 🔥 FIX: Let Wallet Adapter handle the transaction construction
        // This ensures the blockhash is fresh when signing
        const transaction = new Transaction().add(transferInstruction);
        
        // 🔥 IMPORTANT: Don't set blockhash or feePayer here
        // The wallet adapter will handle it with a fresh blockhash
        
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        });
        
        console.log('📤 Transaction sent:', signature);
        console.log('⏳ Confirming transaction...');
        
        // Wait for confirmation with timeout
        const confirmationPromise = connection.confirmTransaction(signature, 'confirmed');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Confirmation timeout')), 30000)
        );
        
        await Promise.race([confirmationPromise, timeoutPromise]);
        
        console.log('✅ Transaction confirmed!');
        
        setTxSignature(signature);
        setSuccess(true);
        
        // Reset form
        setRecipient("");
        setAmount("");
        setMemo("");

        setTimeout(() => {
          setSuccess(false);
          setTxSignature(null);
        }, 8000);

      } catch (txError: any) {
        console.error('Transaction error:', txError);
        
        // Better error messages
        if (txError?.message?.includes('User rejected')) {
          throw new Error('You cancelled the transaction');
        } else if (txError?.message?.includes('Signing failed')) {
          throw new Error('Passkey authentication failed. Please try again.');
        } else if (txError?.message?.includes('insufficient')) {
          throw new Error('Insufficient SOL balance');
        } else if (txError?.message?.includes('blockhash')) {
          throw new Error('Transaction expired. Please try again.');
        } else {
          throw txError;
        }
      }

    } catch (err) {
      console.error('❌ Transaction failed:', err);
      
      let errorMessage = 'Transaction failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 8000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-zenith flex items-center justify-center">
          <Send className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Send Payment</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent" />
            Gasless SOL Transfer (via Lazorkit)
          </p>
        </div>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 mb-4 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-500">Payment Sent!</p>
            <p className="text-xs text-green-500/70 mt-1">Transaction confirmed ✨</p>
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-400 hover:text-green-300 underline mt-2 inline-flex items-center gap-1"
              >
                View on Solana Explorer
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 mb-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Transaction Failed</p>
            <p className="text-xs text-destructive/70 mt-1">{error}</p>
            <p className="text-xs text-destructive/50 mt-2">
              💡 Tip: Make sure to approve the passkey prompt when it appears
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana address..."
            required
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Paste a valid Solana address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount (SOL)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="0.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full px-4 py-3 pr-16 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              SOL
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Max 0.5 SOL for demo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Memo <span className="text-muted-foreground">(Optional)</span>
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment description..."
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <ZenithButton
          type="submit"
          className="w-full"
          size="lg"
          disabled={isProcessing || !publicKey}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" />
              Processing Transaction...
            </>
          ) : (
            <>
              <Send />
              Send Payment
            </>
          )}
        </ZenithButton>

        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            💡 You'll be prompted for biometric confirmation
          </p>
          <p className="text-xs text-muted-foreground/70">
            ⚡ Lazorkit enables gasless transactions
          </p>
        </div>
      </form>
    </motion.div>
  );
}