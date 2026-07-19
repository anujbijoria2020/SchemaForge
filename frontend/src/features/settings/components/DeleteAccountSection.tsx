import * as React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

// NOTE FOR BACKEND COUNTERPART:
// GAP IDENTIFIED: The backend currently lacks an endpoint to delete a user's account.
// Until this endpoint is implemented (e.g. DELETE /api/users/me),
// this button is intentionally disabled and stubbed with a "Coming soon" notice.

export const DeleteAccountSection: React.FC = () => {
  return (
    <div className="space-y-6 pt-6 border-t border-border-subtle">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Danger Zone
        </h2>
        <p className="text-xs text-secondary">
          Irreversible actions related to your account.
        </p>
      </div>

      <div className="border border-destructive/20 bg-destructive/5 rounded-sm p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-primary">Delete Account</h3>
          <p className="text-xs text-secondary leading-relaxed">
            Permanently delete your SchemaForge account and all associated workspaces, projects, versions, and schemas. This action cannot be undone.
          </p>
        </div>

        {/* Disabled delete button with custom tooltip on hover */}
        <div className="flex justify-start">
          <div className="relative group">
            <Button
              variant="destructive"
              disabled={true}
              className="flex items-center gap-2 font-semibold cursor-not-allowed opacity-50"
            >
              Delete Account
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex items-center gap-1.5 bg-surface border border-border-subtle text-secondary text-xs rounded-sm py-1.5 px-3 z-50 whitespace-nowrap shadow-lg">
              <HelpCircle className="h-3.5 w-3.5 text-accent" />
              <span>Coming soon (Backend gap)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
