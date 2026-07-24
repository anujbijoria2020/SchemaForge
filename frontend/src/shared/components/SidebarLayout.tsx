import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useWorkspaces, type Workspace } from '../../features/workspaces/api/workspaces';
import { apiRequest } from '../lib/api-client';
import { Button } from './ui/Button';
import {
  Database,
  LayoutGrid,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home
} from 'lucide-react';
import { cn } from '../lib/cn';

interface SidebarLayoutProps {
  children: React.ReactNode;
  workspaceId?: string;
  workspace?: Workspace;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, workspaceId, workspace }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [switcherOpen, setSwitcherOpen] = React.useState(false);

  const { data: workspaces } = useWorkspaces();

  // Close mobile drawer on route changes
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Determine active states for workspace navigation links
  const isProjectsActive = workspaceId
    ? location.pathname === `/app/workspaces/${workspaceId}` ||
    location.pathname.startsWith(`/app/workspaces/${workspaceId}/projects`)
    : false;
  const isMembersActive = workspaceId ? location.pathname.startsWith(`/app/workspaces/${workspaceId}/members`) : false;
  const isSettingsActive = workspaceId ? location.pathname.startsWith(`/app/workspaces/${workspaceId}/settings`) : false;
  const isDashboardActive = location.pathname === '/app';
  const isProfileSettingsActive = location.pathname.startsWith('/app/settings');

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface text-primary border-r border-border-subtle overflow-hidden">
      {/* Sidebar Header: Logo & Studio */}
      <div className="p-5 border-b border-border-subtle flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Link to="/app" className="h-9 w-9 bg-accent/15 rounded-lg flex items-center justify-center border border-accent/25 hover:border-accent/40 transition-colors shrink-0">
            <Database className="h-5 w-5 text-accent" strokeWidth={2} />
          </Link>
          <div className="text-left">
            <Link to="/app" className="text-md font-bold tracking-tight text-primary block hover:text-accent/90 transition-colors">
              Schema<span className="text-accent">Forge</span>
            </Link>
            <p className="text-[9px] text-secondary font-medium tracking-wide uppercase mt-0.5">
              by <a className="hover:text-accent transition-colors font-semibold" href="https://github.com/anujbijoria2020" target="_blank" rel="noopener noreferrer">Anuj Patel</a>
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="px-4 py-3 border-b border-border-subtle relative">
        <label className="text-[10px] font-semibold text-secondary uppercase tracking-wider block mb-1 px-1 text-left">
          Workspace
        </label>
        <button
          onClick={() => setSwitcherOpen(!switcherOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-background hover:bg-background/80 border border-border-subtle rounded-lg text-sm text-primary font-medium transition-colors cursor-pointer"
        >
          <span className="truncate text-left">
            {workspace ? workspace.name : 'Choose Workspace...'}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-secondary transition-transform", switcherOpen && "rotate-180")} />
        </button>

        {switcherOpen && (
          <div className="absolute top-full left-4 right-4 mt-1 bg-surface border border-border-subtle rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in duration-100">
            <div className="max-h-48 overflow-y-auto py-1">
              <button
                onClick={() => {
                  setSwitcherOpen(false);
                  navigate('/app');
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-accent/10 hover:text-accent font-medium transition-colors cursor-pointer",
                  !workspaceId && "text-accent bg-accent/5 font-semibold"
                )}
              >
                <Home className="h-3.5 w-3.5" />
                All Workspaces Dashboard
              </button>
              <div className="h-px bg-border-subtle my-1" />
              {workspaces && workspaces.length > 0 ? (
                workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setSwitcherOpen(false);
                      navigate(`/app/workspaces/${ws.id}`);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs truncate hover:bg-accent/10 hover:text-accent font-medium transition-colors cursor-pointer",
                      ws.id === workspaceId && "text-accent bg-accent/5 font-semibold"
                    )}
                  >
                    💼 {ws.name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-[10px] text-secondary">No workspaces found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto text-left">
        {workspaceId ? (
          <>
            <div className="px-3 mb-2 text-[10px] font-semibold text-secondary uppercase tracking-wider font-mono">
              Workspace Actions
            </div>
            <Link
              to={`/app/workspaces/${workspaceId}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isProjectsActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
            >
              <LayoutGrid className={cn("h-4 w-4 transition-colors", isProjectsActive ? "text-accent" : "text-secondary group-hover:text-primary")} />
              Database Schemas
            </Link>
            <Link
              to={`/app/workspaces/${workspaceId}/members`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isMembersActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
            >
              <Users className={cn("h-4 w-4 transition-colors", isMembersActive ? "text-accent" : "text-secondary group-hover:text-primary")} />
              Members List
            </Link>
            <Link
              to={`/app/workspaces/${workspaceId}/settings`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isSettingsActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
            >
              <Settings className={cn("h-4 w-4 transition-colors", isSettingsActive ? "text-accent" : "text-secondary group-hover:text-primary")} />
              Workspace Settings
            </Link>
            <div className="h-px bg-border-subtle my-3 mx-3" />
            <Link
              to="/app"
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-secondary hover:text-primary transition-all font-mono"
            >
              ← Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="px-3 mb-2 text-[10px] font-semibold text-secondary uppercase tracking-wider font-mono">
              Main Menu
            </div>
            <Link
              to="/app"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isDashboardActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
            >
              <Home className={cn("h-4 w-4 transition-colors", isDashboardActive ? "text-accent" : "text-secondary group-hover:text-primary")} />
              Dashboard
            </Link>
            <Link
              to="/app/settings/profile"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isProfileSettingsActive
                  ? "bg-accent/10 text-accent border-l-2 border-accent"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
            >
              <Settings className={cn("h-4 w-4 transition-colors", isProfileSettingsActive ? "text-accent" : "text-secondary group-hover:text-primary")} />
              Profile Settings
            </Link>
          </>
        )}
      </nav>

      {/* User Footer Account details & Logout */}
      <div className="p-4 border-t border-border-subtle bg-background/50 flex flex-col gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
            {getInitials(user?.displayName || user?.email)}
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <div className="text-xs font-bold text-primary truncate">
              {user?.displayName || 'User'}
            </div>
            <div className="text-[10px] text-secondary truncate">
              {user?.email || ''}
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 font-semibold text-xs border border-border-subtle cursor-pointer hover:bg-surface/80"
        >
          <LogOut className="h-3.5 w-3.5 text-secondary" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-primary font-sans flex select-none relative">
      {/* Mobile Top Header (only on mobile, contains Hamburger button) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border-subtle flex items-center justify-between px-4 z-40">
        <Link to="/app" className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent" />
          <span className="text-sm font-bold tracking-tight text-primary">
            Schema<span className="text-accent">Forge</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-secondary hover:text-primary hover:bg-background rounded-lg focus:outline-none transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:block fixed top-0 bottom-0 left-0 w-64 z-30 animate-in fade-in duration-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          {/* Off-canvas sidebar */}
          <div className="relative w-64 h-full z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen pt-14 md:pt-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};
