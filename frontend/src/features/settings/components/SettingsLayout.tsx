import * as React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ArrowLeft, User, ShieldAlert, Sliders } from 'lucide-react';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';

export const SettingsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-primary font-sans flex flex-col pb-16 relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-accent rounded-sm flex items-center justify-center shadow-md shadow-accent/20">
            <Sliders className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">Settings</h1>
            <p className="text-[10px] text-secondary">Manage your SchemaForge preferences</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/app"
            className="text-xs text-secondary hover:text-primary transition-colors duration-150 flex items-center gap-1.5 font-semibold cursor-pointer border border-border-subtle bg-surface rounded-sm px-3 py-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Settings Frame */}
      <main className="max-w-4xl w-full mx-auto px-6 sm:px-8 mt-10 space-y-8 z-10 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-border-subtle pb-4 md:pb-0 md:pr-4">
              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'text-secondary hover:text-primary hover:bg-surface/50'
                  }`
                }
              >
                <User className="h-4 w-4" />
                Profile Settings
              </NavLink>

              <NavLink
                to="account"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-md shadow-accent/20'
                      : 'text-secondary hover:text-primary hover:bg-surface/50'
                  }`
                }
              >
                <ShieldAlert className="h-4 w-4" />
                Account & Security
              </NavLink>
            </nav>
          </aside>

          {/* Settings Section Viewport */}
          <section className="flex-1 min-w-0 bg-surface/30 border border-border-subtle rounded-sm p-6 sm:p-8 backdrop-blur-xs">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
};
