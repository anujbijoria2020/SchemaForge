import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ToastData {
  id: string;
  title?: string;
  description: string;
  variant?: 'success' | 'danger';
}

type ToastContextType = {
  toast: (description: string, options?: { title?: string; variant?: 'success' | 'danger' }) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback(
    (description: string, options?: { title?: string; variant?: 'success' | 'danger' }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, description, ...options }]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="down">
        {children}
        {toasts.map(({ id, title, description, variant = 'success' }) => (
          <ToastPrimitive.Root
            key={id}
            onOpenChange={(open: boolean) => {
              if (!open) removeToast(id);
            }}
            className={cn(
              'z-[100] flex w-full max-w-sm items-start gap-3 rounded-sm border p-4 shadow-lg transition-all duration-300 font-sans outline-none animate-toast-show data-[state=closed]:animate-toast-hide pointer-events-auto',
              variant === 'success' && 'bg-surface border-emerald-500/30 text-primary',
              variant === 'danger' && 'bg-surface border-destructive/30 text-primary'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {variant === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {title && <ToastPrimitive.Title className="text-sm font-semibold text-primary">{title}</ToastPrimitive.Title>}
              <ToastPrimitive.Description className="text-xs text-secondary leading-relaxed">
                {description}
              </ToastPrimitive.Description>
            </div>
            <ToastPrimitive.Close className="flex-shrink-0 rounded-xs opacity-75 hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer">
              <X className="h-4 w-4 text-primary" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] m-4 flex flex-col gap-3 w-full max-w-sm max-h-screen pointer-events-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};
