import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/lib/api-client';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
  isArchived: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tableCount?: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

export interface ProjectResponse {
  success: boolean;
  data: {
    project: Project;
  };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
  isPublic?: boolean;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  isPublic?: boolean;
  isArchived?: boolean;
}

// 1. Fetch projects in a workspace
export const useProjects = (workspaceId: string | undefined, includeArchived = false) => {
  return useQuery({
    queryKey: ['projects', workspaceId, { includeArchived }],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      const response = await apiRequest<ProjectsResponse>(
        `/workspaces/${workspaceId}/projects?includeArchived=${includeArchived}`
      );
      return response.data.projects;
    },
    enabled: !!workspaceId,
  });
};

// 2. Fetch specific project details
export const useProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest<ProjectResponse>(`/projects/${projectId}`);
      return response.data.project;
    },
    enabled: !!projectId,
  });
};

// 3. Create a project
export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProjectPayload) => {
      const response = await apiRequest<ProjectResponse>(`/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        data: payload,
      });
      return response.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};

// 4. Update project (Rename, Dialect, etc.)
export const useUpdateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, payload }: { projectId: string; payload: UpdateProjectPayload }) => {
      const response = await apiRequest<ProjectResponse>(`/projects/${projectId}`, {
        method: 'PATCH',
        data: payload,
      });
      return response.data.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};

// 5. Archive / Unarchive project (Optimistic Update)
export const useArchiveProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, archive }: { projectId: string; archive: boolean }) => {
      if (archive) {
        const response = await apiRequest<ProjectResponse>(`/projects/${projectId}/archive`, {
          method: 'POST',
        });
        return response.data.project;
      } else {
        const response = await apiRequest<ProjectResponse>(`/projects/${projectId}`, {
          method: 'PATCH',
          data: { isArchived: false },
        });
        return response.data.project;
      }
    },
    onMutate: async ({ projectId, archive }) => {
      await queryClient.cancelQueries({ queryKey: ['projects', workspaceId] });

      const previousProjectsWithArchived = queryClient.getQueryData<Project[]>([
        'projects',
        workspaceId,
        { includeArchived: true },
      ]);
      const previousProjectsWithoutArchived = queryClient.getQueryData<Project[]>([
        'projects',
        workspaceId,
        { includeArchived: false },
      ]);

      // Optimistically update lists
      queryClient.setQueryData<Project[]>([
        'projects',
        workspaceId,
        { includeArchived: true },
      ], (old) =>
        old ? old.map((p) => (p.id === projectId ? { ...p, isArchived: archive } : p)) : []
      );

      queryClient.setQueryData<Project[]>([
        'projects',
        workspaceId,
        { includeArchived: false },
      ], (old) =>
        old ? (archive ? old.filter((p) => p.id !== projectId) : old) : []
      );

      return { previousProjectsWithArchived, previousProjectsWithoutArchived };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousProjectsWithArchived) {
        queryClient.setQueryData(
          ['projects', workspaceId, { includeArchived: true }],
          context.previousProjectsWithArchived
        );
      }
      if (context?.previousProjectsWithoutArchived) {
        queryClient.setQueryData(
          ['projects', workspaceId, { includeArchived: false }],
          context.previousProjectsWithoutArchived
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};

// 6. Delete project
export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest<void>(`/projects/${projectId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};
