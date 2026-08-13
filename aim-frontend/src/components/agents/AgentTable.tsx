import React from 'react';
import type { AgentIdentity } from '../../types/agent';
import AgentTableRow from './AgentTableRow';
import EmptyState from '../shared/EmptyState';

interface AgentTableProps {
 agents: AgentIdentity[];
 simNow: string;
 isLoading: boolean;
 onSuspend?: (agent: AgentIdentity) => void;
 onReactivate?: (agent: AgentIdentity) => void;
 onRotate?: (agent: AgentIdentity) => void;
 onDecommission?: (agent: AgentIdentity) => void;
}

export const AgentTable: React.FC<AgentTableProps> = ({
 agents,
 simNow,
 isLoading,
 onSuspend,
 onReactivate,
 onRotate,
 onDecommission,
}) => {
 if (isLoading) {
 return (
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse w-full" />
 ))}
 </div>
 );
 }

 if (!agents || agents.length === 0) {
 return (
 <EmptyState
 title="No agents found"
 description="Try adjusting your filters or register a new agent."
 />
 );
 }

 return (
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-colors">
 <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
 <th className="py-3 px-4">Agent ID</th>
 <th className="py-3 px-4">Owning Team</th>
 <th className="py-3 px-4">Creation Date</th>
 <th className="py-3 px-4">Expiry Date</th>
 <th className="py-3 px-4">Approved Scopes</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {agents.map((agent) => (
 <AgentTableRow
 key={agent.agentId}
 agent={agent}
 simNow={simNow}
 onSuspend={onSuspend}
 onReactivate={onReactivate}
 onRotate={onRotate}
 onDecommission={onDecommission}
 />
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
};

export default AgentTable;
