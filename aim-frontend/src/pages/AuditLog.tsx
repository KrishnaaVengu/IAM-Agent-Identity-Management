import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
 ScrollText,
 Download,
 Filter,
 X,
 ChevronLeft,
 ChevronRight,
 ShieldCheck,
 User,
 Eye,
 Bot,
 ChevronDown
} from 'lucide-react';

import { useAuditLog } from '../hooks/useAuditLog';
import { useAgentList } from '../hooks/useAgents';
import { auditLogApi } from '../api/auditLog';
import { useToastStore } from '../stores/toastStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import EmptyState from '../components/shared/EmptyState';

import { formatDateTime } from '../lib/utils';
import type { AuditEventType, AuditLogEntry } from '../types/auditLog';
import type { AgentIdentity } from '../types/agent';

const ALL_EVENT_TYPES: { value: AuditEventType; label: string }[] = [
 { value: 'AGENT_REGISTERED', label: 'AGENT_REGISTERED' },
 { value: 'AGENT_REACTIVATED', label: 'AGENT_REACTIVATED' },
 { value: 'SCOPE_CALL_ALLOWED', label: 'SCOPE_CALL_ALLOWED' },
 { value: 'CREDENTIAL_ISSUED', label: 'CREDENTIAL_ISSUED' },
 { value: 'CREDENTIAL_ROTATED', label: 'CREDENTIAL_ROTATED' },
 { value: 'AGENT_SUSPENDED', label: 'AGENT_SUSPENDED' },
 { value: 'REVIEW_RUN', label: 'REVIEW_RUN' },
 { value: 'CREDENTIAL_REVOKED', label: 'CREDENTIAL_REVOKED' },
 { value: 'AGENT_DECOMMISSIONED', label: 'AGENT_DECOMMISSIONED' },
 { value: 'AUTO_REVOKED', label: 'AUTO_REVOKED' },
 { value: 'SCOPE_CALL_DENIED', label: 'SCOPE_CALL_DENIED' },
];

const ACTOR_ROLES = ['Admin', 'Team Owner', 'Viewer', 'System'];

export const AuditLog: React.FC = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const pushToast = useToastStore((s) => s.push);
 const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

 // Extract filter parameters from URL
 const eventTypeParam = searchParams.get('eventType') || '';
 const agentIdParam = searchParams.get('agentId') || '';
 const actorRoleParam = searchParams.get('actorRole') || '';
 const fromParam = searchParams.get('from') || '';
 const toParam = searchParams.get('to') || '';
 const pageParam = parseInt(searchParams.get('page') || '1', 10);

 const filters = useMemo(() => {
 const f: any = { page: pageParam, limit: 50 };
 if (eventTypeParam) f.eventType = eventTypeParam as AuditEventType;
 if (agentIdParam) f.agentId = agentIdParam;
 if (actorRoleParam) f.actorRole = actorRoleParam;
 if (fromParam) f.from = fromParam;
 if (toParam) f.to = toParam;
 return f;
 }, [eventTypeParam, agentIdParam, actorRoleParam, fromParam, toParam, pageParam]);

 const { data: rawAuditData, isLoading, error, refetch } = useAuditLog(filters);
 const { data: agentListData } = useAgentList();

 const agents: AgentIdentity[] = Array.isArray(agentListData) ? agentListData : (agentListData as any)?.agents || [];

 // Parse entries and pagination safely
 const entries: AuditLogEntry[] = Array.isArray(rawAuditData)
 ? rawAuditData
 : (rawAuditData as any)?.entries || [];

 const pagination = (rawAuditData as any)?.pagination || {
 page: pageParam,
 limit: 50,
 total: entries.length,
 totalPages: Math.ceil(entries.length / 50) || 1,
 };

 // Helper to update search params
 const updateFilter = (key: string, value: string) => {
 setSearchParams((prev) => {
 const next = new URLSearchParams(prev);
 if (value) {
 next.set(key, value);
 } else {
 next.delete(key);
 }
 next.set('page', '1'); // Reset to page 1 on filter change
 return next;
 });
 };

 const handleClearFilters = () => {
 setSearchParams(new URLSearchParams({ page: '1' }));
 };

 const handlePageChange = (newPage: number) => {
 setSearchParams((prev) => {
 const next = new URLSearchParams(prev);
 next.set('page', newPage.toString());
 return next;
 });
 };

 // Handle Export
 const handleExport = async (format: 'cef' | 'csv' | 'json') => {
 try {
 pushToast({
 title: `Preparing ${format.toUpperCase()} Export...`,
 description: 'Generating audit records.',
 variant: 'default',
 });
 setIsExportMenuOpen(false);

 const res = await auditLogApi.export(format);
 const blob = new Blob([res.data]);
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download', `aim-audit-log.${format}`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);

 pushToast({
 title: 'Export Downloaded',
 description: 'Your audit trail has been exported.',
 variant: 'default',
 });
 } catch (err: any) {
 pushToast({
 title: 'Export Failed',
 description: `Failed to generate ${format.toUpperCase()} export.`,
 variant: 'destructive',
 });
 }
 };

 // Helper for Event Type Badge Style
 const getBadgeStyle = (eventType: string) => {
 if (['AGENT_REGISTERED', 'AGENT_REACTIVATED', 'SCOPE_CALL_ALLOWED', 'CREDENTIAL_ISSUED'].includes(eventType)) {
 return 'bg-green-100 text-green-800 border-green-200';
 }
 if (['CREDENTIAL_ROTATED', 'AGENT_SUSPENDED', 'REVIEW_RUN'].includes(eventType)) {
 return 'bg-amber-100 text-amber-800 border-amber-200';
 }
 if (['CREDENTIAL_REVOKED', 'AGENT_DECOMMISSIONED', 'AUTO_REVOKED', 'SCOPE_CALL_DENIED'].includes(eventType)) {
 return 'bg-red-100 text-red-800 border-red-200';
 }
 return 'bg-slate-100 text-slate-700 border-slate-200';
 };

 // Helper for Actor Icon
 const renderActor = (role: string) => {
 const r = (role || '').toLowerCase();
 if (r.includes('admin')) {
 return (
 <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
 <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Admin
 </span>
 );
 }
 if (r.includes('owner') || r.includes('team')) {
 return (
 <span className="inline-flex items-center gap-1 font-semibold text-purple-700">
 <User className="w-3.5 h-3.5 text-purple-600" /> Team Owner
 </span>
 );
 }
 if (r.includes('viewer')) {
 return (
 <span className="inline-flex items-center gap-1 text-slate-600">
 <Eye className="w-3.5 h-3.5 text-slate-500" /> Viewer
 </span>
 );
 }
 if (r.includes('system')) {
 return (
 <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
 <Bot className="w-3.5 h-3.5 text-amber-600" /> System
 </span>
 );
 }
 return (
 <span className="inline-flex items-center gap-1 text-slate-700">
 <User className="w-3.5 h-3.5 text-slate-400" /> {role}
 </span>
 );
 };

 if (isLoading) return <LoadingSpinner />;
 if (error) return <ErrorBanner message="Failed to load global audit log." onRetry={refetch} />;

 const startEntryIndex = (pagination.page - 1) * pagination.limit + 1;
 const endEntryIndex = Math.min(pagination.page * pagination.limit, pagination.total || entries.length);

 return (
 <div className="space-y-6 max-w-6xl mx-auto pb-12">
 {/* Header Card */}
 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
 <div>
 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
 <ScrollText className="w-5 h-5 text-blue-600" />
 Global Security Audit Log
 </h2>
 <p className="text-xs text-slate-500 mt-0.5">
 Immutable system audit trail tracking machine identity lifecycle, authorization checks, and administrative overrides.
 </p>
 </div>

 <div className="relative">
 <button
 type="button"
 onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
 >
 <Download className="w-4 h-4 text-slate-300" /> Export <ChevronDown className="w-3.5 h-3.5" />
 </button>
 {isExportMenuOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
 <button onClick={() => handleExport('cef')} className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-b border-slate-100 cursor-pointer">Export as CEF (SIEM)</button>
 <button onClick={() => handleExport('csv')} className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border-b border-slate-100 cursor-pointer">Export as CSV</button>
 <button onClick={() => handleExport('json')} className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">Export as JSON</button>
 </div>
 )}
 </div>
 </div>

 {/* Filter Bar */}
 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
 <div className="flex items-center justify-between">
 <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
 <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter Audit Trail
 </h3>

 {(eventTypeParam || agentIdParam || actorRoleParam || fromParam || toParam) && (
 <button
 type="button"
 onClick={handleClearFilters}
 className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
 >
 <X className="w-3.5 h-3.5" /> Clear Filters
 </button>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
 {/* Event Type Filter */}
 <div>
 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
 Event Type
 </label>
 <select
 value={eventTypeParam}
 onChange={(e) => updateFilter('eventType', e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">All Events</option>
 {ALL_EVENT_TYPES.map((ev) => (
 <option key={ev.value} value={ev.value}>
 {ev.label}
 </option>
 ))}
 </select>
 </div>

 {/* Agent Filter */}
 <div>
 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
 Target Agent
 </label>
 <select
 value={agentIdParam}
 onChange={(e) => updateFilter('agentId', e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">All Agents</option>
 {agents.map((agent) => (
 <option key={agent.agentId} value={agent.agentId}>
 {agent.name} ({agent.agentId})
 </option>
 ))}
 </select>
 </div>

 {/* Actor Role Filter */}
 <div>
 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
 Actor Role
 </label>
 <select
 value={actorRoleParam}
 onChange={(e) => updateFilter('actorRole', e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 <option value="">All Roles</option>
 {ACTOR_ROLES.map((role) => (
 <option key={role} value={role}>
 {role}
 </option>
 ))}
 </select>
 </div>

 {/* From Date */}
 <div>
 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
 From Date
 </label>
 <input
 type="date"
 value={fromParam}
 onChange={(e) => updateFilter('from', e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />
 </div>

 {/* To Date */}
 <div>
 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
 To Date
 </label>
 <input
 type="date"
 value={toParam}
 onChange={(e) => updateFilter('to', e.target.value)}
 className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 />
 </div>
 </div>
 </div>

 {/* Main Audit Log Table */}
 {entries.length === 0 ? (
 <EmptyState
 title="No audit events found"
 description="Try adjusting your filters or search criteria."
 />
 ) : (
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
 <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
 <th className="py-3.5 px-4">Timestamp</th>
 <th className="py-3.5 px-4">Event Type</th>
 <th className="py-3.5 px-4">Agent Identity</th>
 <th className="py-3.5 px-4">Actor</th>
 <th className="py-3.5 px-4">Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-mono">
 {entries.map((entry) => {
 const agentObj = agents.find((a) => a.agentId === entry.agentId);
 const truncatedDetails =
 entry.details && entry.details.length > 80
 ? `${entry.details.slice(0, 80)}...`
 : entry.details;

 return (
 <tr key={entry.id || Math.random()} className="hover:bg-slate-50/80 transition-colors">
 {/* Timestamp */}
 <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
 {formatDateTime(entry.timestamp)}
 </td>

 {/* Event Type */}
 <td className="py-3.5 px-4 font-sans whitespace-nowrap">
 <span
 className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle(
 entry.eventType
 )}`}
 >
 {entry.eventType}
 </span>
 </td>

 {/* Agent */}
 <td className="py-3.5 px-4 whitespace-nowrap">
 {entry.agentId ? (
 <Link
 to={`/agents/${entry.agentId}`}
 className="font-bold text-blue-600 hover:text-blue-800 hover:underline font-sans"
 >
 {agentObj ? agentObj.name : entry.agentId}
 <span className="block font-mono text-[10px] text-slate-400 font-normal">
 {entry.agentId}
 </span>
 </Link>
 ) : (
 <span className="text-slate-400 italic font-sans">—</span>
 )}
 </td>

 {/* Actor */}
 <td className="py-3.5 px-4 font-sans whitespace-nowrap">
 {renderActor(entry.actorRole)}
 </td>

 {/* Details */}
 <td className="py-3.5 px-4 text-slate-800 font-sans leading-relaxed" title={entry.details}>
 {truncatedDetails}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Pagination Footer */}
 <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
 <div>
 Showing <span className="font-semibold text-slate-900">{startEntryIndex}</span>–
 <span className="font-semibold text-slate-900">{endEntryIndex}</span> of{' '}
 <span className="font-semibold text-slate-900">{pagination.total || entries.length}</span> entries
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => handlePageChange(pagination.page - 1)}
 disabled={pagination.page <= 1}
 className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-medium text-slate-700 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
 >
 <ChevronLeft className="w-3.5 h-3.5" /> Previous
 </button>

 <span className="font-mono text-slate-500 px-1">
 Page {pagination.page} of {pagination.totalPages || 1}
 </span>

 <button
 type="button"
 onClick={() => handlePageChange(pagination.page + 1)}
 disabled={pagination.page >= (pagination.totalPages || 1)}
 className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-medium text-slate-700 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
 >
 Next <ChevronRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

export default AuditLog;
