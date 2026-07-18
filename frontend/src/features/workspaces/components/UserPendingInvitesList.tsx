import * as React from 'react';
import { Mail, Check, X, Calendar, Shield, Database } from 'lucide-react';
import type { WorkspaceInvitation } from '../api/members';
import { Button } from '../../../shared/components/ui/Button';

interface UserPendingInvitesListProps {
  invitations: WorkspaceInvitation[] | undefined;
  isLoading: boolean;
  onAccept: (token: string) => void;
  onReject: (token: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export const UserPendingInvitesList: React.FC<UserPendingInvitesListProps> = ({
  invitations,
  isLoading,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}) => {
  const [actingToken, setActingToken] = React.useState<string | null>(null);

  const handleAccept = (token: string) => {
    setActingToken(token);
    onAccept(token);
  };

  const handleReject = (token: string) => {
    setActingToken(token);
    onReject(token);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-40 bg-border rounded-xs animate-pulse" />
        <div className="rounded-sm border border-border-subtle bg-surface/30 divide-y divide-border-subtle/50">
          {[1].map((n) => (
            <div key={n} className="flex items-center justify-between p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-sm bg-border flex items-center justify-center border border-border-subtle" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              </div>
              <div className="h-8 w-16 bg-border rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter pending invitations
  const pendingInvites = invitations?.filter((inv) => inv.status === 'pending') || [];

  if (pendingInvites.length === 0) {
    return null; // Don't render the section if there are no pending invites
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pl-1">
        <Mail className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">
          Workspace Invitations ({pendingInvites.length})
        </h3>
      </div>

      <div className="rounded-sm border border-border bg-surface/30 overflow-hidden shadow-lg shadow-black/10">
        <div className="divide-y divide-border/60">
          {pendingInvites.map((invite) => {
            const isThisInviteLoading = actingToken === invite.token && (isAccepting || isRejecting);
            return (
              <div
                key={invite.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 hover:bg-surface/10 transition-colors duration-150"
              >
                {/* Invite details */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-sm bg-accent/10 flex items-center justify-center text-accent border border-accent/20 mt-0.5">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-bold text-primary">
                        You've been invited to join <span className="text-accent">{invite.workspace?.name || 'Workspace'}</span>
                      </span>
                      <span className="text-[10px] text-secondary font-semibold capitalize bg-surface/80 border border-border-subtle px-2 py-0.5 rounded-sm flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {invite.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Received {new Date(invite.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isThisInviteLoading}
                    onClick={() => handleReject(invite.token)}
                    className="text-secondary hover:text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-1.5 h-8 px-3"
                  >
                    {isThisInviteLoading && actingToken === invite.token && isRejecting ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Decline
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isThisInviteLoading}
                    onClick={() => handleAccept(invite.token)}
                    className="flex items-center gap-1.5 h-8 px-3"
                  >
                    {isThisInviteLoading && actingToken === invite.token && isAccepting ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Accept & Join
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
