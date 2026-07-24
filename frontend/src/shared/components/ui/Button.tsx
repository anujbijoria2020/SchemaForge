import * as React from 'react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans font-medium transition-all duration-150 active:scale-95 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg',
          // Variants
          variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover shadow-sm',
          variant === 'secondary' && 'bg-surface text-primary border border-border-subtle hover:bg-surface/80',
          variant === 'ghost' && 'bg-transparent text-primary hover:bg-surface/80',
          variant === 'destructive' && 'bg-destructive text-white hover:bg-destructive-hover shadow-sm',
          // Sizes
          size === 'sm' && 'h-9 px-3 text-xs',
          size === 'md' && 'h-10 px-4 text-sm',
          size === 'lg' && 'h-11 px-6 text-base',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
