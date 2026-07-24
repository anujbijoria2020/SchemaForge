import * as React from 'react';
import { Database, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-forge-border-subtle bg-forge-surface-container-lowest/50 px-6 py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-start justify-between gap-8 text-left">
        {/* Brand Block */}
        <div className="flex flex-col gap-3 max-w-sm">
          <Link to="/" className="flex items-center gap-2">
            <Database className="h-5 w-5 text-forge-primary" />
            <span className="text-base font-semibold tracking-tight text-forge-text-primary font-sans">
              SchemaForge
            </span>
          </Link>
          <p className="text-xs text-forge-on-surface-variant leading-relaxed">
            A premium, professional database modeling platform engineered for developer teams. Design, model, and compile schemas with visual and dialect-specific DDL clarity.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-forge-text-primary font-mono uppercase tracking-wider">
              Product
            </span>
            <a href="#features" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              Features
            </a>
            <a href="#demo" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              Interactive Editor
            </a>
            <Link to="/playground" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              Playground Sandbox
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold text-forge-text-primary font-mono uppercase tracking-wider">
              Dialects
            </span>
            <a href="#sql-export" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              PostgreSQL
            </a>
            <a href="#sql-export" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              MySQL
            </a>
            <a href="#sql-export" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              SQLite & SQL Server
            </a>
          </div>

          <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
            <a href="#" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              Terms of Use
            </a>
            <a href="#" className="text-xs text-forge-on-surface-variant hover:text-forge-primary transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      <hr className="border-forge-border-subtle max-w-7xl mx-auto my-8 opacity-50" />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forge-outline font-sans">
        <div>
          &copy; {new Date().getFullYear()} SchemaForge. Built by{' '}
          <a
            href="https://github.com/anujbijoria2020"
            target="_blank"
            rel="noreferrer"
            className="text-forge-on-surface-variant hover:text-forge-primary transition-colors"
          >
            Anuj Patel
          </a>
          . All rights reserved.
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5 text-forge-outline" /> main-v1.0.0
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-forge-success" />
          <span>All Services Operational</span>
        </div>
      </div>
    </footer>
  );
};
