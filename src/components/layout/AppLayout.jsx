import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Brain, BookOpen, Shield, Lightbulb, LogOut, Trash2, ChevronLeft, Settings, Pyramid, Eye, Cross, Type, Moon, Globe, Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useHaptic } from '@/hooks/useHaptic';
import { useTabStack } from '@/hooks/useTabStack';
import { motion } from 'framer-motion';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTextScale } from '@/hooks/useTextScale';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import TextScaleDialog from '@/components/settings/TextScaleDialog';
import ThemeDialog from '@/components/settings/ThemeDialog';
import LanguageDialog from '@/components/settings/LanguageDialog';
import OnboardingDisclaimer from '@/components/shared/OnboardingDisclaimer';
import PublicFooter from '@/components/shared/PublicFooter';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const APP_VERSION = '1.3';

const getNavItems = (t) => [
  { path: '/', label: t('nav.beliefs'), shortLabel: t('nav.beliefsShort'), icon: Lightbulb },
  { path: '/social-analysis', label: t('nav.social'), shortLabel: t('nav.socialShort'), icon: BookOpen },
  { path: '/thinking-report', label: t('nav.thinking'), shortLabel: t('nav.thinkingShort'), icon: Brain },
  { path: '/boundaries', label: t('nav.boundaries'), shortLabel: t('nav.boundariesShort'), icon: Shield },
  { path: '/maslow', label: t('nav.maslow'), icon: Pyramid },
  { path: '/self-awareness', label: t('nav.awareness'), shortLabel: t('nav.awarenessShort'), icon: Eye },
  { path: '/spiritual', label: t('nav.spiritual'), shortLabel: t('nav.spiritualShort'), icon: BookOpen },
];

const rootPaths = ['/', '/social-analysis', '/thinking-report', '/boundaries', '/maslow', '/self-awareness', '/spiritual'];

export default function AppLayout() {
  const { theme, setTheme } = useDarkMode();
  const { textScale, setScale, reset } = useTextScale();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { tap } = useHaptic();
  const tabStack = useTabStack();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTextScaleDialog, setShowTextScaleDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, refreshUser } = useAuth();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const isRoot = rootPaths.includes(location.pathname);
  const navItems = getNavItems(t);
  const scrollPositions = useRef({});
  const mainRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Swipe left/right on the page to move between sections (mobile).
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const target = e.target;
    if (target?.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy)) return;
    const index = navItems.findIndex((item) => item.path === location.pathname);
    if (index === -1) return;
    const next = dx < 0 ? index + 1 : index - 1;
    if (next < 0 || next >= navItems.length) return;
    tap();
    handleTabTap(navItems[next].path);
    navigate(navItems[next].path);
  };

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollPositions.current[location.pathname] = main.scrollTop;
      }, 100);
    };

    main.addEventListener('scroll', handleScroll);
    return () => {
      main.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [location.pathname]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    
    const restoreScroll = () => {
      const savedPosition = scrollPositions.current[location.pathname];
      requestAnimationFrame(() => {
        main.scrollTop = savedPosition ?? 0;
      });
    };

    const timer = setTimeout(restoreScroll, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleDeleteAccount = async () => {
    try {
      await base44.entities.User.delete();
    } catch (err) {
      // Never pretend the account is gone: the person stays signed in and can retry.
      toast({
        title: 'Could not delete your account',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
      return;
    }
    base44.auth.logout('/login');
  };

  const handleTabTap = (path) => {
    tap();
    const currentTab = tabStack.getCurrentTab(location.pathname);
    
    if (currentTab === path) {
      // Same tab: scroll to top
      if (mainRef.current) {
        scrollPositions.current[path] = 0;
        mainRef.current.scrollTop = 0;
        // Force scroll in next frame to ensure it sticks
        requestAnimationFrame(() => {
          if (mainRef.current) mainRef.current.scrollTop = 0;
        });
      }
    } else {
      // Different tab: switch to that tab's stack
      tabStack.switchTab(path);
    }
  };

  useEffect(() => {
    tabStack.updateStack(location.pathname);
  }, [location.pathname, tabStack]);

  useEffect(() => {
    const handleBackPress = (e) => {
      e?.preventDefault?.();
      const didGoBack = tabStack.goBack();
      
      // If no more stack, handle app-level exit
      if (!didGoBack) {
        // For Cordova apps
        if (navigator.app?.exitApp) {
          navigator.app.exitApp();
        }
        // For web, do nothing (natural browser back behavior)
      }
    };

    const handleKeyDown = (e) => {
      // Only intercept Escape key on web (Backspace is handled by Android)
      if (e.key === 'Escape') {
        handleBackPress(e);
      }
    };

    document.addEventListener('backbutton', handleBackPress, false);
    document.addEventListener('keydown', handleKeyDown, false);
    
    return () => {
      document.removeEventListener('backbutton', handleBackPress, false);
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [tabStack]);

  useEffect(() => {
    if (user?.has_accepted_disclaimer) {
      setDisclaimerAccepted(true);
    }
  }, [user?.has_accepted_disclaimer]);

  if (user && !disclaimerAccepted) {
    return (
      <OnboardingDisclaimer
        onAccept={() => {
          setDisclaimerAccepted(true);
          // Remember the acceptance for the rest of the visit (e.g. after opening About).
          refreshUser();
        }}
      />
    );
  }

  return (
    <div 
      className="flex flex-col h-[100dvh] bg-background overflow-hidden"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      {/* Header */}
      <header
        className="relative z-50 bg-background border-b border-border/50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: back button on non-root, logo on root */}
            {!isRoot ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="select-none -ms-2 h-11 w-11"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Link to="/" className="flex items-center gap-2 select-none shrink-0">
                <img
                  src="/media/TheZINNAppLOGOAppStoreGoogle.png"
                  alt="The ZINN App logo"
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap hidden sm:block">The ZINN App</span>
              </Link>
            )}

            {/* Center: page title on mobile */}
            <span className="sm:hidden font-semibold text-sm absolute left-1/2 -translate-x-1/2 max-w-[30%] truncate px-2">
              {navItems.find(n => n.path === location.pathname)?.label ?? 'The ZINN App'}
            </span>

            {/* Desktop Nav */}
            <nav className="hidden sm:flex items-center gap-1 ms-auto me-2 min-w-0">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-label={item.label}
                    title={item.label}
                    className={`select-none flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: settings menu */}
             <div className="relative">
               <Button
                 variant="ghost"
                 size="icon"
                 onClick={() => { tap(); setMenuOpen(o => !o); }}
                 aria-label={t('settings.title')}
                 className="select-none h-11 w-11"
               >
                 <Settings className="w-5 h-5" />
               </Button>
               {menuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                   <div className="absolute end-0 top-full mt-2 z-50 w-48 rounded-md border border-border bg-popover p-1 shadow-md">
                     <button
                       onClick={() => { setMenuOpen(false); setShowTextScaleDialog(true); }}
                       className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                     >
                       <Type className="w-4 h-4" />
                       {t('settings.textSize')}
                       {textScale !== 1 && (
                         <span className="ms-auto text-xs text-muted-foreground">
                           {Math.round(textScale * 100)}%
                         </span>
                       )}
                     </button>
                     <button
                       onClick={() => { setMenuOpen(false); setShowThemeDialog(true); }}
                       className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                     >
                       <Moon className="w-4 h-4" />
                       {t('settings.theme')}
                       {theme !== 'auto' && (
                         <span className="ms-auto text-xs text-muted-foreground capitalize">
                           {theme}
                         </span>
                       )}
                     </button>
                     <button
                       onClick={() => { setMenuOpen(false); setShowLanguageDialog(true); }}
                       className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                     >
                       <Globe className="w-4 h-4" />
                       {t('settings.language')}
                       {language !== 'en' && (
                         <span className="ms-auto text-xs text-muted-foreground uppercase">
                           {language}
                         </span>
                       )}
                     </button>
                     <div className="h-px bg-border my-1" />
                     <Link
                       to="/privacy-policy"
                       onClick={() => { tap(); setMenuOpen(false); }}
                       className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                     >
                       <Shield className="w-4 h-4" />
                       Privacy Policy
                     </Link>
                     {user?.role === 'admin' && (
                       <>
                         <div className="h-px bg-border my-1" />
                         <Link
                           to="/admin"
                           onClick={() => { tap(); setMenuOpen(false); }}
                           className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                         >
                           <Users className="w-4 h-4" />
                           Admin Dashboard
                         </Link>
                       </>
                     )}
                     <div className="h-px bg-border my-1" />
                     <button
                       onClick={() => { setMenuOpen(false); base44.auth.logout(); }}
                       className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent"
                     >
                       <LogOut className="w-4 h-4" />
                       {t('settings.signOut')}
                     </button>
                     <div className="h-px bg-border my-1" />
                     <button
                       onClick={() => { setMenuOpen(false); setShowDeleteDialog(true); }}
                       className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer text-destructive hover:bg-accent"
                     >
                       <Trash2 className="w-4 h-4" />
                       {t('settings.deleteAccount')}
                     </button>
                     <div className="px-2 pt-2 pb-1 text-center text-[11px] text-muted-foreground">
                       The ZINN App v{APP_VERSION}
                     </div>
                   </div>
                 </>
               )}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
       <main 
         ref={mainRef} 
         className="flex-1 max-w-7xl md:max-w-3xl lg:max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8 overflow-y-scroll overflow-x-hidden" 
         style={{ 
           WebkitOverflowScrolling: 'touch',
           WebkitTouchCallout: 'none',
           touchAction: 'manipulation'
         }}
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
       >
         <motion.div
           key={location.pathname}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.2 }}
         >
           <Outlet />
           <PublicFooter />
         </motion.div>
         </main>

      {/* Bottom Nav (mobile only) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50"
        role="tablist"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
      >
        <div className="flex items-stretch justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleTabTap(item.path)}
                role="tab"
                aria-selected={isActive}
                aria-label={item.label}
                className={`select-none flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-xl transition-all duration-200 min-h-[44px] active:opacity-70 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis block w-full px-0.5">{item.shortLabel || item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Text Scale Dialog */}
      <TextScaleDialog
        open={showTextScaleDialog}
        onOpenChange={setShowTextScaleDialog}
        textScale={textScale}
        onScaleChange={setScale}
        onReset={reset}
      />

      {/* Theme Dialog */}
      <ThemeDialog
        open={showThemeDialog}
        onOpenChange={setShowThemeDialog}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Language Dialog */}
      <LanguageDialog
        open={showLanguageDialog}
        onOpenChange={setShowLanguageDialog}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('account.deleteAccountWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('account.confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}