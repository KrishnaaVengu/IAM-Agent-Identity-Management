import client from './client';
import type { AgentIdentity, RegisterAgentPayload, AgentFilters } from '../types/agent';
import type { CredentialWithToken } from '../types/credential';

export const agentsApi = {
 list: (filters?: AgentFilters): Promise<{ data: { agents: AgentIdentity[] } }> =>
 client.get('/agents', { params: filters }),

 get: (agentId: string): Promise<{ data: { agent: AgentIdentity } }> =>
 client.get(`/agents/${agentId}`),

 register: (
 payload: RegisterAgentPayload
 ): Promise<{ data: { agent: AgentIdentity; credential: CredentialWithToken } }> =>
 client.post('/agents', payload),

 suspend: (agentId: string): Promise<{ data: { agent: AgentIdentity } }> =>
 client.post(`/agents/${agentId}/suspend`),

 reactivate: (agentId: string): Promise<{ data: { agent: AgentIdentity } }> =>
 client.post(`/agents/${agentId}/reactivate`),

 decommission: (
 agentId: string,
 confirmedName: string
 ): Promise<{ data: { agent: AgentIdentity } }> =>
 client.post(`/agents/${agentId}/decommission`, { confirmedName }),

 getPendingScopeRequests: (): Promise<{ data: any[] }> =>
 client.get('/agents/scope-requests/pending'),

 requestScope: (agentId: string, scope: string): Promise<{ data: any }> =>
 client.post(`/agents/${agentId}/request-scope`, { scope }),

 approveScopeRequest: (requestId: string): Promise<{ data: any }> =>
 client.post(`/agents/scope-requests/${requestId}/approve`),

 rejectScopeRequest: (requestId: string): Promise<{ data: any }> =>
 client.post(`/agents/scope-requests/${requestId}/reject`),
};
