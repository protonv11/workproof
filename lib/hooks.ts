"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { mockJobs, mockProofEvents } from "@/lib/mock-data";
import type { Job, ProofEvent } from "@/lib/types";

/**
 * Reads merge on-chain state (source of truth for funds/status, via Soroban RPC
 * in lib/contract.ts) with off-chain metadata (Supabase). Falls back to mock
 * data when Supabase env vars aren't configured, so the UI is explorable
 * without a backend.
 */

async function fetchJobs(): Promise<Job[]> {
  if (!supabase) return mockJobs;
  const { data, error } = await supabase.from("jobs").select("*, milestones(*)");
  if (error || !data) return mockJobs;
  return data as unknown as Job[];
}

async function fetchJob(jobId: string): Promise<Job | undefined> {
  if (!supabase) return mockJobs.find((j) => j.id === jobId);
  const { data, error } = await supabase
    .from("jobs")
    .select("*, milestones(*)")
    .eq("id", jobId)
    .single();
  if (error || !data) return mockJobs.find((j) => j.id === jobId);
  return data as unknown as Job;
}

async function fetchProofEvents(jobId: string): Promise<ProofEvent[]> {
  if (!supabase) return mockProofEvents.filter((e) => e.jobId === jobId);
  const { data, error } = await supabase
    .from("proof_events")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });
  if (error || !data) return mockProofEvents.filter((e) => e.jobId === jobId);
  return data as unknown as ProofEvent[];
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
