import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Database, 
  Undo2, 
  Redo2, 
  Download, 
  ChevronRight, 
  Play,
  History
} from 'lucide-react';
import { Button } from '../../../../shared/components/ui/Button';
import { ThemeToggle } from '../../../../shared/components/ThemeToggle';
import { useSchemaStore } from '../../store/schemaStore';
import { useSelectionStore } from '../../store/selectionStore';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { cn } from '../../../../shared/lib/cn';

interface EditorToolbarProps {
  initialProjectName: string;
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
  workspaceId: string;
  workspaceName?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  initialProjectName,
  dialect,
  workspaceId,
  workspaceName,
}) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [projectName, setProjectName] = React.useState(initialProjectName);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(initialProjectName);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Select save status from schemaStore
  const isDirty = useSchemaStore((state) => state.isDirty);
  const isSaving = useSchemaStore((state) => state.isSaving);
  const saveError = useSchemaStore((state) => state.saveError);
  const addTable = useSchemaStore((state) => state.addTable);
  const tables = useSchemaStore((state) => state.tables);

  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const setIsSqlPreviewOpen = useSelectionStore((state) => state.setIsSqlPreviewOpen);

  const handleAddTable = () => {
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
  };

  // Sync state if initial prop changes
  React.useEffect(() => {
    setProjectName(initialProjectName);
    setEditValue(initialProjectName);
  }, [initialProjectName]);

  const handleStartEdit = () => {
    setEditValue(projectName);
    setIsEditing(true);
    // Focus the input on the next tick
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed.length >= 2 && trimmed.length <= 100) {
      setProjectName(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const renderSaveStatus = () => {
    if (saveError) {
      return (
        <span className="text-xs text-red-400 bg-red-950/20 border border-red-900/60 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-medium select-none shadow-sm shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
          <span className="text-[10px] font-mono uppercase font-semibold">Unsaved changes — retrying</span>
        </span>
      );
    }
    if (isSaving) {
      return (
        <span className="text-xs text-amber-400 bg-amber-950/20 border border-amber-900/60 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-medium select-none shadow-sm shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse" />
          <span className="text-[10px] font-mono uppercase font-semibold">Saving…</span>
        </span>
      );
    }
    if (isDirty) {
      return (
        <span className="text-xs text-amber-400 bg-amber-950/20 border border-amber-900/60 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-medium select-none shadow-sm shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-[10px] font-mono uppercase font-semibold">Unsaved changes</span>
        </span>
      );
    }
    return (
      <span className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/60 px-2.5 py-1 rounded-sm flex items-center gap-1.5 font-medium select-none shadow-sm shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        <span className="text-[10px] font-mono uppercase font-semibold">Saved</span>
      </span>
    );
  };

  return (
    <header className="h-14 border-b border-border bg-surface/85 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left side: Navigation, Breadcrumbs & Inline Editing */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate(`/app/workspaces/${workspaceId}`)}
          className="h-8 w-8 rounded-sm text-secondary hover:text-primary hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border border-transparent active:border-border"
          title="Back to Workspace"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
 
        <div className="h-4 w-px bg-border/60" />
 
        {/* Breadcrumb Workspace Name */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary hidden sm:flex">
          <span>{workspaceName || 'Workspace'}</span>
          <ChevronRight className="h-3 w-3 text-secondary/40" />
        </div>
 
        {/* Database Icon */}
        <div className="h-7 w-7 rounded-sm bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
          <Database className="h-4 w-4" />
        </div>
 
        {/* Inline editable name container */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="bg-background/90 text-primary border border-accent px-1.5 py-0.5 rounded-sm text-sm font-bold font-sans outline-none min-w-[120px] max-w-[240px] focus:ring-1 focus:ring-accent"
              />
            ) : (
              <h1 
                onClick={handleStartEdit}
                className="text-sm font-bold text-primary hover:bg-white/5 px-1.5 py-0.5 rounded-sm cursor-edit truncate font-sans transition-colors max-w-[240px]"
                title="Click to rename project"
              >
                {projectName}
              </h1>
            )}
 
            {/* Dialect tag */}
            <span className="text-[10px] leading-none font-mono uppercase bg-white/5 border border-border px-1.5 py-0.5 rounded-xs text-secondary font-semibold shrink-0">
              {dialect}
            </span>
          </div>
        </div>
      </div>
 
      {/* Middle side: Main Canvas Actions (Undo/Redo & Add Table) */}
      <div className="flex items-center gap-1 hidden md:flex">
        {/* Undo Redo Buttons */}
        <div className="flex items-center border border-border bg-background/50 rounded-sm p-0.5 mr-2">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className={cn(
              "h-7 w-8 flex items-center justify-center rounded-xs transition-colors",
              canUndo 
                ? "text-secondary hover:text-primary hover:bg-white/5 cursor-pointer" 
                : "text-secondary/40 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <div className="h-3 w-px bg-border" />
          <button 
            onClick={redo}
            disabled={!canRedo}
            className={cn(
              "h-7 w-8 flex items-center justify-center rounded-xs transition-colors",
              canRedo 
                ? "text-secondary hover:text-primary hover:bg-white/5 cursor-pointer" 
                : "text-secondary/40 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
 
        {/* Add Table Button */}
        <Button 
          variant="secondary"
          size="sm" 
          onClick={handleAddTable}
          className="h-8 gap-1.5 text-xs cursor-pointer font-semibold border-border bg-background/40 hover:bg-surface/50"
        >
          <Play className="h-3 w-3 text-accent rotate-90 fill-accent" />
          Add Table
        </Button>
      </div>
 
      {/* Right side: Save indicator & Sharing/Actions */}
      <div className="flex items-center gap-3">
        {/* Autosave Status Indicator */}
        {renderSaveStatus()}

        {/* Share / Export (Visually disabled / minimal) */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(`/app/projects/${projectId}/versions`)}
            className="h-8 gap-1.5 text-xs font-semibold border-border bg-background/40 hover:bg-surface/50 cursor-pointer hidden sm:flex"
          >
            <History className="h-3.5 w-3.5 text-secondary" />
            <span>History</span>
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsSqlPreviewOpen(true)}
            className="h-8 gap-1.5 text-xs font-semibold border-border bg-background/40 hover:bg-surface/50 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-secondary" />
            <span>Export SQL</span>
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/app/workspaces/${workspaceId}`)}
            className="h-8 text-xs font-semibold cursor-pointer shadow-sm shadow-accent/25"
          >
            Exit
          </Button>
        </div>
      </div>
    </header>
  );
};
