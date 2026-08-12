import { Router } from 'express';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { getSimNow } from '../engine/clockEngine.js';
import { writeAuditLog } from '../engine/expiryEngine.js';

const router = Router();

const SENSITIVE_SCOPES = [
  'write:financial_records',
  'write:user_data',
  'delete:users',
  'deploy:infra',
  'write:users',
  'write:refunds',
  'write:deployments',
  'admin:all'
];

function generateStaleReport(runBy: string = 'System') {
  const simNow = getSimNow();
  const thirtyDaysMs = 30 * 86400000;
  const nowMs = new Date(simNow).getTime();

  const activeAgents = db.prepare("SELECT * FROM agents WHERE status = 'active'").all() as any[];

  const staleAgentIds: string[] = [];
  const teamBreakdown: Record<string, { total: number; stale: number; agents: any[] }> = {};
  const sensitiveScopeHolders: string[] = [];

  for (const agent of activeAgents) {
    const createdAtMs = new Date(agent.created_at).getTime();
    const lastCallMs = agent.last_api_call_at ? new Date(agent.last_api_call_at).getTime() : null;

    let isStale = false;
    if (lastCallMs !== null) {
      isStale = (nowMs - lastCallMs) >= thirtyDaysMs;
    } else {
      isStale = (nowMs - createdAtMs) >= thirtyDaysMs;
    }

    if (isStale) {
      staleAgentIds.push(agent.agent_id);
    }

    const team = agent.owning_team || 'Unassigned';
    if (!teamBreakdown[team]) {
      teamBreakdown[team] = { total: 0, stale: 0, agents: [] };
    }
    teamBreakdown[team].total += 1;
    if (isStale) {
      teamBreakdown[team].stale += 1;
    }
    teamBreakdown[team].agents.push({
      agent_id: agent.agent_id,
      name: agent.name,
      last_api_call_at: agent.last_api_call_at,
      is_stale: isStale
    });

    const approvedScopes: string[] = agent.approved_scopes ? JSON.parse(agent.approved_scopes) : [];
    if (approvedScopes.some((scope) => SENSITIVE_SCOPES.includes(scope))) {
      sensitiveScopeHolders.push(agent.agent_id);
    }
  }

  const reviewId = 'rev_' + nanoid(12);
  const report = {
    reviewId,
    id: reviewId,
    runAt: simNow,
    run_at: simNow,
    runBy,
    run_by: runBy,
    totalActiveAgents: activeAgents.length,
    total_active_agents: activeAgents.length,
    staleAgentIds,
    stale_agent_ids: staleAgentIds,
    teamBreakdown,
    team_breakdown: teamBreakdown,
    sensitiveScopeHolders,
    sensitive_scope_holders: sensitiveScopeHolders
  };

  db.prepare(`
    INSERT INTO review_reports (
      review_id, run_at, run_by, total_active_agents,
      stale_agent_ids, team_breakdown, sensitive_scope_holders
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    report.reviewId,
    report.runAt,
    report.runBy,
    report.totalActiveAgents,
    JSON.stringify(report.staleAgentIds),
    JSON.stringify(report.teamBreakdown),
    JSON.stringify(report.sensitiveScopeHolders)
  );

  writeAuditLog({
    eventType: 'REVIEW_RUN',
    agentId: null,
    actorRole: runBy,
    details: `Access review generated: ${staleAgentIds.length} stale agents identified across ${Object.keys(teamBreakdown).length} teams`
  });

  return report;
}

// GET /api/reviews/stale-report
router.get('/stale-report', (req, res) => {
  const report = generateStaleReport('System');
  res.json({
    ok: true,
    data: { report },
    report
  });
});

// POST /api/reviews/run
router.post('/run', (req, res) => {
  const runBy = req.body?.runBy || req.body?.run_by || 'Admin';
  const report = generateStaleReport(runBy);
  res.status(201).json({ ok: true, data: { report }, report });
});

// GET /api/reviews
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM review_reports ORDER BY run_at DESC').all() as any[];

  if (rows.length === 0) {
    const freshReport = generateStaleReport('System');
    res.json({ ok: true, data: { reports: [freshReport] }, reports: [freshReport] });
    return;
  }

  const reports = rows.map((row) => ({
    reviewId: row.review_id,
    id: row.review_id,
    runAt: row.run_at,
    run_at: row.run_at,
    runBy: row.run_by,
    run_by: row.run_by,
    totalActiveAgents: row.total_active_agents,
    total_active_agents: row.total_active_agents,
    staleAgentIds: JSON.parse(row.stale_agent_ids),
    stale_agent_ids: JSON.parse(row.stale_agent_ids),
    teamBreakdown: JSON.parse(row.team_breakdown),
    team_breakdown: JSON.parse(row.team_breakdown),
    sensitiveScopeHolders: JSON.parse(row.sensitive_scope_holders),
    sensitive_scope_holders: JSON.parse(row.sensitive_scope_holders)
  }));

  res.json({ ok: true, data: { reports }, reports });
});

// GET /api/reviews/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM review_reports WHERE review_id = ? OR id = ?').get(req.params.id, req.params.id) as any;
  if (!row) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Review report not found' } });
    return;
  }

  const report = {
    reviewId: row.review_id,
    id: row.review_id,
    runAt: row.run_at,
    run_at: row.run_at,
    runBy: row.run_by,
    run_by: row.run_by,
    totalActiveAgents: row.total_active_agents,
    total_active_agents: row.total_active_agents,
    staleAgentIds: JSON.parse(row.stale_agent_ids),
    stale_agent_ids: JSON.parse(row.stale_agent_ids),
    teamBreakdown: JSON.parse(row.team_breakdown),
    team_breakdown: JSON.parse(row.team_breakdown),
    sensitiveScopeHolders: JSON.parse(row.sensitive_scope_holders),
    sensitive_scope_holders: JSON.parse(row.sensitive_scope_holders)
  };

  res.json({ ok: true, data: { report }, report });
});

export default router;
