-- The ZINN App: lets an admin move every entry from one account to another.
-- Used for people whose old Base44 sign-in (for example Apple "Hide My Email")
-- can't reach their imported account, so they signed up again and got a new one.
-- Only the admin-move-entries server function can call this (after checking the
-- caller is an admin). Everything moves in one step, or nothing does.

create or replace function public.admin_move_entries(p_from uuid, p_to uuid, p_dry_run boolean default true)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  to_email text;
  tables text[] := array['beliefs', 'boundaries', 'journal_entries', 'maslow_analyses',
                         'monthly_analyses', 'spiritual_reflections', 'thinking_reports'];
  t text;
  n integer;
  from_counts jsonb := '{}'::jsonb;
  to_counts jsonb := '{}'::jsonb;
begin
  if p_from is null or p_to is null or p_from = p_to then
    raise exception 'Choose two different accounts.';
  end if;
  if not exists (select 1 from auth.users where id = p_from) then
    raise exception 'The old account was not found.';
  end if;
  select email into to_email from auth.users where id = p_to;
  if not found then
    raise exception 'The new account was not found.';
  end if;

  foreach t in array tables loop
    execute format('select count(*) from public.%I where created_by_id = $1', t) into n using p_to;
    to_counts := to_counts || jsonb_build_object(t, n);
    if p_dry_run then
      execute format('select count(*) from public.%I where created_by_id = $1', t) into n using p_from;
    else
      execute format('update public.%I set created_by_id = $1, created_by = $2 where created_by_id = $3', t)
        using p_to, to_email, p_from;
      get diagnostics n = row_count;
    end if;
    from_counts := from_counts || jsonb_build_object(t, n);
  end loop;

  if not p_dry_run then
    -- Stored translations belong to whoever owned the text; rebuild them on demand.
    delete from public.translation_cache where user_id in (p_from, p_to);
  end if;

  return jsonb_build_object('moved', not p_dry_run, 'from', from_counts, 'to_before', to_counts);
end;
$$;
revoke all on function public.admin_move_entries(uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function public.admin_move_entries(uuid, uuid, boolean) to service_role;
