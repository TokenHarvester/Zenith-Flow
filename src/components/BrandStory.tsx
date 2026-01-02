import { motion } from "framer-motion";
import { Sparkles, Target, Rocket } from "lucide-react";

export function BrandStory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl p-8 border-gradient"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-zenith flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground">The ZenithFlow Vision</h3>
      </div>

      {/* Story Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* The Problem */}
        <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold text-foreground">The Problem</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Blockchain in 2025 still feels like 2015. Users face{" "}
            <span className="text-foreground font-medium">seed phrases</span>,{" "}
            <span className="text-foreground font-medium">gas fee confusion</span>, and{" "}
            <span className="text-foreground font-medium">mandatory app downloads</span>. 
            The peak experience remains unreachable for most.
          </p>
        </div>

        {/* Our Solution */}
        <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Our Zenith</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ZenithFlow demonstrates what's possible:{" "}
            <span className="text-accent font-medium">passkey authentication</span> via Lazorkit,{" "}
            <span className="text-accent font-medium">gasless transactions</span>, and{" "}
            <span className="text-accent font-medium">session persistence</span>. 
            This is the peak—where technology disappears.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-5 rounded-xl bg-secondary/50 border border-border/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-foreground font-medium mb-1">
              Built with Lazorkit SDK
            </p>
            <p className="text-sm text-muted-foreground">
              This demo showcases how developers can implement passkey-native Solana 
              applications that turn every device into a secure hardware wallet.
            </p>
          </div>
          <a
            href="https://docs.lazorkit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-zenith text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Explore Lazorkit
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 rounded-xl bg-secondary/30">
          <p className="text-2xl font-bold gradient-zenith-text">0</p>
          <p className="text-xs text-muted-foreground">Seed Phrases</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-secondary/30">
          <p className="text-2xl font-bold gradient-zenith-text">$0</p>
          <p className="text-xs text-muted-foreground">Gas Fees</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-secondary/30">
          <p className="text-2xl font-bold gradient-zenith-text">∞</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </div>
      </div>
    </motion.div>
  );
}