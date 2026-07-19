import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../shared/lib/api-client';
import { type Table, type Relationship, type CanvasState } from '../store/schemaStore';

export interface ProjectSchemaData {
  id: string;
  name: string;
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
  workspaceId: string;
  schema: {
    id: string;
    canvasState: CanvasState & { relationships?: Relationship[] };
    tables: Table[];
  };
}

export interface ProjectResponse {
  success: boolean;
  data: {
    project: ProjectSchemaData;
  };
}

export interface SaveSchemaPayload {
  canvasState: CanvasState & { relationships: Relationship[] };
  tables: {
    name: string;
    color: string | null;
    positionX: number;
    positionY: number;
    columns: {
      name: string;
      dataType: string;
      isNullable: boolean;
      isPrimaryKey: boolean;
      isUnique: boolean;
      defaultValue: string | null;
      checkExpr: string | null;
      sortOrder: number;
    }[];
  }[];
}

// Fetch the schema data exactly once on Editor mount
export const useProjectSchema = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-schema', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest<ProjectResponse>(`/projects/${projectId}`);
      
      const project = response.data.project;
      const schema = project.schema;
      
      // Parse relationships out of canvasState JSON
      const rawCanvasState: any = schema.canvasState || {};
      const relationships = rawCanvasState.relationships || [];
      const zoom = rawCanvasState.zoom ?? 1;
      const pan = rawCanvasState.pan ?? { x: 0, y: 0 };
      
      return {
        project,
        schema: {
          tables: schema.tables || [],
          relationships: relationships as Relationship[],
          canvasState: { zoom, pan } as CanvasState,
        },
      };
    },
    enabled: !!projectId,
    staleTime: Infinity, // Avoid background refetching while editing
    gcTime: 0, // Prevent caching old project schema states across project openings
  });
};

// Plain mutation hook for saving the schema (autosave)
export const useSaveSchema = (projectId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaveSchemaPayload) => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiRequest<{ success: boolean; data: { schema: any } }>(
        `/projects/${projectId}/schema`,
        {
          method: 'POST',
          data: payload,
        }
      );
      return response.data.schema;
    },
    onSuccess: () => {
      // Invalidate project details queries to keep workspace list updated
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};
