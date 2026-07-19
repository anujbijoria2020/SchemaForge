import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Database, Clock, Sparkles } from 'lucide-react';
import { useProjectStore } from '../../projects/store/projectStore';
import { apiRequest } from '../../../shared/lib/api-client';
import type { Project, ProjectResponse } from '../../projects/api/projects';

export const RecentProjectsRail: React.FC = () => {
  const navigate = useNavigate();
  const { recentProjectIds, openProject } = useProjectStore();

  const results = useQueries({
    queries: recentProjectIds.map((id) => ({
      queryKey: ['project', id],
      queryFn: async () => {
        const response = await apiRequest<ProjectResponse>(`/projects/${id}`);
        return response.data.project;
      },
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });

  const recentProjects = results
    .map((r) => r.data)
    .filter((p): p is Project => !!p && !p.isArchived);

  const isLoading = results.some((r) => r.isLoading);

  const handleProjectClick = (projectId: string) => {
    openProject(projectId);
    navigate(`/app/projects/${projectId}/editor`);
  };

  // If no projects and not loading, don't show the rail
  if ((!recentProjects || recentProjects.length === 0) && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
          Recently Opened Schemas
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {isLoading
          ? [1, 2].map((n) => (
              <div
                key={n}
                className="w-full sm:w-80 flex-shrink-0 rounded-sm border border-border-subtle bg-surface/50 h-36 p-5 space-y-3 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3 w-16 bg-border rounded-xs" />
                  <div className="h-3.5 w-16 bg-border rounded-xs" />
                </div>
                <div className="h-5 w-3/4 bg-border rounded-xs" />
                <div className="h-3 w-1/2 bg-border rounded-xs mt-4" />
              </div>
            ))
          : recentProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="w-full sm:w-80 flex-shrink-0 group rounded-sm border border-border-subtle bg-surface hover:border-accent/40 transition-all duration-200 shadow-md p-5 flex flex-col justify-between h-36 cursor-pointer select-none"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-secondary font-mono uppercase tracking-wider bg-border-subtle/50 px-2 py-0.5 rounded-xs border border-border-subtle">
                      {project.dialect}
                    </span>
                    <span className="text-[10px] text-secondary flex items-center gap-1.5">
                      <Database className="h-3 w-3 text-accent" />
                      {project.tableCount ?? 0} tables
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-primary mt-3 truncate group-hover:text-accent transition-colors duration-150">
                    {project.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-[11px] text-secondary border-t border-border-subtle/20 pt-3 mt-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-accent/80" />
                    Open Designer
                  </span>
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};
