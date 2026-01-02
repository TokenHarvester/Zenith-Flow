import { motion } from "framer-motion";

interface ZenithLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 32, text: "text-lg" },
  md: { icon: 48, text: "text-2xl" },
  lg: { icon: 64, text: "text-3xl" },
  xl: { icon: 80, text: "text-4xl" },
};

export function ZenithLogo({ size = "md", showText = true }: ZenithLogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      {/* Animated Logo Icon */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div
          className="relative flex items-center justify-center rounded-2xl bg-gradient-zenith p-2"
          style={{ width: icon, height: icon }}
        >
          {/* Peak/Mountain SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-primary-foreground"
          >
            <motion.path
              d="M12 3L20 21H4L12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <motion.path
              d="M12 8L16 16H8L12 8Z"
              fill="currentColor"
              fillOpacity="0.3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            />
          </svg>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-zenith opacity-50 blur-xl -z-10" />
        </div>
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <span className={`font-outfit font-bold ${text} gradient-zenith-text`}>
            Zenith
          </span>
          <span className={`font-outfit font-light ${text} text-foreground`}>
            Flow
          </span>
        </motion.div>
      )}
    </div>
  );
}