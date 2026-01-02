import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const zenithButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-zenith text-primary-foreground shadow-lg hover:shadow-[0_0_40px_-8px_hsl(var(--zenith-purple)/0.6)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-muted hover:border-muted-foreground/20",
        outline:
          "border-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary",
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground",
        cyan:
          "bg-accent text-accent-foreground shadow-lg hover:shadow-[0_0_40px_-8px_hsl(var(--zenith-cyan)/0.6)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ZenithButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
      VariantProps<typeof zenithButtonVariants> {
    asChild?: boolean;
}

const ZenithButton = React.forwardRef<HTMLButtonElement, ZenithButtonProps>(
    ({ className, variant, size, asChild = false, ...props}, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
               className={cn(zenithButtonVariants({ variant, size, className }))}
               ref={ref}
               {...props}
            />   
        );
    }
);
ZenithButton.displayName = "ZenithButton";

export { ZenithButton, zenithButtonVariants };