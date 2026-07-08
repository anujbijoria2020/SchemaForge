import * as React from 'react';
import { Playground } from './Playground';
import { ToastProvider } from '../shared/components/ui/Toast';
import { Sparkles } from 'lucide-react';

function App() {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <ToastProvider>
      {path === '/playground' ? (
        <Playground />
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-background text-primary font-sans flex-col gap-6">
          <div className="h-16 w-16 bg-accent rounded-sm flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">SchemaForge</h1>
            <p className="text-secondary text-sm font-medium">Collaborative Database Schema Design & Modeling Tool</p>
          </div>
          <a
            href="/playground"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/playground');
              setPath('/playground');
            }}
            className="mt-4 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-sm shadow-md shadow-accent/10 transition-colors duration-200"
          >
            Launch UI Design Playground
          </a>
        </div>
      )}
    </ToastProvider>
  );
}

export default App;
