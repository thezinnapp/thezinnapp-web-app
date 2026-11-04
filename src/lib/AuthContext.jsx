import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase, takeStashedAuthParams } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const userIdRef = useRef(null);

  // silent: refresh the user in the background without swapping the app for the
  // loading spinner (which would unmount the page and lose anything being typed).
  const checkUserAuth = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      userIdRef.current = currentUser.id;
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch {
      // A background refresh that fails (for example, offline) keeps the current user.
      if (!silent) {
        userIdRef.current = null;
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      if (!silent) setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const refreshUser = useCallback(() => checkUserAuth({ silent: true }), [checkUserAuth]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // An invite link arrives with the session in the URL hash (see supabaseClient.js).
        // Only accept the two link types this app sends, so a link carrying someone
        // else's session can't silently switch the signed-in account.
        const stashed = takeStashedAuthParams();
        const expected = stashed?.type === 'invite' || stashed?.type === 'recovery';
        if (expected && stashed.access_token && stashed.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: stashed.access_token,
            refresh_token: stashed.refresh_token,
          });
          // Invited people have no password yet: send them to choose one.
          if (!error) {
            window.location.replace(`/reset-password?type=${stashed.type}&session=1`);
            return;
          }
        }
      } catch {
        // A damaged link: ignore it and carry on with the normal check.
      }
      if (active) checkUserAuth();
    })();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        userIdRef.current = null;
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }
      // PASSWORD_RECOVERY is how Supabase reports a sign-in from a reset link.
      if (event !== 'SIGNED_IN' && event !== 'USER_UPDATED' && event !== 'PASSWORD_RECOVERY') return;
      // Supabase repeats SIGNED_IN whenever the tab or app comes back into view.
      // Only a different account needs the full check; otherwise refresh quietly.
      // (Run outside the callback: Supabase recommends not awaiting other calls here.)
      const sameUser = !!session?.user?.id && session.user.id === userIdRef.current;
      if (!sameUser) {
        setTimeout(() => checkUserAuth(), 0);
      } else if (event === 'USER_UPDATED') {
        setTimeout(() => checkUserAuth({ silent: true }), 0);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [checkUserAuth]);

  const logout = (shouldRedirect = true) => {
    userIdRef.current = null;
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      base44.auth.logout('/login');
    } else {
      supabase.auth.signOut({ scope: 'local' });
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      refreshUser,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
