import { create } from 'zustand';
import { type StatePatch } from './schemaStore';

export interface HistoryEntry {
  type: string;
  before: StatePatch;
  after: StatePatch;
}

export interface HistoryStore {
  past: HistoryEntry[];
  future: HistoryEntry[];
  push: (entry: HistoryEntry) => void;
  undo: (applyPatch: (patch: StatePatch) => void) => void;
  redo: (applyPatch: (patch: StatePatch) => void) => void;
  clear: () => void;
}

const MAX_HISTORY = 100;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],

  push: (entry) => set((state) => {
    const newPast = [...state.past, entry];
    if (newPast.length > MAX_HISTORY) {
      newPast.shift();
    }
    return {
      past: newPast,
      future: [], // Clear redo stack on new actions
    };
  }),

  undo: (applyPatch) => {
    const { past } = get();
    if (past.length === 0) return;

    const entry = past[past.length - 1];
    
    // Apply before patch
    applyPatch(entry.before);

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [entry, ...state.future],
    }));
  },

  redo: (applyPatch) => {
    const { future } = get();
    if (future.length === 0) return;

    const entry = future[0];

    // Apply after patch
    applyPatch(entry.after);

    set((state) => ({
      past: [...state.past, entry],
      future: state.future.slice(1),
    }));
  },

  clear: () => set({ past: [], future: [] }),
}));
