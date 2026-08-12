import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, RefreshCw, Eye, CheckCircle, ShieldAlert } from 'lucide-react';
import type { DashboardStats } from '../../types/dashboard';
import type { AgentIdentity } from '../../types/agent';
import { usePermission } from '../../hooks/usePermission';
import { daysUntil, daysAgo } from '../../lib/utils';

export interface AttentionListProps {
  attentionNeeded: DashboardStats['attentionNeeded'];
  agents: AgentIdentity[];
  simNow: string;
  onRotateAgent?: (agentId: string) => void;
}

export const AttentionList: React.FC<AttentionListProps> = ({
  attentionNeeded,
  agents,
  simNow,
  onRotateAgent,
}) => {
  const navigate = useNavigate();
  const canRotate = usePermission('rotate');

  const expiringIds = attentionNeeded?.expiringSoon || [];
  const staleIds = attentionNeeded?.stale || [];

  const safeAgents = Array.isArray(agents) ? agents : [];

  const expiringAgents = expiringIds
    .map((id) => safeAgents.find((a) => a.agentId === id || a.name === id))
    .filter((a): a is AgentIdentity => Boolean(a));

  const staleAgents = staleIds
    .map((id) => safeAgents.find((a) => a.agentId === id || a.name === id))
    .filter((a): a is AgentIdentity => Boolean(a));

  const isHealthy = expiringAgents.length === 0 && staleAgents.length === 0;

  if (isHealthy) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">All agents are healthy</h4>
            <p className="text-xs text-green-700 mt-0.5">
              No credentials are currently expiring within 7 days, and no agents are stale (30+ days inactive).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <ShieldAlert className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
          Attention Needed
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <div>
          <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" /> Expiring Soon ({expiringAgents.length})
          </h4>
          {expiringAgents.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              No expiring credentials
            </div>
          ) : (
            <div className="space-y-2">
              {expiringAgents.map((agent) => {
                const daysLeft = daysUntil(agent.expiryDate, simNow);
                return (
                  <div
                    key={agent.agentId}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors text-xs"
                  >
                    <div>
                      <Link
                        to={`/agents/${agent.agentId}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 block"
                      >
                        {agent.name}
                      </Link>
                      <span className="text-amber-700 font-mono text-[11px] font-medium mt-0.5 inline-block">
                        Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    {canRotate && onRotateAgent && agent.status === 'active' && (
                      <button
                        onClick={() => onRotateAgent(agent.agentId)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3" /> Rotate
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stale Agents */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Stale Agents ({staleAgents.length})
          </h4>
          {staleAgents.length === 0 ? (
            <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
              No stale agent identities
            </div>
          ) : (
            <div className="space-y-2">
              {staleAgents.map((agent) => {
                const elapsed = agent.lastApiCallAt ? daysAgo(agent.lastApiCallAt, simNow) : 30;
                return (
                  <div
                    key={agent.agentId}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors text-xs"
                  >
                    <div>
                      <Link
                        to={`/agents/${agent.agentId}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 block"
                      >
                        {agent.name}
                      </Link>
                      <span className="text-slate-500 font-mono text-[11px] mt-0.5 inline-block">
                        Last active {elapsed} days ago
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/agents/${agent.agentId}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Eye className="w-3 h-3" /> Review
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttentionList;
