# AIM Backend (Agent Identity Management REST API)

Agent Identity Management (AIM) REST API built with Node.js, TypeScript, Express, and better-sqlite3.

## Quick Start
```bash
npm install
npm run dev
# API available at http://localhost:4000/api
```

## Run Smoke Tests (server must be running)
```bash
npm run smoke
```

## Reset Demo Data
```bash
rm aim.db && npm run dev
```

## Key Endpoints
- `GET /api/agents` - List and filter registered AI agent identities
- `POST /api/agents` - Register a new AI agent identity and issue initial credential
- `POST /api/agents/:id/credentials/rotate` - Rotate credential for an active agent
- `POST /api/simulate-call` - Simulate API call with scope and state validation
- `POST /api/reviews/run` - Trigger an access review report for stale agents
- `GET /api/dashboard/stats` - Retrieve high-level summary metrics and security stats
- `POST /api/dev/clock/advance` - Advance simulated clock by N days
- `POST /api/dev/clock/reset` - Reset simulated clock offset back to zero

## Role Header
All mutating requests require `X-Role: Admin` or `X-Role: Team Owner`. `Viewer` (default) is read-only.

## Simulated Clock
Posting `{ "days": N }` to `POST /api/dev/clock/advance` fast-forwards simulated time in SQLite by N days, instantly triggering automatic credential expiry and agent decommissioning sweeps without waiting for real time to elapse.
