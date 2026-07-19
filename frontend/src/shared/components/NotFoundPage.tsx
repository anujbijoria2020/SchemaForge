import * as React from 'react';
import { Database, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080B14] text-primary font-sans flex items-center justify-center p-6 flex-col relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center text-accent shadow-lg shadow-accent/15">
            <Database className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-secondary/30">
            404
          </h1>
          <h2 className="text-lg font-bold text-primary">Page Not Found</h2>
          <p className="text-xs text-secondary max-w-xs mx-auto leading-relaxed">
            The page you are looking for might have been moved, deleted, or doesn't exist.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 cursor-pointer font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app')}
            className="flex items-center gap-1.5 cursor-pointer font-semibold shadow-md"
          >
            <Home className="h-3.5 w-3.5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
