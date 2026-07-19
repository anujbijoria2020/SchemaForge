import * as React from 'react';
import { VersionCard } from './VersionCard';
import { type VersionData } from '../api/versions';

interface VersionTimelineProps {
  versions: VersionData[];
  onRestoreClick: (version: VersionData) => void;
}

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  versions,
  onRestoreClick,
}) => {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 bg-surface/20 rounded-sm">
        <p className="text-sm font-semibold text-secondary">No versions found</p>
        <p className="text-[11px] text-secondary/40 mt-1 max-w-xs">
          This project does not have any saved schema version checkpoints yet. Click "Create Checkpoint" to save one.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-[18px]">
      {/* Vertical Timeline Track Line */}
      <div className="absolute top-4 bottom-4 left-[11px] w-px bg-border/80" />

      {/* Timeline cards list */}
      <div className="space-y-4">
        {versions.map((version) => (
          <VersionCard
            key={version.id}
            version={version}
            onRestoreClick={onRestoreClick}
          />
        ))}
      </div>
    </div>
  );
};
