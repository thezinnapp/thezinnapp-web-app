import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link to="/about" className="hover:text-foreground hover:underline">About</Link>
        <Link to="/contact" className="hover:text-foreground hover:underline">Contact</Link>
        <Link to="/privacy-policy" className="hover:text-foreground hover:underline">Privacy Policy</Link>
        <Link to="/login" className="hover:text-foreground hover:underline">Log in</Link>
        <a href="https://thezinnapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">The ZINN App Website</a>
      </nav>
      <p className="mt-3">© {new Date().getFullYear()} The ZINN App. All rights reserved.</p>
    </footer>
  );
}