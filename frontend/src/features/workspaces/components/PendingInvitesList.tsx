import * as React from 'react';
import { Mail, Trash2, Calendar, Shield, Copy, Check } from 'lucide-react';
import type { WorkspaceInvitation } from '../api/members';
import { Button } from '../../../shared/components/ui/Button';

interface PendingInvitesListProps {
  invitations: WorkspaceInvitation[] | undefined;
  isLoading: boolean;
  onRevoke: (invitationId: string) => void;
}

export const PendingInvitesList: React.FC<PendingInvitesListProps> = ({
  invitations,
  isLoading,
  onRevoke,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyLink = (token: string, inviteId: string) => {
    const inviteLink = `${window.location.origin}/invitations/${token}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-40 bg-border rounded-xs animate-pulse" />
        <div className="rounded-sm border border-border-subtle bg-surface/30 divide-y divide-border-subtle/50">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center justify-between p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-sm bg-border flex items-center justify-center text-secondary border border-border-subtle" />
                <div className="space-y-1.5">
                  <div className="h-4 w-48 bg-border rounded-xs" />
                  <div className="h-3.5 w-24 bg-border rounded-xs" />
                </div>
              </div>
              <div className="h-8 w-8 bg-border rounded-xs" />
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
    <div className="space-y-3">
      <div className="flex items-center gap-2 pl-1">
        <Mail className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary">
          Pending Invitations ({pendingInvites.length})
        </h3>
      </div>

      <div className="rounded-sm border border-border-subtle bg-surface/30 overflow-hidden">
        <div className="divide-y divide-border-subtle/40">
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-surface/10 transition-colors duration-150"
            >
              {/* Invite details */}
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-sm bg-border/40 flex items-center justify-center text-secondary border border-border-subtle mt-0.5">
                  <Mail className="h-4 w-4 text-accent/80" />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-sm font-bold text-primary">{invite.email}</span>
                    <span className="text-[10px] text-secondary font-semibold capitalize bg-surface/80 border border-border-subtle px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {invite.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-secondary mt-1">
                    <Calendar className="h-3 w-3" />
                    Sent {new Date(invite.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyLink(invite.token, invite.id)}
                  className="text-secondary hover:text-accent hover:bg-accent/10 cursor-pointer flex items-center gap-1.5 h-8 px-2.5"
                  title="Copy Invite Link"
                >
                  {copiedId === invite.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-xs font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">Copy Link</span>
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRevoke(invite.id)}
                  className="text-secondary hover:text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-1.5 h-8 w-8 p-0"
                  title="Revoke Invitation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

