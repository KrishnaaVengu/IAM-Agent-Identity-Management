# AIM System — Backend README
### Agent Identity Management · Express + TypeScript + SQLite (better-sqlite3)

---

## Table of Contents

1. [What the Backend Does](#1-what-the-backend-does)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Seed Data](#5-seed-data)
6. [Business Logic Layer](#6-business-logic-layer)
7. [API Routes — Full Reference](#7-api-routes--full-reference)
8. [Middleware](#8-middleware)
9. [Simulated Clock](#9-simulated-clock)
10. [Error Codes & Response Shape](#10-error-codes--response-shape)
11. [Environment & Running Locally](#11-environment--running-locally)
12. [How the Mock Differs from Production](#12-how-the-mock-differs-from-production)

---

## 1. What the Backend Does

The backend is a **Node.js + Express REST API** backed by a **SQLite database** (`better-sqlite3`). It is described as "mock" only in the sense that:

- Credentials are randomly generated strings, not real OIDC tokens
- Emails are logged to the console instead of sent
- Time can be artificially advanced via a `/dev/clock` endpoint

Every other piece of logic — scope enforcement, expiry sweeps, rotation, staleness detection, audit logging — is **real business logic** that a production backend would implement identically.

The database file (`aim.db`) is created automatically on first run and seeded with three agents.

---

## 2. Tech Stack

| Concern | Package | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | LTS stability |
| Framework | Express 4 | Minimal, well-known |
| Language | TypeScript 5 | Type safety on models |
| Database | better-sqlite3 | Synchronous SQLite — no async complexity for a mock |
| ID generation | nanoid | Short unique IDs (`agt_`, `cred_`, etc.) |
| Token generation | crypto (built-in) | `crypto.randomBytes` for credential tokens |
| Validation | zod | Schema validation on all POST bodies |
| Logging | morgan | HTTP request log |
| Dev reload | tsx --watch | No compilation step needed |
| Testing | vitest | Unit tests for engine logic |

Install everything:
```bash
npm install express better-sqlite3 nanoid zod morgan
npm install -D typescript @types/express @types/better-sqlite3 tsx vitest
```

---

## 3. Project Structure

```
aim-backend/
│
├── src/
│   ├── db/
│   │   ├── connection.ts          # Opens (or creates) aim.db, exports the db instance
│   │   ├── migrations.ts          # Creates all tables on startup (idempotent)
│   │   └── seed.ts                # Inserts the 3 demo agents if the table is empty
│   │
│   ├── models/
│   │   ├── agent.ts               # TypeScript interface: AgentIdentity
│   │   ├── credential.ts          # TypeScript interface: Credential
│   │   ├── review.ts              # TypeScript interface: AccessReviewReport
│   │   ├── auditLog.ts            # TypeScript interface: AuditLogEntry
│   │   ├── apiCallLog.ts          # TypeScript interface: ApiCallLogEntry
│   │   └── scopeCatalog.ts        # ScopeDefinition[] — the full scope list
│   │
│   ├── engine/
│   │   ├── credentialEngine.ts    # generateCredential(), revokeCredential()
│   │   ├── scopeEngine.ts         # checkScope(), simulateApiCall()
│   │   ├── expiryEngine.ts        # runExpirySweep() — auto-revoke logic
│   │   ├── reviewEngine.ts        # runAccessReview() — staleness detection
│   │   └── clockEngine.ts         # getSimNow(), advanceClock(), resetClock()
│   │
│   ├── routes/
│   │   ├── agents.ts              # /api/agents (CRUD + lifecycle)
│   │   ├── credentials.ts         # /api/agents/:id/credentials (rotate, history)
│   │   ├── reviews.ts             # /api/reviews (run, list, get)
│   │   ├── simulator.ts           # /api/simulate-call
│   │   ├── auditLog.ts            # /api/audit-log
│   │   ├── dashboard.ts           # /api/dashboard/stats
│   │   └── devClock.ts            # /api/dev/clock (advance, reset — dev only)
│   │
│   ├── middleware/
│   │   ├── validate.ts            # Zod-based request body validator
│   │   ├── roleGuard.ts           # Checks X-Role header, blocks forbidden actions
│   │   └── errorHandler.ts        # Global Express error handler
│   │
│   ├── jobs/
│   │   └── expirySweepJob.ts      # setInterval that calls runExpirySweep() every 30s
│   │
│   └── app.ts                     # Express app setup, mounts all routes
│
├── aim.db                         # SQLite file — auto-created, gitignored
├── tsconfig.json
├── package.json
└── .env                           # PORT, DB_PATH, NODE_ENV
```

---

## 4. Database Schema

All tables are created by `src/db/migrations.ts` on startup using `CREATE TABLE IF NOT EXISTS`. No migration library is needed — this is a single-node mock database.

### 4.1 `agents` table

```sql
CREATE TABLE IF NOT EXISTS agents (
  agent_id              TEXT PRIMARY KEY,       -- "agt_9f2a7c1d44e2"
  name                  TEXT NOT NULL UNIQUE,   -- human-readable, unique
  purpose               TEXT NOT NULL,
  owning_team           TEXT NOT NULL,
  created_at            TEXT NOT NULL,          -- ISO timestamp (sim time)
  expiry_date           TEXT NOT NULL,          -- mirrors current credential's expiresAt
  approved_scopes       TEXT NOT NULL,          -- JSON array: '["read:documents","write:tickets"]'
  status                TEXT NOT NULL DEFAULT 'active', -- 'active' | 'suspended' | 'decommissioned'
  last_api_call_at      TEXT,                   -- ISO timestamp, NULL if never called
  current_credential_id TEXT,                   -- FK -> credentials.credential_id
  registered_by         TEXT NOT NULL,          -- 'Admin' | 'Team Owner'
  requested_lifetime_days INTEGER NOT NULL      -- 7 | 30 | 90
);
```

**Notes:**
- `approved_scopes` is stored as a JSON string and parsed in the engine layer. SQLite has no native array type.
- `expiry_date` is denormalized from the credential for fast dashboard queries — kept in sync on every rotation.
- `status` transitions: `active → suspended` (reversible), `active/suspended → decommissioned` (irreversible).

### 4.2 `credentials` table

```sql
CREATE TABLE IF NOT EXISTS credentials (
  credential_id   TEXT PRIMARY KEY,       -- "cred_abc123..."
  agent_id        TEXT NOT NULL,          -- FK -> agents.agent_id
  token_preview   TEXT NOT NULL,          -- "sk_agt_••••••••af02" — last 4 chars only
  full_token      TEXT NOT NULL,          -- full token — returned ONCE on issuance, never again
  scopes          TEXT NOT NULL,          -- JSON array string
  issued_at       TEXT NOT NULL,
  expires_at      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active', -- 'active' | 'revoked' | 'expired'
  revoked_at      TEXT,
  revoked_reason  TEXT,                   -- 'rotated' | 'manual_revoke' | 'expired'
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);
```

**Notes:**
- `full_token` is stored in the DB (this is a mock — no KMS). In production this would never be stored plaintext; only a hash would be stored for verification.
- The API returns `full_token` **only** in the registration and rotation response, then never again. All other reads return `token_preview` only.

### 4.3 `review_reports` table

```sql
CREATE TABLE IF NOT EXISTS review_reports (
  review_id             TEXT PRIMARY KEY,    -- "rev_..."
  run_at                TEXT NOT NULL,       -- sim timestamp
  run_by                TEXT NOT NULL,       -- role/persona
  total_active_agents   INTEGER NOT NULL,
  stale_agent_ids       TEXT NOT NULL,       -- JSON array string
  team_breakdown        TEXT NOT NULL,       -- JSON object string: { "Data Eng": { total: 2, stale: 1 } }
  sensitive_scope_holders TEXT NOT NULL      -- JSON array of agentIds
);
```

### 4.4 `audit_log` table

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  timestamp   TEXT NOT NULL,       -- sim time
  event_type  TEXT NOT NULL,       -- see FR-8.2 event list
  agent_id    TEXT,
  actor_role  TEXT NOT NULL,       -- 'Admin' | 'Team Owner' | 'Viewer' | 'System'
  details     TEXT NOT NULL        -- human-readable summary string
);
```

Event types stored in `event_type`:
```
AGENT_REGISTERED
CREDENTIAL_ISSUED
CREDENTIAL_ROTATED
CREDENTIAL_REVOKED
AGENT_SUSPENDED
AGENT_REACTIVATED
AGENT_DECOMMISSIONED
AUTO_REVOKED
REVIEW_RUN
SCOPE_CALL_ALLOWED
SCOPE_CALL_DENIED
```

### 4.5 `api_call_log` table

```sql
CREATE TABLE IF NOT EXISTS api_call_log (
  id              TEXT PRIMARY KEY,
  agent_id        TEXT NOT NULL,
  credential_id   TEXT NOT NULL,
  timestamp       TEXT NOT NULL,      -- sim time
  endpoint        TEXT NOT NULL,      -- "POST /tickets"
  required_scope  TEXT NOT NULL,      -- "write:tickets"
  result          TEXT NOT NULL,      -- 'ALLOWED' | 'DENIED'
  reason_code     TEXT                -- 'INSUFFICIENT_SCOPE' | 'CREDENTIAL_EXPIRED' | NULL (if ALLOWED)
);
```

### 4.6 `sim_clock` table

```sql
CREATE TABLE IF NOT EXISTS sim_clock (
  id          INTEGER PRIMARY KEY DEFAULT 1,  -- always row 1 (singleton)
  sim_offset_ms INTEGER NOT NULL DEFAULT 0    -- milliseconds added to real Date.now()
);
```

A single-row table. `getSimNow()` returns `new Date(Date.now() + sim_offset_ms).toISOString()`. Advancing by 7 days adds `7 * 86400 * 1000` to `sim_offset_ms`.

---

## 5. Seed Data

`src/db/seed.ts` runs at startup only if the `agents` table is empty. It inserts exactly three agents designed to demonstrate every success criterion immediately.

```typescript
// src/db/seed.ts  (pseudocode — real file uses db.prepare().run())

const simNow = getSimNow(); // real time on first run

// Agent 1 — read-only, stale
// createdAt = simNow - 45 days, lastApiCallAt = simNow - 40 days → STALE in review
insertAgent({
  agentId: 'agt_docsummarizer01',
  name: 'doc-summarizer-bot',
  purpose: 'Summarizes internal documents for the Data Engineering team',
  owningTeam: 'Data Eng',
  approvedScopes: ['read:documents'],
  requestedLifetimeDays: 90,
  createdAt: daysAgo(45),
  expiryDate: daysFromNow(45),           // expires 45 days from now
  lastApiCallAt: daysAgo(40),            // 40 days ago → flagged STALE
  status: 'active',
  registeredBy: 'Admin',
});

// Agent 2 — write scopes, healthy
// createdAt = simNow - 10 days, lastApiCallAt = simNow - 1 day → healthy
insertAgent({
  agentId: 'agt_tickettriage01',
  name: 'ticket-triage-agent',
  purpose: 'Reads and updates support tickets automatically',
  owningTeam: 'Support-Bot Ops',
  approvedScopes: ['read:tickets', 'write:tickets'],
  requestedLifetimeDays: 30,
  createdAt: daysAgo(10),
  expiryDate: daysFromNow(20),           // 20 days remaining
  lastApiCallAt: daysAgo(1),             // active yesterday → healthy
  status: 'active',
  registeredBy: 'Admin',
});

// Agent 3 — sensitive scopes, expiring in 2 days
// createdAt = simNow - 28 days, lastApiCallAt = simNow - 2 days
insertAgent({
  agentId: 'agt_billingrecon01',
  name: 'billing-reconciler-bot',
  purpose: 'Reads and reconciles financial records for Finance Automation',
  owningTeam: 'Finance-Automation',
  approvedScopes: ['read:financial_records', 'write:financial_records'],
  requestedLifetimeDays: 30,
  createdAt: daysAgo(28),
  expiryDate: daysFromNow(2),            // EXPIRING SOON → shows rotation reminder
  lastApiCallAt: daysAgo(2),
  status: 'active',
  registeredBy: 'Admin',
});
```

Each agent gets a corresponding `credentials` row, an `AGENT_REGISTERED` audit log entry, and a `CREDENTIAL_ISSUED` audit log entry.

---

## 6. Business Logic Layer

All core rules live in `src/engine/`. Routes call engine functions; engine functions call the DB directly. This separation means you can unit-test every rule without HTTP.

### 6.1 `credentialEngine.ts`

```typescript
// Generates a new credential for an agent
function generateCredential(agentId: string, lifetimeDays: number, scopes: string[]): Credential {
  const token = 'sk_agt_' + crypto.randomBytes(16).toString('hex'); // 32 hex chars
  const preview = 'sk_agt_••••••••' + token.slice(-4);
  const now = getSimNow();
  const expiresAt = addDays(now, lifetimeDays);

  const cred: Credential = {
    credentialId: 'cred_' + nanoid(12),
    agentId,
    tokenPreview: preview,
    fullToken: token,   // returned once, stored in DB for verification
    scopes,
    issuedAt: now,
    expiresAt,
    status: 'active',
    revokedAt: null,
    revokedReason: null,
  };

  db.prepare(`INSERT INTO credentials (...) VALUES (...)`).run(cred);
  return cred; // fullToken included here — stripped in all subsequent reads
}

// Marks an existing credential as revoked
function revokeCredential(credentialId: string, reason: 'rotated' | 'manual_revoke' | 'expired'): void {
  db.prepare(`
    UPDATE credentials SET status = 'revoked', revoked_at = ?, revoked_reason = ?
    WHERE credential_id = ?
  `).run(getSimNow(), reason, credentialId);
}
```

### 6.2 `scopeEngine.ts`

```typescript
// The mock endpoint catalog — each endpoint requires a specific scope
const ENDPOINT_CATALOG = [
  { endpointId: 'get_documents',         label: 'GET /documents',        requiredScope: 'read:documents' },
  { endpointId: 'post_documents',        label: 'POST /documents',       requiredScope: 'write:documents' },
  { endpointId: 'get_tickets',           label: 'GET /tickets',          requiredScope: 'read:tickets' },
  { endpointId: 'post_tickets',          label: 'POST /tickets',         requiredScope: 'write:tickets' },
  { endpointId: 'get_financial_records', label: 'GET /financial-records',requiredScope: 'read:financial_records' },
  { endpointId: 'post_financial_records',label: 'POST /financial-records',requiredScope: 'write:financial_records' },
  { endpointId: 'get_users',             label: 'GET /users',            requiredScope: 'read:users' },
  { endpointId: 'post_users',            label: 'POST /users',           requiredScope: 'write:users' },
  { endpointId: 'delete_users',          label: 'DELETE /users/:id',     requiredScope: 'delete:users' },
  { endpointId: 'deploy_infra',          label: 'POST /infra/deploy',    requiredScope: 'deploy:infra' },
];

// Core scope check — returns a result object, never throws
function simulateApiCall(agentId: string, endpointId: string): ApiCallResult {
  const agent = db.prepare(`SELECT * FROM agents WHERE agent_id = ?`).get(agentId);
  const cred  = db.prepare(`SELECT * FROM credentials WHERE credential_id = ?`).get(agent.current_credential_id);
  const endpoint = ENDPOINT_CATALOG.find(e => e.endpointId === endpointId);
  const simNow = getSimNow();

  // Check 1 — agent exists and credential matches
  if (!agent || !cred) return deny('INVALID_CREDENTIAL');

  // Check 2 — agent status
  if (agent.status === 'suspended')      return deny('AGENT_SUSPENDED');
  if (agent.status === 'decommissioned') return deny('AGENT_DECOMMISSIONED');

  // Check 3 — credential expiry
  if (cred.expires_at < simNow) return deny('CREDENTIAL_EXPIRED');

  // Check 4 — scope
  const grantedScopes: string[] = JSON.parse(cred.scopes);
  if (!grantedScopes.includes(endpoint.requiredScope)) return deny('INSUFFICIENT_SCOPE');

  // All checks passed
  db.prepare(`UPDATE agents SET last_api_call_at = ? WHERE agent_id = ?`).run(simNow, agentId);
  logApiCall(agentId, cred.credential_id, endpoint, 'ALLOWED', null);
  return { ok: true, statusCode: 200, reasonCode: 'OK', payload: { message: 'Success', endpoint: endpoint.label } };
}
```

### 6.3 `expiryEngine.ts`

```typescript
// Called every 30s by the background job AND whenever the sim clock advances
function runExpirySweep(): string[] {
  const simNow = getSimNow();
  const revokedIds: string[] = [];

  // Find all active agents whose credential has expired
  const expired = db.prepare(`
    SELECT a.agent_id, a.current_credential_id
    FROM agents a
    JOIN credentials c ON a.current_credential_id = c.credential_id
    WHERE a.status = 'active'
      AND c.status = 'active'
      AND c.expires_at <= ?
  `).all(simNow);

  for (const row of expired) {
    // Mark credential as expired
    db.prepare(`UPDATE credentials SET status = 'expired', revoked_at = ?, revoked_reason = 'expired'
                WHERE credential_id = ?`).run(simNow, row.current_credential_id);
    // Decommission the agent
    db.prepare(`UPDATE agents SET status = 'decommissioned' WHERE agent_id = ?`).run(row.agent_id);
    // Write audit log
    writeAuditLog({ eventType: 'AUTO_REVOKED', agentId: row.agent_id, actorRole: 'System',
                    details: `Credential expired at ${simNow} without renewal` });
    revokedIds.push(row.agent_id);
  }

  return revokedIds; // frontend uses this to show toasts
}
```

### 6.4 `reviewEngine.ts`

```typescript
function runAccessReview(runBy: string): AccessReviewReport {
  const simNow = getSimNow();
  const thirtyDaysAgo = addDays(simNow, -30);

  const activeAgents = db.prepare(`SELECT * FROM agents WHERE status = 'active'`).all();

  const staleAgentIds = activeAgents
    .filter(a => !a.last_api_call_at || a.last_api_call_at <= thirtyDaysAgo)
    .map(a => a.agent_id);

  // Group by team
  const teamBreakdown: Record<string, { total: number; stale: number }> = {};
  for (const agent of activeAgents) {
    if (!teamBreakdown[agent.owning_team]) teamBreakdown[agent.owning_team] = { total: 0, stale: 0 };
    teamBreakdown[agent.owning_team].total++;
    if (staleAgentIds.includes(agent.agent_id)) teamBreakdown[agent.owning_team].stale++;
  }

  // Sensitive scope holders
  const SENSITIVE_SCOPES = ['write:financial_records', 'write:user_data', 'delete:users', 'deploy:infra', 'write:users'];
  const sensitiveScopeHolders = activeAgents
    .filter(a => JSON.parse(a.approved_scopes).some((s: string) => SENSITIVE_SCOPES.includes(s)))
    .map(a => a.agent_id);

  const report: AccessReviewReport = {
    reviewId: 'rev_' + nanoid(12),
    runAt: simNow,
    runBy,
    totalActiveAgents: activeAgents.length,
    staleAgentIds,
    teamBreakdown,
    sensitiveScopeHolders,
  };

  db.prepare(`INSERT INTO review_reports (...) VALUES (...)`).run(/* serialized report */);
  writeAuditLog({ eventType: 'REVIEW_RUN', agentId: null, actorRole: runBy, details: `Review flagged ${staleAgentIds.length} stale agents` });

  return report;
}
```

---

## 7. API Routes — Full Reference

Base URL: `http://localhost:4000/api`

All responses follow this envelope:
```json
{ "ok": true,  "data": { ... } }
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### 7.1 Agents

| Method | Path | Description | Role required |
|---|---|---|---|
| `GET` | `/agents` | List all agents (filterable) | Any |
| `POST` | `/agents` | Register a new agent | Admin, Team Owner |
| `GET` | `/agents/:id` | Get full agent detail | Any |
| `POST` | `/agents/:id/suspend` | Suspend an active agent | Admin |
| `POST` | `/agents/:id/reactivate` | Reactivate a suspended agent | Admin |
| `POST` | `/agents/:id/decommission` | Permanently decommission | Admin |

**GET /agents — query parameters:**
```
?team=Data+Eng          filter by owning team
?status=active          filter by status (active | suspended | decommissioned)
?stale=true             only agents with last_api_call_at > 30 sim-days ago
?scope=read:documents   only agents that have this scope
?q=doc-summarizer       search by name or agentId
```

**POST /agents — request body:**
```json
{
  "name": "my-new-agent",
  "purpose": "Reads internal wiki pages for search indexing",
  "owningTeam": "Platform",
  "requestedScopes": ["read:documents"],
  "requestedLifetimeDays": 30
}
```

**POST /agents — success response (201):**
```json
{
  "ok": true,
  "data": {
    "agent": { /* full AgentIdentity, no token */ },
    "credential": {
      "credentialId": "cred_abc123",
      "fullToken": "sk_agt_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      "tokenPreview": "sk_agt_••••••••3d4",
      "expiresAt": "2026-09-11T10:00:00.000Z",
      "scopes": ["read:documents"]
    }
  }
}
```

The `fullToken` field appears **only in this response**. All future reads of the credential return `tokenPreview` only.

**POST /agents/:id/decommission — request body:**
```json
{ "confirmedName": "billing-reconciler-bot" }
```
The backend validates that `confirmedName` exactly matches the agent's name. If it doesn't, it returns `400 NAME_MISMATCH`. This enforces the "type the name to confirm" UX.

### 7.2 Credentials

| Method | Path | Description |
|---|---|---|
| `POST` | `/agents/:id/credentials/rotate` | Rotate credential — old revoked, new issued |
| `GET` | `/agents/:id/credentials` | Full credential history for this agent |

**POST /agents/:id/credentials/rotate — request body (optional):**
```json
{ "lifetimeDays": 90 }
```
If omitted, uses the agent's original `requestedLifetimeDays`.

**Rotate response (200):**
```json
{
  "ok": true,
  "data": {
    "revokedCredentialId": "cred_old123",
    "newCredential": {
      "credentialId": "cred_new456",
      "fullToken": "sk_agt_...",    // shown once
      "tokenPreview": "sk_agt_••••••••xyz",
      "expiresAt": "2026-11-12T10:00:00.000Z",
      "scopes": ["read:financial_records", "write:financial_records"]
    }
  }
}
```

### 7.3 Reviews

| Method | Path | Description |
|---|---|---|
| `POST` | `/reviews/run` | Run an access review (snapshots all active agents) |
| `GET` | `/reviews` | List all past review reports |
| `GET` | `/reviews/:id` | Get full review report detail |

**POST /reviews/run — request body:**
```json
{ "runBy": "Admin" }
```

**GET /reviews/:id — response:**
```json
{
  "ok": true,
  "data": {
    "reviewId": "rev_xyz789",
    "runAt": "2026-08-12T10:00:00.000Z",
    "runBy": "Admin",
    "totalActiveAgents": 3,
    "staleAgentIds": ["agt_docsummarizer01"],
    "teamBreakdown": {
      "Data Eng":          { "total": 1, "stale": 1 },
      "Support-Bot Ops":   { "total": 1, "stale": 0 },
      "Finance-Automation":{ "total": 1, "stale": 0 }
    },
    "sensitiveScopeHolders": ["agt_billingrecon01"]
  }
}
```

### 7.4 API Call Simulator

| Method | Path | Description |
|---|---|---|
| `POST` | `/simulate-call` | Simulate an API call as a specific agent |
| `GET` | `/simulate-call/endpoints` | List all available mock endpoints |

**POST /simulate-call — request body:**
```json
{ "agentId": "agt_docsummarizer01", "endpointId": "post_documents" }
```

**Response — scope denied (200 HTTP, denied in body):**
```json
{
  "ok": true,
  "data": {
    "result": "DENIED",
    "statusCode": 403,
    "reasonCode": "INSUFFICIENT_SCOPE",
    "message": "Agent 'doc-summarizer-bot' does not have scope 'write:documents'. Approved scopes: read:documents",
    "endpoint": "POST /documents",
    "requiredScope": "write:documents"
  }
}
```

**Response — allowed (200 HTTP, allowed in body):**
```json
{
  "ok": true,
  "data": {
    "result": "ALLOWED",
    "statusCode": 200,
    "reasonCode": "OK",
    "message": "Call succeeded",
    "endpoint": "GET /documents",
    "payload": { "documents": ["Q2 Report", "Product Spec"] }
  }
}
```

### 7.5 Audit Log

| Method | Path | Description |
|---|---|---|
| `GET` | `/audit-log` | Paginated, filterable audit log |

**Query parameters:**
```
?eventType=AUTO_REVOKED
?agentId=agt_docsummarizer01
?actorRole=System
?from=2026-07-01&to=2026-08-12
?page=1&limit=50
```

### 7.6 Dashboard

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | All summary numbers and chart data in one call |

**Response:**
```json
{
  "ok": true,
  "data": {
    "summary": {
      "totalAgents": 3,
      "active": 3,
      "suspended": 0,
      "decommissioned": 0,
      "stale": 1,
      "expiringWithin7Days": 1
    },
    "scopeDistribution": [
      { "scope": "read:documents", "count": 1 },
      { "scope": "read:tickets",   "count": 1 },
      { "scope": "write:tickets",  "count": 1 }
    ],
    "agentsByTeam": [
      { "team": "Data Eng", "count": 1 },
      { "team": "Support-Bot Ops", "count": 1 },
      { "team": "Finance-Automation", "count": 1 }
    ],
    "expiryTimeline": [
      { "agentId": "agt_billingrecon01", "name": "billing-reconciler-bot", "expiresAt": "2026-08-14T..." }
    ],
    "attentionNeeded": {
      "expiringSoon": ["agt_billingrecon01"],
      "stale": ["agt_docsummarizer01"],
      "sensitiveScopesUnreviewed": ["agt_billingrecon01"]
    }
  }
}
```

### 7.7 Dev Clock (only in NODE_ENV !== 'production')

| Method | Path | Description |
|---|---|---|
| `GET` | `/dev/clock` | Get current sim time and offset |
| `POST` | `/dev/clock/advance` | Advance sim time by N days |
| `POST` | `/dev/clock/reset` | Reset sim time to real now |

**POST /dev/clock/advance — request body:**
```json
{ "days": 7 }
```

**Advance response:**
```json
{
  "ok": true,
  "data": {
    "previousSimTime": "2026-08-12T10:00:00.000Z",
    "newSimTime": "2026-08-19T10:00:00.000Z",
    "autoRevokedAgentIds": ["agt_billingrecon01"]
  }
}
```

The `autoRevokedAgentIds` array tells the frontend which agents were auto-decommissioned as a result of the clock advance so it can show toast notifications.

---

## 8. Middleware

### 8.1 `validate.ts`

Wraps a Zod schema into an Express middleware:
```typescript
export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: result.error.message } });
  }
  req.body = result.data; // replace with parsed/typed data
  next();
};
```

Usage in routes:
```typescript
router.post('/agents', validate(registerAgentSchema), agentsController.register);
```

### 8.2 `roleGuard.ts`

Reads the `X-Role` header sent by the frontend (values: `Admin`, `Team Owner`, `Viewer`). Blocks actions based on role:
```typescript
const ROLE_PERMISSIONS = {
  'Admin':      ['register', 'suspend', 'reactivate', 'decommission', 'rotate', 'runReview'],
  'Team Owner': ['register', 'rotate'],
  'Viewer':     [],
};

export const requirePermission = (action: string) => (req, res, next) => {
  const role = req.headers['x-role'] ?? 'Viewer';
  if (!ROLE_PERMISSIONS[role]?.includes(action)) {
    return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: `Role '${role}' cannot perform '${action}'` } });
  }
  next();
};
```

### 8.3 `errorHandler.ts`

Global Express error handler — catches any unhandled throw:
```typescript
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
};
```

---

## 9. Simulated Clock

`src/engine/clockEngine.ts` is the source of truth for all timestamps in the system.

```typescript
// Read sim time
export function getSimNow(): string {
  const row = db.prepare(`SELECT sim_offset_ms FROM sim_clock WHERE id = 1`).get();
  return new Date(Date.now() + row.sim_offset_ms).toISOString();
}

// Advance by N days — triggers expiry sweep automatically
export function advanceClock(days: number): string[] {
  db.prepare(`UPDATE sim_clock SET sim_offset_ms = sim_offset_ms + ? WHERE id = 1`)
    .run(days * 24 * 60 * 60 * 1000);
  return runExpirySweep(); // returns list of auto-revoked agentIds
}

// Reset to real time
export function resetClock(): void {
  db.prepare(`UPDATE sim_clock SET sim_offset_ms = 0 WHERE id = 1`).run();
}
```

Every engine function that writes a timestamp calls `getSimNow()` instead of `Date.now()` or `new Date()`.

---

## 10. Error Codes & Response Shape

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod schema |
| `NOT_FOUND` | 404 | Agent or credential not found |
| `NAME_CONFLICT` | 409 | Agent name already exists |
| `NAME_MISMATCH` | 400 | Decommission confirm name didn't match |
| `FORBIDDEN` | 403 | Role doesn't have permission |
| `INVALID_CREDENTIAL` | 401 | Credential/agent mismatch |
| `AGENT_SUSPENDED` | — | Returned inside simulate-call result body |
| `AGENT_DECOMMISSIONED` | — | Returned inside simulate-call result body |
| `CREDENTIAL_EXPIRED` | — | Returned inside simulate-call result body |
| `CREDENTIAL_REVOKED` | — | Returned inside simulate-call result body |
| `INSUFFICIENT_SCOPE` | — | Returned inside simulate-call result body |
| `INTERNAL_ERROR` | 500 | Unhandled exception |

Note: `/simulate-call` always returns HTTP 200 — the `statusCode` field inside the response body carries the simulated HTTP status (200, 401, 403).

---

## 11. Environment & Running Locally

**.env file:**
```
PORT=4000
DB_PATH=./aim.db
NODE_ENV=development
```

**Scripts in `package.json`:**
```json
{
  "scripts": {
    "dev":   "tsx watch src/app.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/app.js",
    "test":  "vitest run",
    "seed":  "tsx src/db/seed.ts"
  }
}
```

**First run:**
```bash
npm install
npm run dev
# DB is created at ./aim.db
# Three agents are seeded automatically
# API is available at http://localhost:4000/api
```

**Reset demo data:**
```bash
rm aim.db && npm run dev
```

---

## 12. How the Mock Differs from Production

| Aspect | This mock | Production equivalent |
|---|---|---|
| Credential token | Random hex string | Real OIDC JWT (Auth0 M2M client credentials grant) |
| Token storage | Stored plaintext in SQLite | Only a bcrypt hash stored; plaintext never persisted |
| Expiry enforcement | Checked in `scopeEngine.ts` on each simulated call | Enforced by the OIDC provider (token TTL) + gateway middleware |
| Email reports | `console.log("Would email: ...")` | SMTP or SendGrid integration |
| Approval workflow | 2-second auto-approve for sensitive scopes | Real approval queue (Jira ticket, Slack bot, etc.) |
| Background sweep | `setInterval` every 30s inside the process | Cron job / scheduled Lambda |
| Auth | `X-Role` header (trust the client) | Real session tokens / JWT user auth |
| Multi-tenancy | Single namespace | Org-scoped data model |