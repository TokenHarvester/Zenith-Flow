import { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Loader2, Shield, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { ZenithButton } from "./ui/ZenithButton";
import { ZenithLogo } from "./ZenithLogo";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function PasskeyGateway() {
    const { select, wallets, connect, connecting } = useWallet();
    const { setVisible } = useWalletModal();
    const [error, setError] = useState<string | null>(null);

    // Find Lazorkit Wallet
    const lazorKitWallet = wallets.find(w =>
        w.adapter.name.toLowerCase().includes('lazorKit') ||
        w.adapter.name.toLowerCase().includes('lazor')
    );

    const handleConnect = async () => {
        setError(null);
        try {
            if (lazorKitWallet) {
                // Select and connect to Lazorkit
                select(lazorKitWallet.adapter.name);
                await connect();
            } else {
                // Show wallet modal if Lazorkit not found
                setVisible(true);
            }
        } catch (err) {
            console.error('❌ Connection failed:', err)
            setError(err instanceof Error ? err.message: 'Failed to connect');
        }
    };

    const features = [
        {
            icon: Shield,
            title: "Biometric Security",
            description: "Your keys, secured by FaceID or TouchID",
        },
        {
            icon: Zap,
            title: "Zero Gas Fees",
            description: "Send USDC without holding SOL",
        },
        {
            icon: RefreshCw,
            title: "Session Persistence",
            description: "Stay connected across devices",
        },
    ];

    return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="floating-orb w-[600px] h-[600px] bg-zenith-purple/30 -top-64 -left-64 animate-pulse-glow" />
      <div className="floating-orb w-[500px] h-[500px] bg-zenith-cyan/20 -bottom-48 -right-48" style={{ animationDelay: "2s" }} />
      <div className="floating-orb w-[300px] h-[300px] bg-zenith-purple/20 top-1/2 right-1/4" style={{ animationDelay: "4s" }} />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <ZenithLogo size="lg" />
          </motion.div>

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Peak Payment Experience
            </h2>
            <p className="text-muted-foreground text-sm">
              No seed phrases. No wallet apps. Just biometrics.
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-4 rounded-xl bg-destructive/10 border border-destructive/20"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Connection Failed</p>
                <p className="text-xs text-destructive/70 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ZenithButton
              className="w-full"
              size="lg"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Fingerprint />
                  Connect with Lazorkit
                </>
              )}
            </ZenithButton>

            {!lazorKitWallet && (
              <p className="text-xs text-center text-muted-foreground">
                💡 Lazorkit wallet will appear after registration
              </p>
            )}
          </motion.div>

          <motion.div
            className="grid gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-zenith-subtle flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 pt-6 border-t border-border/50 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-muted-foreground">
              ✨ Powered by{" "}
              <span className="text-accent font-medium">Lazorkit SDK</span>
              {" "}on Solana
            </p>
          </motion.div>
        </div>

        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Solana Devnet
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}