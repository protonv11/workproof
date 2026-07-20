-- Run this in the Supabase SQL editor (or via `supabase db push` if using the CLI).

create table if not exists user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_address text,
  rating int not null check (rating between 1 and 5),
  feedback_text text not null,
  created_at timestamptz not null default now()
);

alter table user_feedback enable row level security;

-- Anonymous/authenticated clients may insert their own feedback but never read others'.
create policy "anyone can submit feedback"
  on user_feedback for insert
  to anon, authenticated
  with check (true);
