import client from './client';
import type { AuditLogEntry, AuditLogFilters } from '../types/auditLog';

export const auditLogApi = {
  list: (filters?: AuditLogFilters): Promise<{ data: AuditLogEntry[] }> =>
    client.get('/audit-log', { params: filters }),
};
