import client from './client';
import type { EndpointDefinition } from '../types/scopeCatalog';

export interface SimulatorCallResult {
 result: 'ALLOWED' | 'DENIED';
 statusCode: number;
 reasonCode: string;
 message: string;
 endpoint: string;
 requiredScope?: string;
 payload?: Record<string, unknown>;
}

export const simulatorApi = {
 call: (
 agentId: string,
 endpointId: string
 ): Promise<{ data: SimulatorCallResult }> =>
 client.post('/simulator/execute', { agentId, endpointId }),

 execute: (
 token: string,
 scopeRequired: string,
 agentId?: string
 ): Promise<{ data: SimulatorCallResult }> =>
 client.post(
 '/simulator/execute',
 { token, scope_required: scopeRequired, agentId },
 { headers: { Authorization: `Bearer ${token}` } }
 ),

 listEndpoints: (): Promise<{ data: EndpointDefinition[] }> =>
 client.get('/simulate-call/endpoints'),
};
