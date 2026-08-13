import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';
import { getSimNow } from './clockEngine.js';
import { Credential } from '../models/credential.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-aim-platform';

function addDays(isoDate: string, days: number): string {
  return new Date(new Date(isoDate).getTime() + days * 86400000).toISOString();
}

export function generateCredential(
  agentId: string,
  lifetimeDays: number,
  scopes: string[]
): Credential {
  const credentialId = 'cred_' + nanoid(12);
  const issuedAt = getSimNow();
  const expiresAt = addDays(issuedAt, lifetimeDays);
  
  // OIDC standard claims
  const token = jwt.sign(
    {
      sub: agentId,
      jti: credentialId,
      scopes: scopes
    },
    JWT_SECRET,
    { expiresIn: `${lifetimeDays}d` }
  );

  // Still provide a neat preview for the UI
  const parts = token.split('.');
  const tokenPreview = parts.length === 3 
    ? `jwt_...${parts[2].slice(-8)}`
    : `sk_agt_••••••••${token.slice(-4)}`;

  const status = 'active';

  db.prepare(`
    INSERT INTO credentials (
      credential_id, agent_id, token_preview, full_token, scopes,
      issued_at, expires_at, status, revoked_at, revoked_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    credentialId,
    agentId,
    tokenPreview,
    token,
    JSON.stringify(scopes),
    issuedAt,
    expiresAt,
    status,
    null,
    null
  );

  return {
    credentialId,
    agentId,
    tokenPreview,
    fullToken: token,
    scopes,
    issuedAt,
    expiresAt,
    status,
    revokedAt: null,
    revokedReason: null
  };
}

export function revokeCredential(
  credentialId: string,
  reason: 'rotated' | 'manual_revoke' | 'expired'
): void {
  const revokedAt = getSimNow();
  db.prepare(`
    UPDATE credentials
    SET status = 'revoked', revoked_at = ?, revoked_reason = ?
    WHERE credential_id = ?
  `).run(revokedAt, reason, credentialId);
}
