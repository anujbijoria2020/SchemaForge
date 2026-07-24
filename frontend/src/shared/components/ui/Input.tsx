import * as React from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border-subtle bg-background px-4 py-3 text-sm font-sans text-primary placeholder:text-slate-500 transition-all duration-150 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-none',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
