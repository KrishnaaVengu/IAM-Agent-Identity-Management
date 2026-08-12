import { Router } from 'express';
import db from '../db/connection.js';
import { getSimNow, advanceClock, resetClock } from '../engine/clockEngine.js';
import { runExpirySweep } from '../engine/expiryEngine.js';

const router = Router();

// GET /api/dev-clock
router.get(['/', '/clock'], (req, res) => {
  const simNow = getSimNow();
  const row = db.prepare('SELECT sim_offset_ms FROM sim_clock WHERE id = 1').get() as { sim_offset_ms: number } | undefined;
  const offsetMs = row ? row.sim_offset_ms : 0;

  res.json({
    ok: true,
    data: {
      simNow,
      simTime: simNow,
      offsetMs,
      realTime: new Date().toISOString()
    }
  });
});

// POST /api/dev-clock/advance or /api/dev/clock/advance
router.post(['/advance', '/clock/advance'], (req, res) => {
  const daysToAdvance = Number(req.body.days_to_advance || req.body.days || 35);
  const previousSimTime = getSimNow();

  advanceClock(daysToAdvance);

  const newSimTime = getSimNow();
  const autoRevokedAgentIds = runExpirySweep();

  res.json({
    ok: true,
    data: {
      previousSimTime,
      newSimTime,
      daysAdvanced: daysToAdvance,
      autoRevokedAgentIds
    },
    previousSimTime,
    newSimTime,
    daysAdvanced: daysToAdvance,
    autoRevokedAgentIds
  });
});

// POST /api/dev-clock/reset or /api/dev/clock/reset
router.post(['/reset', '/clock/reset'], (req, res) => {
  resetClock();
  res.json({
    ok: true,
    data: {
      simNow: getSimNow(),
      simTime: getSimNow()
    }
  });
});

export default router;
