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
          'flex h-10 w-full rounded-sm border border-border-subtle bg-surface/50 px-3 py-2 text-sm font-sans text-primary placeholder:text-secondary transition-all duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
