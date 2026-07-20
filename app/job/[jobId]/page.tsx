"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { MilestoneCardSkeleton } from "@/components/ui/Skeleton";
import { MilestoneCard } from "@/components/MilestoneCard";
import { ProofTrail } from "@/components/ProofTrail";
import { useJob, useProofEvents } from "@/lib/hooks";
import { truncateAddress } from "@/lib/wallet";
import { useWallet } from "@/lib/wallet-context";
import { escrowContract } from "@/lib/contract";
import { toast } from "@/lib/toast-store";
import type { Milestone, MilestoneOnChainStatus } from "@/lib/types";

const nextStatus: Record<string, MilestoneOnChainStatus> = {
  fund: "funded",
  deliver: "delivered",
  approve: "approved",
  dispute: "disputed",
  claim_timeout: "approved",
};

const successMessage: Record<string, string> = {
  fund: "Milestone funded.",
  deliver: "Proof submitted.",
  approve: "Approved — funds released.",
  dispute: "Milestone disputed.",
  claim_timeout: "Timeout claimed — funds released.",
};

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const { data: job, isLoading } = useJob(jobId);
  const { data: events } = useProofEvents(jobId);
  const { address } = useWallet();
  const [localMilestones, setLocalMilestones] = useState<Milestone[] | null>(null);

  const milestones = localMilestones ?? job?.milestones ?? [];

  const applyOptimistic = (index: number, status: MilestoneOnChainStatus, proofUrl?: string) => {
    const base = localMilestones ?? job?.milestones ?? [];
    setLocalMilestones(
      base.map((m, i) => (i === index ? { ...m, status, proofUrl: proofUrl ?? m.proofUrl } : m))
    );
  };

  const handleAction = async (
    index: number,
    action: "fund" | "deliver" | "approve" | "dispute" | "claim_timeout",
    proofUrl?: string
  ) => {
    // Demo jobs (mock data, no on-chain job id) stay optimistic-only.
    if (!job?.onChainJobId || !address) {
      applyOptimistic(index, nextStatus[action], proofUrl);
      toast.success(successMessage[action]);
      return;
    }

    try {
      const onChainJobId = BigInt(job.onChainJobId);
      if (action === "fund") {
        await escrowContract.fundMilestone(address, onChainJobId, index);
      } else if (action === "deliver") {
        const proofHash = Buffer.from(proofUrl ?? "", "utf-8");
        await escrowContract.markDelivered(address, onChainJobId, index, proofHash);
      } else if (action === "approve") {
        await escrowContract.approveMilestone(address, onChainJobId, index);
      } else if (action === "dispute") {
        await escrowContract.disputeMilestone(address, onChainJobId, index);
      } else if (action === "claim_timeout") {
        await escrowContract.claimTimeoutRelease(address, onChainJobId, index);
      }
      applyOptimistic(index, nextStatus[action], proofUrl);
      toast.success(successMessage[action]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to ${action} milestone ${index + 1}`);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {isLoading && (
          <div className="flex flex-col gap-4">
            <MilestoneCardSkeleton />
            <MilestoneCardSkeleton />
          </div>
        )}

        {!isLoading && !job && (
          <GlassCard className="p-12 text-center text-text-muted">Job not found.</GlassCard>
        )}

        {!isLoading && job && (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-3xl font-bold">{job.title}</h1>
              <p className="mt-2 max-w-2xl text-text-muted">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-muted">
                <span className="rounded-full border border-glass-border px-3 py-1">
                  Client {truncateAddress(job.client)}
                </span>
                <span className="rounded-full border border-glass-border px-3 py-1">
                  Freelancer {truncateAddress(job.freelancer)}
                </span>
              </div>
            </motion.div>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-5">
                {milestones.map((m) => (
                  <MilestoneCard
                    key={m.id}
                    milestone={m}
                    onAction={(action, proofUrl) => handleAction(m.index, action, proofUrl)}
                  />
                ))}
              </div>

              <GlassCard className="h-fit p-6">
                <h2 className="font-heading text-lg font-semibold">Proof trail</h2>
                <div className="mt-5">
                  <ProofTrail events={events ?? []} />
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
