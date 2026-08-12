import express from 'express';
import morgan from 'morgan';
import { runMigrations } from './db/migrations.js';
import { seedIfEmpty } from './db/seed.js';
import { startExpirySweepJob } from './jobs/expirySweepJob.js';
import { getSimNow } from './engine/clockEngine.js';
import { errorHandler } from './middleware/errorHandler.js';

import agentsRouter from './routes/agents.js';
import credentialsRouter from './routes/credentials.js';
import reviewsRouter from './routes/reviews.js';
import simulatorRouter from './routes/simulator.js';
import auditLogRouter from './routes/auditLog.js';
import dashboardRouter from './routes/dashboard.js';
import devClockRouter from './routes/devClock.js';

// 1. Run migrations first
runMigrations();

// 2. Seed database if empty
seedIfEmpty();

// 3. Start background expiry sweep job
startExpirySweepJob();

const app = express();

// 4. Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Role');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json());
app.use(morgan('dev'));

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

// 6. Error handler middleware (last)
app.use(errorHandler);

// 8. Read PORT from environment
const PORT = process.env.PORT || 4000;

// 9. Start server
app.listen(PORT, () => {
  console.log(`AIM backend running on http://localhost:${PORT}`);
});

export default app;
