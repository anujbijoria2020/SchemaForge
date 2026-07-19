import * as React from 'react';
import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useSchemaStore } from '../../store/schemaStore';
import { useSelectionStore } from '../../store/selectionStore';
import { useHistoryStore } from '../../store/historyStore';
import { TableNode } from './TableNode';
import { RelationshipEdge } from './RelationshipEdge';
import { Plus } from 'lucide-react';

interface EditorCanvasProps {
  dialect?: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
}

const nodeTypes = {
  table: TableNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

const defaultViewport = { x: 0, y: 0, zoom: 1 };

const getEdgeMarkers = (cardinality: string, isSelected: boolean) => {
  const suffix = isSelected ? '-selected' : '-normal';
  if (cardinality === 'one-to-one') {
    return {
      markerStart: `url(#arrow${suffix})`,
      markerEnd: `url(#arrow${suffix})`,
    };
  } else if (cardinality === 'one-to-many') {
    return {
      markerStart: `url(#crowfoot${suffix})`,
      markerEnd: `url(#arrow${suffix})`,
    };
  } else {
    // many-to-many
    return {
      markerStart: `url(#crowfoot${suffix})`,
      markerEnd: `url(#crowfoot${suffix})`,
    };
  }
};

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ dialect = 'postgresql' }) => {
  const tables = useSchemaStore((state) => state.tables);
  const relationships = useSchemaStore((state) => state.relationships);
  const moveTable = useSchemaStore((state) => state.moveTable);
  const addRelationship = useSchemaStore((state) => state.addRelationship);
  const setCanvasState = useSchemaStore((state) => state.setCanvasState);
  const addTable = useSchemaStore((state) => state.addTable);

  const handleAddFirstTable = useCallback(() => {
    addTable({
      name: 'users',
      color: '#2563EB',
      positionX: 350,
      positionY: 200,
      columns: [
        {
          id: crypto.randomUUID(),
          name: 'id',
          dataType: 'uuid',
          isNullable: false,
          isPrimaryKey: true,
          isUnique: true,
          defaultValue: 'gen_random_uuid()',
          checkExpr: null,
          sortOrder: 1,
        },
        {
          id: crypto.randomUUID(),
          name: 'email',
          dataType: 'varchar(255)',
          isNullable: false,
          isPrimaryKey: false,
          isUnique: true,
          defaultValue: null,
          checkExpr: null,
          sortOrder: 2,
        },
        {
          id: crypto.randomUUID(),
          name: 'created_at',
          dataType: 'timestamp',
          isNullable: false,
          isPrimaryKey: false,
          isUnique: false,
          defaultValue: 'now()',
          checkExpr: null,
          sortOrder: 3,
        }
      ]
    });
  }, [addTable]);

  // Track initial node coordinates when a drag starts to compile a single undo/redo entry
  const dragStartPositions = React.useRef<Map<string, { x: number; y: number }>>(new Map());

  // Read/write selection state from selectionStore
  const selectedTableIds = useSelectionStore((state) => state.selectedTableIds);
  const setSelectedTableIds = useSelectionStore((state) => state.setSelectedTableIds);
  const selectedRelationshipIds = useSelectionStore((state) => state.selectedRelationshipIds);
  const setSelectedRelationshipIds = useSelectionStore((state) => state.setSelectedRelationshipIds);

  // Derived projection of schemaStore.tables to React Flow nodes
  const nodes = useMemo(() => {
    return tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: { x: table.positionX, y: table.positionY },
      selected: selectedTableIds.includes(table.id),
      data: {
        id: table.id,
        dialect: dialect,
      },
    }));
  }, [tables, selectedTableIds, dialect]);

  // Derived projection of schemaStore.relationships to React Flow edges with dynamic snapping
  const edges = useMemo(() => {
    return relationships.map((rel) => {
      const sourceTable = tables.find((t) => t.id === rel.sourceTableId);
      const targetTable = tables.find((t) => t.id === rel.targetTableId);

      const sourceIsLeft = sourceTable && targetTable
        ? sourceTable.positionX < targetTable.positionX
        : true;

      const sourceHandle = `${rel.sourceColumnId}-${sourceIsLeft ? 'right' : 'left'}`;
      const targetHandle = `${rel.targetColumnId}-${sourceIsLeft ? 'left' : 'right'}`;

      const isSelected = selectedRelationshipIds.includes(rel.id);
      const markers = getEdgeMarkers(rel.cardinality, isSelected);

      return {
        id: rel.id,
        source: rel.sourceTableId,
        target: rel.targetTableId,
        sourceHandle,
        targetHandle,
        type: 'relationship',
        selected: isSelected,
        ...markers,
      };
    });
  }, [relationships, tables, selectedRelationshipIds]);

  // Handle node position and selection changes
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          moveTable(change.id, change.position.x, change.position.y);
        } else if (change.type === 'select') {
          setSelectedTableIds(change.selected
            ? [...selectedTableIds.filter((id) => id !== change.id), change.id]
            : selectedTableIds.filter((id) => id !== change.id)
          );
        }
      });
    },
    [moveTable, selectedTableIds, setSelectedTableIds]
  );

  // Handle edge selection changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      changes.forEach((change) => {
        if (change.type === 'select') {
          setSelectedRelationshipIds(change.selected
            ? [...selectedRelationshipIds.filter((id) => id !== change.id), change.id]
            : selectedRelationshipIds.filter((id) => id !== change.id)
          );
        }
      });
    },
    [selectedRelationshipIds, setSelectedRelationshipIds]
  );

  // Drag-to-connect to create a new relationship
  const onConnect = useCallback(
    (connection: any) => {
      const sourceColumnId = connection.sourceHandle?.replace(/-left|-right$/, '') || '';
      const targetColumnId = connection.targetHandle?.replace(/-left|-right$/, '') || '';

      if (connection.source && connection.target && sourceColumnId && targetColumnId) {
        addRelationship({
          sourceTableId: connection.source,
          sourceColumnId: sourceColumnId,
          targetTableId: connection.target,
          targetColumnId: targetColumnId,
          cardinality: 'one-to-many',
          onDelete: 'cascade',
        });
      }
    },
    [addRelationship]
  );

  // Track zoom/pan changes and mirror to schemaStore (debounced/throttled on move end)
  const onMoveEnd = useCallback(
    (_event: any, viewport: { x: number; y: number; zoom: number }) => {
      setCanvasState(viewport);
    },
    [setCanvasState]
  );

  const onNodeDragStart = useCallback((_event: any, node: any) => {
    dragStartPositions.current.set(node.id, { x: node.position.x, y: node.position.y });
  }, []);

  const onNodeDragStop = useCallback((_event: any, node: any) => {
    const startPos = dragStartPositions.current.get(node.id);
    if (!startPos) return;

    const endPos = { x: node.position.x, y: node.position.y };

    // Only push a single history patch if coordinates changed
    if (startPos.x !== endPos.x || startPos.y !== endPos.y) {
      const currentTable = useSchemaStore.getState().tables.find(t => t.id === node.id);
      if (currentTable) {
        const beforeTable = { ...currentTable, positionX: startPos.x, positionY: startPos.y };
        const afterTable = { ...currentTable, positionX: endPos.x, positionY: endPos.y };

        useHistoryStore.getState().push({
          type: 'move_table',
          before: { tables: [beforeTable] },
          after: { tables: [afterTable] },
        });
      }
    }
    dragStartPositions.current.delete(node.id);
  }, []);

  return (
    <div className="w-full h-full bg-[#080B14] relative select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        panOnDrag={true}
        panActivationKeyCode="Space"
        defaultViewport={defaultViewport}
        minZoom={0.1}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1E293B"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        
        {/* Custom Marker Definitions */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none', zIndex: -1 }}>
          <defs>
            {/* Arrow normal */}
            <marker
              id="arrow-normal"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto-start-reverse"
              markerUnits="strokeWidth"
            >
              <path d="M 0 1 L 6 4 L 0 7 z" fill="#475569" />
            </marker>
            {/* Arrow selected */}
            <marker
              id="arrow-selected"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="4"
              orient="auto-start-reverse"
              markerUnits="strokeWidth"
            >
              <path d="M 0 1 L 6 4 L 0 7 z" fill="#2563EB" />
            </marker>
            {/* Crowfoot normal */}
            <marker
              id="crowfoot-normal"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="strokeWidth"
            >
              <path d="M 2 2 L 8 5 L 2 8 M 2 5 L 8 5" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </marker>
            {/* Crowfoot selected */}
            <marker
              id="crowfoot-selected"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto-start-reverse"
              markerUnits="strokeWidth"
            >
              <path d="M 2 2 L 8 5 L 2 8 M 2 5 L 8 5" stroke="#2563EB" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </marker>
          </defs>
        </svg>
      </ReactFlow>

      {tables.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <button
            onClick={handleAddFirstTable}
            className="pointer-events-auto flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border hover:border-accent/40 bg-surface/80 backdrop-blur-md rounded-sm w-72 h-44 hover:bg-surface transition-all cursor-pointer group shadow-xl gap-4 select-none"
          >
            <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center border border-accent/20 group-hover:bg-accent/25 transition-all text-accent">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-primary group-hover:text-accent transition-all">Add Your First Table</h3>
              <p className="text-[10px] text-secondary mt-1 max-w-[200px] leading-relaxed">
                Click here or use the toolbar to place a table and start designing your schema.
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
