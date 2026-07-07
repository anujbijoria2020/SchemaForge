import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters'),
  slug: z
    .string({ required_error: 'Slug is required' })
    .min(2, 'Slug must be at least 2 characters long')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase alphanumeric characters and dashes'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const addMemberSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).uuid('Invalid User ID format'),
  role: z.enum(['admin', 'editor', 'viewer', 'commenter'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be admin, editor, viewer, or commenter',
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer', 'commenter'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be admin, editor, viewer, or commenter',
  }),
});

export const createInvitationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer', 'commenter'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be admin, editor, viewer, or commenter',
  }),
});

export const acceptInvitationSchema = z.object({
  token: z.string({ required_error: 'Token is required' }).min(1, 'Token is required'),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;
export type AddMemberDto = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;
export type CreateInvitationDto = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationDto = z.infer<typeof acceptInvitationSchema>;
