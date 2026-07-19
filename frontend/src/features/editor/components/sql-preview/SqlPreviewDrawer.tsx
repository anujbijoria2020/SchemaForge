import * as React from 'react';
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Download, Check, Database } from 'lucide-react';

import { useSchemaStore } from '../../store/schemaStore';
import { useSelectionStore } from '../../store/selectionStore';
import { generateSql } from '../../lib/sql-generation';

interface SqlPreviewDrawerProps {
  projectName: string;
  defaultDialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
}

export const SqlPreviewDrawer: React.FC<SqlPreviewDrawerProps> = ({
  projectName,
  defaultDialect,
}) => {
  const isOpen = useSelectionStore((state) => state.isSqlPreviewOpen);
  const setIsOpen = useSelectionStore((state) => state.setIsSqlPreviewOpen);

  const tables = useSchemaStore((state) => state.tables);
  const relationships = useSchemaStore((state) => state.relationships);

  const [selectedDialect, setSelectedDialect] = useState<any>(defaultDialect);
  const [copied, setCopied] = useState(false);

  // Sync dialect if defaultDialect changes
  useEffect(() => {
    setSelectedDialect(defaultDialect);
  }, [defaultDialect]);

  // Generate SQL based on current state and selected dialect
  const sql = React.useMemo(() => {
    return generateSql(tables, relationships, selectedDialect);
  }, [tables, relationships, selectedDialect]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}_schema.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-[#080B14]/70 backdrop-blur-xs z-40 transition-opacity duration-150 animate-fade-in" />

        {/* Content Panel (Slide-out from Right) */}
        <Dialog.Content className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0F1420] border-l border-[#1E293B]/80 shadow-2xl z-50 flex flex-col outline-none animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-sm bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-primary">Export SQL Schema</h3>
                <p className="text-[10px] text-secondary">Preview and download DDL statements.</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 rounded-sm flex items-center justify-center text-secondary hover:text-primary hover:bg-white/5 cursor-pointer transition-colors"
              title="Close Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Dialect Selector Panel */}
          <div className="p-4 bg-background/30 border-b border-border/40 flex items-center justify-between shrink-0 gap-3">
            <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">Target Dialect</span>
            <select
              value={selectedDialect}
              onChange={(e) => setSelectedDialect(e.target.value as any)}
              className="h-8 rounded-sm border border-border/80 bg-[#080B14] px-2.5 py-1 text-xs text-primary outline-none focus:border-accent/80 cursor-pointer font-sans"
            >
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlite">SQLite</option>
              <option value="mssql">SQL Server (MSSQL)</option>
            </select>
          </div>

          {/* SQL Preview Screen */}
          <div className="flex-1 min-h-0 p-4 flex flex-col relative bg-[#080B14]/30">
            <pre className="flex-1 w-full p-4 bg-background/80 text-[11px] font-mono text-primary/95 overflow-auto border border-border/60 rounded-sm select-text custom-scrollbar leading-relaxed">
              {sql}
            </pre>
          </div>

          {/* Action Bar (Footer) */}
          <div className="p-4 border-t border-border/60 bg-[#0F1420] flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={handleCopy}
              className="h-9 px-3.5 rounded-sm border border-border bg-[#080B14] hover:bg-surface/80 text-primary hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              type="button"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy DDL</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="h-9 px-3.5 rounded-sm bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-accent/25"
              type="button"
            >
              <Download className="h-4 w-4" />
              <span>Download .sql</span>
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
