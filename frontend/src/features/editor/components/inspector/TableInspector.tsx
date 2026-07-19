import * as React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Key } from 'lucide-react';
import { useSchemaStore, type Column } from '../../store/schemaStore';

interface TableInspectorProps {
  tableId: string;
}

const COLOR_PRESETS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#64748B', // Slate
];

const DATA_TYPES = [
  'integer',
  'bigint',
  'uuid',
  'varchar(255)',
  'text',
  'boolean',
  'timestamp',
  'numeric',
  'date',
  'jsonb',
];

export const TableInspector: React.FC<TableInspectorProps> = ({ tableId }) => {
  const table = useSchemaStore(
    React.useCallback((state) => state.tables.find((t) => t.id === tableId), [tableId])
  );

  const updateTable = useSchemaStore((state) => state.updateTable);
  const addColumn = useSchemaStore((state) => state.addColumn);
  const updateColumn = useSchemaStore((state) => state.updateColumn);
  const removeColumn = useSchemaStore((state) => state.removeColumn);
  const reorderColumns = useSchemaStore((state) => state.reorderColumns);

  if (!table) {
    return (
      <div className="p-4 text-center text-xs text-secondary">
        Table not found.
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTable(tableId, { name: e.target.value });
  };

  const handleColorSelect = (color: string) => {
    updateTable(tableId, { color });
  };

  const handleAddColumn = () => {
    addColumn(tableId);
  };

  const handleColumnUpdate = (columnId: string, updates: Partial<Omit<Column, 'id'>>) => {
    updateColumn(tableId, columnId, updates);
  };

  const handleRemoveColumn = (columnId: string) => {
    removeColumn(tableId, columnId);
  };

  const handleMoveColumnUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...table.columns];
    const temp = newColumns[index];
    newColumns[index] = newColumns[index - 1];
    newColumns[index - 1] = temp;
    reorderColumns(tableId, newColumns);
  };

  const handleMoveColumnDown = (index: number) => {
    if (index === table.columns.length - 1) return;
    const newColumns = [...table.columns];
    const temp = newColumns[index];
    newColumns[index] = newColumns[index + 1];
    newColumns[index + 1] = temp;
    reorderColumns(tableId, newColumns);
  };

  return (
    <div className="space-y-6">
      {/* Table details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-primary mb-1">Table Details</h3>
          <p className="text-[10px] text-secondary">Manage table name and branding color.</p>
        </div>

        {/* Table Name */}
        <div className="space-y-1.5">
          <label htmlFor="table-name" className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
            Table Name
          </label>
          <input
            type="text"
            id="table-name"
            value={table.name}
            onChange={handleNameChange}
            placeholder="e.g. users"
            className="w-full h-9 rounded-sm border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-primary outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 font-mono"
          />
        </div>

        {/* Color picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
            Theme Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                style={{ backgroundColor: color }}
                className={`h-6 w-6 rounded-full cursor-pointer transition-all border border-black/20 hover:scale-110 flex items-center justify-center ${
                  table.color === color
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110'
                    : ''
                }`}
                title={color}
                type="button"
              >
                {table.color === color && (
                  <span className="h-1.5 w-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Columns list */}
      <div className="space-y-4 border-t border-border/60 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-primary mb-1">Columns</h3>
            <p className="text-[10px] text-secondary">Define database columns and types.</p>
          </div>
          <button
            onClick={handleAddColumn}
            className="h-7 px-2.5 rounded-sm bg-accent hover:bg-accent/90 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            type="button"
          >
            <Plus className="h-3 w-3" />
            Add Column
          </button>
        </div>

        {/* Column items list */}
        <div className="space-y-3">
          {table.columns.length === 0 ? (
            <div className="p-4 border border-dashed border-border/40 rounded bg-background/25 text-center">
              <p className="text-[10px] text-secondary">No columns defined yet. Click "Add Column" to get started.</p>
            </div>
          ) : (
            table.columns
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((col, index) => (
                <div
                  key={col.id}
                  className="p-3 border border-border bg-background/35 rounded-sm space-y-2.5 hover:border-border/120 transition-colors"
                >
                  {/* Row 1: Drag & Reorder buttons, Name input, Trash */}
                  <div className="flex items-center gap-1.5">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveColumnUp(index)}
                        disabled={index === 0}
                        className="p-0.5 text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary cursor-pointer transition-colors"
                        title="Move Up"
                        type="button"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMoveColumnDown(index)}
                        disabled={index === table.columns.length - 1}
                        className="p-0.5 text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary cursor-pointer transition-colors"
                        title="Move Down"
                        type="button"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Column Name Input */}
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleColumnUpdate(col.id, { name: e.target.value })}
                      placeholder="column_name"
                      className="flex-1 h-8 rounded-sm border border-border/80 bg-background/50 px-2 py-1 text-xs text-primary outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 font-mono"
                    />

                    {/* Remove column button */}
                    <button
                      onClick={() => handleRemoveColumn(col.id)}
                      className="p-1.5 text-secondary hover:text-red-500 rounded hover:bg-white/5 cursor-pointer transition-colors"
                      title="Delete Column"
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Row 2: Data Type & Toggles */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Data Type Select */}
                    <select
                      value={col.dataType}
                      onChange={(e) => handleColumnUpdate(col.id, { dataType: e.target.value })}
                      className="h-8 rounded-sm border border-border/80 bg-background/50 px-1.5 py-0.5 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer font-mono"
                    >
                      {DATA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                      {/* Allow custom types if not present in the preset */}
                      {!DATA_TYPES.includes(col.dataType) && (
                        <option value={col.dataType}>{col.dataType}</option>
                      )}
                    </select>

                    {/* Checkboxes container */}
                    <div className="flex items-center justify-around text-[10px] text-secondary font-semibold border border-border/60 bg-background/20 rounded-sm px-1">
                      {/* PK */}
                      <label className="flex items-center gap-0.5 cursor-pointer hover:text-primary">
                        <input
                          type="checkbox"
                          checked={col.isPrimaryKey}
                          onChange={(e) => handleColumnUpdate(col.id, { isPrimaryKey: e.target.checked })}
                          className="h-3 w-3 accent-accent cursor-pointer rounded-sm"
                        />
                        <span title="Primary Key" className="flex items-center gap-0.5">
                          <Key className="h-2.5 w-2.5 text-amber-500 fill-amber-500/10" /> PK
                        </span>
                      </label>

                      {/* Nullable */}
                      <label className="flex items-center gap-0.5 cursor-pointer hover:text-primary">
                        <input
                          type="checkbox"
                          checked={col.isNullable}
                          onChange={(e) => handleColumnUpdate(col.id, { isNullable: e.target.checked })}
                          className="h-3 w-3 accent-accent cursor-pointer rounded-sm"
                        />
                        <span>NULL</span>
                      </label>

                      {/* Unique */}
                      <label className="flex items-center gap-0.5 cursor-pointer hover:text-primary">
                        <input
                          type="checkbox"
                          checked={col.isUnique}
                          onChange={(e) => handleColumnUpdate(col.id, { isUnique: e.target.checked })}
                          className="h-3 w-3 accent-accent cursor-pointer rounded-sm"
                        />
                        <span>UQ</span>
                      </label>
                    </div>
                  </div>

                  {/* Row 3: Default Value & Check Constraint */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={col.defaultValue || ''}
                      onChange={(e) =>
                        handleColumnUpdate(col.id, { defaultValue: e.target.value || null })
                      }
                      placeholder="Default value"
                      className="h-7 rounded-sm border border-border/80 bg-background/50 px-2 py-0.5 text-[10px] text-primary outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 font-mono"
                    />
                    <input
                      type="text"
                      value={col.checkExpr || ''}
                      onChange={(e) =>
                        handleColumnUpdate(col.id, { checkExpr: e.target.value || null })
                      }
                      placeholder="Check constraint"
                      className="h-7 rounded-sm border border-border/80 bg-background/50 px-2 py-0.5 text-[10px] text-primary outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 font-mono"
                    />
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
