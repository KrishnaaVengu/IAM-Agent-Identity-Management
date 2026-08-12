import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { getSimNow } from './clockEngine.js';
import { writeAuditLog } from './expiryEngine.js';
import { AccessReviewReport, TeamBreakdown } from '../models/review.js';

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

export function runAccessReview(runBy: string): AccessReviewReport {
  const simNow = getSimNow();
  const thirtyDaysAgo = addDays(simNow, -30);

  const activeAgents = db.prepare("SELECT * FROM agents WHERE status = 'active'").all() as {
    agent_id: string;
    owning_team: string;
    approved_scopes: string;
    last_api_call_at: string | null;
  }[];

  const staleAgentIds: string[] = [];
  const teamBreakdown: Record<string, TeamBreakdown> = {};
  const sensitiveScopeHolders: string[] = [];

  for (const agent of activeAgents) {
    const isStale = !agent.last_api_call_at || agent.last_api_call_at <= thirtyDaysAgo;

    if (isStale) {
      staleAgentIds.push(agent.agent_id);
    }

    const team = agent.owning_team;
    if (!teamBreakdown[team]) {
      teamBreakdown[team] = { total: 0, stale: 0 };
    }
    teamBreakdown[team].total += 1;
    if (isStale) {
      teamBreakdown[team].stale += 1;
    }

    const approvedScopes: string[] = JSON.parse(agent.approved_scopes);
    if (approvedScopes.some((scope) => SENSITIVE_SCOPES.includes(scope))) {
      sensitiveScopeHolders.push(agent.agent_id);
    }
  }

  const reviewId = 'rev_' + nanoid(12);
  const report: AccessReviewReport = {
    reviewId,
    runAt: simNow,
    runBy,
    totalActiveAgents: activeAgents.length,
    staleAgentIds,
    teamBreakdown,
    sensitiveScopeHolders
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
    details: `Review flagged ${staleAgentIds.length} stale agents`
  });

  return report;
}
