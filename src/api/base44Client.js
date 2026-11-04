// Drop-in replacement for the Base44 SDK, backed by Supabase + Claude.
// The app's pages still call `base44.entities...`, `base44.auth...` and
// `base44.integrations.Core.InvokeLLM`, so they work unchanged.
import { FunctionsError, FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/api/supabaseClient';
import { ENTITY_TABLES } from '@/api/entityColumns';

// --- helpers ---------------------------------------------------------------

function fail(error, fallback = 'Something went wrong. Please try again.') {
  const err = new Error(error?.message || fallback);
  if (error?.status) err.status = error.status;
  throw err;
}

// Private things this app keeps in the browser. Cleared on sign out and account
// deletion so the next person who uses this device can't see them.
const PRIVATE_LOCAL_KEYS = ['social-analysis-result', 'zinn-translations-json', 'zinn-translations-text'];

function clearPrivateLocalData() {
  for (const key of PRIVATE_LOCAL_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // storage unavailable: nothing to clear
    }
  }
}

// Calls a Supabase server function and returns its JSON body.
async function callFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  // Long AI requests answer with status 200 right away (to stay connected) and
  // report any problem inside the body instead.
  if (!error && data && typeof data === 'object' && typeof data.error === 'string') {
    const err = new Error(data.error);
    err.status = data.status;
    throw err;
  }
  if (error) {
    // The connection dropped (or the response was cut off mid-way): don't show the
    // browser's raw error text, which means nothing to people.
    if (!(error instanceof FunctionsError) || error instanceof FunctionsFetchError) {
      const err = new Error('The connection was interrupted. Please check your internet and try again.');
      err.status = 504;
      throw err;
    }
    let message = error.message;
    let status;
    if (error instanceof FunctionsHttpError) {
      status = error.context?.status;
      try {
        const payload = await error.context.json();
        if (payload?.error) message = payload.error;
      } catch {
        // keep the generic message
      }
    }
    const err = new Error(message || 'Something went wrong. Please try again.');
    err.status = status;
    throw err;
  }
  return data;
}

// Base44 sort strings: '-created_date' (newest first) or 'created_date'.
function applySort(query, sort) {
  if (!sort) return query.order('created_date', { ascending: false });
  const desc = sort.startsWith('-');
  return query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
}

function pick(data, columns) {
  const out = {};
  for (const key of columns) {
    if (data && Object.prototype.hasOwnProperty.call(data, key)) out[key] = data[key];
  }
  return out;
}

function makeEntity({ table, columns }) {
  return {
    async list(sort = '-created_date', limit) {
      let query = applySort(supabase.from(table).select('*'), sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) fail(error);
      return data;
    },
    async filter(criteria = {}, sort = '-created_date', limit) {
      let query = supabase.from(table).select('*').match(pick(criteria, [...columns, 'id']));
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) fail(error);
      return data;
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) fail(error);
      return data;
    },
    async create(values) {
      const { data, error } = await supabase.from(table).insert(pick(values, columns)).select().single();
      if (error) fail(error);
      return data;
    },
    async bulkCreate(items) {
      const rows = (items || []).map((item) => pick(item, columns));
      if (rows.length === 0) return [];
      const { data, error } = await supabase.from(table).insert(rows).select();
      if (error) fail(error);
      return data;
    },
    async update(id, values) {
      const { data, error } = await supabase.from(table).update(pick(values, columns)).eq('id', id).select().single();
      if (error) fail(error);
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) fail(error);
    },
  };
}

// --- users -------------------------------------------------------------------

async function currentProfile() {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData?.session?.user;
  if (!authUser) {
    const err = new Error('Not signed in');
    err.status = 401;
    throw err;
  }
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
  // Don't guess on a failed lookup: defaults would re-show the disclaimer and hide admin tools.
  if (error) fail(error, 'Could not load your profile. Please try again.');
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name ?? authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? '',
    role: profile?.role ?? 'user',
    has_accepted_disclaimer: profile?.has_accepted_disclaimer ?? false,
    created_date: profile?.created_date ?? authUser.created_at,
  };
}

const UserEntity = {
  // Admin Dashboard: everyone's profile (the database only allows this for admins).
  async list(sort = '-created_date') {
    const { data, error } = await applySort(supabase.from('profiles').select('*'), sort);
    if (error) fail(error);
    return data;
  },
  // "Delete account" in settings: removes the signed-in user and all their data.
  async delete() {
    await callFunction('delete-account', {});
    clearPrivateLocalData();
  },
};

const entities = { User: UserEntity };
for (const [name, config] of Object.entries(ENTITY_TABLES)) entities[name] = makeEntity(config);

// --- auth ----------------------------------------------------------------------

// Links in emails must open a web page. Inside the phone apps the page address is
// not a web address (for example capacitor://localhost), so use the live site there.
const WEB_APP_URL = 'https://online.thezinnapp.com';
const siteUrl = (path = '/') => {
  const origin = /^https?:$/.test(window.location.protocol) ? window.location.origin : WEB_APP_URL;
  return new URL(path, origin).toString();
};

const auth = {
  me: currentProfile,

  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return !!data?.session;
  },

  async updateMe(values) {
    const { data: sessionData } = await supabase.auth.getSession();
    const id = sessionData?.session?.user?.id;
    if (!id) fail({ message: 'Not signed in', status: 401 });
    const { error } = await supabase
      .from('profiles')
      .update(pick(values, ['full_name', 'has_accepted_disclaimer']))
      .eq('id', id);
    if (error) fail(error);
    return currentProfile();
  },

  async loginViaEmailPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) fail(error, 'Invalid email or password');
    return data;
  },

  // Sign up; Supabase emails a 6-digit code, checked with verifyOtp below.
  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: siteUrl('/') },
    });
    if (error) fail(error, 'Registration failed');
    // Supabase hides whether an email is taken: for an existing account it returns a
    // stand-in user with no identities and sends no code. Say so instead of waiting.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      fail({ message: 'An account with this email already exists. Log in, or use "Forgot password?" to set a new password.' });
    }
    return data;
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' });
    if (error) fail(error, 'Invalid verification code');
    return { access_token: data?.session?.access_token };
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) fail(error, 'Failed to resend code');
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: siteUrl('/reset-password') });
    if (error) fail(error);
  },

  // Sets a new password from an emailed link. Supports, in order:
  // - ?token_hash=...&type=recovery|invite  (works on any device; needs the email
  //   templates set to this link format)
  // - ?code=...                             (Supabase's default reset link; must be
  //   opened in the same browser that asked for it)
  // - an invite already turned into a session by AuthContext (?session=1)
  async resetPassword({ resetToken, tokenHash, type = 'recovery', newPassword }) {
    const linkType = type === 'invite' ? 'invite' : 'recovery';
    const VERIFIED_KEY = 'zinn-verified-link';
    if (tokenHash) {
      // A link works only once. If it was already used in this tab (for example the
      // first password was rejected as too short), keep the session it created.
      let alreadyVerified = false;
      try {
        alreadyVerified = sessionStorage.getItem(VERIFIED_KEY) === tokenHash;
      } catch {
        // storage unavailable
      }
      if (!alreadyVerified) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: linkType });
        if (error) fail(error, 'This link has expired. Please request a new one.');
        try {
          sessionStorage.setItem(VERIFIED_KEY, tokenHash);
        } catch {
          // storage unavailable
        }
      }
    }
    let { data } = await supabase.auth.getSession();
    // Supabase signs in from a ?code= link on page load and then removes it from the
    // address bar. If the code is still there, it hasn't been used: exchange it now,
    // so the password never changes on some other account already signed in here.
    const linkUnused = /[?&](code|token)=/.test(window.location.search);
    if (resetToken && (linkUnused || !data?.session)) {
      const { error } = await supabase.auth.exchangeCodeForSession(resetToken);
      if (error) {
        fail({ message: 'This link only works in the browser where you asked for it. Open it there, or request a new link.' });
      }
      ({ data } = await supabase.auth.getSession());
    }
    if (!data?.session) fail({ message: 'This link has expired. Please request a new one.' });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) fail(error, 'Failed to set your password');
    try {
      sessionStorage.removeItem(VERIFIED_KEY);
    } catch {
      // storage unavailable
    }
    // After a reset, sign out everywhere so an old session can't stay in; an invited
    // person has no other sessions, so only this device is signed out.
    await supabase.auth.signOut({ scope: linkType === 'recovery' ? 'global' : 'local' });
  },

  async loginWithProvider(provider, returnPath = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: siteUrl(returnPath) },
    });
    if (error) fail(error);
  },

  // Supabase manages the session itself, so this is not needed.
  setToken() {},

  // Signs out this device only (like Base44 did); other devices stay signed in.
  async logout(redirectUrl) {
    clearPrivateLocalData();
    await supabase.auth.signOut({ scope: 'local' });
    window.location.href = redirectUrl || '/login';
  },

  redirectToLogin() {
    window.location.href = '/login';
  },
};

// --- AI ------------------------------------------------------------------------

const integrations = {
  Core: {
    // Same contract as Base44: returns parsed JSON when a schema is given, text otherwise.
    async InvokeLLM({ prompt, response_json_schema }) {
      const data = await callFunction('invoke-llm', { prompt, response_json_schema });
      return data?.result;
    },
  },
};

const FUNCTION_NAMES = { translateJson: 'translate-json' };

const functions = {
  // Base44 returned an axios-style `{ data }`, so keep that shape.
  async invoke(name, body) {
    const data = await callFunction(FUNCTION_NAMES[name] || name, body);
    return { data };
  },
};

const users = {
  async inviteUser(email) {
    await callFunction('admin-invite', { email });
  },
  // Admin Dashboard: preview (confirm=false) or move all entries between two accounts.
  async moveEntries({ fromEmail, toEmail, confirm = false, deleteOld = false }) {
    return callFunction('admin-move-entries', {
      from_email: fromEmail,
      to_email: toEmail,
      confirm,
      delete_old: deleteOld,
    });
  },
};

export const base44 = { entities, auth, integrations, functions, users };
export default base44;
