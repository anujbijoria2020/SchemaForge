import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/lib/api-client';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  ownerId: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceResponse {
  success: boolean;
  data: {
    workspace: Workspace;
  };
}

export interface WorkspacesResponse {
  success: boolean;
  data: {
    workspaces: Workspace[];
  };
}

export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await apiRequest<WorkspacesResponse>('/workspaces');
      return response.data.workspaces;
    },
  });
};

export const useWorkspace = (id: string | undefined) => {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: async () => {
      if (!id) throw new Error('Workspace ID is required');
      const response = await apiRequest<WorkspaceResponse>(`/workspaces/${id}`);
      return response.data.workspace;
    },
    enabled: !!id,
  });
};

export interface CreateWorkspacePayload {
  name: string;
  slug: string;
  description?: string | null;
}

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkspacePayload) => {
      return apiRequest<WorkspaceResponse>('/workspaces', {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export interface RenameWorkspacePayload {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export const useRenameWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: RenameWorkspacePayload) => {
      return apiRequest<WorkspaceResponse>(`/workspaces/${id}`, {
        method: 'PATCH',
        data,
      });
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', variables.id] });
    },
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<void>(`/workspaces/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};
