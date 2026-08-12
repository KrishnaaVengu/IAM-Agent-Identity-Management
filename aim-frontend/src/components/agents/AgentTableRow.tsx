import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import type { AgentIdentity } from '../../types/agent';
import AgentStatusBadge from './AgentStatusBadge';
import { ScopeChipList } from './ScopeChip';
import AgentActionMenu from './AgentActionMenu';
import { daysUntil, daysAgo } from '../../lib/utils';

interface AgentTableRowProps {
  agent: AgentIdentity;
  simNow: string;
  onSuspend?: (agent: AgentIdentity) => void;
  onReactivate?: (agent: AgentIdentity) => void;
  onRotate?: (agent: AgentIdentity) => void;
  onDecommission?: (agent: AgentIdentity) => void;
}

export const AgentTableRow: React.FC<AgentTableRowProps> = ({
  agent,
  simNow,
  onSuspend,
  onReactivate,
  onRotate,
  onDecommission,
}) => {
  const truncatedId =
    agent.agentId.length > 16 ? `${agent.agentId.substring(0, 14)}...` : agent.agentId;

  const daysLeft = daysUntil(agent.expiryDate, simNow);
  const elapsedDays = agent.lastApiCallAt ? daysAgo(agent.lastApiCallAt, simNow) : null;
  const isStale = elapsedDays !== null && elapsedDays > 30;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm">
      {/* 1. Agent ID */}
      <td className="py-3 px-4 font-mono text-xs text-slate-500" title={agent.agentId}>
        {truncatedId}
      </td>

      {/* 2. Name */}
      <td className="py-3 px-4 font-medium text-slate-900">
        <Link
          to={`/agents/${agent.agentId}`}
          className="hover:text-blue-600 transition-colors"
        >
          {agent.name}
        </Link>
      </td>

      {/* 3. Owning Team */}
      <td className="py-3 px-4 text-slate-600 text-xs">{agent.owningTeam}</td>

      {/* 4. Status */}
      <td className="py-3 px-4">
        <AgentStatusBadge status={agent.status} />
      </td>

      {/* 5. Scopes */}
      <td className="py-3 px-4">
        <ScopeChipList scopes={agent.approvedScopes} max={2} />
      </td>

      {/* 6. Expiry */}
      <td className="py-3 px-4 text-xs font-mono">
        {daysLeft <= 0 ? (
          <span className="text-red-600 font-medium">Expired</span>
        ) : daysLeft <= 7 ? (
          <span className="text-amber-700 font-medium inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {daysLeft}d left
          </span>
        ) : (
          <span className="text-slate-600">{daysLeft}d left</span>
        )}
      </td>

      {/* 7. Last Call */}
      <td className="py-3 px-4 text-xs font-mono">
        {elapsedDays === null ? (
          <span className="text-slate-400 italic">Never</span>
        ) : isStale ? (
          <span className="text-amber-700 font-medium inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            {elapsedDays}d ago
          </span>
        ) : (
          <span className="text-slate-600">{elapsedDays}d ago</span>
        )}
      </td>

      {/* 8. Actions */}
      <td className="py-3 px-4 text-right">
        <AgentActionMenu
          agent={agent}
          onSuspend={onSuspend ? () => onSuspend(agent) : undefined}
          onReactivate={onReactivate ? () => onReactivate(agent) : undefined}
          onRotate={onRotate ? () => onRotate(agent) : undefined}
          onDecommission={onDecommission ? () => onDecommission(agent) : undefined}
        />
      </td>
    </tr>
  );
};

export default AgentTableRow;
