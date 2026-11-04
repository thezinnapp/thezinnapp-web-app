-- The ZINN App: follow-up to the initial schema.
-- 1. Count translations separately from AI analyses, so reading results in another
--    language can never use up a person's daily analysis limit.
-- 2. Remember translations per person, so the same text is never paid for twice
--    (for example after signing in on a new phone).
-- Only the server functions can use either table.

alter table public.ai_usage add column if not exists translate_calls integer not null default 0;

create or replace function public.increment_translate_usage(p_user uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  insert into public.ai_usage (user_id, day, translate_calls) values (p_user, current_date, 1)
  on conflict (user_id, day) do update set translate_calls = public.ai_usage.translate_calls + 1
  returning translate_calls into n;
  return n;
end;
$$;
revoke all on function public.increment_translate_usage(uuid) from public, anon, authenticated;
grant execute on function public.increment_translate_usage(uuid) to service_role;

create table if not exists public.translation_cache (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_hash text not null,
  language text not null,
  result text not null,
  created_date timestamptz not null default now(),
  primary key (user_id, content_hash, language)
);
alter table public.translation_cache enable row level security;
revoke all on public.translation_cache from anon, authenticated;
grant all on public.translation_cache to service_role;

-- 3. The Privacy Policy promises deleted items are removed from our servers.
--    Stored translations can't be traced back to the entry they came from, so when
--    someone deletes any entry, clear all of that person's stored translations
--    (they are rebuilt on demand). Deleting the account removes them too (cascade).
create or replace function public.purge_translation_cache()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.translation_cache where user_id = old.created_by_id;
  return null;
end;
$$;
revoke all on function public.purge_translation_cache() from public, anon, authenticated;

create trigger beliefs_purge_translations after delete on public.beliefs
  for each row execute function public.purge_translation_cache();
create trigger boundaries_purge_translations after delete on public.boundaries
  for each row execute function public.purge_translation_cache();
create trigger journal_entries_purge_translations after delete on public.journal_entries
  for each row execute function public.purge_translation_cache();
create trigger maslow_analyses_purge_translations after delete on public.maslow_analyses
  for each row execute function public.purge_translation_cache();
create trigger monthly_analyses_purge_translations after delete on public.monthly_analyses
  for each row execute function public.purge_translation_cache();
create trigger spiritual_reflections_purge_translations after delete on public.spiritual_reflections
  for each row execute function public.purge_translation_cache();
create trigger thinking_reports_purge_translations after delete on public.thinking_reports
  for each row execute function public.purge_translation_cache();
