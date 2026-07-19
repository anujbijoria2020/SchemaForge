import { useEffect, useCallback } from 'react';
import { useHistoryStore } from '../store/historyStore';
import { useSchemaStore } from '../store/schemaStore';

export const useUndoRedo = () => {
  const undo = useHistoryStore((state) => state.undo);
  const redo = useHistoryStore((state) => state.redo);
  const applyPatch = useSchemaStore((state) => state.applyPatch);

  const handleUndo = useCallback(() => undo(applyPatch), [undo, applyPatch]);
  const handleRedo = useCallback(() => redo(applyPatch), [redo, applyPatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Exclude forms / text editors so Ctrl+Z behaves normally in input elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isCtrlZ = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z';
      if (isCtrlZ) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      const isCtrlY = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y';
      if (isCtrlY) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo: useHistoryStore((state) => state.past.length > 0),
    canRedo: useHistoryStore((state) => state.future.length > 0),
  };
};
