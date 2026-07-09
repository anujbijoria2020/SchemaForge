import * as React from 'react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans font-medium transition-colors duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          // Variants
          variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover shadow-sm',
          variant === 'secondary' && 'bg-surface text-primary border border-border-subtle hover:bg-surface/80',
          variant === 'ghost' && 'bg-transparent text-primary hover:bg-surface/80',
          variant === 'destructive' && 'bg-destructive text-white hover:bg-destructive-hover shadow-sm',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs rounded-sm',
          size === 'md' && 'h-10 px-4 text-sm rounded-sm',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
