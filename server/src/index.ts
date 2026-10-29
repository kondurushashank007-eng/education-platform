import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import advisoryRoutes from './routes/advisoryRoutes';
import interventionRoutes from './routes/interventionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { isSupabaseConfigured } from './lib/supabase';
import { isGeminiConfigured, DEFAULT_AI_MODEL } from './lib/gemini';

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Security and Logging Middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : [CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-school-id', 'x-user-role']
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Diagnostic Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'EduReach AI - Inclusive Education Platform',
    timestamp: new Date().toISOString(),
    aiEngine: {
      provider: '@google/genai',
      model: DEFAULT_AI_MODEL,
      configured: isGeminiConfigured
    },
    database: {
      provider: 'Supabase PostgreSQL',
      configured: isSupabaseConfigured,
      mode: isSupabaseConfigured ? 'live-supabase' : 'in-memory-seed-store'
    }
  });
});

// Mount API Route Modules
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Catch]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 EduReach AI Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Engine: ${DEFAULT_AI_MODEL} (${isGeminiConfigured ? 'Active API Key' : 'Curated Fallback Engine Active'})`);
  console.log(`🗄️  Database: ${isSupabaseConfigured ? 'Connected to Supabase' : 'Isolated Demo Seed Store Active'}`);
  console.log(`====================================================`);
});

export default app;

