import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './db/migrations.js';
import { seedIfEmpty } from './db/seed.js';
import { startExpirySweepJob } from './jobs/expirySweepJob.js';
import { getSimNow } from './engine/clockEngine.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import agentsRouter from './routes/agents.js';
import credentialsRouter from './routes/credentials.js';
import reviewsRouter from './routes/reviews.js';
import simulatorRouter from './routes/simulator.js';
import auditLogRouter from './routes/auditLog.js';
import dashboardRouter from './routes/dashboard.js';
import devClockRouter from './routes/devClock.js';
import chatRouter from './routes/chat.js';

// 1. Run migrations first
runMigrations();

// 2. Seed database if empty
seedIfEmpty();

// 3. Start background expiry sweep job
startExpirySweepJob();

const app = express();

// 4. Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local testing/dev
}));

app.use(cors({
  origin: '*', // For enterprise, restrict this to production domains
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Role'],
}));

app.use(express.json());
app.use(morgan('dev'));

// Rate limiting for critical routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// 5. Mount routers under /api
app.use('/api/agents', agentsRouter);
app.use('/api/agents', credentialsRouter);
app.use('/api/credentials', credentialsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/simulate-call', simulatorRouter);
app.use('/api/simulator', simulatorRouter);
app.use('/api/audit-log', auditLogRouter);
app.use('/api/audit-logs', auditLogRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/dev', devClockRouter);
app.use('/api/dev-clock', devClockRouter);
app.use('/api/chat', chatRouter);

// 7. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    data: {
      status: 'ok',
      time: getSimNow()
    }
  });
});

// 7.5 Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../aim-frontend/dist');
  app.use(express.static(frontendDistPath));
  
  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
  });
}

// 6. Error handler middleware (last)
app.use(errorHandler);

// 8. Read PORT from environment
const PORT = process.env.PORT || 4000;

// 9. Start server
app.listen(PORT, () => {
  console.log(`AIM backend running on http://localhost:${PORT}`);
});

export default app;
