import * as React from 'react';
import { useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { useReactFlow } from '@xyflow/react';
import { 
  Plus, 
  FolderOpen, 
  Code, 
  Trash2, 
  Undo2, 
  Redo2, 
  Search 
} from 'lucide-react';

import { useSchemaStore } from '../../features/editor/store/schemaStore';
import { useSelectionStore } from '../../features/editor/store/selectionStore';
import { useUndoRedo } from '../../features/editor/hooks/useUndoRedo';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const { fitView } = useReactFlow();
  
  // Select state from stores
  const tables = useSchemaStore((state) => state.tables);
  const addTable = useSchemaStore((state) => state.addTable);
  const deleteTable = useSchemaStore((state) => state.deleteTable);
  const deleteRelationship = useSchemaStore((state) => state.deleteRelationship);
  
  const selectedTableIds = useSelectionStore((state) => state.selectedTableIds);
  const selectedRelationshipIds = useSelectionStore((state) => state.selectedRelationshipIds);
  const setSelectedTableIds = useSelectionStore((state) => state.setSelectedTableIds);
  const setSelectedRelationshipIds = useSelectionStore((state) => state.setSelectedRelationshipIds);
  const clearSelection = useSelectionStore((state) => state.clearSelection);
  const setIsSqlPreviewOpen = useSelectionStore((state) => state.setIsSqlPreviewOpen);

  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  // Helper action: Add Table
  const handleAddTable = useCallback(() => {
    const tableIndex = tables.length + 1;
    addTable({
      name: `new_table_${tableIndex}`,
      color: '#2563EB',
      positionX: 150 + (tables.length * 30) % 200,
      positionY: 150 + (tables.length * 30) % 200,
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
        }
      ]
    });
    onOpenChange(false);
  }, [tables.length, addTable, onOpenChange]);

  // Helper action: Jump to Table
  const handleJumpToTable = useCallback((tableId: string) => {
    setSelectedTableIds([tableId]);
    setSelectedRelationshipIds([]);
    
    // Smooth scroll/zoom viewport to center the selected table node
    setTimeout(() => {
      fitView({ nodes: [{ id: tableId }], duration: 800 });
    }, 50);

    onOpenChange(false);
  }, [fitView, setSelectedTableIds, setSelectedRelationshipIds, onOpenChange]);

  // Helper action: Delete Selected Element
  const handleDeleteSelection = useCallback(() => {
    if (selectedTableIds.length > 0) {
      selectedTableIds.forEach((id) => deleteTable(id));
      clearSelection();
    } else if (selectedRelationshipIds.length > 0) {
      selectedRelationshipIds.forEach((id) => deleteRelationship(id));
      clearSelection();
    }
    onOpenChange(false);
  }, [selectedTableIds, selectedRelationshipIds, deleteTable, deleteRelationship, clearSelection, onOpenChange]);

  // Helper action: Export SQL drawer trigger
  const handleExportSQL = useCallback(() => {
    setIsSqlPreviewOpen(true);
    onOpenChange(false);
  }, [setIsSqlPreviewOpen, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-[#080B14]/70 backdrop-blur-xs z-50 transition-opacity duration-150 animate-fade-in" />
        
        {/* Content */}
        <Dialog.Content className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#0F1420] border border-[#1E293B]/80 rounded-sm shadow-2xl z-50 flex flex-col overflow-hidden max-h-[350px] outline-none animate-in fade-in zoom-in-95 duration-100">
          <Command label="Command Palette" className="flex flex-col h-full w-full select-none text-xs">
            {/* Search Input */}
            <div className="flex items-center border-b border-border/60 px-3.5 py-1">
              <Search className="h-4 w-4 text-secondary shrink-0 mr-2" />
              <Command.Input
                placeholder="Type a command or table name..."
                className="w-full bg-transparent py-3 text-sm text-primary outline-none placeholder:text-secondary/40 font-sans"
                autoFocus
              />
            </div>
            
            {/* Command List */}
            <Command.List className="overflow-y-auto p-2 max-h-[280px] custom-scrollbar space-y-1">
              <Command.Empty className="py-6 text-center text-secondary/60">No results found.</Command.Empty>
              
              {/* Group: Core Operations */}
              <Command.Group 
                heading="Canvas Operations"
                className="text-[10px] text-secondary/60 font-bold uppercase tracking-wider px-2 py-1.5 block"
              >
                <Command.Item
                  onSelect={handleAddTable}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-primary hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Add Table</span>
                </Command.Item>
                
                <Command.Item
                  onSelect={handleExportSQL}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-primary hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white transition-colors"
                >
                  <Code className="h-3.5 w-3.5 shrink-0" />
                  <span>Export SQL Code...</span>
                </Command.Item>
                
                <Command.Item
                  onSelect={handleDeleteSelection}
                  disabled={selectedTableIds.length === 0 && selectedRelationshipIds.length === 0}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-primary hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:data-[selected=true]:bg-transparent disabled:data-[selected=true]:text-primary transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Delete Selected Element</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => { undo(); onOpenChange(false); }}
                  disabled={!canUndo}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-primary hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:data-[selected=true]:bg-transparent disabled:data-[selected=true]:text-primary transition-colors"
                >
                  <Undo2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Undo Action</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => { redo(); onOpenChange(false); }}
                  disabled={!canRedo}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-primary hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:data-[selected=true]:bg-transparent disabled:data-[selected=true]:text-primary transition-colors"
                >
                  <Redo2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Redo Action</span>
                </Command.Item>
              </Command.Group>

              {/* Group: Navigation */}
              {tables.length > 0 && (
                <Command.Group 
                  heading="Jump to Tables"
                  className="text-[10px] text-secondary/60 font-bold uppercase tracking-wider px-2 py-1.5 block pt-2 border-t border-border/30 mt-2"
                >
                  {tables.map((table) => (
                    <Command.Item
                      key={table.id}
                      onSelect={() => handleJumpToTable(table.id)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-primary hover:text-white cursor-pointer select-none outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white transition-colors font-mono"
                    >
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-accent/80" />
                      <span>{table.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
