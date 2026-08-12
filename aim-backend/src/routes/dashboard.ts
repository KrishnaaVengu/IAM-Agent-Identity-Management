import { Router } from 'express';
import db from '../db/connection.js';
import { getSimNow } from '../engine/clockEngine.js';

const router = Router();

const SENSITIVE_SCOPES = [
  'write:financial_records',
  'write:user_data',
  'delete:users',
  'deploy:infra',
  'write:users'
];

function addDays(isoDate: string, days: number): string {
  return new Date(new Date(isoDate).getTime() + days * 86400000).toISOString();
}

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  const totalAgents = (db.prepare('SELECT COUNT(*) as c FROM agents').get() as any).c;
  const active = (db.prepare("SELECT COUNT(*) as c FROM agents WHERE status = 'active'").get() as any).c;
  const suspended = (db.prepare("SELECT COUNT(*) as c FROM agents WHERE status = 'suspended'").get() as any).c;
  const decommissioned = (db.prepare("SELECT COUNT(*) as c FROM agents WHERE status = 'decommissioned'").get() as any).c;

  const simNow = getSimNow();
  const thirtyDaysAgo = addDays(simNow, -30);
  const sevenDaysFromNow = addDays(simNow, 7);
  const thirtyDaysFromNow = addDays(simNow, 30);

  const activeAgentRows = db.prepare("SELECT * FROM agents WHERE status = 'active'").all() as any[];

  let staleCount = 0;
  let expiring7Count = 0;
  const scopeCounts: Record<string, number> = {};
  const expiringSoonIds: string[] = [];
  const staleIds: string[] = [];
  const sensitiveScopeUnreviewedIds: string[] = [];

  for (const agent of activeAgentRows) {
    const isStale = !agent.last_api_call_at || agent.last_api_call_at <= thirtyDaysAgo;
    if (isStale) {
      staleCount++;
      staleIds.push(agent.agent_id);
    }

    if (agent.expiry_date <= sevenDaysFromNow) {
      expiring7Count++;
      expiringSoonIds.push(agent.agent_id);
    }

    const scopes: string[] = JSON.parse(agent.approved_scopes);
    for (const scope of scopes) {
      scopeCounts[scope] = (scopeCounts[scope] || 0) + 1;
    }

    if (scopes.some((scope) => SENSITIVE_SCOPES.includes(scope))) {
      sensitiveScopeUnreviewedIds.push(agent.agent_id);
    }
  }

  const scopeDistribution = Object.entries(scopeCounts)
    .map(([scope, count]) => ({ scope, count }))
    .sort((a, b) => b.count - a.count);

  const teamRows = db.prepare('SELECT owning_team as team, COUNT(*) as count FROM agents GROUP BY owning_team').all() as any[];

  const expiryTimelineRows = db.prepare(`
    SELECT agent_id as agentId, name, expiry_date as expiresAt
    FROM agents
    WHERE status = 'active' AND expiry_date <= ?
    ORDER BY expiry_date ASC
  `).all(thirtyDaysFromNow) as any[];

  res.json({
    ok: true,
    data: {
      summary: {
        totalAgents,
        active,
        suspended,
        decommissioned,
        stale: staleCount,
        expiringWithin7Days: expiring7Count
      },
      scopeDistribution,
      agentsByTeam: teamRows,
      expiryTimeline: expiryTimelineRows,
      attentionNeeded: {
        expiringSoon: expiringSoonIds,
        stale: staleIds,
        sensitiveScopesUnreviewed: sensitiveScopeUnreviewedIds
      }
    }
  });
});

export default router;
