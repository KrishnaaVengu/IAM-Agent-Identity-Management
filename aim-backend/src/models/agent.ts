export interface AgentIdentity {
  agentId: string;
  name: string;
  purpose: string;
  owningTeam: string;
  createdAt: string;
  expiryDate: string;
  approvedScopes: string[];
  status: 'active' | 'suspended' | 'decommissioned';
  lastApiCallAt: string | null;
  currentCredentialId: string | null;
  registeredBy: string;
  requestedLifetimeDays: number;
}
