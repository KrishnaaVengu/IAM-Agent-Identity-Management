import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  CheckCircle,
  PauseCircle,
  AlertTriangle,
  Clock,
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
import StatCard from '../components/dashboard/StatCard';
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

      {/* Stat Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Agents" value={stats.summary.totalAgents} icon={Bot} variant="default" />
        <StatCard label="Active" value={stats.summary.active} icon={CheckCircle} variant="success" />
        <StatCard label="Suspended" value={stats.summary.suspended} icon={PauseCircle} variant="warning" />
        <StatCard label="Stale (30d+)" value={stats.summary.stale} icon={AlertTriangle} variant="warning" />
        <StatCard label="Expiring (7d)" value={stats.summary.expiringWithin7Days} icon={Clock} variant="danger" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
