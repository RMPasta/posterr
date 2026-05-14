-- Posterr MVP schema (run in Supabase SQL editor or via CLI)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  default_platform text default 'reddit',
  default_tone text default 'boring_credible',
  default_writing_level text default 'normal_adult',
  default_length text default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  raw_idea text not null,
  platform text not null,
  content_type text not null,
  audience text not null,
  writing_level text not null,
  tone text not null,
  length text not null,
  research_notes text,
  avoid_list text,
  cta_style text,
  main_draft text not null,
  short_version text,
  alternate_version text,
  platform_notes text,
  anti_ai_checklist jsonb,
  suggested_edits jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.drafts enable row level security;
alter table public.generation_logs enable row level security;

create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can view own drafts"
on public.drafts for select
using (auth.uid() = user_id);

create policy "Users can insert own drafts"
on public.drafts for insert
with check (auth.uid() = user_id);

create policy "Users can update own drafts"
on public.drafts for update
using (auth.uid() = user_id);

create policy "Users can delete own drafts"
on public.drafts for delete
using (auth.uid() = user_id);

create policy "Users can view own generation logs"
on public.generation_logs for select
using (auth.uid() = user_id);

create policy "Users can insert own generation logs"
on public.generation_logs for insert
with check (auth.uid() = user_id);
