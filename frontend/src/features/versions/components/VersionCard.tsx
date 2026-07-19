import * as React from 'react';
import { Calendar, User, CornerUpLeft, Clock } from 'lucide-react';

import { type VersionData } from '../api/versions';

interface VersionCardProps {
  version: VersionData;
  onRestoreClick: (version: VersionData) => void;
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const VersionCard: React.FC<VersionCardProps> = ({ version, onRestoreClick }) => {
  return (
    <div className="relative group bg-[#0F1420] border border-[#1E293B]/80 hover:border-border transition-all duration-200 rounded-sm p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Timeline Node Indicator Dot */}
      <div className="absolute top-1/2 -left-[25px] -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-border bg-[#080B14] z-10 group-hover:border-accent transition-colors" />

      {/* Info side */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Label */}
          <h4 className="text-sm font-bold text-primary truncate font-mono">
            {version.label || 'Unnamed Snapshot'}
          </h4>

          {/* Manual vs Auto Badge */}
          {version.isAuto ? (
            <span className="px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400">
              Auto Save
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-xs text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Manual Checkpoint
            </span>
          )}
        </div>

        {/* Description */}
        {version.description ? (
          <p className="text-secondary/90 leading-relaxed max-w-xl text-[11px] break-words">
            {version.description}
          </p>
        ) : (
          <p className="text-secondary/40 italic leading-relaxed text-[11px]">
            No description provided.
          </p>
        )}

        {/* Metadata section */}
        <div className="flex items-center gap-4 text-[10px] text-secondary/60 flex-wrap">
          {/* Relative Time */}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{formatRelativeTime(version.createdAt)}</span>
          </div>

          {/* Absolute Date/Time */}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{new Date(version.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Creator Id */}
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">By user: {version.createdBy.substring(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* Actions side */}
      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t border-border/20 pt-3 sm:border-none sm:pt-0">
        <button
          onClick={() => onRestoreClick(version)}
          className="h-8 px-3.5 rounded-sm border border-border bg-[#080B14] hover:bg-accent hover:border-accent hover:text-white text-secondary font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all w-full sm:w-auto"
          title="Restore this Snapshot to Editor"
        >
          <CornerUpLeft className="h-3.5 w-3.5 shrink-0" />
          <span>Restore</span>
        </button>
      </div>
    </div>
  );
};
