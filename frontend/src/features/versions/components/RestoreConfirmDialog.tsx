import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, AlertTriangle } from 'lucide-react';

import { Button } from '../../../shared/components/ui/Button';

interface RestoreConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  versionLabel: string | null;
}

export const RestoreConfirmDialog: React.FC<RestoreConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  versionLabel,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-[#080B14]/70 backdrop-blur-xs z-50 transition-opacity duration-150 animate-fade-in" />

        {/* Content */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#0F1420] border border-[#1E293B]/80 rounded-sm shadow-2xl z-50 flex flex-col overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-primary">Confirm Restore</h3>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 rounded-sm flex items-center justify-center text-secondary hover:text-primary hover:bg-white/5 cursor-pointer transition-colors"
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 text-xs leading-relaxed">
            <p className="text-primary font-medium">
              Are you sure you want to restore snapshot <strong className="text-accent font-mono">"{versionLabel || 'Unnamed Snapshot'}"</strong>?
            </p>
            <p className="text-secondary">
              This will overwrite your current live canvas schema. Any unsaved editor changes will be replaced. This action is destructive and cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/40 bg-[#080B14]/30 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              disabled={isPending}
              className="h-8 bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm shadow-red-900/25 border-none"
            >
              {isPending ? 'Restoring...' : 'Yes, Restore Snapshot'}
            </Button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
