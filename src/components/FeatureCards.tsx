import { motion } from "framer-motion";
import { Shield, Zap, RefreshCw, Wallet } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Passkey Authentication",
    description: "No seed phrases. Secure authentication using device biometrics like FaceID or TouchID.",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
  },
  {
    icon: Zap,
    title: "Gasless Transactions",
    description: "Send USDC without worrying about SOL for gas fees. We handle it for you.",
    gradient: "from-cyan-500/20 to-cyan-600/10",
    iconColor: "text-cyan-400",
  },
  {
    icon: RefreshCw,
    title: "Session Persistence",
    description: "Stay connected across page refreshes with secure session storage.",
    gradient: "from-green-500/20 to-green-600/10",
    iconColor: "text-green-400",
  },
  {
    icon: Wallet,
    title: "Smart Wallet",
    description: "Program Derived Addresses (PDAs) enable advanced features without complexity.",
    gradient: "from-orange-500/20 to-orange-600/10",
    iconColor: "text-orange-400",
  },
];

export function FeatureCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          className="group glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300"
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
          </div>
          <h4 className="text-foreground font-semibold mb-2">{feature.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}