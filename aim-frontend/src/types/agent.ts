export type AgentStatus = 'active' | 'suspended' | 'decommissioned';

export interface AgentIdentity {
  agentId: string;
  name: string;
  purpose: string;
  owningTeam: string;
  createdAt: string;
  expiryDate: string;
  approvedScopes: string[];
  status: AgentStatus;
  lastApiCallAt: string | null;
  lastActiveAt?: string | null;
  currentCredentialId: string | null;
  registeredBy: string;
  requestedLifetimeDays: number;
}

export interface RegisterAgentPayload {
  name: string;
  purpose: string;
  owningTeam: string;
  requestedScopes: string[];
  requestedLifetimeDays: 7 | 30 | 90;
}

export interface AgentFilters {
  team?: string;
  status?: AgentStatus;
  stale?: boolean;
  scope?: string;
  q?: string;
}
