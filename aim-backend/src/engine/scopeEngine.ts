import { nanoid } from 'nanoid';
import db from '../db/connection.js';
import { getSimNow } from './clockEngine.js';
import { ENDPOINT_CATALOG } from '../models/scopeCatalog.js';
import { writeAuditLog } from './expiryEngine.js';

export interface ApiCallResult {
  ok: boolean;
  statusCode: number;
  reasonCode: string;
  message: string;
  endpoint: string;
  payload?: object;
}

function deny(
  reasonCode: string,
  message: string,
  endpointLabel: string
): ApiCallResult {
  return {
    ok: false,
    statusCode: reasonCode === 'INSUFFICIENT_SCOPE' ? 403 : 401,
    reasonCode,
    message,
    endpoint: endpointLabel
  };
}

function recordDeniedCall(
  agentId: string,
  credentialId: string,
  endpointLabel: string,
  requiredScope: string,
  reasonCode: string,
  details: string
): void {
  const timestamp = getSimNow();
  const id = 'call_' + nanoid(12);

  db.prepare(`
    INSERT INTO api_call_log (
      id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, agentId, credentialId, timestamp, endpointLabel, requiredScope, 'DENIED', reasonCode);

  writeAuditLog({
    eventType: 'SCOPE_CALL_DENIED',
    agentId: agentId || null,
    actorRole: 'System',
    details
  });
}

export function simulateApiCall(
  agentId: string,
  endpointId: string
): ApiCallResult {
  // 1. Look up agent row by agentId
  const agent = db.prepare('SELECT * FROM agents WHERE agent_id = ?').get(agentId) as {
    agent_id: string;
    name: string;
    status: string;
    current_credential_id: string | null;
  } | undefined;

  if (!agent) {
    const msg = `Invalid agent ID '${agentId}'`;
    recordDeniedCall(agentId, 'none', endpointId, 'unknown', 'INVALID_CREDENTIAL', msg);
    return deny('INVALID_CREDENTIAL', msg, endpointId);
  }

  // 2. Look up endpoint in ENDPOINT_CATALOG by endpointId
  const endpoint = ENDPOINT_CATALOG.find((e) => e.endpointId === endpointId);
  if (!endpoint) {
    const msg = 'Unknown endpoint';
    recordDeniedCall(
      agentId,
      agent.current_credential_id || 'none',
      endpointId,
      'unknown',
      'INVALID_ENDPOINT',
      msg
    );
    return deny('INVALID_ENDPOINT', msg, endpointId);
  }

  // 3. If agent.status === 'suspended'
  if (agent.status === 'suspended') {
    const msg = `Agent '${agent.name}' is suspended`;
    recordDeniedCall(
      agentId,
      agent.current_credential_id || 'none',
      endpoint.label,
      endpoint.requiredScope,
      'AGENT_SUSPENDED',
      msg
    );
    return deny('AGENT_SUSPENDED', msg, endpoint.label);
  }

  // 4. If agent.status === 'decommissioned'
  if (agent.status === 'decommissioned') {
    const msg = `Agent '${agent.name}' is decommissioned`;
    recordDeniedCall(
      agentId,
      agent.current_credential_id || 'none',
      endpoint.label,
      endpoint.requiredScope,
      'AGENT_DECOMMISSIONED',
      msg
    );
    return deny('AGENT_DECOMMISSIONED', msg, endpoint.label);
  }

  // 5. Look up credential by agent.current_credential_id
  const credential = agent.current_credential_id
    ? (db.prepare('SELECT * FROM credentials WHERE credential_id = ?').get(agent.current_credential_id) as {
        credential_id: string;
        status: string;
        expires_at: string;
        scopes: string;
      } | undefined)
    : undefined;

  if (!credential) {
    const msg = 'No active credential found for agent';
    recordDeniedCall(
      agentId,
      'none',
      endpoint.label,
      endpoint.requiredScope,
      'INVALID_CREDENTIAL',
      msg
    );
    return deny('INVALID_CREDENTIAL', msg, endpoint.label);
  }

  // 6. If credential.status === 'revoked'
  if (credential.status === 'revoked') {
    const msg = `Credential '${credential.credential_id}' is revoked`;
    recordDeniedCall(
      agentId,
      credential.credential_id,
      endpoint.label,
      endpoint.requiredScope,
      'CREDENTIAL_REVOKED',
      msg
    );
    return deny('CREDENTIAL_REVOKED', msg, endpoint.label);
  }

  // 7. If credential.expires_at <= getSimNow()
  const simNow = getSimNow();
  if (credential.expires_at <= simNow) {
    const msg = `Credential '${credential.credential_id}' is expired`;
    recordDeniedCall(
      agentId,
      credential.credential_id,
      endpoint.label,
      endpoint.requiredScope,
      'CREDENTIAL_EXPIRED',
      msg
    );
    return deny('CREDENTIAL_EXPIRED', msg, endpoint.label);
  }

  // 8. Parse credential scopes. If required scope not in list
  const grantedScopes: string[] = JSON.parse(credential.scopes);
  if (!grantedScopes.includes(endpoint.requiredScope)) {
    const msg = `Agent '${agent.name}' does not have scope '${endpoint.requiredScope}'. Approved scopes: ${grantedScopes.join(', ')}`;
    recordDeniedCall(
      agentId,
      credential.credential_id,
      endpoint.label,
      endpoint.requiredScope,
      'INSUFFICIENT_SCOPE',
      msg
    );
    return deny('INSUFFICIENT_SCOPE', msg, endpoint.label);
  }

  // 9. All checks passed
  const callTime = getSimNow();
  db.prepare('UPDATE agents SET last_api_call_at = ? WHERE agent_id = ?').run(callTime, agentId);

  const callId = 'call_' + nanoid(12);
  db.prepare(`
    INSERT INTO api_call_log (
      id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(callId, agentId, credential.credential_id, callTime, endpoint.label, endpoint.requiredScope, 'ALLOWED', null);

  writeAuditLog({
    eventType: 'SCOPE_CALL_ALLOWED',
    agentId,
    actorRole: 'System',
    details: `${endpoint.label} allowed`
  });

  return {
    ok: true,
    statusCode: 200,
    reasonCode: 'OK',
    message: 'Call succeeded',
    endpoint: endpoint.label,
    payload: { message: 'Success', endpoint: endpoint.label }
  };
}
