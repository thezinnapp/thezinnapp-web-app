// Google and Apple sign-in inside the iPhone and Android apps.
//
// Google blocks sign-in inside an app's built-in web view, so in the apps the sign-in
// page opens in the phone's secure browser sheet instead. When it finishes, Supabase
// sends the person back to the app through its own link (APP_AUTH_REDIRECT below,
// which must be in Supabase > Authentication > URL Configuration > Redirect URLs),
// and the app turns the one-time code in that link into a session.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/api/supabaseClient';

export const isNativeApp = Capacitor.isNativePlatform();
export const APP_AUTH_REDIRECT = 'com.base6a371d643d3aa6a37625bf0c.app://auth-callback';

export async function nativeOAuthSignIn(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: APP_AUTH_REDIRECT, skipBrowserRedirect: true },
  });
  if (error) throw error;
  // Full screen on every device. A 'popover' only looks full screen on iPhone; on iPad it
  // stays a small floating card and the sign-in page inside it never loads (App Review,
  // iPad Air, Nov 2026).
  const open = () => Browser.open({ url: data.url, presentationStyle: 'fullscreen' });
  try {
    await open();
  } catch {
    // An earlier sign-in sheet can still be registered; close it and try once more.
    try {
      await Browser.close();
    } catch {
      // nothing to close
    }
    await open();
  }
}

let listening = false;

// Call once when the app starts.
export function startNativeAuthListener() {
  if (!isNativeApp || listening) return;
  listening = true;
  App.addListener('appUrlOpen', async ({ url }) => {
    if (!url || !url.startsWith(APP_AUTH_REDIRECT)) return;
    try {
      await Browser.close();
    } catch {
      // the sheet may already be closed
    }
    const params = new URL(url).searchParams;
    const code = params.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        window.location.replace('/');
        return;
      }
    }
    // Cancelled or failed: back to the login page with a gentle message.
    const message = params.get('error_description') || 'Sign-in was cancelled. Please try again.';
    window.location.replace(`/login?error=${encodeURIComponent(message)}`);
  });
}
