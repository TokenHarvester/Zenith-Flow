import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, CheckCircle, Zap, AlertCircle } from "lucide-react";
import { ZenithButton } from "./ui/ZenithButton";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

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

    // Transaction Submission
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
            // Validate recipient address
            let recipientPubkey: PublicKey;
            try {
                recipientPubkey = new PublicKey(recipient);
            } catch (err) {
                throw new Error('Invalid recepient address format');
            }

            // Convert amount to Lamports
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error('Invalid amount');
            }
            if (amountNum > 0.5) {
                throw new Error('Maximum 0.5 SOL for demo purposes');
            } 

            const lamports = Math.floor(amountNum * LAMPORTS_PER_SOL);

            console.log('🚀 Creating transaction...');
            console.log('From:', publicKey.toString());
            console.log('To:', recipient);
            console.log('Amount:', amountNum, 'SOL')

            // Create transaction
            const transaction = new Transaction(). add(
              SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPubkey,
                lamports: lamports,
              })                
            );

            // Send Transaction via Wallet Adapter
            console.log('✍️ Sending transaction...')
            const signature = await sendTransaction(transaction, connection);

            console.log('⏳ Confirming transaction...');
            await connection.confirmTransaction(signature, 'confirmed');

            console.log('✅ Transaction successful!');
            console.log('Signature:', signature);

            setTxSignature(signature);
            setSuccess(true);

            // Reset Form
            setRecipient("");
            setAmount("");
            setMemo("");

            // Clear success message after 8 seconds
            setTimeout(() => {
                setSuccess(false);
                setTxSignature(null);
            }, 8000);

        } catch (err) {
            console.error('❌ Transaction failed:', err);

            // Error Messages 
            let errorMessage ='Transaction failed';
            if (err instanceof Error) {
                if (err.message.includes('User rejected')) {
                    errorMessage = 'You cancelled the transaction';
                } else if (err.message.includes('Invalid')) {
                    errorMessage = err.message;
                } else if (err.message.includes('Insufficient')) {
                    errorMessage = 'Insufficient SOL balance';
                } else {
                    errorMessage = err.message;
                }
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-zenith flex items-center justify-center">
          <Send className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Send Payment</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent" />
            Gasless SOL Transfer (Demo)
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-4 mb-4 rounded-xl bg-green-500/10 border border-green-500/20"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-500">Payment Sent!</p>
            <p className="text-xs text-green-500/70 mt-1">No gas fees charged ✨</p>
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

      {/* Error Message */}
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
          </div>
        </motion.div>
      )}

      {/* Form */}
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
            Paste a valid Solana address (e.g., 7xKXtg2CW87...)
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
            Max 0.5 SOL for demo. Get devnet SOL from the wallet card above.
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
              Send Payment (No Gas Fees)
            </>
          )}
        </ZenithButton>

        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            ⚡ Gas fees sponsored by Lazorkit Paymaster
          </p>
          <p className="text-xs text-muted-foreground/70">
            You'll be prompted for biometric confirmation
          </p>
        </div>
      </form>
    </motion.div>
  );
}