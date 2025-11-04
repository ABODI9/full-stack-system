import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import authRouter from './routes/auth';
import costsRouter from './routes/costs';
import dashboardRouter from './routes/dashboard';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';                 // ← NEW
import { errorHandler } from './middleware/error';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:4200']),
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());


app.set('trust proxy', 1);           // ← خلف بروكسي (Railway)
app.options('*', cors());            // ← يدعم طلبات OPTIONS التمهيدية


// API routes
app.use('/api/auth', authRouter);
app.use('/api/costs', costsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);                       // ← NEW

// Health check for frontend
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    apiUrl: process.env.PUBLIC_API_URL ?? 'http://localhost:4000/api',
    checkedAt: new Date().toISOString(),
    message: 'Connected'
  });
});


// Global error handler
app.use(errorHandler);

// داخل backend/src/index.ts
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on :${PORT}`);
});

