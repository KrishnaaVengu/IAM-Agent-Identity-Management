import { Router } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { requirePermission } from '../middleware/roleGuard.js';
import { getSimNow } from '../engine/clockEngine.js';
import { generateCredential, revokeCredential } from '../engine/credentialEngine.js';
import { writeAuditLog } from '../engine/expiryEngine.js';

const router = Router();

function formatAgent(row: any) {
  return {
    agentId: row.agent_id,
    id: row.agent_id,
    name: row.name,
    purpose: row.purpose,
    owningTeam: row.owning_team,
    owning_team: row.owning_team,
    createdAt: row.created_at,
    created_at: row.created_at,
    expiryDate: row.expiry_date,
    approvedScopes: row.approved_scopes ? JSON.parse(row.approved_scopes) : [],
    requestedScopes: row.requested_scopes ? JSON.parse(row.requested_scopes) : (row.approved_scopes ? JSON.parse(row.approved_scopes) : []),
    status: row.status,
    lastApiCallAt: row.last_api_call_at,
    currentCredentialId: row.current_credential_id,
    registeredBy: row.registered_by,
    requestedLifetimeDays: row.requested_lifetime_days
  };
}

// GET /agents
router.get('/', (req, res) => {
  const { team, status, stale, scope, q } = req.query;

  const conditions: string[] = [];
  const params: any[] = [];

  if (team && typeof team === 'string') {
    conditions.push('owning_team = ?');
    params.push(team);
  }

  if (status && typeof status === 'string') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (stale !== undefined) {
    const simNow = getSimNow();
    const thirtyDaysAgo = new Date(new Date(simNow).getTime() - 30 * 86400000).toISOString();
    if (stale === 'true') {
      conditions.push('(last_api_call_at IS NULL OR last_api_call_at <= ?)');
      params.push(thirtyDaysAgo);
    } else if (stale === 'false') {
      conditions.push('(last_api_call_at IS NOT NULL AND last_api_call_at > ?)');
      params.push(thirtyDaysAgo);
    }
  }

  if (scope && typeof scope === 'string') {
    conditions.push('approved_scopes LIKE ?');
    params.push(`%"${scope}"%`);
  }

  if (q && typeof q === 'string') {
    conditions.push('(name LIKE ? OR agent_id LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  let sql = 'SELECT * FROM agents';
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params);
  const agents = rows.map(formatAgent);

  res.json({ ok: true, data: { agents } });
});

// Registration handler function for POST / and POST /register
function handleRegister(req: any, res: any) {
  const name = req.body.name;
  const purpose = req.body.purpose || 'Enterprise agentic workflow automation';
  const owningTeam = req.body.owning_team || req.body.owningTeam || 'Unassigned';
  const requestedScopes = req.body.requested_scopes || req.body.requestedScopes || ['read:tickets'];
  const requestedLifetimeDays = Number(req.body.requested_lifetime_days || req.body.requestedLifetimeDays || 30);

  if (!name) {
    res.status(400).json({ ok: false, error: { code: 'INVALID_PAYLOAD', message: 'Name is required' } });
    return;
  }

  const existing = db.prepare('SELECT agent_id FROM agents WHERE name = ?').get(name);
  if (existing) {
    res.status(409).json({
      ok: false,
      error: { code: 'NAME_CONFLICT', message: `Agent with name '${name}' already exists` }
    });
    return;
  }

  const agentId = 'agt_' + nanoid(12);
  const simNow = getSimNow();
  const roleHeader = req.headers['x-role'];
  const actorRole = (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader) || 'Admin';
  const expiryDate = new Date(new Date(simNow).getTime() + requestedLifetimeDays * 86400000).toISOString();

  // Insert agent first so foreign key constraint in credentials table is satisfied
  db.prepare(`
    INSERT INTO agents (
      agent_id, id, name, purpose, owning_team, created_at, expiry_date,
      approved_scopes, requested_scopes, status, last_api_call_at, current_credential_id,
      registered_by, requested_lifetime_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    agentId,
    agentId,
    name,
    purpose,
    owningTeam,
    simNow,
    expiryDate,
    JSON.stringify(requestedScopes),
    JSON.stringify(requestedScopes),
    'active',
    null,
    null,
    actorRole,
    requestedLifetimeDays
  );

  const cred = generateCredential(agentId, requestedLifetimeDays, requestedScopes);

  db.prepare('UPDATE agents SET current_credential_id = ? WHERE agent_id = ?').run(
    cred.credentialId,
    agentId
  );

  writeAuditLog({
    eventType: 'AGENT_REGISTERED',
    agentId,
    actorRole,
    details: `Registered agent ${name}`
  });

  writeAuditLog({
    eventType: 'CREDENTIAL_ISSUED',
    agentId,
    actorRole: 'System',
    details: `Credential issued for agent ${name}`
  });

  const agentData = {
    agentId,
    id: agentId,
    name,
    purpose,
    owningTeam,
    owning_team: owningTeam,
    createdAt: simNow,
    created_at: simNow,
    expiryDate: cred.expiresAt,
    approvedScopes: requestedScopes,
    requestedScopes: requestedScopes,
    requested_scopes: requestedScopes,
    status: 'active',
    lastApiCallAt: null,
    currentCredentialId: cred.credentialId,
    registeredBy: actorRole,
    requestedLifetimeDays
  };

  const credData = {
    credentialId: cred.credentialId,
    id: cred.credentialId,
    agentId,
    agent_id: agentId,
    fullToken: cred.fullToken,
    cleartextToken: cred.fullToken,
    token: cred.fullToken,
    tokenPreview: cred.tokenPreview,
    expiresAt: cred.expiresAt,
    expires_at: cred.expiresAt,
    scopes: cred.scopes
  };

  res.status(201).json({
    ok: true,
    token: cred.fullToken,
    cleartextToken: cred.fullToken,
    agent: agentData,
    credential: credData,
    data: {
      agent: agentData,
      credential: credData,
      token: cred.fullToken
    }
  });
}

// POST /agents
router.post('/', requirePermission('register'), handleRegister);

// POST /agents/register or /register
router.post('/register', requirePermission('register'), handleRegister);

// GET /agents/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(req.params.id, req.params.id);
  if (!row) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return;
  }

  res.json({ ok: true, data: { agent: formatAgent(row) } });
});

// POST /agents/:id/suspend
router.post('/:id/suspend', requirePermission('suspend'), (req, res) => {
  const agent = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(req.params.id, req.params.id) as any;
  if (!agent) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return;
  }

  if (agent.status !== 'active') {
    res.status(400).json({
      ok: false,
      error: { code: 'INVALID_STATE', message: 'Only active agents can be suspended' }
    });
    return;
  }

  db.prepare("UPDATE agents SET status = 'suspended' WHERE agent_id = ?").run(agent.agent_id);

  const roleHeader = req.headers['x-role'];
  const actorRole = (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader) || 'Viewer';

  writeAuditLog({
    eventType: 'AGENT_SUSPENDED',
    agentId: agent.agent_id,
    actorRole,
    details: `Suspended agent ${agent.name}`
  });

  const updatedRow = db.prepare('SELECT * FROM agents WHERE agent_id = ?').get(agent.agent_id);
  res.json({ ok: true, data: { agent: formatAgent(updatedRow) } });
});

// POST /agents/:id/reactivate
router.post('/:id/reactivate', requirePermission('reactivate'), (req, res) => {
  const agent = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(req.params.id, req.params.id) as any;
  if (!agent) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return;
  }

  if (agent.status !== 'suspended') {
    res.status(400).json({
      ok: false,
      error: { code: 'INVALID_STATE', message: 'Only suspended agents can be reactivated' }
    });
    return;
  }

  db.prepare("UPDATE agents SET status = 'active' WHERE agent_id = ?").run(agent.agent_id);

  const roleHeader = req.headers['x-role'];
  const actorRole = (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader) || 'Viewer';

  writeAuditLog({
    eventType: 'AGENT_REACTIVATED',
    agentId: agent.agent_id,
    actorRole,
    details: `Reactivated agent ${agent.name}`
  });

  const updatedRow = db.prepare('SELECT * FROM agents WHERE agent_id = ?').get(agent.agent_id);
  res.json({ ok: true, data: { agent: formatAgent(updatedRow) } });
});

// POST /agents/:id/decommission
router.post('/:id/decommission', requirePermission('decommission'), (req, res) => {
  const agent = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(req.params.id, req.params.id) as any;
  if (!agent) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return;
  }

  if (req.body.confirmedName && req.body.confirmedName !== agent.name) {
    res.status(400).json({
      ok: false,
      error: { code: 'NAME_MISMATCH', message: 'Confirmed name does not match agent name' }
    });
    return;
  }

  if (agent.status === 'decommissioned') {
    res.status(400).json({
      ok: false,
      error: { code: 'ALREADY_DECOMMISSIONED', message: 'Agent is already decommissioned' }
    });
    return;
  }

  if (agent.current_credential_id) {
    revokeCredential(agent.current_credential_id, 'manual_revoke');
  }

  db.prepare("UPDATE agents SET status = 'decommissioned' WHERE agent_id = ?").run(agent.agent_id);

  const roleHeader = req.headers['x-role'];
  const actorRole = (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader) || 'Viewer';

  writeAuditLog({
    eventType: 'AGENT_DECOMMISSIONED',
    agentId: agent.agent_id,
    actorRole,
    details: `Decommissioned agent ${agent.name}`
  });

  const updatedRow = db.prepare('SELECT * FROM agents WHERE agent_id = ?').get(agent.agent_id);
  res.json({ ok: true, data: { agent: formatAgent(updatedRow) } });
});

export default router;
