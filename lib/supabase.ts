import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

/**
 * Off-chain metadata schema (create in Supabase SQL editor):
 *
 * jobs(id uuid pk, on_chain_job_id text, title text, description text,
 *      client_address text, freelancer_address text, created_at timestamptz default now())
 *
 * milestones(id uuid pk, job_id uuid references jobs, index int,
 *            title text, description text, amount numeric,
 *            proof_url text, proof_hash text, delivered_at timestamptz, deadline timestamptz)
 *
 * proof_events(id uuid pk, job_id uuid references jobs, milestone_index int,
 *             type text, message text, created_at timestamptz default now())
 *
 * user_feedback(id uuid pk default gen_random_uuid(), user_address text nullable,
 *               rating int check (rating between 1 and 5), feedback_text text,
 *               created_at timestamptz default now())
 *   — see supabase/migrations/001_user_feedback.sql for the runnable migration.
 *
 * On-chain fields (funds, status) are read from Soroban RPC via lib/contract.ts —
 * Supabase only stores descriptions, proof links, and messages.
 */
