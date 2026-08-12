import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Bot } from 'lucide-react';
import {
  useAgentList,
  useSuspendAgent,
  useReactivateAgent,
  useDecommissionAgent,
} from '../hooks/useAgents';
import { useRotateCredential } from '../hooks/useCredentials';
import { useClockStore } from '../stores/clockStore';
import { useToastStore } from '../stores/toastStore';
import { usePermission } from '../hooks/usePermission';
import AgentFilters from '../components/agents/AgentFilters';
import AgentTable from '../components/agents/AgentTable';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import RotateCredentialDialog from '../components/credentials/RotateCredentialDialog';
import CredentialRevealModal from '../components/credentials/CredentialRevealModal';
import ErrorBanner from '../components/shared/ErrorBanner';
import type { AgentFilters as AgentFiltersType, AgentIdentity, AgentStatus } from '../types/agent';
import type { CredentialWithToken } from '../types/credential';
import { daysUntil, daysAgo } from '../lib/utils';

export const AgentRegistry: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const simNow = useClockStore((s) => s.simNow);
  const pushToast = useToastStore((s) => s.push);

  const canRegister = usePermission('register');

  // Derive filters from URL search params
  const filters: AgentFiltersType = useMemo(() => {
    const team = searchParams.get('team') || undefined;
    const status = (searchParams.get('status') as AgentStatus) || undefined;
    const stale = searchParams.get('stale') === 'true' || undefined;
    const scope = searchParams.get('scope') || undefined;
    const q = searchParams.get('q') || undefined;
    return { team, status, stale, scope, q };
  }, [searchParams]);

  const { data: agents = [], isLoading, error, refetch } = useAgentList(filters);

  // Mutations
  const suspendMutation = useSuspendAgent();
  const reactivateMutation = useReactivateAgent();
  const rotateMutation = useRotateCredential();
  const decommissionMutation = useDecommissionAgent();

  // Local state for modals & dialogs
  const [suspendingAgent, setSuspendingAgent] = useState<AgentIdentity | null>(null);
  const [rotatingAgent, setRotatingAgent] = useState<AgentIdentity | null>(null);
  const [decommissioningAgent, setDecommissioningAgent] = useState<AgentIdentity | null>(null);
  const [newCredential, setNewCredential] = useState<CredentialWithToken | null>(null);

  // Compute summary stats for current filtered view
  const staleCount = useMemo(() => {
    return agents.filter((a) => a.lastApiCallAt && daysAgo(a.lastApiCallAt, simNow) > 30).length;
  }, [agents, simNow]);

  const expiringSoonCount = useMemo(() => {
    return agents.filter((a) => {
      const left = daysUntil(a.expiryDate, simNow);
      return left > 0 && left <= 7;
    }).length;
  }, [agents, simNow]);

  // Action handlers
  const handleSuspendConfirm = async () => {
    if (!suspendingAgent) return;
    try {
      await suspendMutation.mutateAsync(suspendingAgent.agentId);
      pushToast({
        title: 'Agent Suspended',
        description: `Agent ${suspendingAgent.name} suspended successfully.`,
        variant: 'default',
      });
      setSuspendingAgent(null);
    } catch (err: any) {
      pushToast({
        title: 'Suspension Failed',
        description: err?.response?.data?.error?.message || 'Failed to suspend agent.',
        variant: 'destructive',
      });
    }
  };

  const handleReactivate = async (agent: AgentIdentity) => {
    try {
      await reactivateMutation.mutateAsync(agent.agentId);
      pushToast({
        title: 'Agent Reactivated',
        description: `Agent ${agent.name} is now active.`,
        variant: 'default',
      });
    } catch (err: any) {
      pushToast({
        title: 'Reactivation Failed',
        description: err?.response?.data?.error?.message || 'Failed to reactivate agent.',
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

  const handleDecommissionConfirm = async () => {
    if (!decommissioningAgent) return;
    try {
      await decommissionMutation.mutateAsync({
        agentId: decommissioningAgent.agentId,
        confirmedName: decommissioningAgent.name,
      });
      pushToast({
        title: 'Agent Decommissioned',
        description: `Agent ${decommissioningAgent.name} has been permanently decommissioned.`,
        variant: 'destructive',
      });
      setDecommissioningAgent(null);
    } catch (err: any) {
      pushToast({
        title: 'Decommission Failed',
        description: err?.response?.data?.error?.message || 'Failed to decommission agent.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Agent Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, filter, and govern machine identity credentials across your organization.
          </p>
        </div>

        {canRegister && (
          <button
            onClick={() => navigate('/agents/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Register Agent</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <AgentFilters filters={filters} onChange={() => {}} />

      {/* Results Counter / Info Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <div>
          Showing <span className="font-bold text-slate-800 font-mono">{agents.length}</span> {agents.length === 1 ? 'agent' : 'agents'}
          {(staleCount > 0 || expiringSoonCount > 0) && (
            <span className="ml-2 font-mono text-amber-700 font-normal">
              ({staleCount > 0 ? `${staleCount} stale` : ''}
              {staleCount > 0 && expiringSoonCount > 0 ? ', ' : ''}
              {expiringSoonCount > 0 ? `${expiringSoonCount} expiring soon` : ''})
            </span>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          message={error instanceof Error ? error.message : 'Failed to fetch agent identities.'}
          onRetry={refetch}
        />
      )}

      {/* Agent Table */}
      <AgentTable
        agents={agents}
        simNow={simNow}
        isLoading={isLoading}
        onSuspend={(agent) => setSuspendingAgent(agent)}
        onReactivate={(agent) => handleReactivate(agent)}
        onRotate={(agent) => setRotatingAgent(agent)}
        onDecommission={(agent) => setDecommissioningAgent(agent)}
      />

      {/* Suspend Confirmation Dialog */}
      {suspendingAgent && (
        <ConfirmDialog
          open={!!suspendingAgent}
          onOpenChange={(open) => !open && setSuspendingAgent(null)}
          title="Suspend Agent Identity"
          description={`Are you sure you want to suspend "${suspendingAgent.name}"? Active API calls using this identity will be rejected until reactivated.`}
          confirmLabel="Suspend Agent"
          variant="destructive"
          onConfirm={handleSuspendConfirm}
          isLoading={suspendMutation.isPending}
        />
      )}

      {/* Rotate Credential Dialog */}
      {rotatingAgent && (
        <RotateCredentialDialog
          open={!!rotatingAgent}
          onOpenChange={(open) => !open && setRotatingAgent(null)}
          agent={rotatingAgent}
          onConfirm={handleRotateConfirm}
          isLoading={rotateMutation.isPending}
        />
      )}

      {/* Credential Reveal Modal */}
      {newCredential && (
        <CredentialRevealModal
          open={!!newCredential}
          credential={newCredential}
          agentName={newCredential.agentId}
          onClose={() => setNewCredential(null)}
        />
      )}

      {/* Decommission Confirmation Dialog */}
      {decommissioningAgent && (
        <ConfirmDialog
          open={!!decommissioningAgent}
          onOpenChange={(open) => !open && setDecommissioningAgent(null)}
          title="Decommission Agent Identity"
          description={`Decommissioning is PERMANENT and will permanently revoke all active API credentials for "${decommissioningAgent.name}".`}
          confirmLabel="Decommission Agent"
          requireTypedConfirmation={decommissioningAgent.name}
          variant="destructive"
          onConfirm={handleDecommissionConfirm}
          isLoading={decommissionMutation.isPending}
        />
      )}
    </div>
  );
};

export default AgentRegistry;
