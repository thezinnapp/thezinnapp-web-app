import { createClient } from '@supabase/supabase-js';

// These two values are public by design: they identify the project, and the
// database's row level security decides what each signed-in user can see.
// They can be overridden with VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fdsbeshsxugjenaemmbe.supabase.co';
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OaSefKD2RTQ6863P-I6PjA_fBmxvj8b';

// Supabase sends invite links (and older-style links) back with the session in the
// URL hash (#access_token=...&type=invite). The client below uses the more secure
// PKCE flow, which refuses that format, so take it out of the address bar first and
// let AuthContext finish signing the person in with it.
let stashedAuthParams = null;
if (typeof window !== 'undefined' && /(^#|&)(access_token|error_description)=/.test(window.location.hash)) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  stashedAuthParams = {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
    type: params.get('type'),
    error: params.get('error_description'),
  };
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
}

// Returns (once) the sign-in details that arrived in the URL hash, if any.
export function takeStashedAuthParams() {
  const params = stashedAuthParams;
  stashedAuthParams = null;
  return params;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
