export type AuditEventType =
 | 'AGENT_REGISTERED' | 'CREDENTIAL_ISSUED' | 'CREDENTIAL_ROTATED'
 | 'CREDENTIAL_REVOKED' | 'AGENT_SUSPENDED' | 'AGENT_REACTIVATED'
 | 'AGENT_DECOMMISSIONED' | 'AUTO_REVOKED' | 'REVIEW_RUN'
 | 'SCOPE_CALL_ALLOWED' | 'SCOPE_CALL_DENIED';

export interface AuditLogEntry {
 id: string;
 timestamp: string;
 eventType: AuditEventType;
 agentId: string | null;
 actorRole: string;
 details: string;
}

export interface AuditLogFilters {
 eventType?: AuditEventType;
 agentId?: string;
 actorRole?: string;
 from?: string;
 to?: string;
 page?: number;
 limit?: number;
}
