import * as React from 'react';
import { Trash2, Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react';
import type { WorkspaceMember } from '../api/members';
import { Button } from '../../../shared/components/ui/Button';

interface MemberTableProps {
  members: WorkspaceMember[] | undefined;
  isLoading: boolean;
  currentUserRole: 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter' | undefined;
  currentUserId: string | undefined;
  onRoleChange: (userId: string, role: 'admin' | 'editor' | 'viewer' | 'commenter') => void;
  onRemoveMember: (userId: string) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  isLoading,
  currentUserRole,
  currentUserId,
  onRoleChange,
  onRemoveMember,
}) => {
  const isOwner = currentUserRole === 'owner';
  const isAdminOrOwner = currentUserRole === 'owner' || currentUserRole === 'admin';

  if (isLoading) {
    return (
      <div className="rounded-sm border border-border-subtle bg-surface/30 overflow-hidden">
        <div className="divide-y divide-border-subtle/50">
          {[1, 3, 4].map((n) => (
            <div key={n} className="flex items-center justify-between p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-border" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-border rounded-xs" />
                  <div className="h-3 w-48 bg-border rounded-xs" />
                </div>
              </div>
              <div className="h-8 w-20 bg-border rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="rounded-sm border border-border-subtle bg-surface/30 p-12 text-center">
        <User className="h-10 w-10 text-secondary/40 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-primary">No members found</h3>
        <p className="text-xs text-secondary mt-1">There are no collaborators in this workspace.</p>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <ShieldAlert className="h-3.5 w-3.5 text-red-400" />;
      case 'admin':
        return <ShieldCheck className="h-3.5 w-3.5 text-accent" />;
      default:
        return <Shield className="h-3.5 w-3.5 text-secondary" />;
    }
  };

  return (
    <div className="rounded-sm border border-border-subtle bg-surface/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-surface/50 text-[10px] font-semibold text-secondary uppercase tracking-wider">
              <th className="p-4 pl-6">Collaborator</th>
              <th className="p-4">Role</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/40">
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isMemberOwner = member.role === 'owner';
              const canRemove =
                isAdminOrOwner && // Current user is admin/owner
                !isCurrentUser && // Cannot remove self
                !isMemberOwner;    // Cannot remove owner

              return (
                <tr key={member.id} className="hover:bg-surface/10 transition-colors duration-150">
                  {/* Collaborator Profile */}
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      {member.user.avatarUrl ? (
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.displayName}
                          className="h-9 w-9 rounded-full object-cover border border-border-subtle"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-border flex items-center justify-center text-secondary border border-border-subtle">
                          <User className="h-4.5 w-4.5" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-primary">
                            {member.user.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[9px] text-accent/80 bg-accent/10 border border-accent/20 rounded-xs px-1.5 py-0.5 font-medium uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-secondary font-medium">
                          {member.user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role Selection / Gated Dropdown */}
                  <td className="p-4">
                    {isOwner && !isCurrentUser && !isMemberOwner ? (
                      <select
                        className="bg-surface border border-border text-primary text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-accent py-1 px-2.5 capitalize cursor-pointer font-medium"
                        value={member.role}
                        onChange={(e) =>
                          onRoleChange(
                            member.userId,
                            e.target.value as 'admin' | 'editor' | 'viewer' | 'commenter'
                          )
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold capitalize bg-surface/40 border border-border-subtle/50 w-fit px-2.5 py-1 rounded-sm">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </div>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 pr-6 text-right">
                    {canRemove ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveMember(member.userId)}
                        className="text-secondary hover:text-destructive hover:bg-destructive/10 cursor-pointer h-8 w-8 p-0"
                        title="Remove member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <span className="text-[10px] text-secondary/40 font-medium italic">
                        {isMemberOwner ? 'Workspace Creator' : isCurrentUser ? 'Self' : 'Locked'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
