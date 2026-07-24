import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Play, ArrowRight, Link2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-6">
      {/* Background Dot Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 h-72 w-72 rounded-full bg-purple/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Release Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 border border-accent/20 bg-accent/5 rounded-full mb-8"
        >
          <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-accent font-mono">
            v1.0.0 Now Live
          </span>
          <span className="text-border-subtle">|</span>
          <span className="text-[11px] text-secondary font-medium">
            Visual Editor & Version Snapshots
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-primary max-w-4xl leading-[1.1] mb-6 font-sans"
        >
          Design database schemas visually, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-blue-400 to-purple">generate instantly</span>.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-secondary max-w-2xl leading-relaxed mb-10"
        >
          A high-focus, collaborative schema editor built for developers and data architects. Model tables, define relationships, and export clean SQL.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto"
        >
          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-accent text-white hover:bg-accent-hover text-base font-semibold px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 group transition-all duration-150 shadow-lg shadow-accent/10"
          >
            Start Modeling Free
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate('/playground')}
            className="w-full sm:w-auto border border-border-subtle bg-surface/30 hover:bg-surface hover:text-primary px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
          >
            <Play className="h-4 w-4 text-accent fill-accent/10" />
            Open Editor Sandbox
          </Button>
        </motion.div>

        {/* Mock Editor Canvas Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-xl border border-border-subtle bg-surface/80 p-1 md:p-2 backdrop-blur-sm shadow-2xl relative"
        >
          {/* Top IDE Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-background/50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 bg-background rounded-full flex items-center justify-center border border-border-subtle">
                <Database className="h-2 w-2 text-accent" />
              </div>
              <span className="text-[12px] font-medium text-secondary font-mono">
                schemaforge.json
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-success/10 text-success font-mono border border-success/20">
                Valid
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent/80" />
              <span className="text-[11px] font-mono text-secondary">Shared Workspace</span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="h-[380px] md:h-[460px] bg-background relative overflow-hidden rounded-b-lg flex items-center justify-center p-6">
            {/* Visual dot background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

            {/* Schema Connection Vector Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#adc6ff" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              {/* Relationship path line between cards */}
              <motion.path
                d="M 390 190 C 470 190, 470 205, 550 205"
                fill="none"
                stroke="url(#gradient-line)"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1 }}
              />
              {/* Connector dots */}
              <circle cx="390" cy="190" r="4" fill="#adc6ff" />
              <circle cx="550" cy="205" r="4" fill="#3B82F6" />
            </svg>

            {/* Schema Table Card 1: Users */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute left-6 md:left-24 top-1/2 -translate-y-1/2 w-[220px] md:w-[260px] bg-surface border border-accent/40 rounded-xl shadow-lg z-10 select-none text-left"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface rounded-t-xl">
                <span className="text-sm font-semibold text-primary font-mono">users</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-background text-accent border border-border-subtle font-mono">Table</span>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-background/40 rounded-b-xl">
                <div className="flex items-center justify-between py-1 px-1.5 bg-background rounded border border-accent/10">
                  <span className="text-[12px] font-semibold text-success font-mono flex items-center gap-1.5">
                    🔑 id
                  </span>
                  <span className="text-[11px] font-mono text-secondary">UUID</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5">
                  <span className="text-[12px] font-mono text-primary">email</span>
                  <span className="text-[11px] font-mono text-secondary">VARCHAR(255)</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5">
                  <span className="text-[12px] font-mono text-primary">display_name</span>
                  <span className="text-[11px] font-mono text-secondary">VARCHAR(100)</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5">
                  <span className="text-[12px] font-mono text-primary">created_at</span>
                  <span className="text-[11px] font-mono text-secondary">TIMESTAMP</span>
                </div>
              </div>
            </motion.div>

            {/* Schema Table Card 2: Workspace */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute right-6 md:right-24 top-1/2 -translate-y-1/2 w-[220px] md:w-[260px] bg-surface border border-border-subtle rounded-xl shadow-lg z-10 select-none text-left"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface rounded-t-xl">
                <span className="text-sm font-semibold text-primary font-mono">workspaces</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-background text-secondary border border-border-subtle font-mono">Table</span>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-background/40 rounded-b-xl">
                <div className="flex items-center justify-between py-1 px-1.5">
                  <span className="text-[12px] font-semibold text-success font-mono flex items-center gap-1.5">
                    🔑 id
                  </span>
                  <span className="text-[11px] font-mono text-secondary">UUID</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5">
                  <span className="text-[12px] font-mono text-primary">name</span>
                  <span className="text-[11px] font-mono text-secondary">VARCHAR(100)</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5 bg-accent/5 rounded border border-accent/20">
                  <span className="text-[12px] font-mono text-accent flex items-center gap-1">
                    🔗 owner_id
                  </span>
                  <span className="text-[11px] font-mono text-accent">UUID</span>
                </div>
                <div className="flex items-center justify-between py-1 px-1.5">
                  <span className="text-[12px] font-mono text-primary">created_at</span>
                  <span className="text-[11px] font-mono text-secondary">TIMESTAMP</span>
                </div>
              </div>
            </motion.div>

            {/* Hover Tooltip Overlay (Simulation) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.8 }}
              className="absolute left-1/2 top-1/3 -translate-x-1/2 bg-surface px-3 py-2 rounded-lg shadow-xl border border-border-subtle text-left z-20"
            >
              <div className="text-[11px] font-bold text-accent flex items-center gap-1.5 mb-0.5">
                <Link2 className="h-3 w-3" /> Foreign Key Relationship
              </div>
              <div className="text-[10px] text-secondary font-mono">
                workspaces.owner_id → users.id (1:N)
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
