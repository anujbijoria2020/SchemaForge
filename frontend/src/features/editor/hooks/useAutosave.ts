import { useEffect, useCallback } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { useSaveSchema } from '../api/schema';

export const useAutosave = (projectId: string | undefined) => {
  const tables = useSchemaStore((state) => state.tables);
  const relationships = useSchemaStore((state) => state.relationships);
  const canvasState = useSchemaStore((state) => state.canvasState);
  const isDirty = useSchemaStore((state) => state.isDirty);
  
  const setDirty = useSchemaStore((state) => state.setDirty);
  const setSaving = useSchemaStore((state) => state.setSaving);
  const setSaveError = useSchemaStore((state) => state.setSaveError);
  const setLastSavedAt = useSchemaStore((state) => state.setLastSavedAt);

  const saveMutation = useSaveSchema(projectId);
  const { mutate, isPending, isError, failureCount } = saveMutation;

  // Sync React Query mutation states to the Zustand store
  useEffect(() => {
    setSaving(isPending);
    setSaveError(failureCount > 0 || isError);
  }, [isPending, isError, failureCount, setSaving, setSaveError]);

  // Save execution
  const triggerSave = useCallback(() => {
    if (!isDirty || !projectId) return;

    const payload = {
      canvasState: {
        zoom: canvasState.zoom,
        pan: canvasState.pan,
        relationships: relationships,
        tables: tables, // Embed full schema tables copy for versioning snapshots
      },
      tables: tables.map((t) => ({
        name: t.name,
        color: t.color || null,
        positionX: t.positionX,
        positionY: t.positionY,
        columns: t.columns.map((c) => ({
          name: c.name,
          dataType: c.dataType,
          isNullable: c.isNullable,
          isPrimaryKey: c.isPrimaryKey,
          isUnique: c.isUnique,
          defaultValue: c.defaultValue,
          checkExpr: c.checkExpr,
          sortOrder: c.sortOrder,
        })),
      })),
    };

    mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        setLastSavedAt(new Date());
      },
      onError: () => {
        // isDirty is left as true to trigger retries/keep visual warnings
      },
    });
  }, [isDirty, projectId, tables, relationships, canvasState, mutate, setDirty, setLastSavedAt]);

  // Debounced autosave (1.5s inactivity)
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      triggerSave();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDirty, tables, relationships, canvasState, triggerSave]);

  // Immediate save on Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSave]);

  return {
    triggerSave,
    isSaving: isPending,
    isError: failureCount > 0 || isError,
  };
};
