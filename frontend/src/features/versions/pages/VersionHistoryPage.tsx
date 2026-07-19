import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, History, AlertTriangle } from 'lucide-react';

import { Button } from '../../../shared/components/ui/Button';
import { apiRequest } from '../../../shared/lib/api-client';
import { useProjectSchema } from '../../editor/api/schema';
import { 
  useProjectVersions, 
  useCreateVersion, 
  type VersionData,
  type VersionResponse 
} from '../api/versions';
import { VersionTimeline } from '../components/VersionTimeline';
import { CreateVersionDialog } from '../components/CreateVersionDialog';
import { RestoreConfirmDialog } from '../components/RestoreConfirmDialog';
import { useSchemaStore } from '../../editor/store/schemaStore';
import { useSelectionStore } from '../../editor/store/selectionStore';
import { useToast } from '../../../shared/components/ui/Toast';

export const VersionHistoryPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dialog visibility states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  
  // Selected version for restore
  const [selectedVersionForRestore, setSelectedVersionForRestore] = useState<VersionData | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Queries & Mutations
  const { data: projectData, isLoading: isProjectLoading } = useProjectSchema(projectId);
  const { data: versions, isLoading: isVersionsLoading, isError } = useProjectVersions(projectId);
  const createMutation = useCreateVersion(projectId);

  const project = projectData?.project;

  const handleCreateSnapshot = (data: { label: string; description: string | null }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        toast('Version checkpoint saved successfully.', { variant: 'success' });
      },
      onError: (err) => {
        console.error('Failed to create manual snapshot:', err);
        toast('Failed to save version checkpoint.', { variant: 'danger' });
      },
    });
  };

  const handleRestoreClick = (version: VersionData) => {
    setSelectedVersionForRestore(version);
    setIsRestoreConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedVersionForRestore || !projectId) return;

    setIsRestoring(true);
    try {
      // 1. Fetch full version details containing serialized tables/relationships in canvasState JSON
      const response = await apiRequest<VersionResponse>(`/projects/${projectId}/versions/${selectedVersionForRestore.id}`);
      const fullVersion = response.data.version;
      const snapshot = fullVersion.canvasState;

      const snapshotTables = snapshot.tables || [];
      const snapshotRelationships = snapshot.relationships || [];
      const zoom = snapshot.zoom ?? 1;
      const pan = snapshot.pan ?? { x: 0, y: 0 };

      // 2. Load snapshot into Zustand schema store
      const hydrateSchema = useSchemaStore.getState().hydrateSchema;
      hydrateSchema({
        tables: snapshotTables,
        relationships: snapshotRelationships,
        canvasState: { zoom, pan },
      });

      // 3. Mark the editor dirty to kick off M12 autosave
      const setDirty = useSchemaStore.getState().setDirty;
      setDirty(true);

      // 4. Clear existing select/hover states
      const clearSelection = useSelectionStore.getState().clearSelection;
      clearSelection();

      // 5. Redirect user back to the visual editor to auto-persist and show visual progress
      toast('Workspace schema restored successfully!', { variant: 'success' });
      navigate(`/app/projects/${projectId}/editor`);
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
      toast('Failed to restore version snapshot. Please try again.', { variant: 'danger' });
    } finally {
      setIsRestoring(false);
      setSelectedVersionForRestore(null);
      setIsRestoreConfirmOpen(false);
    }
  };

  const isLoading = isProjectLoading || isVersionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080B14] text-primary font-sans flex flex-col select-none">
        {/* Header Skeleton */}
        <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-sm bg-border/20 animate-pulse" />
            <div className="h-4 w-40 bg-border/20 rounded-xs animate-pulse" />
          </div>
          <div className="h-8 w-32 bg-border/20 rounded-sm animate-pulse" />
        </header>

        {/* Content Skeleton */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-border/20 rounded-xs animate-pulse" />
            <div className="h-4 w-96 bg-border/20 rounded-xs animate-pulse" />
          </div>

          {/* Timeline Skeleton */}
          <div className="relative pl-[18px] mt-6">
            <div className="absolute top-4 bottom-4 left-[11px] w-px bg-border/30" />
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative bg-[#0F1420]/50 border border-[#1E293B]/50 rounded-sm p-4 h-24 flex items-center justify-between animate-pulse">
                  <div className="absolute top-1/2 -left-[25px] -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-border/40 bg-[#080B14]" />
                  <div className="space-y-2.5 flex-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <div className="h-4.5 w-32 bg-border/20 rounded-xs" />
                      <div className="h-4 w-20 bg-border/20 rounded-xs" />
                    </div>
                    <div className="h-3.5 w-5/6 bg-border/20 rounded-xs" />
                    <div className="h-3 w-1/3 bg-border/20 rounded-xs" />
                  </div>
                  <div className="h-8 w-20 bg-border/20 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#080B14] text-primary font-sans flex items-center justify-center p-6 flex-col">
        <div className="border border-destructive/30 bg-surface/50 max-w-lg w-full rounded-sm p-6 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-md font-bold">Failed to load history</h3>
              <p className="text-xs text-secondary mt-0.5">
                The project history is currently unavailable or you do not have permission.
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
    <div className="min-h-screen bg-[#080B14] text-primary font-sans flex flex-col">
      {/* Top Bar Header */}
      <header className="h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/app/projects/${projectId}/editor`}
            className="h-8 w-8 rounded-sm border border-border bg-background/50 hover:bg-white/5 transition-colors flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
            title="Back to Editor"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="text-secondary hover:text-primary transition-colors cursor-pointer">Projects</span>
            <span className="text-secondary/40">/</span>
            <span className="text-secondary hover:text-primary transition-colors cursor-pointer truncate font-medium">
              {project.name}
            </span>
            <span className="text-secondary/40">/</span>
            <span className="text-primary font-semibold flex items-center gap-1.5 shrink-0">
              <History className="h-3.5 w-3.5 text-accent" />
              Version History
            </span>
          </div>
        </div>

        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-sm shadow-accent/25"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Checkpoint</span>
          </Button>
        </div>
      </header>

      {/* Main content body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-md font-bold text-primary">Version History Timeline</h2>
          <p className="text-xs text-secondary mt-0.5">
            Immutable snapshots automatically created on edits, or manually checkpointed by editors.
          </p>
        </div>

        {/* Vertical feed list */}
        <VersionTimeline
          versions={versions || []}
          onRestoreClick={handleRestoreClick}
        />
      </main>

      {/* Create snapshot modal dialog */}
      <CreateVersionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={handleCreateSnapshot}
        isPending={createMutation.isPending}
      />

      {/* Restore confirmation dialog */}
      <RestoreConfirmDialog
        open={isRestoreConfirmOpen}
        onOpenChange={setIsRestoreConfirmOpen}
        onConfirm={handleConfirmRestore}
        isPending={isRestoring}
        versionLabel={selectedVersionForRestore?.label || null}
      />
    </div>
  );
};
