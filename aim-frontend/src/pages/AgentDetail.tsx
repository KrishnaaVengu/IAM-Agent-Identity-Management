import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Lock,
  SendHorizontal,
  CheckCircle,
  XCircle,
  Shield,
  Key,
  ScrollText,
  Activity
} from 'lucide-react';

import {
  useAgentDetail,
  useSuspendAgent,
  useReactivateAgent,
  useDecommissionAgent,
} from '../hooks/useAgents';
import { useCredentialHistory, useRotateCredential } from '../hooks/useCredentials';
import { useAuditLog } from '../hooks/useAuditLog';
import { useSimulatorCall, useEndpointList } from '../hooks/useSimulator';
import { useClockStore } from '../stores/clockStore';
import { useToastStore } from '../stores/toastStore';
import { usePermission } from '../hooks/usePermission';

import AgentStatusBadge from '../components/agents/AgentStatusBadge';
import ExpiryProgressBar from '../components/agents/ExpiryProgressBar';
import CredentialHistoryTable from '../components/credentials/CredentialHistoryTable';
import RotateCredentialDialog from '../components/credentials/RotateCredentialDialog';
import CredentialRevealModal from '../components/credentials/CredentialRevealModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';

import { SCOPE_CATALOG } from '../lib/scopeCatalog';
import { daysUntil, daysAgo, formatDateTime, formatDate } from '../lib/utils';
import type { CredentialWithToken } from '../types/credential';
import type { SimulatorCallResult } from '../api/simulator';
import type { EndpointDefinition } from '../types/scopeCatalog';

export const AgentDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const simNow = useClockStore((s) => s.simNow);
  const pushToast = useToastStore((s) => s.push);

  const [activeTab, setActiveTab] = useState<'overview' | 'credential' | 'calls' | 'audit'>('overview');

  // Permission guards
  const canRotate = usePermission('rotate');
  const canSuspend = usePermission('suspend');
  const canReactivate = usePermission('reactivate');
  const canDecommission = usePermission('decommission');

  // Dialog state
  const [rotateOpen, setRotateOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [decommissionConfirmOpen, setDecommissionConfirmOpen] = useState(false);
  const [newCredential, setNewCredential] = useState<CredentialWithToken | null>(null);

  // Call simulation state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET /api/v1/documents');
  const [callHistory, setCallHistory] = useState<
    Array<{ timestamp: string; result: SimulatorCallResult }>
  >([]);

  // Data fetching hooks
  const { data: agent, isLoading: isAgentLoading, error: agentError, refetch: refetchAgent } = useAgentDetail(agentId || '');
  const { data: credHistoryData, refetch: refetchCreds } = useCredentialHistory(agentId || '');
  const { data: auditLogData, refetch: refetchAudit } = useAuditLog({ agentId: agentId || '' });
  const { data: endpointsData } = useEndpointList();

  // Mutations
  const suspendMutation = useSuspendAgent();
  const reactivateMutation = useReactivateAgent();
  const decommissionMutation = useDecommissionAgent();
  const rotateMutation = useRotateCredential();
  const simulateCallMutation = useSimulatorCall();

  if (isAgentLoading) return <LoadingSpinner />;

  if (agentError || !agent) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8">
        <ErrorBanner message="Agent not found" onRetry={refetchAgent} />
        <button
          onClick={() => navigate('/agents')}
          className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registry
        </button>
      </div>
    );
  }

  const credentialsList = Array.isArray(credHistoryData)
    ? credHistoryData
    : (credHistoryData as any)?.credentials || [];
  const auditEntries = Array.isArray(auditLogData)
    ? auditLogData
    : (auditLogData as any)?.entries || [];
  const rawEndpoints = Array.isArray(endpointsData)
    ? endpointsData
    : (endpointsData as any)?.endpoints || [];
  const endpoints: EndpointDefinition[] = rawEndpoints.length > 0 ? rawEndpoints : [
    { endpointId: 'get_documents', label: 'GET /documents', requiredScope: 'read:documents' },
    { endpointId: 'post_documents', label: 'POST /documents', requiredScope: 'write:documents' },
    { endpointId: 'get_tickets', label: 'GET /tickets', requiredScope: 'read:tickets' },
    { endpointId: 'post_tickets', label: 'POST /tickets', requiredScope: 'write:tickets' },
    { endpointId: 'get_financial_records', label: 'GET /financial-records', requiredScope: 'read:financial_records' },
    { endpointId: 'post_financial_records', label: 'POST /financial-records', requiredScope: 'write:financial_records' },
  ];

  const currentCred = credentialsList.find((c: any) => c.credentialId === agent.currentCredentialId) || credentialsList[0];
  const daysLeft = daysUntil(agent.expiryDate, simNow);
  const registeredAgo = daysAgo(agent.createdAt, simNow);

  // Action Handlers
  const handleRotateConfirm = async (lifetimeDays?: number) => {
    try {
      const res = await rotateMutation.mutateAsync({
        agentId: agent.agentId,
        lifetimeDays,
      });
      setNewCredential(res.data.newCredential);
      setRotateOpen(false);
      refetchAgent();
      refetchCreds();
      refetchAudit();
      pushToast({
        title: 'Credential Rotated',
        description: `Successfully generated new API token for ${agent.name}.`,
        variant: 'default',
      });
    } catch (err: any) {
      pushToast({
        title: 'Rotation Failed',
        description: err?.response?.data?.error?.message || 'Failed to rotate credential.',
        variant: 'destructive',
      });
    }
  };

  const handleSuspendConfirm = async () => {
    try {
      await suspendMutation.mutateAsync(agent.agentId);
      setSuspendConfirmOpen(false);
      refetchAgent();
      refetchAudit();
      pushToast({
        title: 'Agent Suspended',
        description: `${agent.name} has been suspended.`,
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

  const handleReactivate = async () => {
    try {
      await reactivateMutation.mutateAsync(agent.agentId);
      refetchAgent();
      refetchAudit();
      pushToast({
        title: 'Agent Reactivated',
        description: `${agent.name} is now active.`,
        variant: 'default',
      });
    } catch (err: any) {
      pushToast({
        title: 'Action Failed',
        description: err?.response?.data?.error?.message || 'Failed to reactivate agent.',
        variant: 'destructive',
      });
    }
  };

  const handleDecommissionConfirm = async () => {
    try {
      await decommissionMutation.mutateAsync({
        agentId: agent.agentId,
        confirmedName: agent.name,
      });
      setDecommissionConfirmOpen(false);
      refetchAgent();
      refetchAudit();
      pushToast({
        title: 'Agent Decommissioned',
        description: `${agent.name} has been permanently decommissioned.`,
        variant: 'destructive',
      });
    } catch (err: any) {
      pushToast({
        title: 'Decommission Failed',
        description: err?.response?.data?.error?.message || 'Failed to decommission agent.',
        variant: 'destructive',
      });
    }
  };

  const handleSimulateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await simulateCallMutation.mutateAsync({
        agentId: agent.agentId,
        endpointId: selectedEndpoint,
      });
      setCallHistory((prev) => [
        { timestamp: new Date().toISOString(), result: res.data },
        ...prev.slice(0, 19),
      ]);
      refetchAudit();
    } catch (err: any) {
      pushToast({
        title: 'Simulation Error',
        description: 'Failed to simulate API call.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/agents')}
          className="text-xs font-mono text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Registry
        </button>
      </div>

      {/* Header Card (Above Tabs) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{agent.name}</h1>
              <AgentStatusBadge status={agent.status} />
            </div>
            <div className="text-xs font-mono text-slate-500">{agent.agentId}</div>
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{agent.owningTeam}</span> · Registered {registeredAgo} days ago
            </div>
          </div>
        </div>

        {/* Permission-gated Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canRotate && agent.status === 'active' && (
            <button
              onClick={() => setRotateOpen(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rotate Credential
            </button>
          )}

          {canSuspend && agent.status === 'active' && (
            <button
              onClick={() => setSuspendConfirmOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-600" /> Suspend
            </button>
          )}

          {canReactivate && agent.status === 'suspended' && (
            <button
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
              className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Reactivate
            </button>
          )}

          {canDecommission && agent.status !== 'decommissioned' && (
            <button
              onClick={() => setDecommissionConfirmOpen(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" /> Decommission
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Overview
        </button>

        <button
          onClick={() => setActiveTab('credential')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'credential'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-3.5 h-3.5" /> Credential
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'calls'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Call Log
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" /> Audit History ({auditEntries.length})
        </button>
      </div>

      {/* Tab 1 — Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Full Identity Record */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Identity Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Agent ID</span>
                <span className="font-mono font-semibold text-slate-900">{agent.agentId}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-900">{agent.name}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Owning Team</span>
                <span className="font-semibold text-blue-600">{agent.owningTeam}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Registered By</span>
                <span className="font-mono text-slate-700">{agent.registeredBy || 'Admin'}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Created At</span>
                <span className="font-mono text-slate-700">{formatDate(agent.createdAt)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Expiry Date</span>
                <span className="font-mono text-amber-700 font-medium">
                  {formatDate(agent.expiryDate)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Requested Lifetime</span>
                <span className="font-semibold text-slate-800">{agent.requestedLifetimeDays} days</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Purpose</span>
                <p className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-200/60 font-sans leading-relaxed">
                  {agent.purpose}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Approved Scopes List */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Approved Scopes ({agent.approvedScopes.length})
            </h3>

            <div className="space-y-3">
              {agent.approvedScopes.map((scopeId) => {
                const scopeDef = SCOPE_CATALOG.find((s) => s.id === scopeId);
                return (
                  <div
                    key={scopeId}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{scopeId}</span>
                      {scopeDef?.sensitive && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-[10px] font-semibold rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Sensitive
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500">
                      {scopeDef?.description || 'Scoped permission grant'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 — Credential */}
      {activeTab === 'credential' && (
        <div className="space-y-6">
          {/* Current Credential Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                  Active Credential
                </h3>
                <p className="text-xs text-slate-500">Current machine authorization key.</p>
              </div>

              {canRotate && agent.status === 'active' && (
                <button
                  onClick={() => setRotateOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" /> Rotate Credential
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Token Preview</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {currentCred?.tokenPreview || 'aim_live_••••••••'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Issued At</span>
                <span className="font-mono text-slate-700">
                  {formatDateTime(currentCred?.issuedAt || agent.createdAt)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Expires At</span>
                <span className="font-mono text-slate-700">
                  {formatDateTime(currentCred?.expiresAt || agent.expiryDate)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                <span className="text-slate-400 block mb-1">Lifetime Progress</span>
                <ExpiryProgressBar
                  issuedAt={currentCred?.issuedAt || agent.createdAt}
                  expiresAt={currentCred?.expiresAt || agent.expiryDate}
                  simNow={simNow}
                />
              </div>
            </div>

            {/* Amber warning if expiring soon */}
            {daysLeft <= 7 && daysLeft > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Credential expiring within {daysLeft} days</h4>
                  <p className="text-amber-700 text-[11px] mt-0.5">
                    Rotate credential to avoid automated agent suspension upon expiration.
                  </p>
                </div>
              </div>
            )}
          </div>

          <hr className="my-6 border-slate-200" />

          {/* Credential History Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Credential Issuance History
            </h3>
            <CredentialHistoryTable credentials={credentialsList} simNow={simNow} />
          </div>
        </div>
      )}

      {/* Tab 3 — Call Log */}
      {activeTab === 'calls' && (
        <div className="space-y-6">
          {/* Call Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <SendHorizontal className="w-4 h-4 text-blue-600" /> Simulate API Call
            </h3>

            <form onSubmit={handleSimulateCall} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Agent (Locked)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${agent.name} (${agent.agentId})`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Endpoint
                </label>
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {endpoints.map((ep) => (
                    <option key={ep.endpointId} value={ep.endpointId}>
                      {ep.label} (Requires {ep.requiredScope})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={simulateCallMutation.isPending || agent.status !== 'active'}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {simulateCallMutation.isPending ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <SendHorizontal className="w-3.5 h-3.5" /> Execute Call
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Calls Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Recent Call Execution Log
            </h3>

            {callHistory.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-6 text-center bg-slate-50 rounded-xl border border-slate-100">
                No simulated calls executed in this session yet. Execute a call above to test permissions.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Endpoint</th>
                      <th className="py-3 px-4">Required Scope</th>
                      <th className="py-3 px-4">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono">
                    {callHistory.map((call, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500">{formatDateTime(call.timestamp)}</td>
                        <td className="py-3 px-4 text-slate-800 font-bold">{call.result.endpoint}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {call.result.requiredScope || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {call.result.result === 'ALLOWED' ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 text-[11px] font-sans font-semibold rounded-full inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" /> ALLOWED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-[11px] font-sans font-semibold rounded-full inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-red-600" /> DENIED ({call.result.reasonCode})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4 — Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Agent Audit Log History ({auditEntries.length})
            </h3>
          </div>

          {auditEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              No audit log records recorded for this agent identity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {auditEntries.map((entry: any) => {
                    const eventType = entry.eventType || entry.event_type || '';
                    let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

                    if (['AGENT_REGISTERED', 'AGENT_REACTIVATED', 'API_CALL_ALLOWED', 'CREDENTIAL_ISSUED'].includes(eventType)) {
                      badgeStyle = 'bg-green-100 text-green-800 border-green-200';
                    } else if (['CREDENTIAL_ROTATED', 'AGENT_SUSPENDED'].includes(eventType)) {
                      badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
                    } else if (['CREDENTIAL_REVOKED', 'AGENT_DECOMMISSIONED', 'AUTO_REVOKED', 'API_CALL_DENIED'].includes(eventType)) {
                      badgeStyle = 'bg-red-100 text-red-800 border-red-200';
                    }

                    return (
                      <tr key={entry.logId || entry.log_id || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500">
                          {formatDateTime(entry.timestamp || entry.created_at)}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
                            {eventType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{entry.actorRole || entry.actor_role || 'System'}</td>
                        <td className="py-3 px-4 text-slate-800 font-sans">{entry.details}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Rotation Dialog */}
      <RotateCredentialDialog
        open={rotateOpen}
        onOpenChange={setRotateOpen}
        agent={agent}
        onConfirm={handleRotateConfirm}
        isLoading={rotateMutation.isPending}
      />

      {/* Reveal Modal */}
      {newCredential && (
        <CredentialRevealModal
          open={!!newCredential}
          credential={newCredential}
          agentName={agent.name}
          onClose={() => setNewCredential(null)}
        />
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmDialog
        open={suspendConfirmOpen}
        onOpenChange={setSuspendConfirmOpen}
        title={`Suspend Agent '${agent.name}'`}
        description="Suspending this agent will immediately revoke its active credential and block all API calls until reactivated."
        confirmLabel="Suspend Agent"
        onConfirm={handleSuspendConfirm}
        isLoading={suspendMutation.isPending}
        variant="destructive"
      />

      {/* Decommission Confirmation Dialog (Requires Typed Name) */}
      <ConfirmDialog
        open={decommissionConfirmOpen}
        onOpenChange={setDecommissionConfirmOpen}
        title={`Decommission Agent '${agent.name}'`}
        description={`This action is permanent and irreversible. Type '${agent.name}' below to confirm decommission.`}
        requireTypedConfirmation={agent.name}
        confirmLabel="Decommission Agent"
        onConfirm={handleDecommissionConfirm}
        isLoading={decommissionMutation.isPending}
        variant="destructive"
      />
    </div>
  );
};

export default AgentDetail;
