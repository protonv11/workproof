"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { StatusRing, type MilestoneStatus } from "@/components/ui/StatusRing";
import { MilestoneCardSkeleton } from "@/components/ui/Skeleton";
import { useJobs } from "@/lib/hooks";
import { truncateAddress } from "@/lib/wallet";

function jobOverallStatus(milestones: { status: MilestoneStatus }[]): MilestoneStatus {
  if (milestones.some((m) => m.status === "disputed")) return "disputed";
  if (milestones.every((m) => m.status === "approved")) return "approved";
  if (milestones.some((m) => m.status === "delivered")) return "delivered";
  if (milestones.some((m) => m.status === "funded")) return "funded";
  return "pending";
}

export default function DashboardPage() {
  const { data: jobs, isLoading } = useJobs();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Jobs</h1>
            <p className="mt-1 text-sm text-text-muted">
              Milestones you&apos;re funding or delivering.
            </p>
          </div>
          <Link href="/dashboard/new">
            <GradientButton className="flex items-center gap-2">
              <Plus size={16} /> New Job
            </GradientButton>
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => <MilestoneCardSkeleton key={i} />)}

          {!isLoading &&
            jobs?.map((job, i) => {
              const overall = jobOverallStatus(job.milestones);
              const total = job.milestones.reduce((sum, m) => sum + m.amount, 0);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.05 }}
                >
                  <Link href={`/job/${job.id}`}>
                    <GlassCard hoverTilt glowBorder className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-heading text-lg font-semibold">{job.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                            {job.description}
                          </p>
                        </div>
                        <StatusRing status={overall} size={48} />
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                        <span>{job.milestones.length} milestones</span>
                        <span className="gradient-text font-semibold">${total.toLocaleString()}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                        <span>Freelancer</span>
                        <span className="rounded-full border border-glass-border px-2 py-0.5">
                          {truncateAddress(job.freelancer)}
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
        </div>

        {!isLoading && jobs?.length === 0 && (
          <GlassCard className="mt-8 flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-text-muted">No jobs yet.</p>
            <Link href="/dashboard/new">
              <GradientButton>Create your first job</GradientButton>
            </Link>
          </GlassCard>
        )}
      </main>
    </div>
  );
}
