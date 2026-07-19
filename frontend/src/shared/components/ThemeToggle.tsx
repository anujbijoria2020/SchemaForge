import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../app/providers/ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="h-8 w-8 rounded-sm border border-border bg-surface hover:bg-white/5 text-secondary hover:text-primary transition-all flex items-center justify-center cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-accent"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
};
