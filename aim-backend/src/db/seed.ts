import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import db from './connection.js';
import { runMigrations } from './migrations.js';
import { getSimNow } from '../engine/clockEngine.js';

runMigrations();

export function seedIfEmpty(): void {
  const row = db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number };
  if (row.count > 0) {
    return;
  }

  const nowMs = new Date(getSimNow()).getTime();
  const daysAgo = (n: number) => new Date(nowMs - n * 86400000).toISOString();
  const daysFromNow = (n: number) => new Date(nowMs + n * 86400000).toISOString();

  const agentsToSeed = [
    {
      agent_id: 'agt_support_reader_01',
      name: 'support-ticket-reader',
      purpose: 'Reads customer support tickets and order details automatically',
      owning_team: 'Customer Support',
      approved_scopes: ['read:tickets', 'read:orders'],
      requested_lifetime_days: 30,
      created_at: daysAgo(5),
      expiry_date: daysFromNow(25),
      last_api_call_at: daysAgo(1),
      status: 'active',
      registered_by: 'Admin',
      credential_expires_at: daysFromNow(25),
      credential_issued_at: daysAgo(5)
    },
    {
      agent_id: 'agt_finance_refund_02',
      name: 'finance-refund-bot',
      purpose: 'Processes invoice checks and automated refund requests',
      owning_team: 'Finance & Billing',
      approved_scopes: ['read:invoices', 'write:refunds'],
      requested_lifetime_days: 14,
      created_at: daysAgo(2),
      expiry_date: daysFromNow(12),
      last_api_call_at: daysAgo(1),
      status: 'active',
      registered_by: 'Admin',
      credential_expires_at: daysFromNow(12),
      credential_issued_at: daysAgo(2)
    },
    {
      agent_id: 'agt_devops_deploy_03',
      name: 'devops-deploy-agent',
      purpose: 'Monitors logs and executes deployment scripts on infrastructure',
      owning_team: 'DevOps & Infrastructure',
      approved_scopes: ['read:logs', 'write:deployments', 'admin:all'],
      requested_lifetime_days: 7,
      created_at: daysAgo(1),
      expiry_date: daysFromNow(6),
      last_api_call_at: daysAgo(1),
      status: 'active',
      registered_by: 'Admin',
      credential_expires_at: daysFromNow(6),
      credential_issued_at: daysAgo(1)
    }
  ];

  const insertAgent = db.prepare(`
    INSERT INTO agents (
      agent_id, id, name, purpose, owning_team, created_at, expiry_date,
      approved_scopes, requested_scopes, status, last_api_call_at, current_credential_id,
      registered_by, requested_lifetime_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCredential = db.prepare(`
    INSERT INTO credentials (
      credential_id, id, agent_id, token_preview, full_token, token_hash, scopes,
      issued_at, created_at, expires_at, status, revoked_at, revoked_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAuditLog = db.prepare(`
    INSERT INTO audit_log (
      id, timestamp, event_type, action, agent_id, actor_role, details
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedTransaction = db.transaction(() => {
    for (const agent of agentsToSeed) {
      const credId = 'cred_' + nanoid(12);
      const fullToken = `aim_tok_${agent.name.replace(/[^a-z0-9]/gi, '_')}_${crypto.randomBytes(12).toString('hex')}`;
      const tokenPreview = `${fullToken.slice(0, 12)}...`;
      const tokenHash = crypto.createHash('sha256').update(fullToken).digest('hex');
      const scopesJson = JSON.stringify(agent.approved_scopes);

      insertAgent.run(
        agent.agent_id,
        agent.agent_id,
        agent.name,
        agent.purpose,
        agent.owning_team,
        agent.created_at,
        agent.expiry_date,
        scopesJson,
        scopesJson,
        agent.status,
        agent.last_api_call_at,
        credId,
        agent.registered_by,
        agent.requested_lifetime_days
      );

      insertCredential.run(
        credId,
        credId,
        agent.agent_id,
        tokenPreview,
        fullToken,
        tokenHash,
        scopesJson,
        agent.credential_issued_at,
        agent.credential_issued_at,
        agent.credential_expires_at,
        'active',
        null,
        null
      );

      insertAuditLog.run(
        'audit_' + nanoid(12),
        agent.created_at,
        'AGENT_REGISTERED',
        'registered',
        agent.agent_id,
        'Admin',
        `Seeded agent ${agent.name}`
      );

      insertAuditLog.run(
        'audit_' + nanoid(12),
        agent.credential_issued_at,
        'CREDENTIAL_ISSUED',
        'issued',
        agent.agent_id,
        'System',
        `Seed credential issued: ${credId}`
      );
    }
  });

  seedTransaction();
}

seedIfEmpty();
