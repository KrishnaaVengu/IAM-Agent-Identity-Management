# AIM System — Frontend README
### Agent Identity Management · React + TypeScript + Tailwind + shadcn/ui

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [API Client Layer](#4-api-client-layer)
5. [State Management](#5-state-management)
6. [Pages — Full Reference](#6-pages--full-reference)
7. [Shared Components](#7-shared-components)
8. [Role Switcher & Permissions](#8-role-switcher--permissions)
9. [Simulation Clock Widget](#9-simulation-clock-widget)
10. [Routing](#10-routing)
11. [Environment & Running Locally](#11-environment--running-locally)
12. [How Frontend Connects to Backend](#12-how-frontend-connects-to-backend)

---

## 1. Overview

The frontend is a **React 18 single-page application** (Vite) that consumes the AIM backend REST API. It presents a professional IAM-console interface — think a lightweight Okta admin panel, purpose-built for AI agent identities.

The frontend has **no business logic of its own**. Every rule (scope enforcement, expiry, staleness, rotation) lives in the backend. The frontend's job is to:

- Send API requests with correct payloads and the `X-Role` header
- Display responses clearly (tables, badges, charts, toasts)
- Gate UI actions based on the current role
- Drive the Simulation Clock widget via `/api/dev/clock`

---

## 2. Tech Stack

| Concern | Package | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast dev loop, HMR |
| Language | TypeScript 5 | Shared model types with backend |
| Styling | Tailwind CSS 3 | Utility-first, consistent density |
| Component kit | shadcn/ui | Pre-built accessible components (Table, Dialog, Badge, Toast, etc.) |
| State | Zustand | Lightweight global stores (role, clock, toast queue) |
| Server state | TanStack Query (React Query) | Data fetching, caching, refetch on clock advance |
| Routing | React Router v6 | Multi-page SPA navigation |
| Charts | Recharts | Dashboard visualizations |
| HTTP client | axios | Interceptors for `X-Role` header + error normalization |
| Form handling | React Hook Form + zod | Validated registration form |
| Icons | lucide-react | Consistent icon set |

Install:
```bash
npm create vite@latest aim-frontend -- --template react-ts
cd aim-frontend
npm install react-router-dom zustand @tanstack/react-query axios
npm install recharts react-hook-form zod @hookform/resolvers
npm install lucide-react
npx shadcn-ui@latest init
npx shadcn-ui@latest add button badge table dialog toast card tabs input select checkbox
```

---

## 3. Project Structure

```
aim-frontend/
│
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance — base URL, X-Role interceptor, error normalizer
│   │   ├── agents.ts              # All /api/agents calls
│   │   ├── credentials.ts         # All /api/agents/:id/credentials calls
│   │   ├── reviews.ts             # All /api/reviews calls
│   │   ├── simulator.ts           # /api/simulate-call
│   │   ├── auditLog.ts            # /api/audit-log
│   │   ├── dashboard.ts           # /api/dashboard/stats
│   │   └── devClock.ts            # /api/dev/clock
│   │
│   ├── types/
│   │   ├── agent.ts               # AgentIdentity interface (mirrors backend model)
│   │   ├── credential.ts          # Credential interface
│   │   ├── review.ts              # AccessReviewReport interface
│   │   ├── auditLog.ts            # AuditLogEntry interface
│   │   ├── apiCallLog.ts          # ApiCallLogEntry interface
│   │   ├── scopeCatalog.ts        # ScopeDefinition[], ENDPOINT_CATALOG
│   │   └── api.ts                 # ApiResponse<T> wrapper type
│   │
│   ├── stores/
│   │   ├── roleStore.ts           # Current role (Admin | Team Owner | Viewer), persisted in sessionStorage
│   │   ├── clockStore.ts          # Current sim time string, updated after every clock advance
│   │   └── toastStore.ts          # Toast queue (auto-revoke notifications, etc.)
│   │
│   ├── hooks/
│   │   ├── useAgents.ts           # useQuery wrappers for agent list and detail
│   │   ├── useCredentials.ts      # useQuery for credential history
│   │   ├── useReviews.ts          # useQuery for review list and detail
│   │   ├── useAuditLog.ts         # useQuery for audit log (paginated)
│   │   ├── useDashboard.ts        # useQuery for /api/dashboard/stats
│   │   ├── useSimulator.ts        # useMutation for /api/simulate-call
│   │   └── usePermission.ts       # Returns true/false for a given action based on current role
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx          # /
│   │   ├── AgentRegistry.tsx      # /agents
│   │   ├── AgentRegistrationForm.tsx  # /agents/new
│   │   ├── AgentDetail.tsx        # /agents/:agentId
│   │   ├── ReviewHistory.tsx      # /reviews
│   │   ├── ReviewReportDetail.tsx # /reviews/:reviewId
│   │   ├── ApiSimulator.tsx       # /simulator
│   │   └── AuditLog.tsx           # /audit-log
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Sidebar + topbar wrapper
│   │   │   ├── Sidebar.tsx            # Nav links (role-aware)
│   │   │   └── Topbar.tsx             # RoleSwitcher + SimClockWidget
│   │   │
│   │   ├── agents/
│   │   │   ├── AgentTable.tsx         # Sortable/filterable agent list table
│   │   │   ├── AgentTableRow.tsx      # Single row with status badge, scope chips, action menu
│   │   │   ├── AgentStatusBadge.tsx   # Green/amber/red badge for active/suspended/decommissioned
│   │   │   ├── ScopeChip.tsx          # Scope pill (first 2 + "+N more")
│   │   │   ├── ExpiryProgressBar.tsx  # Green → amber → red expiry bar
│   │   │   ├── AgentActionMenu.tsx    # Kebab menu (Suspend / Rotate / Decommission)
│   │   │   └── AgentFilters.tsx       # Team, status, stale-only, scope filter bar
│   │   │
│   │   ├── credentials/
│   │   │   ├── CredentialRevealModal.tsx  # One-time token display + "I have saved this" checkbox
│   │   │   ├── CredentialHistoryTable.tsx # All past credentials for an agent
│   │   │   └── RotateCredentialDialog.tsx # Confirmation dialog before rotating
│   │   │
│   │   ├── reviews/
│   │   │   ├── ReviewReportCard.tsx       # Summary stat row at top of report
│   │   │   ├── StaleAgentTable.tsx        # Table of stale agents with inline action buttons
│   │   │   └── TeamBreakdownAccordion.tsx # Collapsible per-team section in report
│   │   │
│   │   ├── simulator/
│   │   │   ├── CallForm.tsx               # Agent picker + endpoint picker + send button
│   │   │   └── ResponsePanel.tsx          # HTTP-response-viewer styled result (ALLOWED/DENIED)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx               # Single number tile (Total Agents, Stale, etc.)
│   │   │   ├── ScopeDistributionChart.tsx # Recharts bar chart
│   │   │   ├── AgentsByTeamChart.tsx      # Recharts donut chart
│   │   │   ├── ExpiryTimelineChart.tsx    # Recharts timeline/bar chart
│   │   │   └── AttentionList.tsx          # Expiring soon + stale agents quick list
│   │   │
│   │   └── shared/
│   │       ├── RoleSwitcher.tsx           # Admin / Team Owner / Viewer toggle in topbar
│   │       ├── SimClockWidget.tsx         # Floating amber DEMO CLOCK widget
│   │       ├── ConfirmDialog.tsx          # Generic "type to confirm" destructive dialog
│   │       ├── EmptyState.tsx             # Empty table / no results illustration
│   │       ├── LoadingSpinner.tsx         # Centered spinner for loading states
│   │       └── ErrorBanner.tsx            # Red error banner for API failures
│   │
│   ├── lib/
│   │   ├── utils.ts               # cn() (classnames), formatDate(), addDays(), pluralize()
│   │   ├── scopeCatalog.ts        # SCOPE_CATALOG constant array (mirrors backend)
│   │   ├── endpointCatalog.ts     # ENDPOINT_CATALOG constant array (mirrors backend)
│   │   └── permissions.ts         # ROLE_PERMISSIONS map — what each role can do
│   │
│   ├── App.tsx                    # Router setup, QueryClientProvider, toaster
│   └── main.tsx                   # React root mount
│
├── .env
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. API Client Layer

### 4.1 `src/api/client.ts`

The Axios instance used by every API module. It automatically attaches the current role as a header and normalizes errors.

```typescript
import axios from 'axios';
import { useRoleStore } from '../stores/roleStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 10000,
});

// Attach X-Role header on every request
client.interceptors.request.use((config) => {
  const role = useRoleStore.getState().role;
  config.headers['X-Role'] = role;
  return config;
});

// Normalize error shape so every call site gets { code, message }
client.interceptors.response.use(
  (res) => res.data,  // unwrap the { ok, data } envelope
  (err) => {
    const error = err.response?.data?.error ?? { code: 'NETWORK_ERROR', message: err.message };
    return Promise.reject(error);
  }
);

export default client;
```

### 4.2 `src/api/agents.ts`

```typescript
import client from './client';
import type { AgentIdentity, RegisterAgentPayload } from '../types/agent';

export const agentsApi = {
  list: (filters?: AgentFilters) =>
    client.get<AgentIdentity[]>('/agents', { params: filters }),

  get: (agentId: string) =>
    client.get<AgentIdentity>(`/agents/${agentId}`),

  register: (payload: RegisterAgentPayload) =>
    client.post<{ agent: AgentIdentity; credential: CredentialWithToken }>('/agents', payload),

  suspend: (agentId: string) =>
    client.post(`/agents/${agentId}/suspend`),

  reactivate: (agentId: string) =>
    client.post(`/agents/${agentId}/reactivate`),

  decommission: (agentId: string, confirmedName: string) =>
    client.post(`/agents/${agentId}/decommission`, { confirmedName }),
};
```

All other `src/api/*.ts` modules follow the same pattern — named export of an object with typed async methods that call `client`.

---

## 5. State Management

### 5.1 Server State — TanStack Query

All data fetched from the backend is managed by React Query. Each hook wraps a query:

```typescript
// src/hooks/useAgents.ts
import { useQuery } from '@tanstack/react-query';
import { agentsApi } from '../api/agents';

export const useAgentList = (filters?: AgentFilters) =>
  useQuery({
    queryKey: ['agents', filters],
    queryFn: () => agentsApi.list(filters),
    staleTime: 30_000,
  });

export const useAgentDetail = (agentId: string) =>
  useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => agentsApi.get(agentId),
    enabled: !!agentId,
  });
```

After a mutation (register, rotate, suspend, etc.), the relevant query keys are invalidated:

```typescript
// src/hooks/useAgentMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useRegisterAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: agentsApi.register,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Show credential reveal modal with data.credential.fullToken
    },
  });
};
```

### 5.2 Global UI State — Zustand Stores

**`src/stores/roleStore.ts`** — persisted in `sessionStorage`:
```typescript
interface RoleStore {
  role: 'Admin' | 'Team Owner' | 'Viewer';
  setRole: (role: RoleStore['role']) => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      role: 'Admin',
      setRole: (role) => set({ role }),
    }),
    { name: 'aim-role', storage: createJSONStorage(() => sessionStorage) }
  )
);
```

**`src/stores/clockStore.ts`** — updated after every `/api/dev/clock/advance` call:
```typescript
interface ClockStore {
  simNow: string;                       // ISO string — shown in the widget
  setSimNow: (t: string) => void;
  autoRevokedIds: string[];             // filled after clock advance → triggers toasts
  setAutoRevokedIds: (ids: string[]) => void;
}
```

**`src/stores/toastStore.ts`** — shadcn Toast queue:
```typescript
// Used to push auto-revoke notifications from clock advance
export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],
  push: (toast) => set({ toasts: [...get().toasts, toast] }),
  dismiss: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));
```

---

## 6. Pages — Full Reference

### 6.1 Dashboard (`/`)

**Data:** `useDashboard()` → single call to `GET /api/dashboard/stats`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [Total: 3]  [Active: 3]  [Suspended: 0]  [Stale: 1]  [Expiring: 1] │  ← StatCard row
├──────────────────────────────┬──────────────────────────────────┤
│  Scope Distribution (bar)    │  Agents by Team (donut)          │  ← Chart row
├──────────────────────────────┴──────────────────────────────────┤
│  Expiry Timeline (bar, next 90 days)                            │
├─────────────────────────────────────────────────────────────────┤
│  Attention Needed                                               │
│  ⚠ billing-reconciler-bot — expires in 2 days   [Rotate]       │
│  ⚠ doc-summarizer-bot — stale (40 days)          [Review]       │
├─────────────────────────────────────────────────────────────────┤
│  [+ Register New Agent]   [▶ Run Access Review]                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components used:** `StatCard`, `ScopeDistributionChart`, `AgentsByTeamChart`, `ExpiryTimelineChart`, `AttentionList`

**Actions:**
- "Register New Agent" → navigates to `/agents/new`
- "Run Access Review" → calls `POST /api/reviews/run`, then navigates to the resulting review report

---

### 6.2 Agent Registry (`/agents`)

**Data:** `useAgentList(filters)` → `GET /api/agents?...`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Search [_______________]  Team [▼]  Status [▼]  Stale [☐]  Scope [▼]  [+ New Agent] │
├──────┬──────────────────┬──────────────┬───────┬──────────┬───────────────────────────┤
│ ID   │ Name             │ Owning Team  │Status │ Scopes   │ Expires  │ Last Call │ ···│
├──────┼──────────────────┼──────────────┼───────┼──────────┼──────────┼───────────┼───┤
│ agt_ │ doc-summarizer.. │ Data Eng     │●Active│[read:doc]│ 45d      │ ⚠ 40d ago │ ⋮ │
│ agt_ │ ticket-triage-.. │Support-Bot   │●Active│[r:tick]  │ 20d      │ 1d ago    │ ⋮ │
│ agt_ │ billing-reconce..│Finance-Auto  │●Active│[r:fin]+1 │ ⚠ 2d     │ 2d ago    │ ⋮ │
└──────┴──────────────────┴──────────────┴───────┴──────────┴──────────┴───────────┴───┘
```

**Table columns:** Agent ID (truncated) · Name (link to detail) · Owning Team · Status badge · Scope chips (first 2 + "+N") · Expiry (with amber/red if ≤ 7 days) · Last API Call (with ⚠ icon if > 30 days) · Actions (kebab menu)

**Kebab menu items (role-gated):**
- View Detail (always)
- Suspend (Admin only, only if active)
- Reactivate (Admin only, only if suspended)
- Rotate Credential (Admin + Team Owner, only if active)
- Decommission (Admin only) → opens `ConfirmDialog` requiring typed name

**Filter bar state** is stored in URL search params (`?team=Data+Eng&status=active`) so filters survive page refresh and are shareable.

---

### 6.3 Agent Registration Form (`/agents/new`)

**Data:** `useMutation(agentsApi.register)`

**Form fields:**
```
Agent Name *             [_________________________________]
Purpose *                [_________________________________]
                         [_________________________________]
Owning Team *            [▼ Select team                   ]
Credential Lifetime *    [○ 7 days   ● 30 days   ○ 90 days]

Requested Scopes *
  Documents
    [☐] read:documents       Read documents
    [☐] write:documents      Create or modify documents
  Tickets
    [☑] read:tickets         Read support tickets
    [☑] write:tickets        Create or update support tickets
  Financial               ⚠ Sensitive
    [☐] read:financial_records   [sensitive badge] ...
    [☐] write:financial_records  [sensitive badge] ...
  ...

─────────────────────────────────────────────────
Live preview sidebar:
  Scopes selected: read:tickets, write:tickets
  Lifetime: 30 days
  Expires: ~Sep 11 2026
─────────────────────────────────────────────────
                         [Cancel]  [Register Agent →]
```

**Validation (React Hook Form + Zod):**
```typescript
const schema = z.object({
  name: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  purpose: z.string().min(10).max(500),
  owningTeam: z.enum(['Platform', 'Data Eng', 'Growth', 'Security', 'Support-Bot Ops', 'Finance-Automation']),
  requestedScopes: z.array(z.string()).min(1, 'Select at least one scope'),
  requestedLifetimeDays: z.union([z.literal(7), z.literal(30), z.literal(90)]),
});
```

**Sensitive scope toast:** When a sensitive scope is checked, a toast fires:
> *"Sensitive scope 'write:financial_records' requires approval — auto-approved in demo mode."*
Then a 2-second loading state shows before the checkbox visually confirms.

**On success → `CredentialRevealModal`:**
- Displays the full token (`sk_agt_a1b2...3d4`) in a monospace box
- "Copy to clipboard" button
- Checkbox: "I have saved this credential in a secure location"
- "Close" button is disabled until the checkbox is checked
- On close, token is gone forever — the agent detail page will only show `sk_agt_••••••3d4`

---

### 6.4 Agent Detail (`/agents/:agentId`)

**Data:** `useAgentDetail(agentId)` + `useCredentials(agentId)` + `useApiCallLog(agentId)`

**Header card:**
```
┌──────────────────────────────────────────────────────────────────┐
│  billing-reconciler-bot                          ● Active        │
│  agt_billingrecon01                                              │
│  Finance-Automation · Registered 28 days ago by Admin           │
│  [Rotate Credential]   [Suspend]   [Decommission]               │
└──────────────────────────────────────────────────────────────────┘
```

**Tabs:**

**Overview tab:**
- Full identity record (all fields from `AgentIdentity`)
- Approved scopes list with descriptions from `SCOPE_CATALOG`
- Status history (from audit log entries for this agent)

**Credential tab:**
```
Current Credential
  sk_agt_••••••••7f3a
  Issued: Aug 1, 2026
  Expires: Aug 14, 2026  ← red because < 7 days

  [████████████████░░░░] 93% of lifetime elapsed
  ⚠ Expires in 2 days — rotate now

  [Rotate Credential]

Credential History
  cred_abc123  sk_agt_••••••••af02   Issued: Jul 1  Revoked: Aug 1  Reason: rotated
```

**Call Log tab** (embeds the simulator pre-filled with this agent):
```
  Recent Calls
  ─────────────────────────────────────────────────────
  Aug 10  GET /financial-records  read:financial_records   ✅ ALLOWED
  Aug 10  POST /financial-records write:financial_records  ✅ ALLOWED
  Aug 8   DELETE /users/:id       delete:users             ❌ INSUFFICIENT_SCOPE
  ─────────────────────────────────────────────────────
  [Test a new call ↓]

  Endpoint [▼ POST /financial-records]   [Send Test Call]
  ─────────────────────────────────────────────────────
  Response: 200 OK  ✅ ALLOWED
```

**Audit History tab:**
- All audit log entries for this specific `agentId`
- Shows `AGENT_REGISTERED`, `CREDENTIAL_ISSUED`, `CREDENTIAL_ROTATED`, etc.

---

### 6.5 Review History (`/reviews`)

**Data:** `useReviews()` → `GET /api/reviews`

Simple table:
```
Date            Run By  Active Agents  Stale  % Stale
Aug 12, 2026    Admin         3          1     33%     [View Report →]
```

[+ Run New Access Review] button at top right.

---

### 6.6 Review Report Detail (`/reviews/:reviewId`)

**Data:** `useReviewReport(reviewId)` → `GET /api/reviews/:id`

**Layout:**
```
Access Review — Aug 12, 2026                              [Export CSV]  [Print]
Run by: Admin

┌──────────────────────────────────────────────────┐
│  Total active: 3  │  Stale: 1  │  Stale %: 33%  │  Sensitive scope holders: 1  │
└──────────────────────────────────────────────────┘

▼ Data Eng (1 agent, 1 stale)
  ┌───────────────────────────────────────────────────────────────────────────────┐
  │ doc-summarizer-bot    agt_docsummarizer01    Last call: 40 days ago    STALE  │
  │ [Suspend]   [Decommission]   [Mark reviewed & keep active]                   │
  └───────────────────────────────────────────────────────────────────────────────┘

▼ Support-Bot Ops (1 agent, 0 stale)
  ticket-triage-agent — healthy

▼ Finance-Automation (1 agent, 0 stale)
  billing-reconciler-bot — healthy (⚠ sensitive scopes: write:financial_records)

ℹ In production, this report would be emailed to each team's distribution list.
```

**Inline actions on stale agents** call:
- Suspend → `POST /api/agents/:id/suspend`
- Decommission → opens `ConfirmDialog`
- Mark reviewed → calls a `reviewAction` endpoint and removes the stale flag for this review cycle

Each action writes an audit log entry with `reviewId` reference.

---

### 6.7 API Simulator (`/simulator`)

**Data:** `useMutation(simulatorApi.call)`, `useQuery(simulatorApi.listEndpoints)`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Agent          [▼ doc-summarizer-bot (agt_docsummarizer01)]    │
│  Endpoint       [▼ POST /documents  (requires write:documents)] │
│                 [Send Test Call]                                 │
├─────────────────────────────────────────────────────────────────┤
│  Response                                                       │
│  ─────────────────────────────────────────────────────────────  │
│  Status    403 ❌ DENIED                                         │
│  Code      INSUFFICIENT_SCOPE                                   │
│  Message   Agent 'doc-summarizer-bot' does not have scope       │
│            'write:documents'. Approved scopes: read:documents   │
│  ─────────────────────────────────────────────────────────────  │
│  Endpoint  POST /documents                                      │
│  Required  write:documents                                      │
└─────────────────────────────────────────────────────────────────┘
```

The result panel is styled like an HTTP response viewer:
- Green background + checkmark for ALLOWED
- Red background + X for DENIED
- Reason code shown prominently
- Full JSON payload expandable below

**Call history** scrolls below the form showing recent calls for the selected agent (from the call log in the sidebar).

---

### 6.8 Audit Log (`/audit-log`)

**Data:** `useAuditLog(filters)` → `GET /api/audit-log?...` (paginated, 50/page)

**Filter bar:** Event Type · Agent · Team · Actor · Date range

```
Timestamp           Event Type          Agent                   Actor   Details
Aug 12, 10:32       AUTO_REVOKED        billing-reconciler-bot  System  Credential expired...
Aug 12, 10:32       AGENT_DECOMMISSIONED billing-reconciler-bot System  Auto-revoked on expiry
Aug 12, 10:01       SCOPE_CALL_DENIED   doc-summarizer-bot      System  INSUFFICIENT_SCOPE: write:documents
Aug 12, 09:55       REVIEW_RUN          —                       Admin   Flagged 1 stale agents
```

[Export CSV] button at top right — generates and downloads `audit-log-{date}.csv` from the full unfiltered response.

---

## 7. Shared Components

### 7.1 `AgentStatusBadge`
```tsx
// status: 'active' | 'suspended' | 'decommissioned'
const colors = {
  active:         'bg-green-100 text-green-800 border-green-200',
  suspended:      'bg-amber-100 text-amber-800 border-amber-200',
  decommissioned: 'bg-red-100 text-red-800 border-red-200',
};

<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${colors[status]}`}>
  <span className="w-1.5 h-1.5 rounded-full bg-current" />
  {status}
</span>
```

### 7.2 `ScopeChip`
Shows first 2 scopes as pills, then "+N more" if there are more.
```tsx
const ScopeChip = ({ scope }: { scope: string }) => (
  <span className="inline-block bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded border border-slate-200">
    {scope}
  </span>
);
```

### 7.3 `ExpiryProgressBar`
```tsx
// Turns amber when < 7 days remain, red if expired
const pct = ((Date.parse(expiresAt) - Date.parse(issuedAt)) / (Date.parse(expiresAt) - Date.parse(issuedAt))) * 100;
const daysLeft = Math.ceil((Date.parse(expiresAt) - Date.parse(simNow)) / 86400000);
const color = daysLeft <= 0 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-amber-400' : 'bg-green-500';
```

### 7.4 `ConfirmDialog`
For destructive actions (Decommission). Uses shadcn `Dialog`:
```tsx
// Requires user to type the agent name before the confirm button activates
<Input
  placeholder={`Type "${agentName}" to confirm`}
  onChange={(e) => setTyped(e.target.value)}
/>
<Button disabled={typed !== agentName} variant="destructive" onClick={onConfirm}>
  Permanently Decommission
</Button>
```

### 7.5 `CredentialRevealModal`
```tsx
// fullToken is passed in from the register/rotate mutation response
// The parent component should NOT store fullToken in React state after this modal closes
<Dialog open={!!fullToken}>
  <div className="font-mono bg-slate-900 text-green-400 p-4 rounded text-sm break-all">
    {fullToken}
  </div>
  <Button onClick={() => navigator.clipboard.writeText(fullToken)}>Copy</Button>
  <Checkbox checked={confirmed} onCheckedChange={setConfirmed}>
    I have saved this credential in a secure location
  </Checkbox>
  <Button disabled={!confirmed} onClick={onClose}>Close</Button>
</Dialog>
```

---

## 8. Role Switcher & Permissions

### 8.1 `RoleSwitcher` (in Topbar)

```tsx
const roles = ['Admin', 'Team Owner', 'Viewer'] as const;

<div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
  {roles.map(r => (
    <button
      key={r}
      onClick={() => setRole(r)}
      className={cn('px-3 py-1 rounded text-sm', role === r && 'bg-white shadow font-medium')}
    >
      {r}
    </button>
  ))}
</div>
```

### 8.2 `usePermission` hook

```typescript
// src/lib/permissions.ts
export const ROLE_PERMISSIONS = {
  'Admin':      ['register', 'suspend', 'reactivate', 'decommission', 'rotate', 'runReview', 'viewAll'],
  'Team Owner': ['register', 'rotate', 'viewAll'],
  'Viewer':     ['viewAll'],
} as const;

// src/hooks/usePermission.ts
export const usePermission = (action: string): boolean => {
  const role = useRoleStore((s) => s.role);
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
};
```

Usage in components:
```tsx
const canRotate = usePermission('rotate');
// ...
<Button disabled={!canRotate}>Rotate Credential</Button>
// or hide entirely:
{canRotate && <Button>Rotate Credential</Button>}
```

---

## 9. Simulation Clock Widget

`src/components/shared/SimClockWidget.tsx` — fixed in the topbar (or as a collapsible drawer from a corner button).

```
┌──────────────────────────────────────┐
│  🕐 DEMO CLOCK                       │  ← amber background
│  Aug 12, 2026 · 10:32 AM (sim)      │
│  [+1 day]  [+7 days]  [+30 days]   │
│  Jump to: [__________] [Go]         │
│  [Reset to real time]               │
└──────────────────────────────────────┘
```

**On "+N days" click:**
```typescript
const advanceClock = async (days: number) => {
  const result = await devClockApi.advance(days);
  // result.data = { newSimTime, autoRevokedAgentIds }
  clockStore.setSimNow(result.data.newSimTime);

  // Fire a toast for each auto-revoked agent
  result.data.autoRevokedAgentIds.forEach(id => {
    toastStore.push({
      title: 'Agent auto-revoked',
      description: `Agent ${id} was decommissioned — credential expired without renewal.`,
      variant: 'destructive',
    });
  });

  // Invalidate all React Query caches — UI reflects new sim time
  queryClient.invalidateQueries();
};
```

The sim time shown throughout the app (expiry countdowns, "last call X days ago") uses `clockStore.simNow` as the reference point, not `Date.now()`.

```typescript
// src/lib/utils.ts
export const daysAgo = (isoTimestamp: string, simNow: string): number =>
  Math.floor((Date.parse(simNow) - Date.parse(isoTimestamp)) / 86400000);

export const daysUntil = (isoTimestamp: string, simNow: string): number =>
  Math.ceil((Date.parse(isoTimestamp) - Date.parse(simNow)) / 86400000);
```

---

## 10. Routing

```tsx
// src/App.tsx
<BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <AppShell>
      <Routes>
        <Route path="/"                    element={<Dashboard />} />
        <Route path="/agents"              element={<AgentRegistry />} />
        <Route path="/agents/new"          element={<AgentRegistrationForm />} />
        <Route path="/agents/:agentId"     element={<AgentDetail />} />
        <Route path="/reviews"             element={<ReviewHistory />} />
        <Route path="/reviews/:reviewId"   element={<ReviewReportDetail />} />
        <Route path="/simulator"           element={<ApiSimulator />} />
        <Route path="/audit-log"           element={<AuditLog />} />
        <Route path="*"                    element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
    <Toaster />
  </QueryClientProvider>
</BrowserRouter>
```

**`AppShell`** renders:
- `Sidebar` on the left (nav links + role-aware visibility)
- `Topbar` at the top (`RoleSwitcher` + `SimClockWidget`)
- `<Outlet />` / children in the main content area

---

## 11. Environment & Running Locally

**.env file:**
```
VITE_API_BASE_URL=http://localhost:4000/api
```

**Scripts in `package.json`:**
```json
{
  "scripts": {
    "dev":     "vite",
    "build":   "tsc && vite build",
    "preview": "vite preview",
    "lint":    "eslint src --ext .ts,.tsx"
  }
}
```

**Running both backend and frontend:**
```bash
# Terminal 1 — backend
cd aim-backend && npm run dev   # http://localhost:4000

# Terminal 2 — frontend
cd aim-frontend && npm run dev  # http://localhost:5173
```

**CORS:** The backend's Express app must allow the Vite dev server origin:
```typescript
// src/app.ts (backend)
app.use(cors({ origin: 'http://localhost:5173' }));
```

---

## 12. How Frontend Connects to Backend

Every user action maps to a specific API call:

| User action in UI | Frontend | Backend |
|---|---|---|
| Page loads | `useDashboard()` fires | `GET /api/dashboard/stats` |
| Open /agents | `useAgentList()` fires | `GET /api/agents` |
| Filter agents | filters change → query refires | `GET /api/agents?team=...&status=...` |
| Click agent row | navigate to `/agents/:id` | — |
| Agent detail loads | `useAgentDetail()` + `useCredentials()` | `GET /api/agents/:id` + `GET /api/agents/:id/credentials` |
| Submit registration form | `useRegisterAgent()` mutation fires | `POST /api/agents` |
| Close credential modal | `fullToken` cleared from state | — (token gone forever) |
| Click "Rotate Credential" | confirmation dialog → `useRotateCredential()` | `POST /api/agents/:id/credentials/rotate` |
| Click "Suspend" | `useSuspendAgent()` | `POST /api/agents/:id/suspend` |
| Click "Decommission" | type name dialog → `useDecommissionAgent()` | `POST /api/agents/:id/decommission` |
| Send test call | `useSimulatorCall()` mutation | `POST /api/simulate-call` |
| Click "+7 days" (clock) | `devClockApi.advance(7)` → toast(s) → `queryClient.invalidateQueries()` | `POST /api/dev/clock/advance` |
| Click "Run Access Review" | `useRunReview()` mutation → navigate to report | `POST /api/reviews/run` |
| Open review report | `useReviewReport(id)` | `GET /api/reviews/:id` |
| "Suspend" stale agent from report | `useSuspendAgent()` | `POST /api/agents/:id/suspend` |
| Export audit log CSV | `auditLogApi.export()` → `<a download>` | `GET /api/audit-log?limit=9999` |

**The `X-Role` header** is sent automatically by the Axios interceptor on every request. The backend uses it to allow or reject actions. If the backend returns `403 FORBIDDEN`, the frontend shows an error toast — it should never reach this state if the UI correctly hides/disables actions the current role cannot perform, but the backend enforces it regardless.