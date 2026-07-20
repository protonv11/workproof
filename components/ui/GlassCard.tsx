"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLMotionProps<"div"> & {
  hoverTilt?: boolean;
  glowBorder?: boolean;
};

export function GlassCard({
  className,
  children,
  hoverTilt = false,
  glowBorder = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "glass rounded-2xl",
        glowBorder && "gradient-border",
        className
      )}
      whileHover={
        hoverTilt
          ? { rotateX: -2, rotateY: 2, scale: 1.01, transition: { type: "spring", stiffness: 200, damping: 16 } }
          : undefined
      }
      style={{ transformStyle: "preserve-3d", ...props.style }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
