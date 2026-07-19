import * as React from 'react';
import { Settings, Info, HelpCircle } from 'lucide-react';
import { useSelectionStore } from '../../store/selectionStore';
import { TableInspector } from './TableInspector';
import { RelationshipInspector } from './RelationshipInspector';

interface EditorInspectorProps {
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
}

export const EditorInspector: React.FC<EditorInspectorProps> = ({ dialect }) => {
  const selectedTableIds = useSelectionStore((state) => state.selectedTableIds);
  const selectedRelationshipIds = useSelectionStore((state) => state.selectedRelationshipIds);

  const [namingConvention, setNamingConvention] = React.useState('snake_case');
  const [pkStrategy, setPkStrategy] = React.useState('uuid');
  const [autoIndexFk, setAutoIndexFk] = React.useState(true);
  const [schemaDoc, setSchemaDoc] = React.useState('');

  const hasTableSelection = selectedTableIds.length > 0;
  const hasRelationshipSelection = selectedRelationshipIds.length > 0;

  const activeTableId = selectedTableIds[0];
  const activeRelationshipId = selectedRelationshipIds[0];

  const getDialectName = () => {
    switch (dialect) {
      case 'postgresql': return 'PostgreSQL';
      case 'mysql': return 'MySQL';
      case 'sqlite': return 'SQLite';
      case 'mssql': return 'SQL Server (MSSQL)';
      default: return dialect;
    }
  };

  return (
    <aside className="w-80 border-l border-border bg-surface flex flex-col h-full select-none flex-shrink-0 z-20">
      {/* Inspector Header */}
      <div className="p-4 border-b border-border/60 flex items-center gap-2">
        <Settings className="h-4 w-4 text-secondary" />
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
          {hasTableSelection
            ? 'Table Inspector'
            : hasRelationshipSelection
            ? 'Relationship Inspector'
            : 'Project Inspector'}
        </span>
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {hasTableSelection ? (
          <TableInspector tableId={activeTableId} />
        ) : hasRelationshipSelection ? (
          <RelationshipInspector relationshipId={activeRelationshipId} />
        ) : (
          <>
            {/* Schema settings container */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-primary mb-1">Schema Settings</h3>
                <p className="text-[10px] text-secondary">Global configurations for your visual schema.</p>
              </div>

              {/* Database Dialect (Read-only display) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  <span>Database Dialect</span>
                  <span title="Dialect is defined at project creation" className="cursor-help">
                    <HelpCircle className="h-3 w-3 text-secondary/40" />
                  </span>
                </div>
                <div className="w-full bg-background/40 border border-border/60 rounded-sm px-3 py-2 text-xs text-primary/70 font-mono select-none">
                  {getDialectName()}
                </div>
              </div>

              {/* Naming Conventions */}
              <div className="space-y-1.5">
                <label htmlFor="naming-convention" className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
                  Naming Convention
                </label>
                <select
                  id="naming-convention"
                  value={namingConvention}
                  onChange={(e) => setNamingConvention(e.target.value)}
                  className="w-full h-9 rounded-sm border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-primary outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 cursor-pointer"
                >
                  <option value="snake_case">snake_case (Recommended)</option>
                  <option value="camelCase">camelCase</option>
                  <option value="PascalCase">PascalCase</option>
                </select>
              </div>

              {/* Default Primary Key Type */}
              <div className="space-y-1.5">
                <label htmlFor="pk-strategy" className="text-[11px] font-semibold text-secondary uppercase tracking-wider block">
                  Default PK Strategy
                </label>
                <select
                  id="pk-strategy"
                  value={pkStrategy}
                  onChange={(e) => setPkStrategy(e.target.value)}
                  className="w-full h-9 rounded-sm border border-border/80 bg-background/50 px-3 py-1.5 text-xs text-primary outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 cursor-pointer"
                >
                  <option value="uuid">UUID (v4)</option>
                  <option value="serial">Serial (Auto-increment)</option>
                  <option value="bigint">BigInt (Identity)</option>
                </select>
              </div>

              {/* Auto-index Foreign Keys */}
              <div className="flex items-center justify-between py-1 border-t border-border/30 mt-2 pt-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-primary">Auto-create FK Indexes</span>
                  <span className="text-[9px] text-secondary">Index FK columns automatically</span>
                </div>
                <button
                  onClick={() => setAutoIndexFk(!autoIndexFk)}
                  role="switch"
                  aria-checked={autoIndexFk}
                  className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer shrink-0 ${
                    autoIndexFk ? 'bg-accent' : 'bg-border/85'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      autoIndexFk ? 'translate-x-4.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Documentation Section */}
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div>
                <h3 className="text-xs font-bold text-primary mb-1">Documentation</h3>
                <p className="text-[10px] text-secondary">Write a description or metadata for this database schema.</p>
              </div>

              <div className="space-y-1.5">
                <textarea
                  placeholder="e.g. Core PostgreSQL schema for SchemaForge workspace..."
                  value={schemaDoc}
                  onChange={(e) => setSchemaDoc(e.target.value)}
                  className="w-full h-32 bg-background/50 text-xs text-primary placeholder:text-secondary/40 border border-border/80 rounded-sm p-3 outline-none focus:border-accent/80 focus:ring-1 focus:ring-accent/80 resize-none font-sans"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selection Help Panel (Bottom of Inspector) */}
      <div className="p-3 border-t border-border bg-background/25 flex items-start gap-2">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-primary leading-none">
            {hasTableSelection
              ? 'Table Selected'
              : hasRelationshipSelection
              ? 'Relationship Selected'
              : 'Property Inspector'}
          </span>
          <p className="text-[9px] text-secondary leading-normal">
            {hasTableSelection
              ? 'Click on empty canvas or press Esc to clear table selection and return to global settings.'
              : hasRelationshipSelection
              ? 'Click on empty canvas or press Esc to clear relationship selection and return to global settings.'
              : 'Click on a table header or relationship line to view and edit its properties.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
