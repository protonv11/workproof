-- Off-chain metadata cache for jobs/milestones/proof events. On-chain state
-- (funds, status) remains the source of truth via lib/contract.ts — these
-- tables just let the dashboard list jobs without an RPC round trip per row.

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  on_chain_job_id text,
  title text not null,
  description text,
  client_address text not null,
  freelancer_address text not null,
  created_at timestamptz not null default now()
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  index int not null,
  title text not null,
  description text,
  amount numeric not null,
  status text not null default 'pending',
  proof_url text,
  proof_hash text,
  delivered_at timestamptz,
  deadline timestamptz
);

create table if not exists proof_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  milestone_index int not null,
  type text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table jobs enable row level security;
alter table milestones enable row level security;
alter table proof_events enable row level security;

-- Testnet demo app: any client can read/write. Tighten with auth.uid()
-- checks against client_address/freelancer_address before mainnet.
create policy "anyone can read jobs" on jobs for select to anon, authenticated using (true);
create policy "anyone can insert jobs" on jobs for insert to anon, authenticated with check (true);
create policy "anyone can update jobs" on jobs for update to anon, authenticated using (true);

create policy "anyone can read milestones" on milestones for select to anon, authenticated using (true);
create policy "anyone can insert milestones" on milestones for insert to anon, authenticated with check (true);
create policy "anyone can update milestones" on milestones for update to anon, authenticated using (true);

create policy "anyone can read proof_events" on proof_events for select to anon, authenticated using (true);
create policy "anyone can insert proof_events" on proof_events for insert to anon, authenticated with check (true);
