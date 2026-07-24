import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';

type CodeType = 'postgres' | 'mysql' | 'sqlite' | 'mssql';

const CODE_TEMPLATES: Record<CodeType, string> = {
  postgres: `-- Exported from SchemaForge
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  category VARCHAR(100),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);`,
  mysql: `-- Exported from SchemaForge
CREATE TABLE \`products\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`category\` VARCHAR(100),
  \`in_stock\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX \`idx_products_category\` ON \`products\`(\`category\`);`,
  sqlite: `-- Exported from SchemaForge
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0.00,
  category TEXT,
  in_stock INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);`,
  mssql: `-- Exported from SchemaForge
CREATE TABLE products (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  category VARCHAR(100),
  in_stock BIT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);`,
};

export const SqlExportSection: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<CodeType>('postgres');
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_TEMPLATES[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: CodeType; label: string }[] = [
    { key: 'postgres', label: 'PostgreSQL' },
    { key: 'mysql', label: 'MySQL' },
    { key: 'sqlite', label: 'SQLite' },
    { key: 'mssql', label: 'SQL Server (MSSQL)' },
  ];

  return (
    <section id="sql-export" className="py-20 md:py-28 px-6 bg-background/10 border-t border-border-subtle relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-4 font-sans">
            Instant multi-engine exports
          </h2>
          <p className="text-base text-secondary leading-relaxed">
            Your visual design is automatically parsed into standard dialect syntaxes. Inspect compiler outputs live and copy scripts instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Card Mockup (Left Side) */}
          <div className="lg:col-span-4 flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[280px] bg-surface border border-accent/20 rounded-xl shadow-2xl text-left"
            >
              <div className="px-4 py-3 border-b border-border-subtle bg-background rounded-t-xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary font-mono">products</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-accent border border-border-subtle font-mono">
                  Table
                </span>
              </div>
              <div className="p-3 bg-background/30 rounded-b-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono py-1 px-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded">
                  <span className="text-emerald-500 font-semibold">🔑 id</span>
                  <span className="text-secondary text-[11px]">UUID</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono py-1 px-1.5">
                  <span className="text-primary">name</span>
                  <span className="text-secondary text-[11px]">VARCHAR(255)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono py-1 px-1.5">
                  <span className="text-primary">price</span>
                  <span className="text-secondary text-[11px]">DECIMAL(12,2)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono py-1 px-1.5">
                  <span className="text-primary">category</span>
                  <span className="text-secondary text-[11px]">VARCHAR(100)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono py-1 px-1.5">
                  <span className="text-primary">in_stock</span>
                  <span className="text-secondary text-[11px]">BOOLEAN</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono py-1 px-1.5">
                  <span className="text-secondary">created_at</span>
                  <span className="text-secondary text-[11px]">TIMESTAMP</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Code Window (Right Side) */}
          <div className="lg:col-span-8 flex flex-col rounded-xl border border-border-subtle bg-background overflow-hidden shadow-2xl">
            {/* Window Tabs Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border-subtle bg-surface/60 px-4 py-2 gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${activeTab === tab.key
                        ? 'bg-background border border-border-subtle text-primary font-semibold'
                        : 'text-secondary hover:text-primary'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-secondary hover:text-primary border border-border-subtle bg-surface hover:bg-background rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Content Box */}
            <div className="relative p-5 bg-background/70 text-left overflow-x-auto">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-xs text-secondary leading-relaxed"
                >
                  <code>{CODE_TEMPLATES[activeTab]}</code>
                </motion.pre>
              </AnimatePresence>
            </div>

            {/* Technical Footer console */}
            <div className="border-t border-border-subtle/50 bg-background px-4 py-2.5 flex items-center justify-between text-[10px] text-secondary font-mono">
              <span className="flex items-center gap-1">
                <Terminal className="h-3 w-3" /> compiled_products.sql
              </span>
              <span>100% Valid SQL Syntax</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
