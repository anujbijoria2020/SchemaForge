import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Calendar, MoreVertical, FolderArchive, FolderOpen, Edit, Trash2 } from 'lucide-react';
import type { Project } from '../api/projects';
import { useProjectStore } from '../store/projectStore';

interface ProjectCardProps {
  project: Project;
  onRename: () => void;
  onArchive: (archive: boolean) => void;
  onDelete: () => void;
  isArchiving?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onRename,
  onArchive,
  onDelete,
  isArchiving = false,
}) => {
  const navigate = useNavigate();
  const openProject = useProjectStore((state) => state.openProject);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.stop-propagation')) {
      return;
    }
    openProject(project.id);
    navigate(`/app/projects/${project.id}/editor`);
  };

  const getDialectColor = (dialect: string) => {
    switch (dialect) {
      case 'postgresql':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
      case 'mysql':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      case 'sqlite':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      case 'mssql':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/25';
      default:
        return 'text-secondary bg-border-subtle/50 border-border-subtle';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group flex flex-col justify-between rounded-xl border p-5 h-auto shadow-md bg-surface transition-all duration-200 cursor-pointer relative overflow-visible ${
        project.isArchived
          ? 'border-dashed border-border-subtle bg-surface/40 opacity-70 hover:opacity-100 hover:border-border-subtle'
          : 'border-border-subtle hover:border-accent/40 hover:shadow-lg hover:shadow-black/20'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h3
            className={`text-md font-bold truncate transition-colors duration-150 flex-1 text-left ${
              project.isArchived
                ? 'text-secondary font-normal'
                : 'text-primary group-hover:text-accent'
            }`}
          >
            {project.name}
          </h3>
          <div className="flex items-center gap-2 stop-propagation">
            {project.isArchived && (
              <span className="text-[9px] font-semibold text-secondary bg-border-subtle border border-border-subtle px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <FolderArchive className="h-2.5 w-2.5" />
                Archived
              </span>
            )}
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDialectColor(
                project.dialect
              )}`}
            >
              {project.dialect}
            </span>

            {/* Menu Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                disabled={isArchiving}
                className="p-1 rounded-lg hover:bg-border-subtle/80 text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg border border-border-subtle bg-surface shadow-xl z-50 py-1 divide-y divide-border-subtle/60">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onRename();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-primary hover:bg-background hover:text-accent transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Rename Project
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onArchive(!project.isArchived);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-primary hover:bg-background hover:text-accent transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      {project.isArchived ? (
                        <>
                          <FolderOpen className="h-3.5 w-3.5" />
                          Unarchive Project
                        </>
                      ) : (
                        <>
                          <FolderArchive className="h-3.5 w-3.5" />
                          Archive Project
                        </>
                      )}
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary line-clamp-2 mt-1 leading-relaxed text-left">
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Mini schema canvas preview */}
      <div className="h-24 bg-background border border-border-subtle rounded-lg mt-3 flex items-center justify-center gap-3 relative overflow-hidden select-none">
        {/* Dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] bg-[size:8px_8px] opacity-40" />
        
        {/* Table 1 */}
        <div className="z-10 bg-surface border border-border-subtle rounded p-1 w-16 text-[7px] text-left">
          <div className="font-bold border-b border-border-subtle pb-0.5 mb-0.5 text-primary font-mono truncate">users</div>
          <div className="text-secondary font-mono">id</div>
          <div className="text-secondary font-mono">email</div>
        </div>

        {/* Connector line (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <path d="M 115 48 L 140 48" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2,2" />
        </svg>

        {/* Table 2 */}
        <div className="z-10 bg-surface border border-border-subtle rounded p-1 w-16 text-[7px] text-left">
          <div className="font-bold border-b border-border-subtle pb-0.5 mb-0.5 text-primary font-mono truncate font-semibold">orders</div>
          <div className="text-accent font-mono font-semibold">user_id</div>
          <div className="text-secondary font-mono">total</div>
        </div>
      </div>

      {/* Footer details */}
      <div className="flex items-center justify-between text-xs text-secondary border-t border-border-subtle/20 pt-4 mt-3">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Database className="h-3.5 w-3.5 text-accent" />
          <span className="font-semibold text-primary">{project.tableCount ?? 0}</span> tables
        </span>
        <span className="text-[11px] flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          Created {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
