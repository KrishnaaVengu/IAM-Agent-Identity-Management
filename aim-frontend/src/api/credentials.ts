import client from './client';
import type { Credential, CredentialWithToken } from '../types/credential';

export const credentialsApi = {
  history: (agentId: string): Promise<{ data: Credential[] }> =>
    client.get(`/agents/${agentId}/credentials`),

  rotate: (
    agentId: string,
    lifetimeDays?: number
  ): Promise<{
    data: { revokedCredentialId: string; newCredential: CredentialWithToken };
  }> => client.post(`/agents/${agentId}/credentials/rotate`, { lifetimeDays }),
};
