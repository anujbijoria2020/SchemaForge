import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectState {
  activeProjectId: string | null;
  recentProjectIds: string[];
  setActiveProjectId: (id: string | null) => void;
  openProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      recentProjectIds: [],
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      openProject: (id) =>
        set((state) => {
          // Remove if already exists to move it to the front
          const filtered = state.recentProjectIds.filter((pid) => pid !== id);
          const updated = [id, ...filtered].slice(0, 10); // Limit to top 10
          return {
            activeProjectId: id,
            recentProjectIds: updated,
          };
        }),
    }),
    {
      name: 'schemaforge-project-store',
    }
  )
);
