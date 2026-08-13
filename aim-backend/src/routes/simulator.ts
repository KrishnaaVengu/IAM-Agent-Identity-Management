import { Router } from 'express';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import db from '../db/connection.js';
import { getSimNow } from '../engine/clockEngine.js';
import { ENDPOINT_CATALOG } from '../models/scopeCatalog.js';
import { writeAuditLog } from '../engine/expiryEngine.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-aim-platform';

const strikeTracker = new Map<string, { strikes: number, firstStrike: number }>();

// Clean up tracker to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [agentId, tracker] of strikeTracker.entries()) {
    if (now - tracker.firstStrike > 10000) {
      strikeTracker.delete(agentId);
    }
  }
}, 30000);

const router = Router();

function handleExecute(req: any, res: any) {
  const authHeader = req.headers.authorization;
  let token = req.body.token || req.body.cleartextToken;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  const scopeRequired = req.body.scope_required || req.body.scopeRequired || req.body.requiredScope || req.body.required_scope;
  const endpointId = req.body.endpointId || req.body.endpoint;

  let requiredScope = scopeRequired;
  let endpointLabel = endpointId || 'simulated_endpoint';

  if (endpointId) {
    const ep = ENDPOINT_CATALOG.find((e) => e.endpointId === endpointId || e.label === endpointId);
    if (ep) {
      if (!requiredScope) requiredScope = ep.requiredScope;
      endpointLabel = ep.label || ep.endpointId;
    }
  }

  // Find credential by token or fallback agentId
  let credential: any = null;
  let agent: any = null;

  if (token) {
    // Check if token is a JWT
    if (token.startsWith('ey')) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const jti = decoded.jti; // credentialId
        credential = db.prepare('SELECT * FROM credentials WHERE credential_id = ?').get(jti);
      } catch (err: any) {
        // Fallback to searching db by full_token just in case it's an old token
        credential = db.prepare('SELECT * FROM credentials WHERE full_token = ? OR credential_id = ? OR id = ? OR token_preview LIKE ?').get(
          token, token, token, `%${token.slice(-4)}`
        );
      }
    } else {
      credential = db.prepare('SELECT * FROM credentials WHERE full_token = ? OR credential_id = ? OR id = ? OR token_preview LIKE ?').get(
        token, token, token, `%${token.slice(-4)}`
      );
    }
  }

  if (credential) {
    agent = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(credential.agent_id, credential.agent_id);
  } else if (req.body.agentId || req.body.agent_id) {
    const aid = req.body.agentId || req.body.agent_id;
    agent = db.prepare('SELECT * FROM agents WHERE agent_id = ? OR id = ?').get(aid, aid);
    if (agent && agent.current_credential_id) {
      credential = db.prepare('SELECT * FROM credentials WHERE credential_id = ?').get(agent.current_credential_id);
    }
  }

  const simNow = getSimNow();
  const logId = 'call_' + nanoid(12);

  // 1. Check if token/credential is invalid or missing
  if (!credential || !agent) {
    const msg = 'Invalid or unauthenticated credential token';
    db.prepare(`
      INSERT INTO api_call_log (
        id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, agent?.agent_id || 'unknown', credential?.credential_id || 'none', simNow, endpointLabel, requiredScope || 'unknown', 'DENIED', 'INVALID_CREDENTIAL');

    res.status(401).json({
      ok: false,
      statusCode: 401,
      result: 'DENIED',
      reasonCode: 'INVALID_CREDENTIAL',
      message: msg,
      endpoint: endpointLabel
    });
    return;
  }

  // 2. Check if credential is revoked
  if (credential.status === 'revoked') {
    const msg = `Credential '${credential.credential_id}' has been revoked`;
    db.prepare(`
      INSERT INTO api_call_log (
        id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, agent.agent_id, credential.credential_id, simNow, endpointLabel, requiredScope || 'unknown', 'DENIED', 'CREDENTIAL_REVOKED');

    writeAuditLog({
      eventType: 'SCOPE_CALL_DENIED',
      agentId: agent.agent_id,
      actorRole: 'System',
      details: msg
    });

    res.status(401).json({
      ok: false,
      statusCode: 401,
      result: 'DENIED',
      reasonCode: 'CREDENTIAL_REVOKED',
      message: msg,
      endpoint: endpointLabel
    });
    return;
  }

  // 3. Auto-Revoke Check: Reject if now > expires_at (401)
  if (simNow > credential.expires_at) {
    const msg = `Token has expired at ${credential.expires_at}`;
    
    // Auto-revoke in DB
    db.prepare("UPDATE credentials SET status = 'revoked', revoked_at = ?, revoked_reason = 'expired' WHERE credential_id = ?").run(
      simNow, credential.credential_id
    );

    db.prepare(`
      INSERT INTO api_call_log (
        id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, agent.agent_id, credential.credential_id, simNow, endpointLabel, requiredScope || 'unknown', 'DENIED', 'CREDENTIAL_EXPIRED');

    writeAuditLog({
      eventType: 'AUTO_REVOKED',
      agentId: agent.agent_id,
      actorRole: 'System',
      details: `Auto-revoked credential ${credential.credential_id} on expiration check`
    });

    res.status(401).json({
      ok: false,
      statusCode: 401,
      result: 'DENIED',
      reasonCode: 'CREDENTIAL_EXPIRED',
      message: msg,
      endpoint: endpointLabel
    });
    return;
  }

  // 4. Check if agent is active
  if (agent.status !== 'active') {
    const msg = `Agent '${agent.name}' is currently ${agent.status}`;
    db.prepare(`
      INSERT INTO api_call_log (
        id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, agent.agent_id, credential.credential_id, simNow, endpointLabel, requiredScope || 'unknown', 'DENIED', `AGENT_${agent.status.toUpperCase()}`);

    res.status(403).json({
      ok: false,
      statusCode: 403,
      result: 'DENIED',
      reasonCode: `AGENT_${agent.status.toUpperCase()}`,
      message: msg,
      endpoint: endpointLabel
    });
    return;
  }

  // 5. Scope Check: Reject if scope_required is not in credential scopes (403)
  const grantedScopes: string[] = credential.scopes ? JSON.parse(credential.scopes) : (agent.approved_scopes ? JSON.parse(agent.approved_scopes) : []);

  if (requiredScope && !grantedScopes.includes(requiredScope) && !grantedScopes.includes('admin:all')) {
    const nowReal = Date.now();
    let tracker = strikeTracker.get(agent.agent_id) || { strikes: 0, firstStrike: nowReal };
    
    if (nowReal - tracker.firstStrike > 10000) {
      tracker = { strikes: 0, firstStrike: nowReal };
    }
    
    tracker.strikes += 1;
    strikeTracker.set(agent.agent_id, tracker);

    if (tracker.strikes >= 5) {
      // Trigger Lockdown
      db.prepare("UPDATE agents SET status = 'suspended' WHERE agent_id = ?").run(agent.agent_id);
      db.prepare("UPDATE credentials SET status = 'revoked', revoked_at = ?, revoked_reason = 'security_lockdown' WHERE credential_id = ?").run(simNow, credential.credential_id);
      
      writeAuditLog({
        eventType: 'AGENT_SUSPENDED',
        agentId: agent.agent_id,
        actorRole: 'System',
        details: 'Multiple unauthorized access attempts detected. Agent automatically suspended and credentials revoked.'
      });

      db.prepare(`
        INSERT INTO api_call_log (
          id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(logId, agent.agent_id, credential.credential_id, simNow, endpointLabel, requiredScope, 'DENIED', 'SECURITY_LOCKDOWN');

      strikeTracker.delete(agent.agent_id);

      res.status(423).json({
        ok: false,
        statusCode: 423,
        result: 'DENIED',
        reasonCode: 'SECURITY_LOCKDOWN',
        message: 'SECURITY LOCKDOWN: Anomaly detected. Agent suspended and credentials revoked.',
        endpoint: endpointLabel,
        requiredScope
      });
      return;
    }

    const msg = `Agent '${agent.name}' lacks scope '${requiredScope}'. Granted scopes: [${grantedScopes.join(', ')}]`;
    db.prepare(`
      INSERT INTO api_call_log (
        id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, agent.agent_id, credential.credential_id, simNow, endpointLabel, requiredScope, 'DENIED', 'INSUFFICIENT_SCOPE');

    writeAuditLog({
      eventType: 'SCOPE_CALL_DENIED',
      agentId: agent.agent_id,
      actorRole: 'System',
      details: msg
    });

    res.status(403).json({
      ok: false,
      statusCode: 403,
      result: 'DENIED',
      reasonCode: 'INSUFFICIENT_SCOPE',
      message: msg,
      endpoint: endpointLabel,
      requiredScope
    });
    return;
  }

  // 6. On success: log execution to api_call_logs, update agent last_api_call_at, return 200 OK
  db.prepare('UPDATE agents SET last_api_call_at = ? WHERE agent_id = ?').run(simNow, agent.agent_id);

  db.prepare(`
    INSERT INTO api_call_log (
      id, agent_id, credential_id, timestamp, endpoint, required_scope, result, reason_code
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(logId, agent.agent_id, credential.credential_id, simNow, endpointLabel, requiredScope || 'granted', 'ALLOWED', 'OK');

  writeAuditLog({
    eventType: 'SCOPE_CALL_ALLOWED',
    agentId: agent.agent_id,
    actorRole: 'System',
    details: `Call to ${endpointLabel} succeeded with scope ${requiredScope || 'granted'}`
  });

  res.status(200).json({
    ok: true,
    statusCode: 200,
    result: 'ALLOWED',
    reasonCode: 'OK',
    message: 'API call executed successfully',
    endpoint: endpointLabel,
    requiredScope,
    payload: {
      status: 'SUCCESS',
      agentId: agent.agent_id,
      agentName: agent.name,
      timestamp: simNow,
      output: `Executed tool call for ${endpointLabel}`
    },
    data: {
      result: 'ALLOWED',
      statusCode: 200,
      reasonCode: 'OK',
      message: 'Call succeeded',
      endpoint: endpointLabel,
      payload: { message: 'Success', endpoint: endpointLabel }
    }
  });
}

// Support POST /execute, POST /, and GET /endpoints
router.post('/execute', handleExecute);
router.post('/', handleExecute);

router.get('/endpoints', (req, res) => {
  res.json({ ok: true, data: { endpoints: ENDPOINT_CATALOG } });
});

export default router;
