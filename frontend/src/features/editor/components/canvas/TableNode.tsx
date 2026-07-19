import * as React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Link as LinkIcon, GripHorizontal, MoreHorizontal, Table as TableIcon } from 'lucide-react';
import { type Column, useSchemaStore } from '../../store/schemaStore';

interface TableNodeData {
  id: string;
  dialect?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
}

export type TableNodeProps = NodeProps & {
  data: TableNodeData;
};

// Sub-component for individual column rows
const ColumnRow: React.FC<{
  column: Column;
}> = ({ column }) => {
  const hasLeftPort = true;
  const hasRightPort = true;

  return (
    <div className="relative group/row flex items-center justify-between px-3 py-1.5 hover:bg-white/2 space-y-0 text-[11px] font-mono border-b border-border/10 last:border-b-0">
      {/* Left target handle */}
      {hasLeftPort && (
        <Handle
          type="target"
          position={Position.Left}
          id={`${column.id}-left`}
          className="!absolute !top-1/2 -translate-y-1/2 !w-2.5 !h-2.5 !rounded-full !border !border-border !bg-[#0B0D10] !flex !items-center !justify-center opacity-70 group-hover/row:opacity-100 group-hover/row:scale-110 group-hover/row:border-accent transition-all duration-150 cursor-pointer !left-[-5px]"
          style={{ pointerEvents: 'all' }}
        />
      )}

      {/* Column metadata + Name */}
      <div className="flex items-center gap-1.5 min-w-0 pointer-events-none">
        <span className="shrink-0 flex items-center justify-center">
          {column.isPrimaryKey && <Key className="h-3 w-3 text-amber-500 fill-amber-500/20" />}
          {column.isForeignKey && !column.isPrimaryKey && <LinkIcon className="h-2.5 w-2.5 text-accent" />}
          {!column.isPrimaryKey && !column.isForeignKey && <div className="h-3 w-3" />}
        </span>
        <span className={`truncate font-medium ${column.isPrimaryKey ? 'text-primary' : 'text-primary/95'}`}>
          {column.name}
          {column.isNullable && <span className="text-secondary/50 font-sans ml-0.5">?</span>}
        </span>
      </div>

      {/* Data Type */}
      <div className="flex items-center gap-1.5 pl-2 shrink-0 pointer-events-none">
        <span className="text-[10px] text-secondary/60 font-semibold">{column.dataType}</span>
      </div>

      {/* Right source handle */}
      {hasRightPort && (
        <Handle
          type="source"
          position={Position.Right}
          id={`${column.id}-right`}
          className="!absolute !top-1/2 -translate-y-1/2 !w-2.5 !h-2.5 !rounded-full !border !border-border !bg-[#0B0D10] !flex !items-center !justify-center opacity-70 group-hover/row:opacity-100 group-hover/row:scale-110 group-hover/row:border-accent transition-all duration-150 cursor-pointer !right-[-5px]"
          style={{ pointerEvents: 'all' }}
        />
      )}
    </div>
  );
};

export const TableNode = React.memo<TableNodeProps>(
  ({ id, data, selected }) => {
    // Narrow subscription: only re-render this table node if its own data changes
    const table = useSchemaStore(
      React.useCallback((state) => state.tables.find((t) => t.id === id), [id])
    );

    if (!table) {
      return null;
    }

    const getHeaderColor = () => {
      if (table.color) return table.color;
      switch (data.dialect) {
        case 'postgresql': return '#2563EB';
        case 'mysql': return '#F29111';
        case 'sqlite': return '#10B981';
        case 'mssql': return '#EF4444';
        default: return '#2563EB';
      }
    };
    const headerBorderColor = getHeaderColor();

    return (
      <div
        className={`w-56 rounded-sm border bg-surface shadow-xl flex flex-col transition-shadow select-none group/table border-t-2 ${
          selected
            ? 'border-accent ring-1 ring-accent shadow-accent/5'
            : 'border-border hover:border-border/120 hover:shadow-2xl'
        }`}
        style={{
          borderTopColor: headerBorderColor,
        }}
      >
        {/* Table Header */}
        <div
          className={`px-3 py-2 flex items-center justify-between border-b select-none ${
            selected ? 'border-accent/40 bg-accent/5' : 'border-border/80 bg-background/30'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 select-none pointer-events-none">
            <GripHorizontal className="h-3.5 w-3.5 text-secondary/40 shrink-0" />
            <TableIcon className="h-3.5 w-3.5 text-accent shrink-0" />
            <span className="text-xs font-mono font-bold text-primary truncate">
              {table.name}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover/table:opacity-100 transition-opacity nodrag">
            <button
              type="button"
              className="h-5 w-5 text-secondary hover:text-primary flex items-center justify-center rounded hover:bg-white/5 cursor-pointer"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Columns List */}
        <div className="py-1 flex flex-col nodrag">
          {table.columns.map((col) => (
            <ColumnRow key={col.id} column={col} />
          ))}
        </div>
      </div>
    );
  },
  // Custom comparison to prevent re-rendering when other nodes change/move or when columns of other nodes change
  (prevProps, nextProps) => {
    return (
      prevProps.selected === nextProps.selected &&
      prevProps.id === nextProps.id &&
      prevProps.data.dialect === nextProps.data.dialect
    );
  }
);

TableNode.displayName = 'TableNode';
