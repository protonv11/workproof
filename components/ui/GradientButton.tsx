"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "success" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-accent-violet via-accent-cyan to-accent-magenta text-white",
  success: "bg-gradient-to-r from-accent-green to-accent-cyan text-white",
  danger: "bg-gradient-to-r from-accent-amber to-red-500 text-white",
  ghost: "glass text-text-primary",
};

type GradientButtonProps = HTMLMotionProps<"button"> & {
  variant?: Variant;
};

export function GradientButton({
  className,
  variant = "primary",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className={cn(
        "relative rounded-xl px-5 py-2.5 text-sm font-medium shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-opacity disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
