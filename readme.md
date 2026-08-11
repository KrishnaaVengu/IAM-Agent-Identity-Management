# Agent Identity Management (AIM) System
### Software Requirements Specification & Build README
**Version:** 1.0
**Prepared for:** Aivar Innovations — Agentic AI Task
**Scope of this document:** Frontend application with a simulated (mock) backend for local development and demo purposes.

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for building the **Agent Identity Management (AIM) System** — a web application that provisions, tracks, and governs machine identities for AI agents the same way an IAM system governs human employee accounts.

This SRS covers a **frontend-only deliverable backed by a simulated backend**. The "backend" is not a real server; it is a mock service layer (in-memory / local-storage / IndexedDB-backed) that mimics REST API behavior, latency, and business rules, so the UI can be built, demoed, and tested without real infrastructure. The mock layer is designed so it can later be swapped for a real backend (Node/Express, FastAPI, etc.) with minimal UI changes.

### 1.2 Problem Statement
Human employees get a governed identity lifecycle: account creation, RBAC-scoped role, periodic access review, and offboarding. AI agents today typically get a static API key with broad, unreviewed, non-expiring permissions. AIM closes this gap by treating every agent as a first-class identity subject to registration, scoping, expiry, rotation, review, and revocation.

### 1.3 Intended Audience
- Frontend engineers building the UI
- Reviewers/evaluators of the Agentic AI Task submission
- Future backend engineers who will replace the mock layer with a real API

### 1.4 Definitions

| Term | Meaning |
|---|---|
| Agent | A registered AI/automation identity (not a human) |
| Credential | A scoped, time-bounded secret/token issued to an agent |
| Scope | A permission grant, e.g. `read:documents`, `write:tickets` |
| Owning Team | The human team accountable for the agent |
| Stale Agent | An active agent with no recorded API call in ≥30 days |
| Auto-Revoke | System-driven deactivation of an expired, unrenewed credential |
| Mock Backend | Simulated service layer replacing a real server for this build |

---

## 2. Overall Description

### 2.1 Product Perspective
A single-page application (SPA) with a persistent simulated backend state (survives refresh via `localStorage`/`IndexedDB`), designed to look and behave like a production IAM console (think: a lightweight Okta/Auth0 admin panel, but for AI agents).

### 2.2 Product Functions (Summary)
1. Register a new agent → issue scoped, time-bounded credential
2. View/manage the full identity registry (list, filter, search, detail view)
3. Rotate credentials (old one revoked instantly)
4. Run a quarterly access review simulation → stale-agent detection → report generation
5. Auto-revoke expired, unrenewed agents (simulated clock or "Advance Time" dev control)
6. Simulate scoped API calls against an agent's credential to prove scope enforcement and expiry enforcement
7. Audit log of every identity/credential event

### 2.3 User Classes

| Role | Description | Permissions in UI |
|---|---|---|
| **Admin / Security Reviewer** | Full IAM authority | Register, suspend, decommission, rotate, run reviews, view audit log |
| **Team Owner** | Owns one or more agents | Register agents for own team, view/rotate own agents, view review reports for own team |
| **Viewer / Auditor** | Read-only | View registry, review reports, audit log only |

A simple role switcher (mock auth, no real login required) should let the demo user toggle between these roles to showcase permission enforcement in the UI itself.

### 2.4 Operating Environment
- Modern browsers (Chrome, Edge, Firefox, Safari — latest 2 versions)
- Responsive: desktop-first, usable on tablet width (≥1024px minimum for full data tables; graceful reflow below that)
- No real network dependency required to run the demo (mock backend runs entirely client-side)

### 2.5 Design & Implementation Constraints
- Mock backend must simulate realistic network latency (e.g., 200–600ms) and occasional error responses to force the UI to build proper loading/error states.
- All "time-based" logic (expiry, staleness, rotation windows) must be driven by a **controllable simulated clock**, not just `Date.now()`, so reviewers can fast-forward time in the demo without waiting real days.
- State must persist across page reloads (localStorage/IndexedDB) but must be fully resettable via a "Reset Demo Data" control.

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND (SPA)                        │
│  ┌────────────┐  ┌────────────────┐  ┌─────────────────────┐ │
│  │   Pages/    │  │   State Layer   │  │   Mock API Client   │ │
│  │   Views     │◄─┤ (store: agents, │◄─┤  (fetch-like async  │ │
│  │             │  │ creds, reviews, │  │   functions w/      │ │
│  │             │  │ audit log,      │  │   simulated latency  │ │
│  │             │  │ sim clock)      │  │   & errors)          │ │
│  └────────────┘  └────────────────┘  └──────────┬───────────┘ │
│                                                    │            │
│                                     ┌──────────────▼──────────┐│
│                                     │   Mock Backend Engine    ││
│                                     │  (business rules: scope  ││
│                                     │   enforcement, expiry,   ││
│                                     │   rotation, staleness,   ││
│                                     │   auto-revoke)           ││
│                                     └──────────────┬──────────┘│
│                                                    │            │
│                                     ┌──────────────▼──────────┐│
│                                     │  Persistence: localStorage││
│                                     │  / IndexedDB (seed data +││
│                                     │  runtime mutations)       ││
│                                     └───────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 3.1 Recommended Tech Stack

| Layer | Recommendation | Rationale |
|---|---|---|
| Framework | React 18+ (Vite) or Next.js | Component reuse, fast dev loop |
| Language | TypeScript | Strong typing for identity/credential models catches bugs early |
| Styling | Tailwind CSS + a component kit (shadcn/ui) | Fast, consistent, IAM-console aesthetic |
| State management | Zustand or React Context + useReducer | Lightweight, sufficient for mock backend scope |
| Mock persistence | `localStorage` via a thin repository wrapper (swappable for IndexedDB if data volume grows) | Simple, synchronous-feeling, demo-resettable |
| Mock API layer | Hand-rolled async functions simulating REST (`mockApi.registerAgent()`, etc.) with `setTimeout`-based latency | Mirrors real API ergonomics; easy to replace later with real `fetch` calls |
| Charts | Recharts | For dashboard visuals (scope distribution, expiry timeline, staleness trend) |
| Testing | Vitest + React Testing Library | Unit tests for scope enforcement & expiry logic |
| Routing | React Router | Multi-page IAM console feel |

### 3.2 Why a Simulated Backend (Not a Real Server)
Per the assignment, the backend is explicitly mocked/simulated. All "server" logic (credential issuance, scope checks, expiry checks, staleness detection) runs in a client-side module designed with the **same function signatures and async contracts a real API would have**, so a future team can lift-and-shift this logic into an actual Node/FastAPI service with minimal rewrite. See §7 for the mock API contract.

---

## 4. Functional Requirements

Each requirement is tagged `FR-x` and mapped to the assignment's "What to Build" and "Success Criteria" sections.

### FR-1: Agent Registration Flow
**Maps to:** "Agent registration flow"

- FR-1.1: A form to register a new agent, capturing:
  - Agent Name (required, unique, 3–50 chars)
  - Purpose Description (required, free text, 10–500 chars)
  - Owning Team (required, dropdown — seeded list: Platform, Data Eng, Growth, Security, Support-Bot Ops, Finance-Automation)
  - Requested Tool Scopes (required, multi-select checklist grouped by category — see §5.3 Scope Catalog)
  - Requested credential lifetime (dropdown: 7 / 30 / 90 days — default 30)
- FR-1.2: On submit, the mock backend:
  - Validates uniqueness of agent name
  - Validates at least one scope selected
  - Generates an **Agent ID** (format: `agt_` + 12-char alphanumeric)
  - Generates a **scoped, time-bounded credential** (format: `sk_agt_` + 32-char random token), with:
    - `issuedAt` = current sim time
    - `expiresAt` = issuedAt + requested lifetime
    - `scopes` = approved scopes (see FR-1.3)
  - Creates an **Identity Record** (see §5.1) with status `active`
  - Writes an audit log entry: `AGENT_REGISTERED`
- FR-1.3: **Approval simulation** — scopes tagged `sensitive` (e.g., `write:financial_records`, `write:user_data`, `delete:*`) require a mock "approval" step (auto-approved after a simulated 2-second review delay with a toast: *"Sensitive scope auto-approved by policy engine (demo mode)"*) so the UI can visibly demonstrate governance without a real approval workflow.
- FR-1.4: On success, display the **credential exactly once** in a "copy and store safely" modal (mirrors real IAM UX — Okta/AWS-style one-time secret reveal), then redact it in all future views (show only last 4 characters, e.g., `sk_agt_••••••••af02`).

### FR-2: Identity Record Management
**Maps to:** "Each identity record includes..."

- FR-2.1: Identity Registry page — a sortable, filterable, searchable table of all agents with columns:
  `Agent ID | Name | Owning Team | Created | Expires | Scopes (badge chips, +N more) | Status | Last API Call | Actions`
- FR-2.2: Filters: by Owning Team, by Status (active/suspended/decommissioned), by "stale only", by scope.
- FR-2.3: Search by agent name or Agent ID.
- FR-2.4: Row click → **Agent Detail page**, showing:
  - Full identity record
  - Current credential (redacted) with issued/expiry dates and a countdown/progress bar to expiry
  - Full scope list with descriptions
  - Credential history (rotation log)
  - Recent simulated API call log (timestamp, endpoint, scope used, allowed/denied)
  - Action buttons (role-gated): Suspend, Reactivate, Decommission, Rotate Credential, Extend Expiry
- FR-2.5: Status transitions and rules:
  - `active → suspended` (manual, reversible) — credential calls are rejected while suspended
  - `active/suspended → decommissioned` (manual, **irreversible**, requires confirmation dialog with typed agent name to confirm — mirrors destructive-action UX patterns)
  - `active → decommissioned` automatically triggered by **auto-revoke** when expiry passes with no renewal (FR-5)

### FR-3: Credential Rotation
**Maps to:** "A credential rotation mechanism"

- FR-3.1: From Agent Detail page, "Rotate Credential" button (enabled only for `active` agents).
- FR-3.2: On rotation:
  - New credential generated with a **new expiry** = sim-now + same lifetime window as original request (editable in an "Advanced" toggle)
  - Old credential immediately marked `revoked` (status + revokedAt timestamp) and can no longer authorize simulated API calls
  - New credential shown once in the reveal modal (same UX as FR-1.4)
  - Audit log entry: `CREDENTIAL_ROTATED` (old credential ID, new credential ID)
- FR-3.3: **Rotation reminder banner**: any agent within 7 days of expiry shows a "Credential expiring soon — rotate now" warning badge in the registry and a banner on the detail page.
- FR-3.4: Credential History table on the Agent Detail page lists every credential ever issued to that agent: `Credential ID (redacted) | Issued | Expired/Revoked | Reason (rotated / expired / manual revoke)`.

### FR-4: Quarterly Access Review Simulation
**Maps to:** "A quarterly access review simulation"

- FR-4.1: A "Run Access Review" action (dashboard + dedicated Reviews page) that, when triggered:
  - Snapshots all **active** agents at that moment
  - Flags any agent with `lastApiCallAt` more than **30 sim-days** ago (or `null`, i.e., never called) as **STALE**
  - Groups results by Owning Team
  - Computes summary stats: total active agents, stale count, % stale, scopes most commonly granted, sensitive-scope holders
- FR-4.2: Generates a **Review Report** (see §5.4 model) that is:
  - Viewable in-app as a formatted report page (per team and overall)
  - Exportable as a downloadable file (CSV and/or PDF/print-friendly view) — a "real" backend would email this to owning teams; the mock version surfaces a toast: *"Report generated — in production this would be emailed to [team]@company.com"*
- FR-4.3: Reports are archived under a "Review History" list (date run, who ran it, total flagged) so multiple quarters can be compared over time (using the simulated clock to fast-forward between "quarters").
- FR-4.4: From within a review report, a reviewer can take direct action on a stale agent (Suspend / Decommission / Mark Reviewed & Keep Active) without leaving the report — each action logged to the audit trail with a `reviewId` reference.

### FR-5: Auto-Revoke on Expiry
**Maps to:** "An auto-revoke trigger"

- FR-5.1: The mock backend engine runs an **expiry sweep** whenever:
  - The simulated clock advances (see §4.6), and
  - On every app load / poll interval (e.g., every 30s while the app is open, simulating a cron job)
- FR-5.2: Any `active` agent whose credential `expiresAt` ≤ sim-now **and** was not renewed/rotated is transitioned to `status: decommissioned`, credential `status: expired`, with an audit log entry `AUTO_REVOKED`.
- FR-5.3: A visible system notification/toast fires when auto-revoke happens during a live session: *"Agent 'billing-reconciler-bot' auto-revoked — credential expired without renewal."*
- FR-5.4: **Call-time enforcement**: the API Simulator (FR-6) must reject any call attempted with an expired or revoked credential, returning a mock `401 CREDENTIAL_EXPIRED` or `403 CREDENTIAL_REVOKED`, proving auto-revoke is enforced, not just cosmetic.

### FR-6: Scope Enforcement / API Call Simulator
**Maps to:** "Credentials correctly enforce scope"

- FR-6.1: A dedicated **"Test Agent Call"** panel (on Agent Detail page and as a standalone "API Simulator" page) letting a user:
  - Pick a mock endpoint/action from a catalog (e.g., `GET /documents` [`read:documents`], `POST /tickets` [`write:tickets`], `DELETE /users/:id` [`delete:users`])
  - Submit the call "as" the selected agent's current credential
- FR-6.2: The mock backend engine evaluates:
  1. Does the credential exist and belong to this agent? → else `401 INVALID_CREDENTIAL`
  2. Is the agent status `active`? → else `403 AGENT_SUSPENDED` / `403 AGENT_DECOMMISSIONED`
  3. Is the credential expired (`expiresAt` < sim-now)? → else `401 CREDENTIAL_EXPIRED`
  4. Does the credential's scope list include the scope required by the requested action? → else `403 INSUFFICIENT_SCOPE`
  5. If all pass → `200 OK` with a mock success payload, and `lastApiCallAt` is updated to sim-now (this is what feeds staleness detection in FR-4)
- FR-6.3: Every call (success or denial) is logged to that agent's **API Call Log** and the global **Audit Log**, with full reason codes — this is the primary UI evidence for the "Success Criteria" section.
- FR-6.4: UI must visibly demonstrate: a read-only-scoped agent attempting a write call → clearly shown as **DENIED (403 INSUFFICIENT_SCOPE)** in the response panel, in red, with the reason.

### FR-7: Simulated Clock / Time Travel Control
- FR-7.1: A persistent dev-mode control (e.g., a floating "Simulation Clock" widget) showing current sim date/time, with controls:
  - "Advance 1 day" / "Advance 7 days" / "Advance 30 days" / "Jump to date"
  - "Reset clock to real time"
- FR-7.2: Advancing time re-runs the expiry sweep (FR-5.1) and updates all relative displays ("expires in X days", "last call Y days ago") live.
- FR-7.3: This control is what allows a live demo to show staleness detection and auto-revoke without waiting real days — it should be visually distinct (e.g., an amber "DEMO CLOCK" chip) so it reads as a testing aid, not a production feature.

### FR-8: Audit Log
- FR-8.1: A global, append-only, filterable Audit Log page capturing every mutating event system-wide:
  `Timestamp (sim) | Event Type | Agent ID | Actor (role) | Details`
- FR-8.2: Event types: `AGENT_REGISTERED, CREDENTIAL_ISSUED, CREDENTIAL_ROTATED, CREDENTIAL_REVOKED, AGENT_SUSPENDED, AGENT_REACTIVATED, AGENT_DECOMMISSIONED, AUTO_REVOKED, REVIEW_RUN, SCOPE_CALL_ALLOWED, SCOPE_CALL_DENIED`.
- FR-8.3: Filterable by event type, agent, team, date range; exportable as CSV.

### FR-9: Dashboard (Home Page)
- FR-9.1: Summary cards: Total Agents, Active, Suspended, Decommissioned, Stale (≥30d inactive), Expiring in ≤7 days.
- FR-9.2: Charts:
  - Scope distribution (which scopes are most granted — bar chart)
  - Agents by owning team (pie/donut)
  - Expiry timeline (next 30/60/90 days — timeline/gantt-style or bar chart)
  - Staleness trend across past review runs (line chart)
- FR-9.3: "Attention needed" list: expiring-soon agents, stale agents, agents with sensitive scopes not reviewed this quarter.
- FR-9.4: Quick actions: Register New Agent, Run Access Review.

### FR-10: Role-Based UI Gating (Mock Auth)
- FR-10.1: Role switcher (Admin / Team Owner / Viewer) in the top nav — no real login, just a demo persona switch, persisted in session.
- FR-10.2: UI hides/disables actions not permitted for the current role (e.g., Viewer sees no Suspend/Decommission/Rotate buttons; Team Owner only sees full management controls for agents owned by their team, read-only for others).

---

## 5. Data Models

All models are TypeScript interfaces used by both the mock backend and the UI layer.

### 5.1 Identity Record
```ts
interface AgentIdentity {
  agentId: string;              // "agt_9f2a7c1d44e2"
  name: string;                 // unique, human-readable
  purpose: string;               // free-text description
  owningTeam: string;             // e.g. "Data Eng"
  createdAt: string;             // ISO timestamp (sim time)
  expiryDate: string;            // ISO timestamp — current credential's expiry
  approvedScopes: string[];       // e.g. ["read:documents", "write:tickets"]
  status: "active" | "suspended" | "decommissioned";
  lastApiCallAt: string | null;   // ISO timestamp, null if never called
  currentCredentialId: string;    // FK -> Credential.credentialId
  registeredBy: string;           // role/persona who registered it
  requestedLifetimeDays: number;  // 7 | 30 | 90
}
```

### 5.2 Credential
```ts
interface Credential {
  credentialId: string;          // "cred_..."
  agentId: string;                // FK -> AgentIdentity.agentId
  tokenPreview: string;           // e.g. "sk_agt_••••••••af02" (never store/display full token after creation)
  scopes: string[];
  issuedAt: string;
  expiresAt: string;
  status: "active" | "revoked" | "expired";
  revokedAt: string | null;
  revokedReason: "rotated" | "manual_revoke" | "expired" | null;
}
```

### 5.3 Scope Catalog (seed data)
```ts
interface ScopeDefinition {
  scopeId: string;        // "read:documents"
  category: string;        // "Documents" | "Tickets" | "Financial" | "Users" | "Infra"
  description: string;
  sensitive: boolean;      // true => requires simulated approval step
}
```
Example seed set:
- `read:documents` (Documents, not sensitive)
- `write:documents` (Documents, not sensitive)
- `read:tickets` (Tickets, not sensitive)
- `write:tickets` (Tickets, not sensitive)
- `read:financial_records` (Financial, sensitive)
- `write:financial_records` (Financial, **sensitive**)
- `read:users` (Users, not sensitive)
- `write:users` (Users, **sensitive**)
- `delete:users` (Users, **sensitive**)
- `deploy:infra` (Infra, **sensitive**)

### 5.4 Review Report
```ts
interface AccessReviewReport {
  reviewId: string;
  runAt: string;                 // sim timestamp
  runBy: string;                  // persona/role
  totalActiveAgents: number;
  staleAgentIds: string[];
  teamBreakdown: Record<string, { total: number; stale: number }>;
  sensitiveScopeHolders: string[]; // agentIds with any sensitive scope
}
```

### 5.5 Audit Log Entry
```ts
interface AuditLogEntry {
  id: string;
  timestamp: string;  // sim time
  eventType: string;   // see FR-8.2
  agentId: string | null;
  actorRole: "Admin" | "Team Owner" | "Viewer" | "System";
  details: string;
}
```

### 5.6 API Call Log Entry (per agent)
```ts
interface ApiCallLogEntry {
  id: string;
  agentId: string;
  credentialId: string;
  timestamp: string;
  endpoint: string;         // "POST /tickets"
  requiredScope: string;
  result: "ALLOWED" | "DENIED";
  reasonCode: string | null; // "INSUFFICIENT_SCOPE" | "CREDENTIAL_EXPIRED" | ...
}
```

---

## 6. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Mock API responses simulate 200–600ms latency; long operations (e.g., review run) simulate up to 1.5s with a progress indicator. |
| NFR-2 | All destructive actions (decommission, revoke) require explicit confirmation UX. |
| NFR-3 | Full credential tokens are never persisted in plaintext after the one-time reveal — only `tokenPreview` (last 4 chars) is stored/displayed thereafter, mirroring real secret-management UX. |
| NFR-4 | App must be usable with keyboard navigation and pass basic a11y checks (labels, focus states, color contrast) — this is an IAM/security tool, so trustworthy, accessible UI matters. |
| NFR-5 | State persists across refresh (localStorage) and includes a "Reset Demo Data" control that reseeds the original three demo agents. |
| NFR-6 | Visual design should read as a professional security/IAM console — dense data tables, status badges (green=active, amber=suspended, red=decommissioned/expired), clear typographic hierarchy. Avoid a "toy app" look. |
| NFR-7 | All simulated backend logic must be isolated in a `/mock-backend` module with clear function boundaries, so swapping to a real API later means changing only the API client layer, not the UI components. |
| NFR-8 | Errors from the mock layer (validation errors, denied scope, expired credential) must surface as clear, actionable UI messages — not raw console errors. |

---

## 7. Mock Backend — API Contract

Implement as async functions with realistic REST-like semantics (can literally be named like endpoints for clarity). Suggested module: `src/mock-backend/api.ts`.

| Function (mock endpoint) | Method equivalent | Description |
|---|---|---|
| `registerAgent(payload)` | `POST /agents` | FR-1 |
| `listAgents(filters)` | `GET /agents` | FR-2.1–2.3 |
| `getAgent(agentId)` | `GET /agents/:id` | FR-2.4 |
| `suspendAgent(agentId)` | `POST /agents/:id/suspend` | FR-2.5 |
| `reactivateAgent(agentId)` | `POST /agents/:id/reactivate` | FR-2.5 |
| `decommissionAgent(agentId)` | `POST /agents/:id/decommission` | FR-2.5 |
| `rotateCredential(agentId, options?)` | `POST /agents/:id/credentials/rotate` | FR-3 |
| `getCredentialHistory(agentId)` | `GET /agents/:id/credentials` | FR-3.4 |
| `runAccessReview()` | `POST /reviews/run` | FR-4 |
| `listReviewReports()` | `GET /reviews` | FR-4.3 |
| `getReviewReport(reviewId)` | `GET /reviews/:id` | FR-4 |
| `simulateApiCall(agentId, endpointId)` | `POST /simulate-call` | FR-6 |
| `getAuditLog(filters)` | `GET /audit-log` | FR-8 |
| `getDashboardStats()` | `GET /dashboard/stats` | FR-9 |
| `advanceSimClock(days)` | (dev only) | FR-7 |
| `resetDemoData()` | (dev only) | NFR-5 |

Each function should return a shape like:
```ts
type MockResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```
so UI error-handling logic is uniform and directly portable to real HTTP status/error handling later.

---

## 8. Seed / Demo Data

On first load, seed exactly **3 agents** to satisfy the "Register three agents with different scopes" success criterion out of the box (in addition to allowing the user to register more live):

1. **`doc-summarizer-bot`** — Owning Team: Data Eng — Scopes: `read:documents` only (read-only) — Status: active — created 45 sim-days ago, `lastApiCallAt` 40 days ago → **should appear as STALE** in the review demo.
2. **`ticket-triage-agent`** — Owning Team: Support-Bot Ops — Scopes: `read:tickets`, `write:tickets` — Status: active — created 10 days ago, called recently → healthy.
3. **`billing-reconciler-bot`** — Owning Team: Finance-Automation — Scopes: `read:financial_records`, `write:financial_records` (sensitive) — Status: active — credential expiring in 2 sim-days → demonstrates **rotation reminder** and, if left untouched, **auto-revoke** when the clock is advanced.

This seed set alone lets a reviewer exercise every success criterion within minutes using the Simulation Clock.

---

## 9. UI / Page Inventory (Information Architecture)

```
/                         Dashboard
/agents                   Identity Registry (list/filter/search)
/agents/new                Agent Registration flow
/agents/:agentId            Agent Detail (identity, credential, history, call log, actions)
/reviews                   Review History
/reviews/:reviewId          Review Report Detail
/simulator                 Standalone API Call Simulator
/audit-log                 Global Audit Log
(persistent) Role switcher + Simulation Clock widget — visible in top nav on every page
```

### 9.1 Key Screens — Component Notes

**Dashboard**: stat cards row → charts row (2x2 grid) → "attention needed" list → quick action buttons.

**Registration Form**: multi-step or single long-form; scope selection as grouped checkboxes with category headers and a "sensitive" badge + tooltip; live summary sidebar showing selected scopes and requested lifetime; submit → loading state → one-time credential reveal modal with "Copy" button and explicit "I have saved this credential" acknowledgment before closing.

**Identity Registry Table**: sticky header, status badge chips, scope chips (first 2 + "+N"), stale indicator icon, expiring-soon indicator icon, row-level action menu (kebab menu) gated by role.

**Agent Detail**: header card (name, status badge, team, ID) → tabs: `Overview | Credential | Call Log | Audit History`. Credential tab shows expiry progress bar (green → amber under 7 days → red if expired) and Rotate button. Call Log tab embeds the API Simulator scoped to this agent.

**Review Report**: summary stat header, per-team accordion/table breakdown, stale-agent table with inline action buttons, "Export CSV" / "Print/PDF" buttons, banner reproducing the "would be emailed to..." mock note.

**API Simulator**: agent picker (or pre-filled from Agent Detail) → endpoint/action picker (shows required scope inline) → "Send Test Call" button → response panel styled like an HTTP response viewer (status code, colored ALLOWED/DENIED badge, reason, JSON payload).

**Simulation Clock widget**: fixed position (e.g., bottom-right), collapsible, amber "DEMO" styling, shows current sim date, +1d/+7d/+30d buttons, jump-to-date input, reset button.

---

## 10. Success Criteria Traceability Matrix

| Assignment Success Criterion | Satisfied By |
|---|---|
| Register three agents with different scopes; each receives a working scoped credential | FR-1 + §8 Seed Data + credential reveal modal |
| Credentials correctly enforce scope — read-only agent cannot perform write ops | FR-6 (API Call Simulator scope check, step 4) |
| Stale agent report correctly identifies agents inactive ≥30 days | FR-4.1 + FR-7 (Simulation Clock to demonstrate) |
| Auto-revoke works: expired agent's credential rejected at call time | FR-5 + FR-6.2 step 3 (`401 CREDENTIAL_EXPIRED`) |
| (Bonus) Real IAM provider integration | §11 below |

---

## 11. Bonus: Real IAM Provider Integration Path (Not required for mock build)

If extending beyond the mock backend:
- Use **Auth0** (free tier) **Client Credentials Grant** to represent each agent as an Auth0 **Machine-to-Machine Application**, with Auth0 **Scopes/Permissions** mapped 1:1 to this system's `approvedScopes`.
- On "Register Agent," call the Auth0 Management API to create the M2M app + assign an API + grant scopes; store the returned `client_id`/`client_secret` reference (not the secret itself) in the Identity Record.
- Replace the mock credential with a real OIDC token retrieved via `POST https://{tenant}.auth0.com/oauth/token`.
- Token expiry becomes Auth0-managed; the "auto-revoke" sweep would instead **deactivate the Auth0 application/grant** via Management API when the assignment's business-rule expiry (independent of the token's own TTL) is reached.
- This is a natural v2 milestone once the mock backend's function contracts (§7) are proven — the same function signatures can proxy to real Auth0 Management API calls with the UI untouched.

---

## 12. Suggested Folder Structure

```
src/
  mock-backend/
    api.ts               // exported async functions (§7 contract)
    engine.ts            // business rules: scope check, expiry sweep, staleness calc
    seed.ts               // §8 seed data
    store.ts              // localStorage-backed persistence
    simClock.ts            // simulated clock state + advance logic
  types/
    agent.ts, credential.ts, review.ts, audit.ts   // §5 models
  pages/
    Dashboard.tsx
    AgentRegistry.tsx
    AgentRegistrationForm.tsx
    AgentDetail.tsx
    ReviewHistory.tsx
    ReviewReportDetail.tsx
    ApiSimulator.tsx
    AuditLog.tsx
  components/
    StatusBadge.tsx, ScopeChip.tsx, CredentialRevealModal.tsx,
    SimClockWidget.tsx, RoleSwitcher.tsx, ExpiryProgressBar.tsx, ...
  hooks/
    useAgents.ts, useReviews.ts, useAuditLog.ts, useSimClock.ts
  App.tsx / router.tsx
```

---

## 13. Out of Scope (for this build)

- Real network calls / real backend server
- Real user authentication (role switcher is a demo convenience only)
- Real secret storage/vaulting (KMS, HSM) — token generation is simulated
- Real email delivery of review reports (toast message substitutes)
- Multi-tenant / multi-organization support

---

## 14. Glossary of Status/Reason Codes (for consistent UI copy)

| Code | Meaning | UI Treatment |
|---|---|---|
| `INVALID_CREDENTIAL` | Credential/agent mismatch or unknown | Red error, 401 |
| `AGENT_SUSPENDED` | Agent manually suspended | Amber warning, 403 |
| `AGENT_DECOMMISSIONED` | Agent permanently retired | Red error, 403 |
| `CREDENTIAL_EXPIRED` | Past `expiresAt`, not renewed | Red error, 401 |
| `CREDENTIAL_REVOKED` | Manually revoked or superseded by rotation | Red error, 403 |
| `INSUFFICIENT_SCOPE` | Scope not in credential's grant list | Red error, 403 |
| `OK` | Call succeeded | Green success, 200 |

---

*End of SRS. This document is intended to be sufficient, on its own, for a frontend engineer to build the complete UI and mock backend without further clarification, and for a reviewer to verify every assignment success criterion is demonstrable in the running app.*