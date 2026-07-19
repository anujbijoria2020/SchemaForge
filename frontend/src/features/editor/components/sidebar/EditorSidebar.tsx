import * as React from 'react';
import { Search, Table, ChevronDown, ListFilter, Hash } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import { useSelectionStore } from '../../store/selectionStore';
import { useReactFlow } from '@xyflow/react';
import { tableTemplates, type TableTemplateKey } from "../templates/tableTemplates";




export const EditorSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [templatesOpen, setTemplatesOpen] = React.useState(true);
  const addTable = useSchemaStore((state) => state.addTable);

  const handleAddTemplate = React.useCallback(
    (key: TableTemplateKey) => {
      const template = tableTemplates[key];

      const tableCount = useSchemaStore.getState().tables.length;
      const offset = tableCount * 30;

      addTable({
        ...template.table,
        positionX: 300 + offset,
        positionY: 180 + offset,
        columns: template.table.columns.map((column) => ({
          ...column,
          id: crypto.randomUUID(),
        })),
      });
    },
    [addTable]
  );

  // Zustand store hooks
  const tables = useSchemaStore((state) => state.tables);
  const selectedTableIds = useSelectionStore((state) => state.selectedTableIds);
  const setSelectedTableIds = useSelectionStore((state) => state.setSelectedTableIds);

  // React Flow hook for outline navigation
  const reactFlow = useReactFlow();

  const filteredTables = tables.filter((table) =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTableClick = (tableId: string) => {
    // Select this table node
    setSelectedTableIds([tableId]);

    // Smoothly pan and center on the table node
    reactFlow.fitView({
      nodes: [{ id: tableId }],
      duration: 350,
    });
  };

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-full select-none flex-shrink-0 z-20">
      {/* Sidebar Header: Section Title */}
      <div className="p-4 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Schema Outline</span>
          <span className="text-[10px] font-mono font-bold bg-white/5 border border-border px-1.5 py-0.5 rounded-sm text-secondary">
            {tables.length}
          </span>
        </div>
        <button
          className="h-6 w-6 rounded-sm text-secondary hover:text-primary hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border border-transparent active:border-border"
          title="Filter Outline"
        >
          <ListFilter className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-secondary/60" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background/50 text-xs text-primary placeholder:text-secondary/50 border border-border/80 rounded-sm pl-8 pr-3 py-2 outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 transition-all font-sans"
          />
        </div>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
        {filteredTables.length > 0 ? (
          filteredTables.map((table) => {
            const isSelected = selectedTableIds.includes(table.id);
            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-sm cursor-pointer transition-all duration-150 ${isSelected
                  ? 'bg-accent/15 border border-accent/35 text-primary'
                  : 'border border-transparent text-secondary hover:text-primary hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Table className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-accent' : 'text-secondary group-hover:text-primary'}`} />
                  <span className="text-xs font-mono font-medium truncate">{table.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-secondary/60 group-hover:text-secondary/80 flex items-center gap-0.5">
                    <Hash className="h-2.5 w-2.5 shrink-0" />
                    {table.columns?.length ?? 0}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <span className="text-xs text-secondary/40 font-medium">No tables found</span>
          </div>
        )}
      </div>
      {/* Templates Section */}
      <div className="border-t border-border bg-background/30 shrink-0">

        {/* Header */}
        <button
          onClick={() => setTemplatesOpen((prev) => !prev)}
          className="
      w-full
      px-3
      py-2
      flex
      items-center
      justify-between
      hover:bg-white/5
      transition-colors
    "
        >
          <div className="text-left">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-secondary/70">
              Table Templates
            </h3>

            <p className="text-[9px] text-secondary/40 mt-0.5">
              Click to insert a table
            </p>
          </div>

          <ChevronDown
            className={`
        h-3.5
        w-3.5
        text-secondary/50
        transition-transform
        duration-200
        ${templatesOpen ? "rotate-180" : ""}
      `}
          />
        </button>


        {/* Collapsible Content */}
        <div
          className={`
      overflow-hidden
      transition-all
      duration-300
      ${templatesOpen
              ? "max-h-[360px] opacity-100"
              : "max-h-0 opacity-0"
            }
    `}
        >

          {/* Scrollable templates */}
          <div
            className="
        px-3
        pb-3
        max-h-[360px]
        overflow-y-auto
        custom-scrollbar
      "
          >

            <div className="grid grid-cols-2 gap-2">

              {(Object.entries(tableTemplates) as [
                TableTemplateKey,
                (typeof tableTemplates)[TableTemplateKey]
              ][]).map(([key, template]) => (

                <button
                  key={key}
                  onClick={() => handleAddTemplate(key)}
                  className="
              group
              flex
              flex-col
              items-start
              rounded-lg
              border
              border-border/70
              bg-surface
              p-3
              text-left
              transition-all
              hover:-translate-y-0.5
              hover:border-accent/40
              hover:bg-accent/5
              active:scale-[0.98]
            "
                >

                  <div
                    className="
                mb-2
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
              "
                    style={{
                      backgroundColor: `${template.ui.iconColor}20`,
                      color: template.ui.iconColor,
                    }}
                  >
                    <Table className="h-4 w-4" />
                  </div>

                  <span className="text-[11px] font-semibold text-primary">
                    {template.ui.title}
                  </span>

                  <span className="mt-1 text-[9px] text-secondary">
                    {template.ui.subtitle}
                  </span>

                  <span className="mt-1 text-[9px] text-secondary/40">
                    {template.table.columns.length} columns
                  </span>

                </button>

              ))}

            </div>

          </div>

        </div>

      </div>
    </aside>
  );
};
