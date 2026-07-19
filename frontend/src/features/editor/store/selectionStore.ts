import { create } from 'zustand';

export interface SelectionStore {
  selectedTableIds: string[];
  selectedRelationshipIds: string[];
  selectedColumnId: string | null;
  hoveredNodeId: string | null;
  isSqlPreviewOpen: boolean;

  setSelectedTableIds: (ids: string[]) => void;
  setSelectedRelationshipIds: (ids: string[]) => void;
  setSelectedColumnId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setIsSqlPreviewOpen: (open: boolean) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedTableIds: [],
  selectedRelationshipIds: [],
  selectedColumnId: null,
  hoveredNodeId: null,
  isSqlPreviewOpen: false,

  setSelectedTableIds: (ids) => set({ selectedTableIds: ids }),
  setSelectedRelationshipIds: (ids) => set({ selectedRelationshipIds: ids }),
  setSelectedColumnId: (id) => set({ selectedColumnId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setIsSqlPreviewOpen: (open) => set({ isSqlPreviewOpen: open }),
  clearSelection: () => set({
    selectedTableIds: [],
    selectedRelationshipIds: [],
    selectedColumnId: null,
    hoveredNodeId: null,
  }),
}));
