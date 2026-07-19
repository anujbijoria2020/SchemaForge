import * as React from 'react';
import { useReactFlow, useViewport } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Map, Code, Info } from 'lucide-react';
import { useSelectionStore } from '../../store/selectionStore';

export const EditorBottomBar: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  const [isMinimapOpen, setIsMinimapOpen] = React.useState(false);
  const isSqlOpen = useSelectionStore((state) => state.isSqlPreviewOpen);
  const setIsSqlOpen = useSelectionStore((state) => state.setIsSqlPreviewOpen);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="h-10 border-t border-border bg-surface px-4 flex items-center justify-between z-20 select-none flex-shrink-0 text-xs text-secondary">
      {/* Left side: Zoom controls & Minimap */}
      <div className="flex items-center gap-1.5">
        {/* Zoom Out */}
        <button
          onClick={() => zoomOut()}
          className="h-6 w-6 rounded-sm hover:text-primary hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border border-transparent active:border-border"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        {/* Zoom Percentage */}
        <div className="px-1.5 py-0.5 font-mono font-medium select-none text-[10px]">
          {zoomPercent}%
        </div>

        {/* Zoom In */}
        <button
          onClick={() => zoomIn()}
          className="h-6 w-6 rounded-sm hover:text-primary hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border border-transparent active:border-border"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <div className="h-3 w-px bg-border/60 mx-1" />

        {/* Fit View */}
        <button
          onClick={() => fitView({ duration: 300 })}
          className="h-6 w-6 rounded-sm hover:text-primary hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer border border-transparent active:border-border"
          title="Fit to Screen (Shift + 1)"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-3 w-px bg-border/60 mx-1" />

        {/* Minimap Toggle */}
        <button
          onClick={() => setIsMinimapOpen(!isMinimapOpen)}
          className={`h-6 px-2 gap-1 rounded-sm transition-all flex items-center justify-center cursor-pointer border ${
            isMinimapOpen
              ? 'bg-accent/15 border-accent/40 text-primary'
              : 'border-transparent hover:text-primary hover:bg-white/5'
          }`}
          title="Toggle Minimap"
        >
          <Map className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold">Minimap</span>
        </button>
      </div>

      {/* Center: info notification placeholder */}
      <div className="hidden md:flex items-center gap-1.5 text-secondary/60">
        <Info className="h-3 w-3" />
        <span className="text-[10px] font-mono">Press Ctrl+K for command palette</span>
      </div>

      {/* Right side: SQL preview toggle */}
      <div className="flex items-center">
        <button
          onClick={() => setIsSqlOpen(!isSqlOpen)}
          className={`h-6 px-2.5 gap-1.5 rounded-sm transition-all flex items-center justify-center cursor-pointer border ${
            isSqlOpen
              ? 'bg-accent/15 border-accent/40 text-primary'
              : 'border-transparent hover:text-primary hover:bg-white/5'
          }`}
          title="Toggle SQL Preview"
        >
          <Code className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">SQL Preview</span>
        </button>
      </div>
    </footer>
  );
};
