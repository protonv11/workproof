"use client";

import { motion } from "framer-motion";
import { CircleDollarSign, FileCheck2, ShieldCheck, ShieldAlert, Clock3 } from "lucide-react";
import type { ProofEvent } from "@/lib/types";

const eventMeta: Record<
  ProofEvent["type"],
  { icon: typeof CircleDollarSign; color: string; label: string }
> = {
  funded: { icon: CircleDollarSign, color: "var(--accent-cyan)", label: "Milestone funded" },
  delivered: { icon: FileCheck2, color: "var(--accent-violet)", label: "Proof delivered" },
  approved: { icon: ShieldCheck, color: "var(--accent-green)", label: "Approved & released" },
  disputed: { icon: ShieldAlert, color: "var(--accent-amber)", label: "Disputed" },
  timeout_released: { icon: Clock3, color: "var(--accent-green)", label: "Timeout auto-release" },
};

export function ProofTrail({ events }: { events: ProofEvent[] }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-violet via-accent-cyan to-accent-magenta opacity-40" />
      <div className="flex flex-col gap-6">
        {events.map((event, i) => {
          const meta = eventMeta[event.type];
          const Icon = meta.icon;
          const isLast = i === events.length - 1;
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 140, damping: 16 }}
              className="relative"
            >
              <div
                className={`absolute -left-8 top-0 flex h-8 w-8 items-center justify-center rounded-full glass ${
                  isLast ? "animate-pulse" : ""
                }`}
                style={{ boxShadow: `0 0 14px ${meta.color}` }}
              >
                <Icon size={14} style={{ color: meta.color }} />
              </div>
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="text-xs text-text-muted">
                Milestone {event.milestoneIndex + 1} ·{" "}
                {new Date(event.createdAt).toLocaleString()}
              </p>
              {event.message && (
                <p className="mt-1 text-xs text-text-muted italic">&quot;{event.message}&quot;</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
