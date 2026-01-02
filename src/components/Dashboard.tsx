import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { ZenithLogo } from "./ZenithLogo";
import { WalletCard } from "./WalletCard"; 
import { PaymentForm } from "./PaymentForm";
import { FeatureCards } from "./FeatureCards";
import { BrandStory } from "./BrandStory";
import { ZenithButton } from "./ui/ZenithButton";
import { useWallet } from "@solana/wallet-adapter-react";

export function Dashboard() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Lazorkit Disconnect
    const { disconnect } = useWallet();

    // Disconnect Handler
    const handleDisconnect = async () => {
        try {
            await disconnect();
        } catch (error) {
            console.error('❌ Disconnect failed:', error);
        }
    };

    return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb w-[500px] h-[500px] bg-zenith-purple/10 -top-48 -right-48" />
        <div className="floating-orb w-[400px] h-[400px] bg-zenith-cyan/10 bottom-0 left-0" style={{ animationDelay: "3s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <ZenithLogo size="sm" />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Solana Devnet
              </div>
              {/* 🔥 REAL DISCONNECT BUTTON */}
              <ZenithButton
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </ZenithButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 pb-2 border-t border-border/50 mt-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Solana Devnet
                </div>
                <ZenithButton
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </ZenithButton>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Payment Dashboard
          </h1>
          <p className="text-muted-foreground">
            Experience gasless SOL transfers on Solana Devnet
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 🔥 WALLET CARD - FETCHES REAL DATA */}
          <div className="lg:col-span-1">
            <WalletCard />
          </div>

          {/* 🔥 PAYMENT FORM - SENDS REAL TRANSACTIONS */}
          <div className="lg:col-span-2">
            <PaymentForm />
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Key Features
          </h2>
          <FeatureCards />
        </motion.div>

        {/* Brand Story Section */}
        <BrandStory />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Built for the{" "}
            <span className="text-accent font-medium">Lazorkit SDK Bounty</span>
            {" "}· Demonstrating peak Solana UX
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <a
              href="https://docs.lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Lazorkit Docs
            </a>
            <a
              href="https://github.com/lazor-kit/lazor-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://t.me/lazorkit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Telegram
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}