import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Beliefs from '@/pages/Beliefs';
import SocialAnalysis from '@/pages/SocialAnalysis';
import ThinkingReport from '@/pages/ThinkingReport';
import Boundaries from '@/pages/Boundaries';
import MaslowNeeds from '@/pages/MaslowNeeds';
import SelfAwareness from '@/pages/SelfAwareness';
import Spiritual from '@/pages/Spiritual';
import AdminDashboard from '@/pages/AdminDashboard';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

// Browser tab titles per page (the same titles the live app showed).
const PAGE_TITLES = {
  '/login': 'Login | The ZINN App',
  '/register': 'Register | The ZINN App',
  '/forgot-password': 'Forgot Password | The ZINN App',
  '/reset-password': 'Reset Password | The ZINN App',
  '/privacy-policy': 'Privacy Policy | The ZINN App',
  '/about': 'About | The ZINN App',
  '/contact': 'Contact | The ZINN App',
  '/': 'The ZINN App',
  '/social-analysis': 'Social Analysis | The ZINN App',
  '/thinking-report': 'Thinking Report | The ZINN App',
  '/boundaries': 'Boundaries | The ZINN App',
  '/maslow': 'Maslow Needs | The ZINN App',
  '/self-awareness': 'Self Awareness | The ZINN App',
  '/spiritual': 'Spiritual | The ZINN App',
  '/admin': 'Admin Dashboard | The ZINN App',
};

const PageTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '').toLowerCase() : '/';
    document.title = PAGE_TITLES[path] || 'The ZINN App';
  }, [pathname]);
  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, authChecked } = useAuth();

  // Only the very first check hides the whole app. Later checks (for example, an
  // account switch) are handled by ProtectedRoute, so public pages such as
  // /reset-password stay on screen and keep what the person typed.
  if (isLoadingPublicSettings || (isLoadingAuth && !authChecked)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Beliefs />} />
          <Route path="/social-analysis" element={<SocialAnalysis />} />
          <Route path="/thinking-report" element={<ThinkingReport />} />
          <Route path="/boundaries" element={<Boundaries />} />
          <Route path="/maslow" element={<MaslowNeeds />} />
          <Route path="/self-awareness" element={<SelfAwareness />} />
          <Route path="/spiritual" element={<Spiritual />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <PageTitle />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <SonnerToaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App