import * as React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, MessageSquare, Code2, Users2, History, ShieldCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, badge, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="p-6 rounded-xl border border-border-subtle bg-surface/40 hover:border-accent/40 hover:bg-surface hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 transition-all duration-200 group flex flex-col text-left"
    >
      <div className="h-10 w-10 bg-background rounded-lg border border-border-subtle flex items-center justify-center text-accent mb-4 group-hover:bg-accent/10 transition-colors">
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-semibold text-primary font-sans">
          {title}
        </h3>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-mono font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-secondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <LayoutGrid className="h-5 w-5" strokeWidth={1.5} />,
      title: 'Visual Diagram Canvas',
      description: 'Interact with tables as nodes. Drag, drop, group, and connect fields visually with auto-routing relationship lines.',
    },
    {
      icon: <MessageSquare className="h-5 w-5" strokeWidth={1.5} />,
      title: 'Contextual Discussions',
      description: 'Leave message threads directly on schema tables to discuss architectural decisions and collaborate with teammates.',
    },
    {
      icon: <Code2 className="h-5 w-5" strokeWidth={1.5} />,
      title: 'Multi-Engine SQL Export',
      description: 'Generate formatted DDL SQL scripts for PostgreSQL, MySQL, SQLite, and Microsoft SQL Server (MSSQL) dialers.',
    },
    {
      icon: <Users2 className="h-5 w-5" strokeWidth={1.5} />,
      title: 'Team Workspaces',
      description: 'Organize project schemas into shared team workspaces, invite members via email, and allocate roles.',
    },
    {
      icon: <History className="h-5 w-5" strokeWidth={1.5} />,
      title: 'Timeline Version History',
      description: 'Track database schema changes over time. Save manual snapshots, inspect historical backups, and revert blueprints.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />,
      title: 'Semantic Verification',
      description: 'Built-in real-time validation checks for broken foreign key constraints, recursive joins, and missing primary keys.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 px-6 border-t border-border-subtle relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary mb-4 font-sans">
            Engineered for high-focus database modeling
          </h2>
          <p className="text-base text-secondary leading-relaxed">
            All the features required to design, visualize, and communicate structures without leaving your web browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Small technical quote banner */}
        <div className="mt-16 p-4 rounded-xl border border-border-subtle/50 bg-background/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-4 w-4 text-accent" />
            <span className="text-xs text-secondary font-sans">
              Designed with performance in mind to support large visual schemas.
            </span>
          </div>
          <span className="text-xs text-placeholder font-sans">
            Fully responsive visual workspace built for standard landscape workstation monitors.
          </span>
        </div>
      </div>
    </section>
  );
};
