import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, LogOut, Database } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useInvitationDetails, useAcceptInvitation, useRejectInvitation } from '../api/members';
import { Button } from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/Toast';

export const AcceptInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user: currentUser, isAuthenticated, isInitializing, logout } = useAuthStore();
  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: rejectInvitation, isPending: isRejecting } = useRejectInvitation();

  const [hasStartedAccept, setHasStartedAccept] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // 1. Fetch invitation details
  const {
    data: invitation,
    isLoading: isInvitationLoading,
    isError: isInvitationError,
    error: invitationError,
  } = useInvitationDetails(token);

  // 2. Redirect to login if user is logged out (after auth store finishes initializing)
  React.useEffect(() => {
    if (!isInitializing && !isAuthenticated && token) {
      navigate(`/login?redirectTo=/invitations/${token}`);
    }
  }, [isInitializing, isAuthenticated, token, navigate]);

  // 3. Verify email matches current user
  React.useEffect(() => {
    if (isAuthenticated && invitation && currentUser && !errorMessage) {
      // Check for email match
      if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
        setErrorMessage(
          `This invitation was sent to ${invitation.email}, but you are currently signed in as ${currentUser.email}.`
        );
      }
    }
  }, [isAuthenticated, invitation, currentUser, errorMessage]);

  const handleAccept = () => {
    if (!token) return;
    setHasStartedAccept(true);
    acceptInvitation(
      { token },
      {
        onSuccess: () => {
          toast('Invitation accepted! Welcome to the workspace.', { variant: 'success' });
          navigate(`/app/workspaces/${invitation?.workspaceId}`);
        },
        onError: (err: any) => {
          setErrorMessage(err.message || 'Failed to accept the invitation.');
          setHasStartedAccept(false);
        },
      }
    );
  };

  const handleReject = () => {
    if (!token) return;
    rejectInvitation(
      { token },
      {
        onSuccess: () => {
          toast('Invitation declined.', { variant: 'success' });
          navigate('/app');
        },
        onError: (err: any) => {
          toast(err.message || 'Failed to decline the invitation.', { variant: 'danger' });
        },
      }
    );
  };

  const handleLogout = () => {
    logout();
  };

  const showLoading = isInitializing || isInvitationLoading || (isAuthenticated && hasStartedAccept && isAccepting && !errorMessage);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-accent rounded-sm flex items-center justify-center shadow-lg shadow-accent/20 mb-4">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">SchemaForge</h1>
          <p className="text-secondary text-xs mt-1 font-medium tracking-wide uppercase">
            by Vednix Technology
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-sm border border-border bg-surface shadow-2xl p-8 space-y-6">
          {showLoading ? (
            /* Loading State */
            <div className="text-center py-6 space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-md font-bold text-primary">Processing Invitation</h3>
                <p className="text-xs text-secondary">
                  {isInitializing
                    ? 'Checking your session...'
                    : isInvitationLoading
                    ? 'Loading invitation details...'
                    : 'Joining workspace...'}
                </p>
              </div>
            </div>
          ) : isInvitationError ? (
            /* Invalid Token/Invitation Error State */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-primary">Invalid Invitation</h3>
                  <p className="text-xs text-secondary mt-0.5">
                    {invitationError instanceof Error ? invitationError.message : 'The invitation link is invalid or has expired.'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-border-subtle/20 pt-4">
                <Button variant="secondary" size="sm" onClick={() => navigate('/app')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : errorMessage ? (
            /* Specific Logic Errors (Email Mismatch, Accept Fail) */
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-primary">Invitation Error</h3>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              {currentUser && invitation && currentUser.email.toLowerCase() !== invitation.email.toLowerCase() && (
                <div className="text-[11px] text-secondary leading-relaxed bg-surface/80 border border-border-subtle p-3 rounded-sm space-y-1.5">
                  <span className="font-semibold text-primary">Need to switch accounts?</span>
                  <p>Click "Sign Out" below to log out, then sign up or sign in using the invited email: <span className="font-semibold text-primary">{invitation.email}</span>.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-border-subtle/20 pt-4">
                {currentUser && invitation && currentUser.email.toLowerCase() !== invitation.email.toLowerCase() ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => navigate('/app')}>
                      Go to Dashboard
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => navigate('/app')}>
                    Go to Dashboard
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Manual Accept/Decline Options */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-12 w-12 bg-accent/15 rounded-full flex items-center justify-center mx-auto text-accent mb-2">
                  <Database className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-extrabold text-primary">Workspace Invitation</h2>
                <p className="text-xs text-secondary leading-relaxed px-4">
                  You have been invited to join the workspace <span className="text-accent font-semibold">{invitation?.workspace?.name}</span> as an <span className="font-semibold text-primary capitalize">{invitation?.role}</span>.
                </p>
              </div>

              <div className="border-t border-border-subtle/20 pt-4 flex flex-col gap-3">
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 h-10 font-bold cursor-pointer"
                  onClick={handleAccept}
                  disabled={isAccepting || isRejecting}
                >
                  {isAccepting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : null}
                  Accept & Join Workspace
                </Button>

                <Button
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 h-10 font-semibold cursor-pointer"
                  onClick={handleReject}
                  disabled={isAccepting || isRejecting}
                >
                  {isRejecting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                  ) : null}
                  Decline Invitation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
