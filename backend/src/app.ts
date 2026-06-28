import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env';

const app = express();

// 1. Helmet for security headers
app.use(helmet());

// 2. CORS configuration (credentials: true, origin from env)
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// 3. Request logging with morgan
app.use(morgan('dev'));

// 4. JSON body parsing
app.use(express.json());

// 5. URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));

// 6. Cookie parsing
app.use(cookieParser());

// Mount health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

export default app;
