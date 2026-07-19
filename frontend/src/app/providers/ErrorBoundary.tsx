import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/app';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B14] text-primary font-sans flex items-center justify-center p-6 flex-col relative overflow-hidden select-none">
          {/* Background Decorative Glows */}
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

          <div className="border border-destructive/30 bg-surface/50 max-w-lg w-full rounded-sm p-6 space-y-6 shadow-xl z-10 backdrop-blur-xs">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-destructive/10 rounded-sm flex items-center justify-center flex-shrink-0 mt-1">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-bold">Application Error</h3>
                <p className="text-xs text-secondary leading-relaxed">
                  An unexpected error occurred in the application. We've logged the error details.
                </p>
                {this.state.error && (
                  <pre className="mt-3 p-3 bg-[#080B14]/80 border border-border-subtle rounded-xs text-[10px] text-destructive/90 overflow-x-auto max-h-32 font-mono">
                    {this.state.error.name}: {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border-subtle/25 pt-4">
              <Button variant="secondary" size="sm" onClick={this.handleGoHome} className="flex items-center gap-1.5 cursor-pointer font-semibold">
                <Home className="h-3.5 w-3.5" />
                Go to Dashboard
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleReset} className="flex items-center gap-1.5 cursor-pointer font-semibold">
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
