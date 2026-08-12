export interface ApiCallLogEntry {
  id: string;
  agentId: string;
  credentialId: string;
  timestamp: string;
  endpoint: string;
  requiredScope: string;
  result: 'ALLOWED' | 'DENIED';
  reasonCode: string | null;
}
