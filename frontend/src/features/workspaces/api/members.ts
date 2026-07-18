import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/lib/api-client';
import { useToast } from '../../../shared/components/ui/Toast';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  invitedBy: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'commenter';
  token: string;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: string;
  createdAt: string;
  workspace?: {
    name: string;
  };
}

export interface MembersResponse {
  success: boolean;
  data: {
    members: WorkspaceMember[];
  };
}

export interface InvitationsResponse {
  success: boolean;
  data: {
    invitations: WorkspaceInvitation[];
  };
}

export interface InvitationResponse {
  success: boolean;
  data: {
    invitation: WorkspaceInvitation;
  };
}

export interface CreateInvitationPayload {
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'commenter';
}

export interface MemberResponse {
  success: boolean;
  data: {
    member: WorkspaceMember;
  };
}

// 1. Fetch workspace members
export const useWorkspaceMembers = (workspaceId: string | undefined) => {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      const response = await apiRequest<MembersResponse>(`/workspaces/${workspaceId}/members`);
      return response.data.members;
    },
    enabled: !!workspaceId,
  });
};

// 2. Add member (Direct Add)
export const useAddMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: string; role: 'admin' | 'editor' | 'viewer' | 'commenter' }) => {
      return apiRequest<MemberResponse>(`/workspaces/${workspaceId}/members`, {
        method: 'POST',
        data: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};

// 3. Update member role (Optimistic Update)
export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (vars: { userId: string; role: 'admin' | 'editor' | 'viewer' | 'commenter' }) => {
      return apiRequest<MemberResponse>(`/workspaces/${workspaceId}/members/${vars.userId}`, {
        method: 'PATCH',
        data: { role: vars.role },
      });
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['members', workspaceId] });
      const previous = queryClient.getQueryData<WorkspaceMember[]>(['members', workspaceId]);

      queryClient.setQueryData<WorkspaceMember[]>(['members', workspaceId], (old) =>
        old ? old.map((m) => (m.userId === vars.userId ? { ...m, role: vars.role } : m)) : []
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['members', workspaceId], context.previous);
      }
      toast('Could not update role — reverted', { variant: 'danger' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};

// 4. Remove member (Optimistic Update)
export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (vars: { userId: string }) => {
      return apiRequest<void>(`/workspaces/${workspaceId}/members/${vars.userId}`, {
        method: 'DELETE',
      });
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['members', workspaceId] });
      const previous = queryClient.getQueryData<WorkspaceMember[]>(['members', workspaceId]);

      queryClient.setQueryData<WorkspaceMember[]>(['members', workspaceId], (old) =>
        old ? old.filter((m) => m.userId !== vars.userId) : []
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['members', workspaceId], context.previous);
      }
      toast('Could not remove member — reverted', { variant: 'danger' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};

// 5. Fetch pending invitations
export const usePendingInvitations = (workspaceId: string | undefined) => {
  return useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) throw new Error('Workspace ID is required');
      const response = await apiRequest<InvitationsResponse>(`/workspaces/${workspaceId}/invitations`);
      return response.data.invitations;
    },
    enabled: !!workspaceId,
  });
};

// 6. Invite user (create invitation)
export const useInviteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInvitationPayload) => {
      return apiRequest<{ success: boolean; data: { invitation: WorkspaceInvitation } }>(
        `/workspaces/${workspaceId}/invitations`,
        {
          method: 'POST',
          data: payload,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', workspaceId] });
    },
  });
};

// 7. Revoke invitation (Optimistic Update)
export const useRevokeInvitation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (vars: { invitationId: string }) => {
      return apiRequest<void>(`/workspaces/${workspaceId}/invitations/${vars.invitationId}`, {
        method: 'DELETE',
      });
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['invitations', workspaceId] });
      const previous = queryClient.getQueryData<WorkspaceInvitation[]>(['invitations', workspaceId]);

      queryClient.setQueryData<WorkspaceInvitation[]>(['invitations', workspaceId], (old) =>
        old ? old.filter((inv) => inv.id !== vars.invitationId) : []
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['invitations', workspaceId], context.previous);
      }
      toast('Could not revoke invitation — reverted', { variant: 'danger' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', workspaceId] });
    },
  });
};

// 8. Fetch invitation details by token
export const useInvitationDetails = (token: string | undefined) => {
  return useQuery({
    queryKey: ['invitation-details', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');
      const response = await apiRequest<InvitationResponse>(`/workspaces/invitations/${token}`);
      return response.data.invitation;
    },
    enabled: !!token,
    retry: false,
  });
};

// 9. Accept invitation
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      return apiRequest<{ success: boolean; data: { member: WorkspaceMember } }>('/workspaces/invitations/accept', {
        method: 'POST',
        data: { token },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

// 10. Reject invitation
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ token }: { token: string }) => {
      return apiRequest<void>('/workspaces/invitations/reject', {
        method: 'POST',
        data: { token },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
    },
  });
};

// 11. Fetch current user's pending invitations
export const useMyInvitations = () => {
  return useQuery({
    queryKey: ['my-invitations'],
    queryFn: async () => {
      const response = await apiRequest<InvitationsResponse>('/workspaces/my-invitations');
      return response.data.invitations;
    },
  });
};
