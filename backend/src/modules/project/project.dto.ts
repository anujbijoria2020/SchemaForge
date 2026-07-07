import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().nullable(),
  dialect: z.enum(['postgresql', 'mysql', 'sqlite', 'mssql'], {
    invalid_type_error: 'Dialect must be postgresql, mysql, sqlite, or mssql',
  }).default('postgresql'),
  isPublic: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial();

export const schemaColumnSchema = z.object({
  name: z.string({ required_error: 'Column name is required' }).min(1, 'Column name cannot be empty'),
  dataType: z.string({ required_error: 'Data type is required' }).min(1, 'Data type cannot be empty'),
  isNullable: z.boolean().default(true),
  isPrimaryKey: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  defaultValue: z.string().nullable().optional(),
  checkExpr: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
});

export const schemaTableSchema = z.object({
  name: z.string({ required_error: 'Table name is required' }).min(1, 'Table name cannot be empty'),
  color: z.string().nullable().optional(),
  positionX: z.number().default(0),
  positionY: z.number().default(0),
  columns: z.array(schemaColumnSchema).default([]),
});

export const saveSchemaSchema = z.object({
  canvasState: z.any().default({}),
  tables: z.array(schemaTableSchema).default([]),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
export type SchemaColumnDto = z.infer<typeof schemaColumnSchema>;
export type SchemaTableDto = z.infer<typeof schemaTableSchema>;
export type SaveSchemaDto = z.infer<typeof saveSchemaSchema>;
