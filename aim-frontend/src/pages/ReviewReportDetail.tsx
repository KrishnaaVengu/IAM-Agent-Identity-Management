import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
 ArrowLeft,
 Download,
 Lock,
 Mail
} from 'lucide-react';

import { useReviewDetail } from '../hooks/useReviews';
import { useAgentList, useSuspendAgent, useDecommissionAgent } from '../hooks/useAgents';
import { useClockStore } from '../stores/clockStore';
import { useToastStore } from '../stores/toastStore';

import ReviewReportCard from '../components/reviews/ReviewReportCard';
import StaleAgentTable from '../components/reviews/StaleAgentTable';
import TeamBreakdownAccordion from '../components/reviews/TeamBreakdownAccordion';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';

import { formatDateTime, formatDate } from '../lib/utils';
import type { AgentIdentity } from '../types/agent';

export const ReviewReportDetail: React.FC = () => {
 const { reviewId } = useParams<{ reviewId: string }>();
 const navigate = useNavigate();
 const simNow = useClockStore((s) => s.simNow);
 const pushToast = useToastStore((s) => s.push);

 const { data: report, isLoading: isReportLoading, error: reportError } = useReviewDetail(reviewId || '');
 const { data: agentList, isLoading: isAgentsLoading, refetch: refetchAgents } = useAgentList();

 const suspendMutation = useSuspendAgent();
 const decommissionMutation = useDecommissionAgent();

 // Confirmation dialogs
 const [suspendTargetId, setSuspendTargetId] = useState<string | null>(null);
 const [decommissionTargetId, setDecommissionTargetId] = useState<string | null>(null);

 const agents: AgentIdentity[] = Array.isArray(agentList) ? agentList : (agentList as any)?.agents || [];

 if (isReportLoading || isAgentsLoading) return <LoadingSpinner />;
 if (reportError || !report) {
 return (
 <div className="space-y-4 max-w-4xl mx-auto py-8">
 <ErrorBanner message="Access Review Report not found." />
 <button
 onClick={() => navigate('/reviews')}
 className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" /> Back to Review History
 </button>
 </div>
 );
 }

 // Handle Export CSV
 const handleExportCSV = () => {
 const headers = ['Team', 'Agent ID', 'Agent Name', 'Status', 'Stale', 'Last API Call', 'Scopes', 'Expires'];

 const rows = agents.map((agent) => {
 const isStale = report.staleAgentIds?.includes(agent.agentId);
 const scopesStr = (agent.approvedScopes || []).join('; ');
 const lastCall = agent.lastApiCallAt || agent.lastActiveAt;
 return [
 `"${agent.owningTeam || ''}"`,
 `"${agent.agentId || ''}"`,
 `"${agent.name || ''}"`,
 `"${agent.status || ''}"`,
 `"${isStale ? 'YES' : 'NO'}"`,
 `"${lastCall ? formatDateTime(lastCall) : 'Never'}"`,
 `"${scopesStr}"`,
 `"${agent.expiryDate ? formatDate(agent.expiryDate) : ''}"`,
 ].join(',');
 });

 const csvContent = [headers.join(','), ...rows].join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download', `access-review-${report.reviewId}-${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);

 pushToast({
 title: 'CSV Export Generated',
 description: 'Downloaded complete machine identity access audit log as CSV.',
 variant: 'default',
 });
 };

 // Suspend Handler
 const handleSuspendConfirm = async () => {
 if (!suspendTargetId) return;
 try {
 await suspendMutation.mutateAsync(suspendTargetId);
 setSuspendTargetId(null);
 refetchAgents();
 pushToast({
 title: 'Agent Suspended',
 description: `Successfully suspended agent identity ${suspendTargetId}.`,
 variant: 'default',
 });
 } catch (err: any) {
 pushToast({
 title: 'Action Failed',
 description: err?.response?.data?.error?.message || 'Failed to suspend agent.',
 variant: 'destructive',
 });
 }
 };

 // Decommission Handler
 const handleDecommissionConfirm = async () => {
 if (!decommissionTargetId) return;
 const targetAgent = agents.find((a) => a.agentId === decommissionTargetId);
 try {
 await decommissionMutation.mutateAsync({
 agentId: decommissionTargetId,
 confirmedName: targetAgent ? targetAgent.name : decommissionTargetId,
 });
 setDecommissionTargetId(null);
 refetchAgents();
 pushToast({
 title: 'Agent Decommissioned',
 description: `Permanently decommissioned agent identity ${decommissionTargetId}.`,
 variant: 'destructive',
 });
 } catch (err: any) {
 pushToast({
 title: 'Action Failed',
 description: err?.response?.data?.error?.message || 'Failed to decommission agent.',
 variant: 'destructive',
 });
 }
 };

 const suspendTargetAgent = agents.find((a) => a.agentId === suspendTargetId);
 const decommissionTargetAgent = agents.find((a) => a.agentId === decommissionTargetId);

 return (
 <div className="space-y-6 max-w-6xl mx-auto pb-12">
 {/* Back button */}
 <div>
 <button
 onClick={() => navigate('/reviews')}
 className="text-xs font-mono text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
 >
 <ArrowLeft className="w-3.5 h-3.5" /> Back to Review History
 </button>
 </div>

 {/* Header Card */}
 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <div>
 <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
 Access Review Report
 </h1>
 <div className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-3">
 <span>Run Date: {formatDateTime(report.runAt)}</span>
 <span>·</span>
 <span>Report ID: {report.reviewId}</span>
 <span>·</span>
 <span>Auditor: {report.runBy || 'Admin'}</span>
 </div>
 </div>

 <button
 type="button"
 onClick={handleExportCSV}
 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
 >
 <Download className="w-4 h-4 text-slate-300" /> Export CSV
 </button>
 </div>

 {/* Summary Stat Tiles */}
 <ReviewReportCard report={report} />

 {/* Stale Agents Action Panel */}
 {report.staleAgentIds && report.staleAgentIds.length > 0 && (
 <StaleAgentTable
 staleAgentIds={report.staleAgentIds}
 agents={agents}
 simNow={simNow}
 onSuspend={(id) => setSuspendTargetId(id)}
 onDecommission={(id) => setDecommissionTargetId(id)}
 />
 )}

 {/* Team Breakdown Accordion */}
 <TeamBreakdownAccordion
 teamBreakdown={report.teamBreakdown}
 staleAgentIds={report.staleAgentIds || []}
 agents={agents}
 onSuspend={(id) => setSuspendTargetId(id)}
 onDecommission={(id) => setDecommissionTargetId(id)}
 />

 {/* Sensitive Scope Holders Callout (Amber Box) */}
 {report.sensitiveScopeHolders && report.sensitiveScopeHolders.length > 0 && (
 <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
 <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wider">
 <Lock className="w-4 h-4 text-amber-600" />
 Sensitive Scope Holders ({report.sensitiveScopeHolders.length})
 </h3>
 <p className="text-xs text-amber-800">
 The following agent identities hold sensitive scopes (e.g., financial ledger read/write, user deletion, or infrastructure deployment grants). Verify these grants periodically.
 </p>

 <div className="flex items-center gap-2 flex-wrap pt-1">
 {report.sensitiveScopeHolders.map((agentId) => {
 const holderAgent = agents.find((a) => a.agentId === agentId);
 return (
 <span
 key={agentId}
 className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-900 shadow-xs flex items-center gap-1.5"
 >
 <Lock className="w-3 h-3 text-amber-600" />
 {holderAgent ? holderAgent.name : agentId} ({agentId})
 </span>
 );
 })}
 </div>
 </div>
 )}

 {/* Gray Info Box */}
 <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-slate-600 text-xs">
 <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
 <p>
 <span className="font-semibold text-slate-800">Automated Notification Info:</span> In production, this audit review report is automatically generated on schedule and emailed to each team's distribution list for governance compliance.
 </p>
 </div>

 {/* Suspend Confirm Dialog */}
 <ConfirmDialog
 open={!!suspendTargetId}
 onOpenChange={(open) => !open && setSuspendTargetId(null)}
 title={`Suspend Agent '${suspendTargetAgent ? suspendTargetAgent.name : suspendTargetId}'`}
 description="Suspending this agent will immediately revoke its active credential and block all API calls until reactivated."
 confirmLabel="Suspend Agent"
 onConfirm={handleSuspendConfirm}
 isLoading={suspendMutation.isPending}
 variant="destructive"
 />

 {/* Decommission Confirm Dialog */}
 <ConfirmDialog
 open={!!decommissionTargetId}
 onOpenChange={(open) => !open && setDecommissionTargetId(null)}
 title={`Decommission Agent '${decommissionTargetAgent ? decommissionTargetAgent.name : decommissionTargetId}'`}
 description={`This action is permanent and irreversible. Type '${decommissionTargetAgent ? decommissionTargetAgent.name : decommissionTargetId}' below to confirm.`}
 requireTypedConfirmation={decommissionTargetAgent ? decommissionTargetAgent.name : decommissionTargetId || undefined}
 confirmLabel="Decommission Agent"
 onConfirm={handleDecommissionConfirm}
 isLoading={decommissionMutation.isPending}
 variant="destructive"
 />
 </div>
 );
};

export default ReviewReportDetail;
