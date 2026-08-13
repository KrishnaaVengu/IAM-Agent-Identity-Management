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

  const teams = ['Data Eng', 'Finance-Automation', 'InfoSec', 'Infra', 'Ops', 'QA', 'SecOps'];
  const possibleScopes = ['read:documents', 'write:databases', 'admin:billing', 'read:logs', 'execute:deployments', 'write:tickets', 'read:tickets'];
  
  const agentsToSeed: any[] = [];

  // Helper to pick random item
  const pickRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const pickRandomScopes = () => {
    const numScopes = Math.floor(Math.random() * 3) + 1;
    const scopes = new Set<string>();
    for (let i = 0; i < numScopes; i++) scopes.add(pickRandom(possibleScopes));
    return Array.from(scopes);
  };

  for (let i = 1; i <= 35; i++) {
    const team = pickRandom(teams);
    let status = 'active';
    let lastApiCallAt: string | null = daysAgo(Math.floor(Math.random() * 10)); // Recent call
    let expiryDays = Math.floor(Math.random() * 80) + 10; // 10 to 90 days from now

    // Force some suspended and decommissioned
    if (i <= 3) status = 'suspended';
    else if (i <= 5) status = 'decommissioned';

    // Force some stale (Active but > 30 days no call)
    if (i >= 6 && i <= 10) {
      status = 'active';
      lastApiCallAt = daysAgo(Math.floor(Math.random() * 20) + 35); // 35-55 days ago
    }

    // Force some expiring within 7 days
    if (i >= 11 && i <= 14) {
      status = 'active';
      expiryDays = Math.floor(Math.random() * 6) + 1; // 1 to 6 days
    }

    // A few with never called
    if (i === 15 || i === 16) {
      lastApiCallAt = null;
      // if created > 30 days ago, it will be stale
    }

    const createdDaysAgo = Math.floor(Math.random() * 100) + 40; // Created 40-140 days ago

    agentsToSeed.push({
      agent_id: `agt_bot_${i}_${nanoid(6)}`,
      name: `${team.toLowerCase().replace(/[^a-z0-9]/g, '-')}-bot-${i}`,
      purpose: `Automated tasks for ${team}`,
      owning_team: team,
      approved_scopes: pickRandomScopes(),
      requested_lifetime_days: 90,
      created_at: daysAgo(createdDaysAgo),
      expiry_date: daysFromNow(expiryDays),
      last_api_call_at: lastApiCallAt,
      status: status,
      registered_by: 'Admin',
      credential_expires_at: daysFromNow(expiryDays),
      credential_issued_at: daysAgo(createdDaysAgo - 10)
    });
  }

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

  const insertApiLog = db.prepare(`
    INSERT INTO api_call_log (
      id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        agent.status === 'active' ? 'active' : 'revoked',
        agent.status !== 'active' ? agent.last_api_call_at || daysAgo(1) : null,
        agent.status !== 'active' ? 'status_change' : null
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
      
      // If there's a last API call, let's insert a log for it so the dashboard has API logs
      if (agent.last_api_call_at) {
        insertApiLog.run(
          'log_' + nanoid(12),
          agent.agent_id,
          credId,
          agent.last_api_call_at,
          'simulated_endpoint',
          agent.approved_scopes[0] || 'read:documents',
          'ALLOWED',
          'OK'
        );
      }
    }
  });

  seedTransaction();
}

seedIfEmpty();
