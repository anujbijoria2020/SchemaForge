import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Database } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';

import { useWorkspace } from '../../workspaces/api/workspaces';
import { Button } from '../../../shared/components/ui/Button';
import { EditorToolbar } from '../components/toolbar/EditorToolbar';
import { EditorSidebar } from '../components/sidebar/EditorSidebar';
import { EditorCanvas } from '../components/canvas/EditorCanvas';
import { EditorInspector } from '../components/inspector/EditorInspector';
import { EditorBottomBar } from '../components/canvas/EditorBottomBar';
import { cn } from '../../../shared/lib/cn';
import { useProjectSchema } from '../api/schema';
import { useAutosave } from '../hooks/useAutosave';
import { useSchemaStore } from '../store/schemaStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CommandPalette } from '../../../shared/components/CommandPalette';
import { SqlPreviewDrawer } from '../components/sql-preview/SqlPreviewDrawer';

interface EditorInnerProps {
  project: any;
  workspace: any;
  projectData: any;
}

const EditorInner: React.FC<EditorInnerProps> = ({ project, workspace, projectData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);

  const hydrateSchema = useSchemaStore((state) => state.hydrateSchema);

  // Hydrate store exactly once when schema is loaded
  React.useEffect(() => {
    if (projectData?.schema) {
      hydrateSchema(projectData.schema);
    }
  }, [projectData?.schema, hydrateSchema]);

  // Activate autosave hook
  const { triggerSave } = useAutosave(project.id);

  // Activate keyboard shortcuts hook
  useKeyboardShortcuts({
    toggleCommandPalette: () => setIsCommandPaletteOpen((open) => !open),
    triggerSave,
  });

  return (
    <div className="min-h-screen max-h-screen h-screen bg-background text-primary font-sans flex flex-col select-none overflow-hidden relative">
      {/* Top Bar */}
      <EditorToolbar
        initialProjectName={project.name}
        dialect={project.dialect}
        workspaceId={project.workspaceId}
        workspaceName={workspace?.name}
      />

      {/* Main layout container containing Sidebar, Canvas (with BottomBar), and Inspector */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Sidebar Backdrop on Mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs z-35 md:hidden"
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out border-r border-border bg-surface shrink-0 z-40",
            // Desktop (md and up) behavior
            "md:relative md:translate-x-0 md:opacity-100",
            // Mobile (below md) behavior: float over canvas
            "absolute top-0 bottom-0 left-0 w-64 shadow-2xl md:shadow-none",
            isSidebarOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full md:w-0 md:-translate-x-0 md:border-r-0 overflow-hidden opacity-0 md:opacity-100"
          )}
        >
          <div className="w-64 h-full shrink-0">
            <EditorSidebar />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#080B14]">
          {/* Floating Sidebar Toggle - Shifts on mobile when sidebar is open */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "absolute top-4 z-50 h-8 w-8 rounded-sm bg-surface/85 border border-border backdrop-blur-md flex items-center justify-center text-secondary hover:text-primary hover:bg-surface transition-all cursor-pointer shadow-md focus:outline-none focus:ring-1 focus:ring-accent",
              isSidebarOpen ? "left-[272px] md:left-4" : "left-4"
            )}
            title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>

          {/* Floating Inspector Toggle - Shifts on mobile when inspector is open */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={cn(
              "absolute top-4 z-50 h-8 w-8 rounded-sm bg-surface/85 border border-border backdrop-blur-md flex items-center justify-center text-secondary hover:text-primary hover:bg-surface transition-all cursor-pointer shadow-md focus:outline-none focus:ring-1 focus:ring-accent",
              isInspectorOpen ? "right-[336px] lg:right-4" : "right-4"
            )}
            title={isInspectorOpen ? "Hide Inspector" : "Show Inspector"}
          >
            {isInspectorOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>

          {/* Dotted Canvas */}
          <div className="flex-1 min-h-0 relative">
            <EditorCanvas dialect={project.dialect} />
          </div>

          {/* Bottom Bar */}
          <EditorBottomBar />
        </div>

        {/* Inspector Backdrop on Mobile */}
        {isInspectorOpen && (
          <div
            onClick={() => setIsInspectorOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs z-35 lg:hidden"
          />
        )}

        {/* Inspector */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out border-l border-border bg-surface shrink-0 z-40",
            // Desktop (lg and up) behavior
            "lg:relative lg:translate-x-0 lg:opacity-100",
            // Mobile (below lg) behavior: float over canvas
            "absolute top-0 bottom-0 right-0 w-80 shadow-2xl lg:shadow-none",
            isInspectorOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full lg:w-0 lg:translate-x-0 lg:border-l-0 overflow-hidden opacity-0 lg:opacity-100"
          )}
        >
          <div className="w-80 h-full shrink-0">
            <EditorInspector dialect={project.dialect} />
          </div>
        </div>
      </div>

      {/* Command Palette Dialog */}
      <CommandPalette open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen} />

      {/* SQL Preview Drawer */}
      <SqlPreviewDrawer projectName={project.name} defaultDialect={project.dialect} />
    </div>
  );
};

export const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    data: projectData,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useProjectSchema(projectId);

  const project = projectData?.project;

  const {
    data: workspace,
  } = useWorkspace(project?.workspaceId);

  const isLoading = isProjectLoading;
  const isError = isProjectError || !project;

  if (isLoading) {
    return (
      <div className="min-h-screen max-h-screen h-screen bg-[#080B14] text-primary font-sans flex flex-col select-none overflow-hidden relative">
        {/* Top Bar Skeleton */}
        <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between shrink-0 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 bg-border/20 rounded-sm" />
            <div className="h-4 w-px bg-border/20" />
            <div className="h-4 w-24 bg-border/20 rounded-xs hidden sm:block" />
            <div className="h-7 w-7 bg-border/20 rounded-sm" />
            <div className="h-5 w-32 bg-border/20 rounded-xs" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-border/20 rounded-xs" />
            <div className="h-8 w-24 bg-border/20 rounded-sm" />
          </div>
        </header>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Sidebar Skeleton */}
          <div className="hidden md:block w-64 border-r border-border bg-surface shrink-0 p-4 space-y-4 animate-pulse">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="h-4 w-24 bg-border/20 rounded-xs" />
              <div className="h-5 w-8 bg-border/20 rounded-sm" />
            </div>
            <div className="h-8 bg-border/20 rounded-sm" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex justify-between items-center h-6">
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 bg-border/20 rounded-xs" />
                    <div className="h-3 w-16 bg-border/20 rounded-xs" />
                  </div>
                  <div className="h-3 w-6 bg-border/20 rounded-xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Skeleton */}
          <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#080B14]">
            {/* Grid dots background pattern */}
            <div 
              className="absolute inset-0 opacity-25" 
              style={{
                backgroundImage: 'radial-gradient(#1E293B 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="flex-1 flex items-center justify-center relative z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 bg-accent/15 border border-accent/25 rounded-full flex items-center justify-center text-accent shadow-lg shadow-accent/15 animate-pulse">
                  <Database className="h-5 w-5" />
                </div>
                <p className="text-[10px] text-secondary/60 tracking-wider font-semibold uppercase animate-pulse">
                  Loading visual editor shell...
                </p>
              </div>
            </div>
          </div>

          {/* Inspector Skeleton */}
          <div className="hidden lg:block w-80 border-l border-border bg-surface shrink-0 p-6 space-y-6 animate-pulse">
            <div className="space-y-2 pb-4 border-b border-border/60">
              <div className="h-5 w-32 bg-border/20 rounded-xs" />
              <div className="h-3.5 w-48 bg-border/20 rounded-xs" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-2">
                  <div className="h-3.5 w-20 bg-border/20 rounded-xs" />
                  <div className="h-8 bg-border/20 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background text-primary font-sans flex items-center justify-center p-6 flex-col">
        <div className="border border-destructive/30 bg-surface/50 max-w-lg w-full rounded-sm p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-md font-bold">Project not found</h3>
              <p className="text-xs text-secondary mt-0.5">
                {projectError?.message || 'The project does not exist or you do not have permission.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-border-subtle/20 pt-4">
            <Button variant="primary" size="sm" onClick={() => navigate('/app')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <EditorInner project={project} workspace={workspace} projectData={projectData} />
    </ReactFlowProvider>
  );
};
