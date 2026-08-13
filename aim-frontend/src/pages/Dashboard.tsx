import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
 Plus,
 ClipboardCheck,
 Loader2
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useAgentList } from '../hooks/useAgents';
import { useRotateCredential } from '../hooks/useCredentials';
import { useRunReview } from '../hooks/useReviews';
import { useClockStore } from '../stores/clockStore';
import { useToastStore } from '../stores/toastStore';
import { usePermission } from '../hooks/usePermission';
import ScopeDistributionChart from '../components/dashboard/ScopeDistributionChart';
import AgentsByTeamChart from '../components/dashboard/AgentsByTeamChart';
import ExpiryTimelineChart from '../components/dashboard/ExpiryTimelineChart';
import AttentionList from '../components/dashboard/AttentionList';
import RotateCredentialDialog from '../components/credentials/RotateCredentialDialog';
import CredentialRevealModal from '../components/credentials/CredentialRevealModal';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import type { AgentIdentity } from '../types/agent';
import type { CredentialWithToken } from '../types/credential';

export const Dashboard: React.FC = () => {
 const navigate = useNavigate();
 const simNow = useClockStore((s) => s.simNow);
 const pushToast = useToastStore((s) => s.push);

 const { data: stats, isLoading, error, refetch } = useDashboard();
 const { data: agentList } = useAgentList();
 const runReviewMutation = useRunReview();
 const rotateMutation = useRotateCredential();

 const canRegister = usePermission('register');
 const canRunReview = usePermission('review');

 const [rotatingAgent, setRotatingAgent] = useState<AgentIdentity | null>(null);
 const [newCredential, setNewCredential] = useState<CredentialWithToken | null>(null);

 if (isLoading) return <LoadingSpinner />;
 if (error || !stats) {
 return (
 <ErrorBanner
 message={error instanceof Error ? error.message : 'Failed to load dashboard stats.'}
 onRetry={refetch}
 />
 );
 }

 const handleRunReview = async () => {
 try {
 const res = await runReviewMutation.mutateAsync('Admin');
 pushToast({
 title: 'Access Review Completed',
 description: 'New access review report generated successfully.',
 variant: 'default',
 });
 navigate(`/reviews/${res.data.reviewId}`);
 } catch (err: any) {
 pushToast({
 title: 'Review Failed',
 description: err?.response?.data?.error?.message || 'Failed to trigger access review.',
 variant: 'destructive',
 });
 }
 };

 const handleRotateConfirm = async (lifetimeDays?: number) => {
 if (!rotatingAgent) return;
 try {
 const res = await rotateMutation.mutateAsync({
 agentId: rotatingAgent.agentId,
 lifetimeDays,
 });
 setNewCredential(res.data.newCredential);
 pushToast({
 title: 'Credential Rotated',
 description: `Rotated API key for ${rotatingAgent.name}.`,
 variant: 'default',
 });
 setRotatingAgent(null);
 } catch (err: any) {
 pushToast({
 title: 'Rotation Failed',
 description: err?.response?.data?.error?.message || 'Failed to rotate credential.',
 variant: 'destructive',
 });
 }
 };

 return (
 <div className="space-y-6">
 {/* Top Action Bar */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
 <div>
 <h2 className="text-lg font-bold text-slate-900">IAM Console Overview</h2>
 <p className="text-xs text-slate-500">Live operational telemetry & governance controls.</p>
 </div>

 <div className="flex items-center gap-3">
 {canRunReview && (
 <button
 onClick={handleRunReview}
 disabled={runReviewMutation.isPending}
 className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
 >
 {runReviewMutation.isPending ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
 ) : (
 <ClipboardCheck className="w-3.5 h-3.5 text-blue-400" />
 )}
 <span>Run Access Review</span>
 </button>
 )}

 {canRegister && (
 <button
 onClick={() => navigate('/agents/new')}
 className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
 >
 <Plus className="w-3.5 h-3.5 text-white" />
 <span>Register New Agent</span>
 </button>
 )}
 </div>
 </div>

 {/* Unified Operational Telemetry Bar */}
 <div id="tour-telemetry-bar" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-stretch">
 {/* Primary Metric (Left - 30% Width) */}
 <div className="w-full md:w-[30%] pr-0 md:pr-6 flex flex-col justify-center">
 <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">System Inventory</div>
 <div className="flex items-baseline gap-3 mb-2">
 <span className="text-4xl font-extrabold text-slate-900">{stats.summary.totalAgents}</span>
 <span className="text-sm font-medium text-slate-500">Registered Agents</span>
 </div>
 <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 w-fit mb-3">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
 <span className="text-xs font-semibold text-slate-700">{Math.round((stats.summary.active / (stats.summary.totalAgents || 1)) * 100)}% Active</span>
 </div>
 {/* Progress Bar */}
 <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-100">
 <div style={{ width: `${(stats.summary.active / (stats.summary.totalAgents || 1)) * 100}%` }} className="bg-emerald-500" />
 <div style={{ width: `${(stats.summary.suspended / (stats.summary.totalAgents || 1)) * 100}%` }} className="bg-amber-500" />
 <div style={{ width: `${(stats.summary.stale / (stats.summary.totalAgents || 1)) * 100}%` }} className="bg-orange-500" />
 <div style={{ width: `${(stats.summary.expiringWithin7Days / (stats.summary.totalAgents || 1)) * 100}%` }} className="bg-rose-500" />
 </div>
 </div>

 {/* Vertical Divider */}
 <div className="hidden md:block w-px bg-slate-200 my-1 mx-6"></div>
 <div className="block md:hidden h-px bg-slate-200 my-6 mx-1"></div>

 {/* Secondary Status Breakdown (Right - 70% Width) */}
 <div className="w-full md:w-[70%] grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-0 md:flex md:items-center md:justify-between md:divide-x divide-slate-100">
 <div className="flex-1 px-2 md:px-4 text-center md:text-left">
 <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.summary.active}</div>
 <div className="flex items-center justify-center md:justify-start text-sm font-medium text-slate-600">
 <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full inline-block mr-2"></span>
 Active
 </div>
 </div>
 
 <div className="flex-1 px-2 md:px-4 text-center md:text-left">
 <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.summary.suspended}</div>
 <div className="flex items-center justify-center md:justify-start text-sm font-medium text-slate-600">
 <span className="bg-amber-500 w-2.5 h-2.5 rounded-full inline-block mr-2"></span>
 Suspended
 </div>
 </div>

 <div className="flex-1 px-2 md:px-4 text-center md:text-left">
 <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.summary.stale}</div>
 <div className="flex items-center justify-center md:justify-start text-sm font-medium text-slate-600">
 <span className="bg-orange-500 w-2.5 h-2.5 rounded-full inline-block mr-2"></span>
 Needing Review
 </div>
 </div>

 <div className="flex-1 px-2 md:px-4 text-center md:text-left">
 <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">{stats.summary.expiringWithin7Days}</div>
 <div className="flex items-center justify-center md:justify-start text-sm font-medium text-slate-600">
 <span className="bg-rose-500 w-2.5 h-2.5 rounded-full inline-block mr-2"></span>
 Expiring Soon
 </div>
 </div>
 </div>
 </div>

 {/* Charts Grid */}
 <div id="tour-analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <ScopeDistributionChart data={stats.scopeDistribution} />
 <AgentsByTeamChart data={stats.agentsByTeam} />
 </div>

 {/* Expiry Timeline Chart */}
 <ExpiryTimelineChart data={stats.expiryTimeline} simNow={simNow} />

 {/* Attention Needed Panel */}
 <AttentionList
 attentionNeeded={stats.attentionNeeded}
 agents={agentList || []}
 simNow={simNow}
 onRotateAgent={(agentId) => {
 const found = agentList?.find((a) => a.agentId === agentId);
 if (found) setRotatingAgent(found);
 }}
 />

 {/* Rotation & Reveal Dialogs */}
 {rotatingAgent && (
 <RotateCredentialDialog
 open={!!rotatingAgent}
 onOpenChange={(open) => !open && setRotatingAgent(null)}
 agent={rotatingAgent}
 onConfirm={handleRotateConfirm}
 isLoading={rotateMutation.isPending}
 />
 )}

 {newCredential && (
 <CredentialRevealModal
 open={!!newCredential}
 credential={newCredential}
 agentName={newCredential.agentId}
 onClose={() => setNewCredential(null)}
 />
 )}
 </div>
 );
};

export default Dashboard;
