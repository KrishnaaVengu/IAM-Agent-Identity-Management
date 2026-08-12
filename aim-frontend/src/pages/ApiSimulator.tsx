import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Zap,
  History,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { useAgentList } from '../hooks/useAgents';
import { useSimulatorCall, useEndpointList } from '../hooks/useSimulator';
import CallForm from '../components/simulator/CallForm';
import ResponsePanel from '../components/simulator/ResponsePanel';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import { formatDateTime } from '../lib/utils';
import type { SimulatorCallResult } from '../api/simulator';
import type { EndpointDefinition } from '../types/scopeCatalog';

interface CallHistoryItem {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  endpointId: string;
  result: SimulatorCallResult;
}

export const ApiSimulator: React.FC = () => {
  const { data: agentList, isLoading: isAgentsLoading, error: agentsError } = useAgentList();
  const { data: endpointList, isLoading: isEndpointsLoading } = useEndpointList();
  const simulateMutation = useSimulatorCall();

  const agents = Array.isArray(agentList) ? agentList : [];
  const rawEndpoints = Array.isArray(endpointList)
    ? endpointList
    : (endpointList as any)?.endpoints || [];

  const endpoints: EndpointDefinition[] = rawEndpoints.length > 0 ? rawEndpoints : [
    { endpointId: 'get_documents', label: 'GET /documents', requiredScope: 'read:documents' },
    { endpointId: 'post_documents', label: 'POST /documents', requiredScope: 'write:documents' },
    { endpointId: 'get_tickets', label: 'GET /tickets', requiredScope: 'read:tickets' },
    { endpointId: 'post_tickets', label: 'POST /tickets', requiredScope: 'write:tickets' },
    { endpointId: 'get_financial_records', label: 'GET /financial-records', requiredScope: 'read:financial_records' },
    { endpointId: 'post_financial_records', label: 'POST /financial-records', requiredScope: 'write:financial_records' },
  ];

  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('');
  const [lastResult, setLastResult] = useState<SimulatorCallResult | null>(null);
  const [history, setHistory] = useState<CallHistoryItem[]>([]);

  // Set default selections once loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].agentId);
    }
  }, [agents, selectedAgentId]);

  useEffect(() => {
    if (endpoints.length > 0 && !selectedEndpointId) {
      setSelectedEndpointId(endpoints[0].endpointId);
    }
  }, [endpoints, selectedEndpointId]);

  if (isAgentsLoading || isEndpointsLoading) return <LoadingSpinner />;
  if (agentsError) return <ErrorBanner message="Failed to load agent registry for simulator." />;

  const handleSimulateSubmit = async (agentId: string, endpointId: string) => {
    try {
      const res = await simulateMutation.mutateAsync({ agentId, endpointId });
      const callRes = res.data;
      setLastResult(callRes);

      const agentObj = agents.find((a) => a.agentId === agentId || a.name === agentId);
      const newItem: CallHistoryItem = {
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        agentId,
        agentName: agentObj ? agentObj.name : agentId,
        endpointId,
        result: callRes,
      };

      setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      // Error handled by mutation error state
    }
  };

  // Quick Test Scenarios
  const handleQuickScenario = (scenario: 'readonly_write' | 'healthy_read' | 'expired_call') => {
    if (agents.length === 0 || endpoints.length === 0) return;

    if (scenario === 'readonly_write') {
      const readonlyAgent = agents.find((a) => a.name.includes('doc') || a.approvedScopes.length === 1) || agents[0];
      const writeEp = endpoints.find((e) => e.endpointId.includes('POST') && e.requiredScope.includes('write')) || endpoints[1];
      setSelectedAgentId(readonlyAgent.agentId);
      setSelectedEndpointId(writeEp.endpointId);
      handleSimulateSubmit(readonlyAgent.agentId, writeEp.endpointId);
    } else if (scenario === 'healthy_read') {
      const healthyAgent = agents.find((a) => a.status === 'active' && a.name.includes('ticket')) || agents[0];
      const readEp = endpoints.find((e) => e.requiredScope.includes('read:tickets')) || endpoints[0];
      setSelectedAgentId(healthyAgent.agentId);
      setSelectedEndpointId(readEp.endpointId);
      handleSimulateSubmit(healthyAgent.agentId, readEp.endpointId);
    } else if (scenario === 'expired_call') {
      const expiredAgent = agents.find((a) => a.name.includes('billing') || a.status !== 'active') || agents[agents.length - 1];
      const ep = endpoints[0];
      setSelectedAgentId(expiredAgent.agentId);
      setSelectedEndpointId(ep.endpointId);
      handleSimulateSubmit(expiredAgent.agentId, ep.endpointId);
    }
  };

  const handleHistoryRowClick = (item: CallHistoryItem) => {
    setSelectedAgentId(item.agentId);
    setSelectedEndpointId(item.endpointId);
    setLastResult(item.result);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-600" />
            API Call Policy Simulator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test and evaluate machine authorization policies in real time without live API tokens.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (40% -> 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Test Scenarios */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Test Scenarios
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickScenario('readonly_write')}
                className="text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>🚫 Read-only agent tries write</span>
                <span className="text-[10px] font-mono text-slate-400">Denied test</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickScenario('healthy_read')}
                className="text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>✅ Healthy agent reads tickets</span>
                <span className="text-[10px] font-mono text-slate-400">Allowed test</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickScenario('expired_call')}
                className="text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>⏰ Expired / Stale agent call</span>
                <span className="text-[10px] font-mono text-slate-400">Expiry sweep test</span>
              </button>
            </div>
          </div>

          {/* Call Form */}
          <CallForm
            agents={agents}
            endpoints={endpoints}
            selectedAgentId={selectedAgentId}
            selectedEndpointId={selectedEndpointId}
            onAgentChange={setSelectedAgentId}
            onEndpointChange={setSelectedEndpointId}
            onSubmit={handleSimulateSubmit}
            isLoading={simulateMutation.isPending}
          />

          {/* Recent Call History */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" /> Recent Session Simulations ({history.length})
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-lg border border-slate-100">
                No calls simulated in this session yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryRowClick(item)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{item.agentName}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.endpointId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(item.timestamp)}
                      </div>
                    </div>

                    <div>
                      {item.result.result === 'ALLOWED' ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 text-[10px] font-semibold rounded-full flex items-center gap-1 font-sans">
                          <CheckCircle className="w-3 h-3 text-green-600" /> ALLOWED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 text-[10px] font-semibold rounded-full flex items-center gap-1 font-sans">
                          <XCircle className="w-3 h-3 text-red-600" /> {item.result.reasonCode || 'DENIED'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (60% -> 7 cols) */}
        <div className="lg:col-span-7">
          <div className="sticky top-24">
            <ResponsePanel result={lastResult} isLoading={simulateMutation.isPending} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSimulator;
