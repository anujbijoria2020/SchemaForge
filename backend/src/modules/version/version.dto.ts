import { z } from 'zod';

export const createVersionSchema = z.object({
  label: z
    .string()
    .max(100, 'Label must be less than 100 characters')
    .optional()
    .nullable(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
});

export type CreateVersionDto = z.infer<typeof createVersionSchema>;
