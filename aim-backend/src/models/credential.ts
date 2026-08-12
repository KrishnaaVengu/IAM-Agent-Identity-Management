export interface Credential {
  credentialId: string;
  agentId: string;
  tokenPreview: string;
  fullToken: string;
  scopes: string[];
  issuedAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
  revokedAt: string | null;
  revokedReason: 'rotated' | 'manual_revoke' | 'expired' | null;
}
