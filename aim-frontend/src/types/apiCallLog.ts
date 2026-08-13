export type CallResult = 'ALLOWED' | 'DENIED';

export interface ApiCallLogEntry {
 id: string;
 agentId: string;
 credentialId: string;
 timestamp: string;
 endpoint: string;
 requiredScope: string;
 result: CallResult;
 reasonCode: string | null;
}
