"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mockJobs, mockProofEvents } from "@/lib/mock-data";
import type { Job, Milestone, MilestoneOnChainStatus, ProofEvent } from "@/lib/types";

/**
 * Reads merge on-chain state (source of truth for funds/status, via Soroban RPC
 * in lib/contract.ts) with off-chain metadata (Supabase). Falls back to mock
 * data when Supabase env vars aren't configured, so the UI is explorable
 * without a backend.
 */

type MilestoneRow = {
  id: string;
  job_id: string;
  index: number;
  title: string;
  description: string | null;
  amount: number;
  status: string;
  proof_url: string | null;
  proof_hash: string | null;
  delivered_at: string | null;
  deadline: string | null;
};

type JobRow = {
  id: string;
  on_chain_job_id: string | null;
  title: string;
  description: string | null;
  client_address: string;
  freelancer_address: string;
  created_at: string;
  milestones: MilestoneRow[];
};

function mapMilestone(row: MilestoneRow, jobId: string): Milestone {
  return {
    id: row.id,
    jobId,
    index: row.index,
    title: row.title,
    description: row.description ?? "",
    amount: Number(row.amount),
    status: row.status as MilestoneOnChainStatus,
    proofUrl: row.proof_url ?? undefined,
    proofHash: row.proof_hash ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    deadline: row.deadline ?? undefined,
  };
}

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    onChainJobId: row.on_chain_job_id ?? undefined,
    title: row.title,
    description: row.description ?? "",
    client: row.client_address,
    freelancer: row.freelancer_address,
    createdAt: row.created_at,
    milestones: (row.milestones ?? [])
      .map((m) => mapMilestone(m, row.id))
      .sort((a, b) => a.index - b.index),
  };
}

async function fetchJobs(): Promise<Job[]> {
  if (!supabase) return mockJobs;
  const { data, error } = await supabase.from("jobs").select("*, milestones(*)");
  if (error || !data) return mockJobs;
  return (data as JobRow[]).map(mapJob);
}

async function fetchJob(jobId: string): Promise<Job | undefined> {
  if (!supabase) return mockJobs.find((j) => j.id === jobId);
  const { data, error } = await supabase
    .from("jobs")
    .select("*, milestones(*)")
    .eq("id", jobId)
    .single();
  if (error || !data) return mockJobs.find((j) => j.id === jobId);
  return mapJob(data as JobRow);
}

async function fetchProofEvents(jobId: string): Promise<ProofEvent[]> {
  if (!supabase) return mockProofEvents.filter((e) => e.jobId === jobId);
  const { data, error } = await supabase
    .from("proof_events")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });
  if (error || !data) return mockProofEvents.filter((e) => e.jobId === jobId);
  return (
    data as Array<{
      id: string;
      job_id: string;
      milestone_index: number;
      type: ProofEvent["type"];
      message: string | null;
      created_at: string;
    }>
  ).map((row) => ({
    id: row.id,
    jobId: row.job_id,
    milestoneIndex: row.milestone_index,
    type: row.type,
    message: row.message ?? undefined,
    createdAt: row.created_at,
  }));
}

export function useJobs() {
  return useQuery({ queryKey: ["jobs"], queryFn: fetchJobs });
}

export function useJob(jobId: string) {
  return useQuery({ queryKey: ["job", jobId], queryFn: () => fetchJob(jobId) });
}

export function useProofEvents(jobId: string) {
  return useQuery({ queryKey: ["proof-events", jobId], queryFn: () => fetchProofEvents(jobId) });
}

type FeedbackInput = {
  userAddress: string | null;
  rating: number;
  feedbackText: string;
};

async function submitFeedback(input: FeedbackInput) {
  if (!supabase) {
    throw new Error("Feedback isn't configured yet — Supabase env vars are missing.");
  }
  const { error } = await supabase.from("user_feedback").insert({
    user_address: input.userAddress,
    rating: input.rating,
    feedback_text: input.feedbackText,
  });
  if (error) throw new Error(error.message);
}

export function useSubmitFeedback() {
  return useMutation({ mutationFn: submitFeedback });
}

type CreateJobInput = {
  onChainJobId: string;
  title: string;
  description: string;
  clientAddress: string;
  freelancerAddress: string;
  milestones: Array<{ title: string; description: string; amount: number }>;
};

async function createJobRecord(input: CreateJobInput): Promise<string> {
  if (!supabase) {
    throw new Error("Job saved on-chain, but the dashboard needs Supabase configured to list it.");
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      on_chain_job_id: input.onChainJobId,
      title: input.title,
      description: input.description,
      client_address: input.clientAddress,
      freelancer_address: input.freelancerAddress,
    })
    .select()
    .single();
  if (jobError || !job) throw new Error(jobError?.message ?? "Failed to save job");

  const { error: milestonesError } = await supabase.from("milestones").insert(
    input.milestones.map((m, index) => ({
      job_id: job.id,
      index,
      title: m.title,
      description: m.description,
      amount: m.amount,
      status: "pending",
    }))
  );
  if (milestonesError) throw new Error(milestonesError.message);

  return job.id as string;
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createJobRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

async function updateMilestoneRecord(input: {
  jobId: string;
  milestoneIndex: number;
  status: MilestoneOnChainStatus;
  proofUrl?: string;
  eventType: ProofEvent["type"];
}) {
  if (!supabase) return;

  const patch: { status: MilestoneOnChainStatus; proof_url?: string; delivered_at?: string } = {
    status: input.status,
  };
  if (input.proofUrl) patch.proof_url = input.proofUrl;
  if (input.status === "delivered") patch.delivered_at = new Date().toISOString();

  await supabase
    .from("milestones")
    .update(patch)
    .eq("job_id", input.jobId)
    .eq("index", input.milestoneIndex);

  await supabase.from("proof_events").insert({
    job_id: input.jobId,
    milestone_index: input.milestoneIndex,
    type: input.eventType,
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMilestoneRecord,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["proof-events", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
