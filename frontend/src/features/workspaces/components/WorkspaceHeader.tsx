import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Users } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { type Workspace } from '../api/workspaces';

interface WorkspaceHeaderProps {
  workspace: Workspace;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ workspace }) => {
  const navigate = useNavigate();

  return (
    <div className="border-b border-border-subtle bg-surface/30 backdrop-blur-xs py-6 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Workspace Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary">
              {workspace.name}
            </h1>
            <span className="text-[10px] text-accent/80 bg-accent/10 border border-accent/15 rounded-xs px-2 py-0.5 font-medium">
              /{workspace.slug}
            </span>
          </div>
          {workspace.description && (
            <p className="text-sm text-secondary max-w-2xl leading-relaxed">
              {workspace.description}
            </p>
          )}
        </div>

        {/* Workspace Operations */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/workspaces/${workspace.id}/members`)}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-accent" />
            Members
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/app/workspaces/${workspace.id}/settings`)}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-accent" />
            Settings
          </Button>
        </div>

      </div>
    </div>
  );
};
