import * as React from 'react';
import { Database, Clock, Sparkles } from 'lucide-react';

export const RecentProjectsRail: React.FC = () => {
  // Static placeholder projects as CRUD is not implemented
  const mockProjects = [
    {
      id: 'proj-1',
      name: 'Acme E-Commerce Schema',
      dialect: 'postgresql',
      updatedAt: '2 hours ago',
      tableCount: 18,
    },
    {
      id: 'proj-2',
      name: 'Auth Service Schema',
      dialect: 'mysql',
      updatedAt: '1 day ago',
      tableCount: 6,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary">
          Recently Opened Schemas
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {mockProjects.map((project) => (
          <div
            key={project.id}
            className="w-full sm:w-80 flex-shrink-0 group rounded-sm border border-border-subtle bg-surface hover:border-accent/40 transition-all duration-200 shadow-md p-5 flex flex-col justify-between h-36 cursor-not-allowed select-none opacity-85"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-secondary font-mono uppercase tracking-wider bg-border-subtle/50 px-2 py-0.5 rounded-xs border border-border-subtle">
                  {project.dialect}
                </span>
                <span className="text-[10px] text-secondary flex items-center gap-1">
                  <Database className="h-3 w-3 text-accent" />
                  {project.tableCount} tables
                </span>
              </div>
              <h3 className="text-sm font-bold text-primary mt-3 truncate group-hover:text-accent transition-colors duration-150">
                {project.name}
              </h3>
            </div>
            <div className="flex items-center justify-between text-[11px] text-secondary border-t border-border-subtle/20 pt-3 mt-2">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-accent/80" />
                ReadOnly Placeholder
              </span>
              <span>Updated {project.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
