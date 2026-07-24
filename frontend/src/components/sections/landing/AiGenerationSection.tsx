import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';


interface GeneratedTable {
  name: string;
  columns: { name: string; type: string; isPk?: boolean; isFk?: boolean }[];
}

const PRESETS: Record<string, { prompt: string; tables: GeneratedTable[] }> = {
  ecommerce: {
    prompt: 'E-commerce store with orders, items and stripe transaction tracking',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'stripe_customer_id', type: 'VARCHAR(100)' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'customer_id', type: 'UUID', isFk: true },
          { name: 'status', type: 'VARCHAR(50)' },
          { name: 'total_amount', type: 'DECIMAL(10,2)' },
        ],
      },
      {
        name: 'order_items',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'order_id', type: 'UUID', isFk: true },
          { name: 'product_id', type: 'UUID' },
          { name: 'quantity', type: 'INTEGER' },
        ],
      },
    ],
  },
  blog: {
    prompt: 'Simple blog engine with users, posts, comments and tag associations',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'username', type: 'VARCHAR(50)' },
          { name: 'email', type: 'VARCHAR(255)' },
        ],
      },
      {
        name: 'posts',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'author_id', type: 'UUID', isFk: true },
          { name: 'title', type: 'VARCHAR(200)' },
          { name: 'content', type: 'TEXT' },
        ],
      },
      {
        name: 'comments',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'post_id', type: 'UUID', isFk: true },
          { name: 'body', type: 'TEXT' },
        ],
      },
    ],
  },
  tasks: {
    prompt: 'Agile team project board tracking sprints, stories and tasks',
    tables: [
      {
        name: 'projects',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'owner_id', type: 'UUID' },
        ],
      },
      {
        name: 'tasks',
        columns: [
          { name: 'id', type: 'UUID', isPk: true },
          { name: 'project_id', type: 'UUID', isFk: true },
          { name: 'title', type: 'VARCHAR(200)' },
          { name: 'status', type: 'VARCHAR(50)' },
        ],
      },
    ],
  },
};

export const AiGenerationSection: React.FC = () => {
  const [activePresetKey, setActivePresetKey] = React.useState<keyof typeof PRESETS | null>(null);
  const [customPrompt, setCustomPrompt] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'analyzing' | 'compiling' | 'finished'>('idle');
  const [logs, setLogs] = React.useState<string[]>([]);
  const [generatedData, setGeneratedData] = React.useState<GeneratedTable[]>([]);

  const handleGenerate = (key: keyof typeof PRESETS) => {
    setActivePresetKey(key);
    setCustomPrompt(PRESETS[key].prompt);
    setStatus('analyzing');
    setLogs([]);
    setGeneratedData([]);

    // Run terminal logs sequence
    setTimeout(() => {
      setLogs((prev) => [...prev, '> Initializing LLM schema compiler...']);
    }, 200);

    setTimeout(() => {
      setLogs((prev) => [...prev, '> Extracting semantic nouns and entities...']);
    }, 600);

    setTimeout(() => {
      setLogs((prev) => [...prev, `> Identified relationships from prompt context.`]);
      setStatus('compiling');
    }, 1100);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `> Building ${PRESETS[key].tables.length} normalized tables...`,
        '> Enforcing database indexes and foreign keys...',
      ]);
    }, 1600);

    setTimeout(() => {
      setLogs((prev) => [...prev, '✓ Database schema compiled successfully!']);
      setGeneratedData(PRESETS[key].tables);
      setStatus('finished');
    }, 2200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    // Map custom prompts to blog/ecommerce/tasks randomly or standard to blog for simulation
    const keys: (keyof typeof PRESETS)[] = ['ecommerce', 'blog', 'tasks'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    handleGenerate(randomKey);
  };

  return (
    <section id="ai-gen" className="py-20 md:py-28 px-6 border-t border-border-subtle relative">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-10 h-72 w-72 rounded-full bg-purple/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Prompt Form & Logs (Left side) */}
          <div className="lg:col-span-5 text-left flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple/10 border border-purple/20 rounded-full w-fit">
              <Sparkles className="h-3.5 w-3.5 text-purple" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-purple font-mono">
                AI Compiler Engine
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary font-sans">
              Describe in plain text, compile in seconds
            </h2>
            <p className="text-sm text-secondary leading-relaxed">
              Skip drafting initial database structures. State your application objectives, and the engine designs complete normalized schema nodes.
            </p>

            <form onSubmit={handleCustomSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask SchemaForge AI to build a schema..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                disabled={status === 'analyzing' || status === 'compiling'}
                className="w-full bg-background border border-border-subtle rounded-lg pl-4 pr-12 py-3.5 text-sm text-primary placeholder:text-placeholder/65 focus:outline-none focus:border-accent disabled:opacity-60 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'analyzing' || status === 'compiling'}
                className="absolute right-2 p-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>

            {/* Quick Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-placeholder font-sans uppercase tracking-wider">
                Try Preset Prompts
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleGenerate(key)}
                    disabled={status === 'analyzing' || status === 'compiling'}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                      activePresetKey === key
                        ? 'bg-purple/10 border-purple text-purple'
                        : 'bg-surface border-border-subtle text-secondary hover:border-accent'
                    }`}
                  >
                    {key === 'ecommerce' ? '🛒 e-commerce' : key === 'blog' ? '✍️ blog system' : '📋 task board'}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Terminal logs */}
            {(logs.length > 0 || status !== 'idle') && (
              <div className="rounded-xl border border-border-subtle bg-surface/80 p-4 font-mono text-[11px] text-secondary flex flex-col gap-1.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-border-subtle/50 pb-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-placeholder" />
                    <span className="font-semibold text-primary">compiler.log</span>
                  </div>
                  {status !== 'finished' && <span className="text-[10px] text-accent animate-pulse">Running...</span>}
                </div>
                {logs.map((log, index) => (
                  <div key={index} className={log.startsWith('✓') ? 'text-success font-medium' : ''}>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Result Canvas Preview (Right side) */}
          <div className="lg:col-span-7 rounded-xl border border-border-subtle bg-background relative overflow-hidden flex items-center justify-center p-6 h-[400px]">
            {/* Dots background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />

            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center gap-3 z-10"
                >
                  <div className="h-12 w-12 bg-surface rounded-full flex items-center justify-center border border-border-subtle">
                    <Sparkles className="h-6 w-6 text-placeholder" />
                  </div>
                  <div className="text-xs text-placeholder font-mono">
                    Select a prompt to generate visual nodes.
                  </div>
                </motion.div>
              )}

              {(status === 'analyzing' || status === 'compiling') && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center gap-3 z-10"
                >
                  <div className="h-10 w-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  <div className="text-xs text-accent font-mono font-medium">
                    Structuring schema models...
                  </div>
                </motion.div>
              )}

              {status === 'finished' && (
                <motion.div
                  key="finished"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex items-center justify-center relative"
                >
                  {/* Generated table cards */}
                  <div className="flex flex-wrap items-center justify-center gap-4 z-10">
                    {generatedData.map((table, tIdx) => (
                      <motion.div
                        key={table.name}
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: tIdx * 0.15 }}
                        className="w-[180px] bg-surface border border-border-subtle rounded-xl shadow-lg text-left"
                      >
                        <div className="px-3 py-2 border-b border-border-subtle bg-background rounded-t-xl flex justify-between items-center">
                          <span className="text-[11px] font-bold text-primary font-mono">{table.name}</span>
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        </div>
                        <div className="p-2 flex flex-col gap-1.5 bg-background/30 rounded-b-xl">
                          {table.columns.map((col) => (
                            <div key={col.name} className="flex justify-between items-center text-[10px] font-mono py-0.5">
                              <span className={col.isPk ? 'text-success font-semibold' : col.isFk ? 'text-accent' : 'text-primary'}>
                                {col.isPk ? '🔑 ' : col.isFk ? '🔗 ' : ''}
                                {col.name}
                              </span>
                              <span className="text-placeholder text-[9px]">{col.type}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
