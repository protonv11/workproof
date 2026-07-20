"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldAlert, Upload, Wallet, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { StatusRing } from "@/components/ui/StatusRing";
import type { Milestone } from "@/lib/types";
import { useWallet } from "@/lib/wallet-context";

export function MilestoneCard({
  milestone,
  onAction,
}: {
  milestone: Milestone;
  onAction: (action: "fund" | "deliver" | "approve" | "dispute", proofUrl?: string) => void;
}) {
  const { address } = useWallet();
  const [proofUrl, setProofUrl] = useState("");
  const [releasing, setReleasing] = useState(false);
  const [showDeliverForm, setShowDeliverForm] = useState(false);

  const handleApprove = () => {
    setReleasing(true);
    setTimeout(() => {
      onAction("approve");
      setReleasing(false);
    }, 900);
  };

  return (
    <GlassCard glowBorder className="relative overflow-hidden p-5">
      <AnimatePresence>
        {releasing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-accent-green"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 14) * Math.PI * 2) * 90,
                  y: Math.sin((i / 14) * Math.PI * 2) * 90,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={
          milestone.status === "pending" || milestone.status === "funded"
            ? { y: [0, -4, 0] }
            : {}
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs text-text-muted">Milestone {milestone.index + 1}</span>
            <h3 className="font-heading text-lg font-semibold">{milestone.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{milestone.description}</p>
          </div>
          <StatusRing status={milestone.status} />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="gradient-text text-lg font-bold">
            ${milestone.amount.toLocaleString()}
          </span>
          {milestone.proofUrl && (
            <a
              href={milestone.proofUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
            >
              View proof <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {milestone.status === "pending" && (
            <GradientButton
              disabled={!address}
              onClick={() => onAction("fund")}
              className="flex items-center gap-2 text-xs"
            >
              <Wallet size={14} /> Fund milestone
            </GradientButton>
          )}

          {milestone.status === "funded" && !showDeliverForm && (
            <GradientButton
              disabled={!address}
              onClick={() => setShowDeliverForm(true)}
              className="flex items-center gap-2 text-xs"
            >
              <Upload size={14} /> Submit proof
            </GradientButton>
          )}

          {milestone.status === "funded" && showDeliverForm && (
            <div className="flex w-full flex-col gap-2">
              <input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Proof link or hash"
                className="glass-input text-sm"
              />
              <div className="flex gap-2">
                <GradientButton
                  className="text-xs"
                  onClick={() => {
                    onAction("deliver", proofUrl);
                    setShowDeliverForm(false);
                  }}
                  disabled={!proofUrl.trim()}
                >
                  Submit
                </GradientButton>
                <GradientButton
                  variant="ghost"
                  className="text-xs"
                  onClick={() => setShowDeliverForm(false)}
                >
                  Cancel
                </GradientButton>
              </div>
            </div>
          )}

          {milestone.status === "delivered" && (
            <>
              <GradientButton
                variant="success"
                disabled={!address}
                onClick={handleApprove}
                className="flex items-center gap-2 text-xs"
              >
                <Check size={14} /> Approve & release
              </GradientButton>
              <motion.div whileTap={{ x: [0, -3, 3, -3, 0] }}>
                <GradientButton
                  variant="danger"
                  disabled={!address}
                  onClick={() => onAction("dispute")}
                  className="flex items-center gap-2 text-xs"
                >
                  <ShieldAlert size={14} /> Dispute
                </GradientButton>
              </motion.div>
            </>
          )}

          {milestone.status === "disputed" && (
            <span className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-3 py-1.5 text-xs text-accent-amber">
              Awaiting resolution / timeout release
            </span>
          )}

          {milestone.status === "approved" && (
            <span className="rounded-full border border-accent-green/40 bg-accent-green/10 px-3 py-1.5 text-xs text-accent-green">
              Funds released
            </span>
          )}
        </div>
      </motion.div>
    </GlassCard>
  );
}
