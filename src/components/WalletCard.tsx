import { motion } from "framer-motion";
import { Copy, RefreshCw, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export function WalletCard() {
  const { publicKey, connected } = useWallet();

  const [balance, setBalance] = useState<number>(0);
  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Balanca Fetching from Solana
  const fetchBalance = async () => {
    if (!publicKey) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const connection = new Connection(
        import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      );

      const pubkey = new PublicKey(publicKey);
      const balanceLamports = await connection.getBalance(pubkey);
      setBalance(balanceLamports / LAMPORTS_PER_SOL);

      setUsdcBalance(0); // For demo keeping as 0 until USDC is added

      console.log('✅ Balance fetched:', balanceLamports / LAMPORTS_PER_SOL, 'SOL');
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      setError('Failed to fetch balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch balance on mount and when wallet changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey]);

  // Handle copy address
  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchBalance();
  };

  // Truncate address for display
  const truncatedAddress = publicKey
  ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`
  :'Loading...';

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6 bg-gradient-zenith"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-primary-foreground/80 text-sm font-medium">
              Connected
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors disabled:opacity-50"
            disabled={isRefreshing}
            title="Refresh balance"
          >
            <RefreshCw
              className={`w-4 h-4 text-primary-foreground ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Address */}
        <div className="mb-6">
          <p className="text-primary-foreground/60 text-xs mb-1">Wallet Address</p>
          <div className="flex items-center gap-2">
            <code className="text-primary-foreground font-mono text-sm">
              {truncatedAddress}
            </code>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              disabled={!publicKey}
              title="Copy full address"
            >
              <Copy className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
            {copied && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-300"
              >
                Copied!
              </motion.span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-primary-foreground/60 text-xs mb-1">SOL Balance</p>
            <p className="text-primary-foreground text-2xl font-bold">
              {balance.toFixed(4)}
            </p>
            <p className="text-primary-foreground/60 text-xs">SOL</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-primary-foreground/60 text-xs mb-1">USDC Balance</p>
            <p className="text-primary-foreground text-2xl font-bold">
              ${usdcBalance.toFixed(2)}
            </p>
            <p className="text-primary-foreground/60 text-xs">USDC</p>
          </div>
        </div>

        {/* Get Devnet SOL Button */}
        <a
          href="https://faucet.solana.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 mb-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm text-primary-foreground/80 hover:text-primary-foreground"
        >
          Get Devnet SOL
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Explorer Link */}
        {publicKey && (
          <a
            href={`https://explorer.solana.com/address/${publicKey}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            View on Solana Explorer
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}