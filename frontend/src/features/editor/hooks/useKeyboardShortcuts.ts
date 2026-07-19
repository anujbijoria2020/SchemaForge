import { useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useSchemaStore } from '../store/schemaStore';
import { useSelectionStore } from '../store/selectionStore';

interface KeyboardShortcutsOptions {
  toggleCommandPalette: () => void;
  triggerSave: () => void;
}

export const useKeyboardShortcuts = ({
  toggleCommandPalette,
  triggerSave,
}: KeyboardShortcutsOptions) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const tables = useSchemaStore((state) => state.tables);
  const addTable = useSchemaStore((state) => state.addTable);
  const deleteTable = useSchemaStore((state) => state.deleteTable);
  const deleteRelationship = useSchemaStore((state) => state.deleteRelationship);

  const selectedTableIds = useSelectionStore((state) => state.selectedTableIds);
  const selectedRelationshipIds = useSelectionStore((state) => state.selectedRelationshipIds);
  const setSelectedTableIds = useSelectionStore((state) => state.setSelectedTableIds);
  const setSelectedRelationshipIds = useSelectionStore((state) => state.setSelectedRelationshipIds);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check if focus is inside an input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Force save (Ctrl+S / Cmd+S) is allowed even when typing in input fields!
      const isCtrlS = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';
      if (isCtrlS) {
        e.preventDefault();
        triggerSave();
        return;
      }

      // Command palette toggle (Ctrl+K / Cmd+K) is allowed from inputs too!
      const isCtrlK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCtrlK) {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // If an input is focused, ignore other canvas shortcuts
      if (isInput) return;

      const key = e.key.toLowerCase();
      const isCtrlOrMeta = e.metaKey || e.ctrlKey;

      // ⌘A: Select All Tables
      if (isCtrlOrMeta && key === 'a') {
        e.preventDefault();
        setSelectedTableIds(tables.map((t) => t.id));
        setSelectedRelationshipIds([]);
        return;
      }

      // ⌘D: Duplicate Selected Table
      if (isCtrlOrMeta && key === 'd') {
        e.preventDefault();
        if (selectedTableIds.length > 0) {
          const sourceId = selectedTableIds[0];
          const sourceTable = tables.find((t) => t.id === sourceId);
          if (sourceTable) {
            const copyColumns = sourceTable.columns.map((c) => ({
              ...c,
              id: crypto.randomUUID(),
              isForeignKey: false,
            }));
            addTable({
              name: `${sourceTable.name}_copy`,
              color: sourceTable.color,
              positionX: sourceTable.positionX + 50,
              positionY: sourceTable.positionY + 50,
              columns: copyColumns,
            });
          }
        }
        return;
      }

      // Delete / Backspace: Delete Selection
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedTableIds.length > 0) {
          selectedTableIds.forEach((id) => deleteTable(id));
          clearSelection();
        } else if (selectedRelationshipIds.length > 0) {
          selectedRelationshipIds.forEach((id) => deleteRelationship(id));
          clearSelection();
        }
        return;
      }

      // Esc: Clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
        return;
      }

      // Shift+1: Zoom to Fit
      if (e.shiftKey && e.key === '1') {
        e.preventDefault();
        fitView({ duration: 300 });
        return;
      }

      // Zoom in (+) and Zoom out (-)
      const isPlus = e.key === '+' || e.key === '=';
      const isMinus = e.key === '-';

      if (isPlus) {
        e.preventDefault();
        zoomIn();
        return;
      }

      if (isMinus) {
        e.preventDefault();
        zoomOut();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    tables,
    addTable,
    deleteTable,
    deleteRelationship,
    selectedTableIds,
    selectedRelationshipIds,
    setSelectedTableIds,
    setSelectedRelationshipIds,
    clearSelection,
    zoomIn,
    zoomOut,
    fitView,
    triggerSave,
    toggleCommandPalette,
  ]);
};
