import * as React from 'react';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import { useSelectionStore } from '../../store/selectionStore';

interface RelationshipInspectorProps {
  relationshipId: string;
}

export const RelationshipInspector: React.FC<RelationshipInspectorProps> = ({ relationshipId }) => {
  const tables = useSchemaStore((state) => state.tables);
  const relationships = useSchemaStore((state) => state.relationships);
  
  const updateRelationship = useSchemaStore((state) => state.updateRelationship);
  const deleteRelationship = useSchemaStore((state) => state.deleteRelationship);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const relationship = React.useMemo(() => {
    return relationships.find((r) => r.id === relationshipId);
  }, [relationships, relationshipId]);

  if (!relationship) {
    return (
      <div className="p-4 text-center text-xs text-secondary">
        Relationship not found.
      </div>
    );
  }

  // Get active source and target tables
  const sourceTable = tables.find((t) => t.id === relationship.sourceTableId);
  const targetTable = tables.find((t) => t.id === relationship.targetTableId);

  // Lists of columns for selected tables
  const sourceColumns = sourceTable ? sourceTable.columns : [];
  const targetColumns = targetTable ? targetTable.columns : [];

  const handleSourceTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTableId = e.target.value;
    const nextTable = tables.find((t) => t.id === nextTableId);
    const nextColId = nextTable?.columns[0]?.id || '';
    updateRelationship(relationshipId, {
      sourceTableId: nextTableId,
      sourceColumnId: nextColId,
    });
  };

  const handleSourceColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRelationship(relationshipId, { sourceColumnId: e.target.value });
  };

  const handleTargetTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTableId = e.target.value;
    const nextTable = tables.find((t) => t.id === nextTableId);
    const nextColId = nextTable?.columns[0]?.id || '';
    updateRelationship(relationshipId, {
      targetTableId: nextTableId,
      targetColumnId: nextColId,
    });
  };

  const handleTargetColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRelationship(relationshipId, { targetColumnId: e.target.value });
  };

  const handleDelete = () => {
    deleteRelationship(relationshipId);
    clearSelection();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-primary mb-1">Relationship Details</h3>
        <p className="text-[10px] text-secondary">Configure endpoints, cardinality, and referential actions.</p>
      </div>

      {/* Source Endpoint (Foreign Key side) */}
      <div className="space-y-3 p-3 border border-border/80 bg-background/25 rounded-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary uppercase tracking-wider">
          <LinkIcon className="h-3 w-3 text-accent" />
          <span>Referencing (FK / Source)</span>
        </div>
        
        {/* Source Table Select */}
        <div className="space-y-1">
          <label htmlFor="source-table-select" className="text-[10px] text-secondary font-medium">Table</label>
          <select
            id="source-table-select"
            value={relationship.sourceTableId}
            onChange={handleSourceTableChange}
            className="w-full h-8 rounded-sm border border-border/80 bg-background/50 px-2 py-1 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer font-mono"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Source Column Select */}
        <div className="space-y-1">
          <label htmlFor="source-column-select" className="text-[10px] text-secondary font-medium">Column</label>
          <select
            id="source-column-select"
            value={relationship.sourceColumnId}
            onChange={handleSourceColumnChange}
            className="w-full h-8 rounded-sm border border-border/80 bg-background/50 px-2 py-1 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer font-mono"
          >
            {sourceColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Endpoint (Referenced PK side) */}
      <div className="space-y-3 p-3 border border-border/80 bg-background/25 rounded-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary uppercase tracking-wider">
          <LinkIcon className="h-3 w-3 text-amber-500" />
          <span>Referenced (PK / Target)</span>
        </div>

        {/* Target Table Select */}
        <div className="space-y-1">
          <label htmlFor="target-table-select" className="text-[10px] text-secondary font-medium">Table</label>
          <select
            id="target-table-select"
            value={relationship.targetTableId}
            onChange={handleTargetTableChange}
            className="w-full h-8 rounded-sm border border-border/80 bg-background/50 px-2 py-1 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer font-mono"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Target Column Select */}
        <div className="space-y-1">
          <label htmlFor="target-column-select" className="text-[10px] text-secondary font-medium">Column</label>
          <select
            id="target-column-select"
            value={relationship.targetColumnId}
            onChange={handleTargetColumnChange}
            className="w-full h-8 rounded-sm border border-border/80 bg-background/50 px-2 py-1 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer font-mono"
          >
            {targetColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cardinality */}
      <div className="space-y-1.5">
        <label htmlFor="cardinality-select" className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
          Cardinality
        </label>
        <select
          id="cardinality-select"
          value={relationship.cardinality}
          onChange={(e) => updateRelationship(relationshipId, { cardinality: e.target.value as any })}
          className="w-full h-9 rounded-sm border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer"
        >
          <option value="one-to-many">One to Many (1:N)</option>
          <option value="one-to-one">One to One (1:1)</option>
          <option value="many-to-many">Many to Many (N:M)</option>
        </select>
      </div>

      {/* On Delete Referential Behavior */}
      <div className="space-y-1.5">
        <label htmlFor="on-delete-select" className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
          On Delete Action
        </label>
        <select
          id="on-delete-select"
          value={relationship.onDelete}
          onChange={(e) => updateRelationship(relationshipId, { onDelete: e.target.value as any })}
          className="w-full h-9 rounded-sm border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer"
        >
          <option value="cascade">CASCADE</option>
          <option value="restrict">RESTRICT</option>
          <option value="set-null">SET NULL</option>
          <option value="no-action">NO ACTION</option>
        </select>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="w-full h-9 rounded-sm bg-red-600/10 hover:bg-red-600 border border-red-600/30 text-red-500 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 mt-4"
        type="button"
      >
        <Trash2 className="h-4 w-4" />
        Delete Relationship
      </button>
    </div>
  );
};
