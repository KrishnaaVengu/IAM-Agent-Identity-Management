import { Router } from 'express';
import db from '../db/connection.js';
import { requirePermission } from '../middleware/roleGuard.js';
import { generateCredential, revokeCredential } from '../engine/credentialEngine.js';
import { writeAuditLog } from '../engine/expiryEngine.js';

const router = Router();

function handleRotate(req: any, res: any) {
  const agentId = req.body?.agent_id || req.body?.agentId || req.params?.id;

  if (!agentId) {
    res.status(400).json({ ok: false, error: { code: 'INVALID_PAYLOAD', message: 'agent_id is required' } });
    return;
  }

  const agent = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(agentId, agentId) as any;
  if (!agent) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return;
  }

  if (agent.status !== 'active') {
    res.status(400).json({
      ok: false,
      error: { code: 'INVALID_STATE', message: 'Cannot rotate a non-active agent' }
    });
    return;
  }

  const oldCredentialId = agent.current_credential_id;
  let scopes: string[] = agent.approved_scopes ? JSON.parse(agent.approved_scopes) : ['read:tickets'];

  if (oldCredentialId) {
    const oldCred = db.prepare('SELECT scopes FROM credentials WHERE credential_id = ?').get(oldCredentialId) as any;
    if (oldCred && oldCred.scopes) {
      scopes = JSON.parse(oldCred.scopes);
    }
    revokeCredential(oldCredentialId, 'rotated');
  }

  const lifetimeDays = Number(req.body?.lifetimeDays || req.body?.requested_lifetime_days || agent.requested_lifetime_days || 30);
  const newCred = generateCredential(agent.agent_id, lifetimeDays, scopes);

  db.prepare('UPDATE agents SET current_credential_id = ?, expiry_date = ? WHERE agent_id = ?').run(
    newCred.credentialId,
    newCred.expiresAt,
    agent.agent_id
  );

  const roleHeader = req.headers['x-role'];
  const actorRole = (Array.isArray(roleHeader) ? roleHeader[0] : roleHeader) || 'Admin';

  writeAuditLog({
    eventType: 'CREDENTIAL_ROTATED',
    agentId: agent.agent_id,
    actorRole,
    details: `Rotated credential from ${oldCredentialId || 'none'} to ${newCred.credentialId}`
  });

  const credentialData = {
    credentialId: newCred.credentialId,
    id: newCred.credentialId,
    agentId: agent.agent_id,
    agent_id: agent.agent_id,
    fullToken: newCred.fullToken,
    cleartextToken: newCred.fullToken,
    token: newCred.fullToken,
    tokenPreview: newCred.tokenPreview,
    expiresAt: newCred.expiresAt,
    expires_at: newCred.expiresAt,
    scopes: newCred.scopes
  };

  res.json({
    ok: true,
    token: newCred.fullToken,
    revokedCredentialId: oldCredentialId,
    newCredential: credentialData,
    data: {
      revokedCredentialId: oldCredentialId,
      newCredential: credentialData,
      token: newCred.fullToken
    }
  });
}

// POST /api/agents/:id/credentials/rotate
router.post('/:id/credentials/rotate', requirePermission('rotate'), handleRotate);

// POST /api/credentials/rotate or /rotate
router.post('/rotate', requirePermission('rotate'), handleRotate);
router.post('/credentials/rotate', requirePermission('rotate'), handleRotate);

// GET /api/agents/:id/credentials
router.get('/:id/credentials', (req, res) => {
  const agent = db.prepare('SELECT agent_id FROM agents WHERE agent_id = ? OR id = ?').get(req.params.id, req.params.id) as any;
  if (!agent) {
    res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return;
  }

  const rows = db.prepare('SELECT * FROM credentials WHERE agent_id = ? ORDER BY issued_at DESC').all(agent.agent_id) as any[];

  const credentials = rows.map((row) => ({
    credentialId: row.credential_id,
    id: row.credential_id,
    agentId: row.agent_id,
    tokenPreview: row.token_preview,
    scopes: row.scopes ? JSON.parse(row.scopes) : [],
    issuedAt: row.issued_at,
    expiresAt: row.expires_at,
    status: row.status,
    revokedAt: row.revoked_at,
    revokedReason: row.revoked_reason
  }));

  res.json({ ok: true, data: { credentials } });
});

export default router;
