import * as React from 'react';
import { Database, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/Button';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Interactive Demo', href: '#demo' },
    { label: 'Version History', href: '#collaboration' },
    { label: 'SQL Export', href: '#sql-export' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface/80 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 bg-accent/10 rounded-lg flex items-center justify-center border border-accent/20 group-hover:border-accent/40 transition-colors">
            <Database className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-primary">
            Schema<span className="text-accent">Forge</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-secondary hover:text-accent transition-colors duration-150"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-secondary hover:text-primary hover:bg-surface transition-colors"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate('/register')}
            className="bg-accent text-white hover:bg-accent-hover text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-accent/10"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="md:hidden p-2 text-secondary hover:text-primary transition-colors focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 border-b border-border-subtle bg-surface/95 backdrop-blur-lg px-6 py-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-secondary hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <hr className="border-border-subtle" />
          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full text-center text-secondary hover:text-primary py-2.5"
            >
              Log In
            </Button>
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/register');
              }}
              className="w-full bg-accent text-white hover:bg-accent-hover py-2.5 rounded-lg font-semibold text-center"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
