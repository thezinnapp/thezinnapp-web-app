-- Season 3 Thinking Report: new "Take It Captive" field (a Scripture that
-- challenges the Underlying Belief). Stored like the other report fields.
alter table public.thinking_reports add column if not exists take_it_captive text;
