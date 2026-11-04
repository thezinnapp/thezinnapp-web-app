import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_URL = '/media/TheZINNAppLOGOAppStoreGoogle.png';

// Header used on public pages (About, Contact, Privacy Policy).
export default function PublicHeader({ showLogin = true }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <header className="border-b border-border/50 bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          aria-label="Back"
          className="select-none -ms-2 h-11 w-11 shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Link to="/" className="flex items-center gap-2 select-none min-w-0">
          <img src={LOGO_URL} alt="The ZINN App logo" className="w-8 h-8 rounded-xl object-cover shrink-0" />
          <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap truncate">The ZINN App</span>
        </Link>
        {showLogin && (
          <Link to="/login" className="ms-auto text-sm text-primary font-medium hover:underline shrink-0">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
