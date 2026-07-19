import { create } from 'zustand';
import { useHistoryStore } from './historyStore';

export interface Column {
  id: string;
  name: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isUnique: boolean;
  defaultValue: string | null;
  checkExpr: string | null;
  sortOrder: number;
  isForeignKey?: boolean;
}

export interface Table {
  id: string;
  name: string;
  color: string;
  positionX: number;
  positionY: number;
  columns: Column[];
}

export interface Relationship {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
  onDelete: 'cascade' | 'restrict' | 'set-null' | 'no-action';
}

export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
}

export interface StatePatch {
  tables?: Table[];
  relationships?: Relationship[];
  deleteTableIds?: string[];
  deleteRelationshipIds?: string[];
  canvasState?: Partial<CanvasState>;
}

export interface SchemaStore {
  tables: Table[];
  relationships: Relationship[];
  canvasState: CanvasState;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;
  saveError: boolean;
  
  // Actions
  applyPatch: (patch: StatePatch) => void;
  addTable: (table: Omit<Table, 'id'>) => void;
  moveTable: (tableId: string, positionX: number, positionY: number) => void;
  deleteTable: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<Omit<Table, 'id' | 'columns'>>) => void;
  addColumn: (tableId: string, column?: Partial<Column>) => void;
  updateColumn: (tableId: string, columnId: string, updates: Partial<Omit<Column, 'id'>>) => void;
  removeColumn: (tableId: string, columnId: string) => void;
  reorderColumns: (tableId: string, columns: Column[]) => void;
  addRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  updateRelationship: (relationshipId: string, updates: Partial<Omit<Relationship, 'id'>>) => void;
  deleteRelationship: (relationshipId: string) => void;
  hydrateSchema: (schema: { tables: Table[]; relationships: Relationship[]; canvasState: CanvasState }) => void;
  setCanvasState: (canvasState: Partial<CanvasState>) => void;
  setDirty: (isDirty: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;
  setSaving: (isSaving: boolean) => void;
  setSaveError: (saveError: boolean) => void;
}


export const useSchemaStore = create<SchemaStore>((set) => ({
  tables: [],
  relationships: [],
  canvasState: { zoom: 1, pan: { x: 0, y: 0 } },
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,
  saveError: false,

  applyPatch: (patch) => set((state) => {
    let updatedTables = [...state.tables];
    let updatedRelationships = [...state.relationships];
    let updatedCanvasState = { ...state.canvasState };

    // 1. Delete tables
    if (patch.deleteTableIds) {
      updatedTables = updatedTables.filter(t => !patch.deleteTableIds!.includes(t.id));
    }

    // 2. Delete relationships
    if (patch.deleteRelationshipIds) {
      updatedRelationships = updatedRelationships.filter(r => !patch.deleteRelationshipIds!.includes(r.id));
    }

    // 3. Upsert tables
    if (patch.tables) {
      patch.tables.forEach((pTable) => {
        const index = updatedTables.findIndex(t => t.id === pTable.id);
        if (index !== -1) {
          updatedTables[index] = pTable;
        } else {
          updatedTables.push(pTable);
        }
      });
    }

    // 4. Upsert relationships
    if (patch.relationships) {
      patch.relationships.forEach((pRel) => {
        const index = updatedRelationships.findIndex(r => r.id === pRel.id);
        if (index !== -1) {
          updatedRelationships[index] = pRel;
        } else {
          updatedRelationships.push(pRel);
        }
      });
    }

    // 5. Update canvas state
    if (patch.canvasState) {
      updatedCanvasState = { ...updatedCanvasState, ...patch.canvasState };
    }

    return {
      tables: updatedTables,
      relationships: updatedRelationships,
      canvasState: updatedCanvasState,
      isDirty: true, // Mark dirty so autosave saves the undone/redone state
    };
  }),

  addTable: (table) => set((state) => {
    const newTable: Table = {
      ...table,
      id: crypto.randomUUID()
    };

    useHistoryStore.getState().push({
      type: 'add_table',
      before: { deleteTableIds: [newTable.id] },
      after: { tables: [newTable] },
    });

    return {
      tables: [...state.tables, newTable],
      isDirty: true
    };
  }),

  moveTable: (tableId, positionX, positionY) => set((state) => {
    // Determine if anything actually changed to prevent redundant updates
    const existingTable = state.tables.find(t => t.id === tableId);
    if (existingTable && existingTable.positionX === positionX && existingTable.positionY === positionY) {
      return state;
    }
    
    return {
      tables: state.tables.map((table) =>
        table.id === tableId
          ? { ...table, positionX, positionY }
          : table
      ),
      isDirty: true
    };
  }),

  deleteTable: (tableId) => set((state) => {
    const tableToDelete = state.tables.find(t => t.id === tableId);
    if (!tableToDelete) return state;

    const remainingRelationships = state.relationships.filter(
      (r) => r.sourceTableId !== tableId && r.targetTableId !== tableId
    );
    const deletedRelationships = state.relationships.filter(
      (r) => r.sourceTableId === tableId || r.targetTableId === tableId
    );

    // Update isForeignKey flags on the columns of remaining tables
    const updatedTables = state.tables
      .filter((t) => t.id !== tableId)
      .map((table) => {
        return {
          ...table,
          columns: table.columns.map((col) => {
            const hasFK = remainingRelationships.some(
              (r) => r.sourceTableId === table.id && r.sourceColumnId === col.id
            );
            return {
              ...col,
              isForeignKey: hasFK,
            };
          }),
        };
      });

    useHistoryStore.getState().push({
      type: 'delete_table',
      before: {
        tables: [tableToDelete],
        relationships: deletedRelationships,
      },
      after: {
        deleteTableIds: [tableId],
        deleteRelationshipIds: deletedRelationships.map(r => r.id),
      },
    });

    return {
      tables: updatedTables,
      relationships: remainingRelationships,
      isDirty: true,
    };
  }),

  addRelationship: (relationship) => set((state) => {
    // Check if relationship already exists
    const exists = state.relationships.some(
      (r) =>
        (r.sourceTableId === relationship.sourceTableId &&
          r.sourceColumnId === relationship.sourceColumnId &&
          r.targetTableId === relationship.targetTableId &&
          r.targetColumnId === relationship.targetColumnId) ||
        (r.sourceTableId === relationship.targetTableId &&
          r.sourceColumnId === relationship.targetColumnId &&
          r.targetTableId === relationship.sourceTableId &&
          r.targetColumnId === relationship.sourceColumnId)
    );
    if (exists) return state;

    const newRel: Relationship = {
      ...relationship,
      id: crypto.randomUUID(),
    };

    const sourceTable = state.tables.find((t) => t.id === relationship.sourceTableId);
    if (!sourceTable) return state;

    const oldTable = sourceTable;
    const newTable = {
      ...sourceTable,
      columns: sourceTable.columns.map((col) =>
        col.id === relationship.sourceColumnId ? { ...col, isForeignKey: true } : col
      ),
    };

    useHistoryStore.getState().push({
      type: 'add_relationship',
      before: {
        tables: [oldTable],
        deleteRelationshipIds: [newRel.id],
      },
      after: {
        tables: [newTable],
        relationships: [newRel],
      },
    });

    return {
      relationships: [...state.relationships, newRel],
      tables: state.tables.map((table) =>
        table.id === relationship.sourceTableId ? newTable : table
      ),
      isDirty: true,
    };
  }),

  updateRelationship: (relationshipId, updates) => set((state) => {
    const oldRel = state.relationships.find((r) => r.id === relationshipId);
    if (!oldRel) return state;

    const newRel = { ...oldRel, ...updates };

    const oldTables = state.tables;
    const updatedTables = state.tables.map((table) => {
      return {
        ...table,
        columns: table.columns.map((col) => {
          // Check if column is a source in any relationship (including the new updated one, excluding the old one)
          const isSourceInOthers = state.relationships.some(
            (r) =>
              r.id !== relationshipId &&
              r.sourceTableId === table.id &&
              r.sourceColumnId === col.id
          );
          const isSourceInUpdated =
            newRel.sourceTableId === table.id && newRel.sourceColumnId === col.id;

          return {
            ...col,
            isForeignKey: isSourceInOthers || isSourceInUpdated,
          };
        }),
      };
    });

    const changedTablesBefore = oldTables.filter((ot, idx) => {
      const nt = updatedTables[idx];
      return JSON.stringify(ot.columns) !== JSON.stringify(nt.columns);
    });
    const changedTablesAfter = updatedTables.filter((nt, idx) => {
      const ot = oldTables[idx];
      return JSON.stringify(ot.columns) !== JSON.stringify(nt.columns);
    });

    useHistoryStore.getState().push({
      type: 'update_relationship',
      before: {
        tables: changedTablesBefore,
        relationships: [oldRel],
      },
      after: {
        tables: changedTablesAfter,
        relationships: [newRel],
      },
    });

    return {
      relationships: state.relationships.map((rel) =>
        rel.id === relationshipId ? newRel : rel
      ),
      tables: updatedTables,
      isDirty: true,
    };
  }),

  deleteRelationship: (relationshipId) => set((state) => {
    const rel = state.relationships.find((r) => r.id === relationshipId);
    if (!rel) return state;

    // Check if other relationships still use the source column
    const otherRelsUsingSource = state.relationships.some(
      (r) =>
        r.id !== relationshipId &&
        r.sourceTableId === rel.sourceTableId &&
        r.sourceColumnId === rel.sourceColumnId
    );

    const sourceTable = state.tables.find((t) => t.id === rel.sourceTableId);
    const oldTables = sourceTable ? [sourceTable] : [];

    const updatedTables = state.tables.map((table) => {
      if (table.id === rel.sourceTableId && !otherRelsUsingSource) {
        return {
          ...table,
          columns: table.columns.map((col) =>
            col.id === rel.sourceColumnId
              ? { ...col, isForeignKey: false }
              : col
          ),
        };
      }
      return table;
    });

    const newTables = sourceTable && !otherRelsUsingSource
      ? [updatedTables.find((t) => t.id === rel.sourceTableId)!]
      : [];

    useHistoryStore.getState().push({
      type: 'delete_relationship',
      before: {
        tables: oldTables,
        relationships: [rel],
      },
      after: {
        tables: newTables,
        deleteRelationshipIds: [relationshipId],
      },
    });

    return {
      relationships: state.relationships.filter((r) => r.id !== relationshipId),
      tables: updatedTables,
      isDirty: true,
    };
  }),

  updateTable: (tableId, updates) => set((state) => {
    const oldTable = state.tables.find((t) => t.id === tableId);
    if (!oldTable) return state;

    const newTable = { ...oldTable, ...updates };

    useHistoryStore.getState().push({
      type: 'update_table',
      before: { tables: [oldTable] },
      after: { tables: [newTable] },
    });

    return {
      tables: state.tables.map((table) =>
        table.id === tableId ? newTable : table
      ),
      isDirty: true
    };
  }),

  addColumn: (tableId, column) => set((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return state;

    const newColumn: Column = {
      id: crypto.randomUUID(),
      name: `column_${table.columns.length + 1}`,
      dataType: 'varchar(255)',
      isNullable: true,
      isPrimaryKey: false,
      isUnique: false,
      defaultValue: null,
      checkExpr: null,
      sortOrder: table.columns.length + 1,
      ...column
    };

    const oldTable = table;
    const newTable = {
      ...table,
      columns: [...table.columns, newColumn]
    };

    useHistoryStore.getState().push({
      type: 'add_column',
      before: { tables: [oldTable] },
      after: { tables: [newTable] },
    });

    return {
      tables: state.tables.map((t) => (t.id === tableId ? newTable : t)),
      isDirty: true
    };
  }),

  updateColumn: (tableId, columnId, updates) => set((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return state;

    const oldTable = table;
    const newTable = {
      ...table,
      columns: table.columns.map((col) =>
        col.id === columnId
          ? { ...col, ...updates }
          : col
      )
    };

    useHistoryStore.getState().push({
      type: 'update_column',
      before: { tables: [oldTable] },
      after: { tables: [newTable] },
    });

    return {
      tables: state.tables.map((t) => (t.id === tableId ? newTable : t)),
      isDirty: true
    };
  }),

  removeColumn: (tableId, columnId) => set((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return state;

    const oldTable = table;
    const filteredColumns = table.columns.filter((col) => col.id !== columnId);
    const updatedColumns = filteredColumns.map((col, index) => ({
      ...col,
      sortOrder: index + 1
    }));
    const newTable = {
      ...table,
      columns: updatedColumns
    };

    useHistoryStore.getState().push({
      type: 'remove_column',
      before: { tables: [oldTable] },
      after: { tables: [newTable] },
    });

    return {
      tables: state.tables.map((t) => (t.id === tableId ? newTable : t)),
      isDirty: true
    };
  }),

  reorderColumns: (tableId, columns) => set((state) => {
    const table = state.tables.find((t) => t.id === tableId);
    if (!table) return state;

    const oldTable = table;
    const updatedColumns = columns.map((col, index) => ({
      ...col,
      sortOrder: index + 1
    }));
    const newTable = {
      ...table,
      columns: updatedColumns
    };

    useHistoryStore.getState().push({
      type: 'reorder_columns',
      before: { tables: [oldTable] },
      after: { tables: [newTable] },
    });

    return {
      tables: state.tables.map((t) => (t.id === tableId ? newTable : t)),
      isDirty: true
    };
  }),

  setCanvasState: (canvasState) => set((state) => ({
    canvasState: { ...state.canvasState, ...canvasState }
  })),

  setDirty: (isDirty) => set({ isDirty }),
  
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

  hydrateSchema: (schema) => set({
    tables: schema.tables,
    relationships: schema.relationships,
    canvasState: schema.canvasState,
    isDirty: false,
    lastSavedAt: new Date(),
    isSaving: false,
    saveError: false,
  }),

  setSaving: (isSaving) => set({ isSaving }),

  setSaveError: (saveError) => set({ saveError }),
}));
