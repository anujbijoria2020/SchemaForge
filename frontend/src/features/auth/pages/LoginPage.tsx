import * as React from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[128px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-accent rounded-sm flex items-center justify-center shadow-lg shadow-accent/20 mb-4">
            <Database className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">SchemaForge</h1>
          <p className="text-secondary text-xs mt-1 font-medium tracking-wide uppercase">
            by Vednix Technology
          </p>
        </div>

        <div className="rounded-sm border border-border bg-surface shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-primary">Welcome Back</h2>
            <p className="text-secondary text-xs mt-1">Sign in to your account to continue</p>
          </div>
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
};
