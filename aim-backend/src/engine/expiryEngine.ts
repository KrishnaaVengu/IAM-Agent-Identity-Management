import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { getSimNow } from './clockEngine.js';
import { revokeCredential } from './credentialEngine.js';
import { AuditLogEntry } from '../models/auditLog.js';

export function writeAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const id = 'log_' + nanoid(12);
  const timestamp = getSimNow();
  db.prepare(`
    INSERT INTO audit_log (id, timestamp, event_type, agent_id, actor_role, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, timestamp, entry.eventType, entry.agentId, entry.actorRole, entry.details);
}

export function runExpirySweep(): string[] {
  const simNow = getSimNow();
  const rows = db.prepare(`
    SELECT a.agent_id, a.current_credential_id
    FROM agents a
    JOIN credentials c ON a.current_credential_id = c.credential_id
    WHERE a.status = 'active' AND c.status = 'active' AND c.expires_at <= ?
  `).all(simNow) as { agent_id: string; current_credential_id: string }[];

  const decommissionedAgentIds: string[] = [];

  for (const row of rows) {
    db.prepare(`
      UPDATE credentials
      SET status = 'expired', revoked_at = ?, revoked_reason = 'expired'
      WHERE credential_id = ?
    `).run(simNow, row.current_credential_id);

    db.prepare(`
      UPDATE agents
      SET status = 'decommissioned'
      WHERE agent_id = ?
    `).run(row.agent_id);

    writeAuditLog({
      eventType: 'AUTO_REVOKED',
      agentId: row.agent_id,
      actorRole: 'System',
      details: `Credential expired at ${simNow} without renewal`
    });

    decommissionedAgentIds.push(row.agent_id);
  }

  return decommissionedAgentIds;
}
