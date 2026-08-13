export type CredentialStatus = 'active' | 'revoked' | 'expired';
export type RevokedReason = 'rotated' | 'manual_revoke' | 'expired';

export interface Credential {
 credentialId: string;
 agentId: string;
 tokenPreview: string;
 scopes: string[];
 issuedAt: string;
 expiresAt: string;
 status: CredentialStatus;
 revokedAt: string | null;
 revokedReason: RevokedReason | null;
}

export interface CredentialWithToken extends Credential {
 fullToken: string;
}
