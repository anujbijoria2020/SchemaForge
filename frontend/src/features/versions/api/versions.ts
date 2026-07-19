import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/lib/api-client';
import { type Table, type Relationship, type CanvasState } from '../../editor/store/schemaStore';

export interface VersionData {
  id: string;
  projectId: string;
  label: string | null;
  description: string | null;
  canvasState: CanvasState & { relationships?: Relationship[]; tables?: Table[] };
  createdBy: string;
  createdAt: string;
  isAuto: boolean;
  project?: {
    name: string;
  };
}

export interface VersionsResponse {
  success: boolean;
  data: {
    versions: VersionData[];
  };
}

export interface VersionResponse {
  success: boolean;
  data: {
    version: VersionData;
  };
}

export interface CreateVersionPayload {
  label?: string | null;
  description?: string | null;
}

// Hook to list all version snapshots for a project
export const useProjectVersions = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-versions', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest<VersionsResponse>(`/projects/${projectId}/versions`);
      return response.data.versions;
    },
    enabled: !!projectId,
    staleTime: Infinity, // Versions are immutable snapshots
  });
};

// Hook to create a manual version snapshot for a project
export const useCreateVersion = (projectId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateVersionPayload) => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest<{ success: boolean; data: { version: VersionData } }>(
        `/projects/${projectId}/versions`,
        {
          method: 'POST',
          data: payload,
        }
      );
      return response.data.version;
    },
    onSuccess: () => {
      // Invalidate versions list for this project
      queryClient.invalidateQueries({ queryKey: ['project-versions', projectId] });
    },
  });
};

// Hook to fetch details (including full canvas snapshot) of a specific version
export const useVersionDetails = (projectId: string | undefined, versionId: string | undefined) => {
  return useQuery({
    queryKey: ['version-details', versionId],
    queryFn: async () => {
      if (!projectId || !versionId) throw new Error('Project ID and Version ID are required');
      const response = await apiRequest<VersionResponse>(`/projects/${projectId}/versions/${versionId}`);
      return response.data.version;
    },
    enabled: !!projectId && !!versionId,
    staleTime: Infinity, // Single version detail snapshot is immutable
  });
};
