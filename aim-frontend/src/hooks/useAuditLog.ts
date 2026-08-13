import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '../api/auditLog';
import type { AuditLogFilters } from '../types/auditLog';

export const useAuditLog = (filters?: AuditLogFilters) => {
 return useQuery({
 queryKey: ['auditLog', filters],
 queryFn: async () => {
 const res = await auditLogApi.list(filters);
 return res.data;
 },
 });
};
