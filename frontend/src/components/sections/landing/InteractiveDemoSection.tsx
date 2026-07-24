import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Database, Plus, Trash2 } from 'lucide-react';

interface Column {
  id: string;
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
}

const PRESET_COLUMNS: Column[] = [
  { id: 'id', name: 'id', type: 'UUID', isPk: true },
  { id: 'user_id', name: 'user_id', type: 'UUID', isFk: true },
  { id: 'total_amount', name: 'total_amount', type: 'DECIMAL(10,2)' },
  { id: 'status', name: 'status', type: 'VARCHAR(50)' },
  { id: 'created_at', name: 'created_at', type: 'TIMESTAMP' },
];

export const InteractiveDemoSection: React.FC = () => {
  const [columns, setColumns] = React.useState<Column[]>([
    PRESET_COLUMNS[0],
    PRESET_COLUMNS[1],
    PRESET_COLUMNS[2],
  ]);
  const [newFieldName, setNewFieldName] = React.useState('');
  const [newFieldType, setNewFieldType] = React.useState('VARCHAR(255)');

  // Toggle pre-existing columns
  const handleTogglePreset = (col: Column) => {
    const exists = columns.find((c) => c.id === col.id);
    if (exists) {
      // Don't allow empty table just for validation warning test, or let them remove it!
      setColumns(columns.filter((c) => c.id !== col.id));
    } else {
      setColumns([...columns, col]);
    }
  };

  // Add custom column
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const formattedName = newFieldName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    const newCol: Column = {
      id: `custom_${Date.now()}`,
      name: formattedName,
      type: newFieldType,
    };

    setColumns([...columns, newCol]);
    setNewFieldName('');
  };

  // Delete column
  const handleDeleteColumn = (id: string) => {
    setColumns(columns.filter((c) => c.id !== id));
  };

  // Validation logic
  const hasPk = columns.some((c) => c.isPk);
  const hasFk = columns.some((c) => c.isFk);
  const totalCols = columns.length;

  let validationMsg = 'Schema Valid';
  let validationSeverity: 'success' | 'warning' | 'info' = 'success';

  if (totalCols === 0) {
    validationMsg = 'Empty Table: A table must contain at least one column.';
    validationSeverity = 'warning';
  } else if (!hasPk) {
    validationMsg = 'Missing Primary Key: High risk of duplicate entries. Add a primary key (e.g. id).';
    validationSeverity = 'warning';
  } else if (hasPk && !hasFk) {
    validationMsg = 'Standalone Table: No relations detected. Define columns like user_id to map structures.';
    validationSeverity = 'info';
  } else {
    validationMsg = `Schema Valid: Model compiles to PostgreSQL successfully (${totalCols} columns).`;
    validationSeverity = 'success';
  }

  return (
    <section id="demo" className="py-20 md:py-28 px-6 bg-background/30 border-t border-border-subtle relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-4 font-sans">
            Interactive Editor Sandbox
          </h2>
          <p className="text-base text-secondary leading-relaxed">
            Test the schema compiler rules below. Toggle fields or add custom attributes to verify real-time layout rendering and semantic compiler logs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Panel (Left side) */}
          <div className="lg:col-span-5 flex flex-col gap-6 p-6 rounded-xl border border-border-subtle bg-surface/60 text-left">
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider font-mono mb-1">
                Configure Table: orders
              </h3>
              <p className="text-xs text-secondary">
                Activate presets or insert new column metadata attributes.
              </p>
            </div>

            {/* Toggle Preset Columns */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-secondary">Preset Columns</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_COLUMNS.map((col) => {
                  const isActive = columns.some((c) => c.name === col.name);
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleTogglePreset(col)}
                      className={`px-3 py-2 text-xs font-mono rounded-lg border flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-accent/10 border-accent text-accent'
                          : 'bg-surface border-border-subtle text-secondary hover:border-accent'
                      }`}
                    >
                      <span>
                        {col.isPk ? '🔑 ' : col.isFk ? '🔗 ' : ''}
                        {col.name}
                      </span>
                      <span className="text-[9px] opacity-75">{isActive ? 'Active' : 'Add'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-border-subtle" />

            {/* Add Custom Field Form */}
            <form onSubmit={handleAddCustom} className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-secondary">Add Custom Column</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="column_name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="flex-1 min-w-0 bg-background border border-border-subtle text-primary rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-accent transition-colors"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="bg-background border border-border-subtle text-secondary rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="VARCHAR(255)">VARCHAR</option>
                  <option value="INTEGER">INT</option>
                  <option value="BOOLEAN">BOOL</option>
                  <option value="DECIMAL(10,2)">DECIMAL</option>
                  <option value="TEXT">TEXT</option>
                </select>
                <button
                  type="submit"
                  className="bg-accent/25 text-accent border border-accent/30 hover:bg-accent hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </form>

            <hr className="border-border-subtle" />

            {/* Validation Panel */}
            <div className="mt-auto">
              <span className="text-xs font-semibold text-secondary block mb-2">Compiler Diagnostics</span>
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 transition-colors duration-200 ${
                  validationSeverity === 'success'
                    ? 'bg-success/5 border-success/20 text-success'
                    : validationSeverity === 'warning'
                    ? 'bg-destructive/5 border-destructive/20 text-destructive'
                    : 'bg-accent/5 border-accent/20 text-accent'
                }`}
              >
                {validationSeverity === 'success' && <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />}
                {validationSeverity === 'warning' && <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0" />}
                {validationSeverity === 'info' && <Database className="h-4.5 w-4.5 flex-shrink-0" />}
                <p className="leading-relaxed">{validationMsg}</p>
              </div>
            </div>
          </div>

          {/* Designer Preview (Right side) */}
          <div className="lg:col-span-7 rounded-xl border border-border-subtle bg-background relative overflow-hidden flex items-center justify-center p-6 min-h-[360px]">
            {/* Dots Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

            {/* Interactive SVG relationships */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {hasFk && (
                <motion.path
                  d="M 170 190 C 230 190, 230 200, 290 200"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </svg>

            {/* Left Static Table: Users */}
            {hasFk && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-[160px] bg-surface border border-border-subtle rounded-xl shadow-md z-10 text-left select-none hidden sm:block"
              >
                <div className="px-3 py-1.5 border-b border-border-subtle bg-background rounded-t-xl">
                  <span className="text-[11px] font-bold text-primary font-mono">users</span>
                </div>
                <div className="p-2 flex flex-col gap-1.5 bg-background/30 rounded-b-xl">
                  <div className="flex justify-between items-center text-[10px] font-mono py-0.5">
                    <span className="text-success font-semibold">🔑 id</span>
                    <span className="text-placeholder">UUID</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono py-0.5">
                    <span className="text-primary">email</span>
                    <span className="text-placeholder">VARCHAR</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dynamic Table Card: Orders */}
            <div className={`w-[240px] bg-surface border rounded-xl shadow-xl z-10 text-left select-none relative transition-all duration-300 ${
              hasPk ? 'border-border-subtle' : 'border-destructive/60 shadow-destructive/5'
            }`}>
              <div className="px-4 py-3 border-b border-border-subtle bg-background rounded-t-xl flex justify-between items-center">
                <span className="text-sm font-semibold text-primary font-mono">orders</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-background border border-border-subtle rounded-lg text-placeholder font-mono">
                  Table
                </span>
              </div>
              <div className="p-3 bg-background/20 rounded-b-xl flex flex-col gap-2 min-h-[80px]">
                <AnimatePresence initial={false}>
                  {columns.map((col) => (
                    <motion.div
                      key={col.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`flex items-center justify-between px-2 py-1 bg-background rounded-lg border transition-colors ${
                        col.isPk
                          ? 'border-success/20 bg-success/5'
                          : col.isFk
                          ? 'border-accent/20 bg-accent/5'
                          : 'border-border-subtle/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-semibold text-primary">
                          {col.isPk ? '🔑 ' : col.isFk ? '🔗 ' : ''}
                          {col.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-placeholder">{col.type}</span>
                        {/* Custom fields show a delete button */}
                        {col.id.startsWith('custom_') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteColumn(col.id);
                            }}
                            className="text-placeholder hover:text-destructive transition-colors p-0.5 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {columns.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <span className="text-xs text-placeholder font-mono">No columns active</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
