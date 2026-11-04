-- The ZINN App: database schema (moved from Base44 to Supabase).
-- Every table keeps Base44's field names so existing data imports cleanly.
-- Each user can only ever see and change their own rows (row level security).

create extension if not exists pgcrypto;

-- Keeps updated_date current on every edit.
create or replace function public.set_updated_date()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_date = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (Base44's "User" entity): one row per sign-up.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  has_accepted_disclaimer boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create trigger profiles_updated_date before update on public.profiles
  for each row execute function public.set_updated_date();

-- Is the signed-in person an admin? (Used by security rules.)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
create policy "Read own profile, or any profile as admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
-- Users may change only these columns of their own profile (never their role).
grant update (full_name, has_accepted_disclaimer) on public.profiles to authenticated;

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Belief -> public.beliefs
-- ---------------------------------------------------------------------------
create table public.beliefs (
  id text primary key default gen_random_uuid()::text,
  content text not null,
  type text not null,
  category text,
  correlated_affirmation text,
  correlated_philosophy text,
  explanation text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index beliefs_owner_created_idx on public.beliefs (created_by_id, created_date desc);
create trigger beliefs_updated_date before update on public.beliefs
  for each row execute function public.set_updated_date();
alter table public.beliefs enable row level security;
create policy "Read own rows" on public.beliefs for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.beliefs for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.beliefs for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.beliefs for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.beliefs from anon;
grant select, insert, update, delete on public.beliefs to authenticated;

-- ---------------------------------------------------------------------------
-- Boundary -> public.boundaries
-- ---------------------------------------------------------------------------
create table public.boundaries (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  description text,
  boundary_type text not null,
  related_belief text,
  action_steps text,
  boundary_script text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index boundaries_owner_created_idx on public.boundaries (created_by_id, created_date desc);
create trigger boundaries_updated_date before update on public.boundaries
  for each row execute function public.set_updated_date();
alter table public.boundaries enable row level security;
create policy "Read own rows" on public.boundaries for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.boundaries for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.boundaries for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.boundaries for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.boundaries from anon;
grant select, insert, update, delete on public.boundaries to authenticated;

-- ---------------------------------------------------------------------------
-- JournalEntry -> public.journal_entries
-- ---------------------------------------------------------------------------
create table public.journal_entries (
  id text primary key default gen_random_uuid()::text,
  thoughts text,
  feelings text,
  reactions text,
  work_on text,
  grateful_for text,
  entry_date text not null,
  entry_time text,
  day_of_week text,
  ai_recommendations text,
  pro_social_score double precision,
  flag text,
  four_agreements text,
  power_control_wheel text,
  shame_guilt_analysis text,
  halo_effect_analysis text,
  stockholm_syndrome_analysis text,
  gaslighting_analysis text,
  coping_strategies text,
  cognitive_dissonance_analysis text,
  cognitive_biases_analysis text,
  human_needs_analysis text,
  thank_you_power_analysis text,
  description text,
  intent_vs_impact_analysis text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index journal_entries_owner_created_idx on public.journal_entries (created_by_id, created_date desc);
create trigger journal_entries_updated_date before update on public.journal_entries
  for each row execute function public.set_updated_date();
alter table public.journal_entries enable row level security;
create policy "Read own rows" on public.journal_entries for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.journal_entries for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.journal_entries for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.journal_entries for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.journal_entries from anon;
grant select, insert, update, delete on public.journal_entries to authenticated;

-- ---------------------------------------------------------------------------
-- MaslowAnalysis -> public.maslow_analyses
-- ---------------------------------------------------------------------------
create table public.maslow_analyses (
  id text primary key default gen_random_uuid()::text,
  source_report_id text,
  first_thought text not null,
  behavior text,
  situation text,
  physiological text,
  safety text,
  love_belonging text,
  esteem text,
  self_actualization text,
  primary_deficit text,
  recommendations text,
  human_needs_analysis text,
  thank_you_power_analysis text,
  description text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index maslow_analyses_owner_created_idx on public.maslow_analyses (created_by_id, created_date desc);
create trigger maslow_analyses_updated_date before update on public.maslow_analyses
  for each row execute function public.set_updated_date();
alter table public.maslow_analyses enable row level security;
create policy "Read own rows" on public.maslow_analyses for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.maslow_analyses for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.maslow_analyses for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.maslow_analyses for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.maslow_analyses from anon;
grant select, insert, update, delete on public.maslow_analyses to authenticated;

-- ---------------------------------------------------------------------------
-- MonthlyAnalysis -> public.monthly_analyses
-- ---------------------------------------------------------------------------
create table public.monthly_analyses (
  id text primary key default gen_random_uuid()::text,
  month integer not null,
  year integer not null,
  month_label text,
  pro_social_patterns text,
  anti_social_patterns text,
  overall_summary text,
  daily_flags text,
  description text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index monthly_analyses_owner_created_idx on public.monthly_analyses (created_by_id, created_date desc);
create trigger monthly_analyses_updated_date before update on public.monthly_analyses
  for each row execute function public.set_updated_date();
alter table public.monthly_analyses enable row level security;
create policy "Read own rows" on public.monthly_analyses for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.monthly_analyses for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.monthly_analyses for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.monthly_analyses for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.monthly_analyses from anon;
grant select, insert, update, delete on public.monthly_analyses to authenticated;

-- ---------------------------------------------------------------------------
-- SpiritualReflection -> public.spiritual_reflections
-- ---------------------------------------------------------------------------
create table public.spiritual_reflections (
  id text primary key default gen_random_uuid()::text,
  source_entry_id text,
  entry_date text not null,
  entry_time text,
  day_of_week text,
  thoughts_text text,
  reactions_text text,
  religion text,
  referenced_book text,
  bible_translation text,
  pro_social_scriptures text,
  anti_social_scriptures text,
  spiritual_summary text,
  cognitive_biases_analysis text,
  thank_you_power_analysis text,
  description text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index spiritual_reflections_owner_created_idx on public.spiritual_reflections (created_by_id, created_date desc);
create trigger spiritual_reflections_updated_date before update on public.spiritual_reflections
  for each row execute function public.set_updated_date();
alter table public.spiritual_reflections enable row level security;
create policy "Read own rows" on public.spiritual_reflections for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.spiritual_reflections for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.spiritual_reflections for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.spiritual_reflections for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.spiritual_reflections from anon;
grant select, insert, update, delete on public.spiritual_reflections to authenticated;

-- ---------------------------------------------------------------------------
-- ThinkingReport -> public.thinking_reports
-- ---------------------------------------------------------------------------
create table public.thinking_reports (
  id text primary key default gen_random_uuid()::text,
  situation text,
  first_thought text not null,
  feelings text,
  behavior text,
  disputing_thought text,
  replacement_thought text,
  associated_belief text,
  cognitive_distortion text,
  ai_analysis text,
  distorted_thinking_patterns text,
  avoidance_diversion_aggression_tactics text,
  associated_stances text,
  four_agreements text,
  power_control_wheel text,
  shame_guilt_analysis text,
  halo_effect_analysis text,
  stockholm_syndrome_analysis text,
  gaslighting_analysis text,
  coping_strategies text,
  cognitive_dissonance_analysis text,
  cognitive_biases_analysis text,
  thank_you_power_analysis text,
  description text,
  intent_vs_impact_analysis text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_by text default (auth.jwt() ->> 'email'),
  is_sample boolean not null default false,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index thinking_reports_owner_created_idx on public.thinking_reports (created_by_id, created_date desc);
create trigger thinking_reports_updated_date before update on public.thinking_reports
  for each row execute function public.set_updated_date();
alter table public.thinking_reports enable row level security;
create policy "Read own rows" on public.thinking_reports for select to authenticated
  using (created_by_id = (select auth.uid()));
create policy "Add own rows" on public.thinking_reports for insert to authenticated
  with check (created_by_id = (select auth.uid()));
create policy "Change own rows" on public.thinking_reports for update to authenticated
  using (created_by_id = (select auth.uid())) with check (created_by_id = (select auth.uid()));
create policy "Delete own rows" on public.thinking_reports for delete to authenticated
  using (created_by_id = (select auth.uid()));
revoke all on public.thinking_reports from anon;
grant select, insert, update, delete on public.thinking_reports to authenticated;

-- ---------------------------------------------------------------------------
-- AI usage counter (daily cap per user so nobody can drain the Claude budget).
-- Only the server functions can read or write it.
-- ---------------------------------------------------------------------------
create table public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  calls integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;

create or replace function public.increment_ai_usage(p_user uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.ai_usage (user_id, day, calls) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set calls = public.ai_usage.calls + 1
  returning calls into n;
  return n;
end;
$$;
revoke all on function public.increment_ai_usage(uuid) from public, anon, authenticated;
grant execute on function public.increment_ai_usage(uuid) to service_role;

-- Server functions (service role) need full table access for admin tasks and the data import.
grant all on all tables in schema public to service_role;
