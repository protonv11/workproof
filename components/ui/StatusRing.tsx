"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MilestoneStatus =
  | "pending"
  | "funded"
  | "delivered"
  | "approved"
  | "disputed";

const statusConfig: Record<MilestoneStatus, { pct: number; color: string; label: string }> = {
  pending: { pct: 10, color: "#9a9ab0", label: "Pending" },
  funded: { pct: 35, color: "#06b6d4", label: "Funded" },
  delivered: { pct: 65, color: "#7c3aed", label: "Delivered" },
  approved: { pct: 100, color: "#10b981", label: "Approved" },
  disputed: { pct: 50, color: "#f59e0b", label: "Disputed" },
};

export function StatusRing({
  status,
  size = 56,
}: {
  status: MilestoneStatus;
  size?: number;
}) {
  const { pct, color, label } = statusConfig[status];
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--glass-border)"
          strokeWidth={4}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: "spring", stiffness: 80, damping: 18 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span
        className={cn(
          "absolute text-[9px] font-medium uppercase tracking-wide",
          status === "disputed" && "animate-pulse"
        )}
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
