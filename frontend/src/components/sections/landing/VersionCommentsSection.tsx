import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MessageSquare, CornerDownRight, User, Clock } from 'lucide-react';

interface Snapshot {
  version: string;
  creator: string;
  timestamp: string;
  description: string;
  isAuto?: boolean;
}

interface MockComment {
  author: string;
  role: string;
  content: string;
  time: string;
}

const MOCK_SNAPSHOTS: Snapshot[] = [
  {
    version: 'v1.4.0',
    creator: 'Alice Smith',
    timestamp: '10 mins ago',
    description: 'Add subscriptions and billing schemas',
  },
  {
    version: 'v1.3.1',
    creator: 'System (Autosave)',
    timestamp: '1 hour ago',
    description: 'Auto-saved blueprint backup',
    isAuto: true,
  },
  {
    version: 'v1.3.0',
    creator: 'Bob Johnson',
    timestamp: 'Yesterday',
    description: 'Initialize users and auth structures',
  },
];

const MOCK_COMMENTS: MockComment[] = [
  {
    author: 'Alice Smith',
    role: 'Database Lead',
    content: 'Should we change total_amount to DECIMAL(12,2) instead of FLOAT to prevent precision issues?',
    time: '5 mins ago',
  },
  {
    author: 'Bob Johnson',
    role: 'Backend Dev',
    content: 'Good catch. I will toggle the type to DECIMAL and check constraints.',
    time: '2 mins ago',
  },
];

export const VersionCommentsSection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'versions' | 'comments'>('versions');

  return (
    <section id="collaboration" className="py-20 md:py-28 px-6 border-t border-border-subtle relative">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-10 h-72 w-72 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Info Block (Left side) */}
          <div className="lg:col-span-5 text-left flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full w-fit">
              <History className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-accent font-mono">
                Version Control & Teamwork
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary font-sans">
              Blueprints history and inline discussions
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Track structural updates over time with point-in-time blueprints. Keep developers, managers, and architects aligned by chatting directly inside schema diagrams.
            </p>

            {/* Selector Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('versions')}
                className={`px-4 py-2 text-xs font-mono rounded-md border transition-all ${activeTab === 'versions'
                    ? 'bg-accent/10 border-accent text-accent font-semibold'
                    : 'bg-surface border-border-subtle text-secondary hover:border-secondary/40'
                  }`}
              >
                🕒 Version History
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 text-xs font-mono rounded-md border transition-all ${activeTab === 'comments'
                    ? 'bg-accent/10 border-accent text-accent font-semibold'
                    : 'bg-surface border-border-subtle text-secondary hover:border-secondary/40'
                  }`}
              >
                💬 Node Discussions
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview (Right side) */}
          <div className="lg:col-span-7 rounded-xl border border-border-subtle bg-background relative overflow-hidden p-6 min-h-[380px] flex items-center justify-center">
            {/* Dots background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

            <div className="w-full max-w-md bg-surface border border-border-subtle rounded-xl shadow-2xl z-10 text-left overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border-subtle bg-background flex justify-between items-center">
                <span className="text-xs font-bold text-primary font-mono flex items-center gap-1.5">
                  {activeTab === 'versions' ? (
                    <>
                      <History className="h-4 w-4 text-accent" /> Version Snapshots
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 text-accent" /> orders (Table Comments)
                    </>
                  )}
                </span>
                <span className="text-[10px] text-secondary font-mono">Project Blueprint</span>
              </div>

              {/* Body */}
              <div className="p-4 bg-background/30 flex flex-col gap-3 min-h-[220px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'versions' ? (
                    <motion.div
                      key="versions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2.5"
                    >
                      {MOCK_SNAPSHOTS.map((snap) => (
                        <div
                          key={snap.version}
                          className={`p-3 rounded-lg border flex flex-col gap-1 transition-colors ${snap.isAuto
                              ? 'bg-surface/40 border-border-subtle/50'
                              : 'bg-surface border-accent/20 hover:border-accent/40'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary font-mono">
                              {snap.version}
                            </span>
                            <span className="text-[10px] text-secondary flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {snap.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-secondary font-sans">
                            {snap.description}
                          </p>
                          <div className="flex justify-between items-center mt-1 border-t border-border-subtle/30 pt-1.5 text-[9px] text-secondary">
                            <span>Creator: {snap.creator}</span>
                            {!snap.isAuto && (
                              <span className="text-accent font-mono hover:underline cursor-pointer">
                                Revert to snapshot
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="comments"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-3"
                    >
                      {MOCK_COMMENTS.map((comment, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="h-7 w-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 flex flex-col p-2.5 rounded-lg bg-surface border border-border-subtle/80">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-primary font-sans">
                                {comment.author}{' '}
                                <span className="text-[9px] font-normal text-secondary ml-1 px-1 bg-background rounded">
                                  {comment.role}
                                </span>
                              </span>
                              <span className="text-[9px] text-secondary">{comment.time}</span>
                            </div>
                            <p className="text-xs text-secondary leading-relaxed font-sans">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Reply preview */}
                      <div className="flex gap-2 mt-1">
                        <div className="h-7 w-7 rounded-full bg-background border border-border-subtle flex items-center justify-center text-secondary flex-shrink-0">
                          <CornerDownRight className="h-4 w-4" />
                        </div>
                        <div className="flex-grow flex items-center bg-background border border-border-subtle rounded-lg px-3 py-1.5">
                          <input
                            type="text"
                            placeholder="Add a reply to this thread..."
                            disabled
                            className="bg-transparent border-none outline-none text-xs text-secondary w-full placeholder:text-secondary/60"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
