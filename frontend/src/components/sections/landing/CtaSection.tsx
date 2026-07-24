import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-24 px-6 border-t border-border-subtle relative overflow-hidden">
      {/* Decorative Blur Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto rounded-2xl border border-accent/20 bg-gradient-to-b from-surface/30 to-surface/40 p-8 md:p-12 text-center relative z-10">
        <div className="h-12 w-12 bg-accent/10 rounded-xl border border-accent/20 flex items-center justify-center text-accent mx-auto mb-6">
          <Database className="h-6 w-6" strokeWidth={1.5} />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-4 font-sans">
          Ready to structure your data?
        </h2>
        <p className="text-base text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
          Design visual entity relations, review constraints in real-time, co-author with teammates, and export production scripts instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-accent text-white hover:bg-accent-hover text-base font-semibold px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 group shadow-lg shadow-accent/10 transition-colors"
          >
            Create Free Account
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/playground')}
            className="w-full sm:w-auto border border-border-subtle bg-background/30 hover:bg-surface hover:text-primary px-8 py-3.5 rounded-lg text-sm font-semibold transition-colors"
          >
            Try Sandbox Editor
          </Button>
        </div>
      </div>
    </section>
  );
};
