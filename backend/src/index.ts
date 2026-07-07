/// <reference path="./types/express.d.ts" />
import app from '@/app';
import { env } from '@/config/env';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

// Graceful shutdown
const handleGracefulShutdown = (signal: string) => {
  console.log(`🛑 Received ${signal}. Initiating graceful shutdown...`);

  server.close(() => {
    console.log('🚪 HTTP server closed. Process exiting.');
    process.exit(0);
  });

  // Force exit after 10 seconds if connections are still open
  setTimeout(() => {
    console.error('⚠️ Forceful shutdown initiated: connections could not be closed in time.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
