import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, PauseCircle, Trash2, CheckSquare } from 'lucide-react';
import type { AgentIdentity } from '../../types/agent';
import { daysAgo, formatDateTime } from '../../lib/utils';

export interface StaleAgentTableProps {
  staleAgentIds: string[];
  agents: AgentIdentity[];
  simNow: string;
  onSuspend: (agentId: string) => void;
  onDecommission: (agentId: string) => void;
}

export const StaleAgentTable: React.FC<StaleAgentTableProps> = ({
  staleAgentIds,
  agents,
  simNow,
  onSuspend,
  onDecommission,
}) => {
  // Local state for optimistic "Mark Reviewed" removal
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);

  // Filter agents that are in staleAgentIds and not marked reviewed
  const staleAgents = agents.filter(
    (a) => staleAgentIds.includes(a.agentId) && !reviewedIds.includes(a.agentId)
  );

  const handleMarkReviewed = (agentId: string) => {
    setReviewedIds((prev) => [...prev, agentId]);
  };

  if (staleAgents.length === 0) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center space-y-1">
        <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">
          ✅ All Stale Agents Actioned
        </h4>
        <p className="text-xs text-green-700">
          No unreviewed stale agent identities remaining in this review cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden space-y-0">
      {/* Header */}
      <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          ⚠️ Stale Agents — Action Required ({staleAgents.length})
        </h3>
        <span className="text-xs font-medium text-amber-800">
          Agents inactive for &gt; 90 days require remediation
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Agent Name</th>
              <th className="py-3 px-4">Team</th>
              <th className="py-3 px-4">Last API Call</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {staleAgents.map((agent) => {
              const lastCall = agent.lastApiCallAt || agent.lastActiveAt;
              const inactiveDays = lastCall ? daysAgo(lastCall, simNow) : 90;

              return (
                <tr key={agent.agentId} className="bg-amber-50/40 hover:bg-amber-50/80 transition-colors">
                  {/* Name (Link) */}
                  <td className="py-3 px-4">
                    <Link
                      to={`/agents/${agent.agentId}`}
                      className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {agent.name}
                    </Link>
                    <div className="font-mono text-[11px] text-slate-400">{agent.agentId}</div>
                  </td>

                  {/* Team */}
                  <td className="py-3 px-4 font-medium text-slate-700">{agent.owningTeam}</td>

                  {/* Last API Call */}
                  <td className="py-3 px-4 font-mono text-amber-800 font-semibold">
                    {lastCall ? (
                      <>
                        {formatDateTime(lastCall)}
                        <span className="block text-[10px] text-amber-600 font-sans font-normal">
                          ({inactiveDays} days inactive)
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-700">Never (&gt;90 days)</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> STALE
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onSuspend(agent.agentId)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <PauseCircle className="w-3 h-3" /> Suspend
                      </button>

                      <button
                        type="button"
                        onClick={() => onDecommission(agent.agentId)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3 h-3" /> Decommission
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkReviewed(agent.agentId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Dismiss from unreviewed list optimistically"
                      >
                        <CheckSquare className="w-3 h-3 text-slate-500" /> Mark Reviewed
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaleAgentTable;
