import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, CheckCircle, PauseCircle, Trash2 } from 'lucide-react';
import type { AgentIdentity } from '../../types/agent';
import { formatDateTime } from '../../lib/utils';

export interface TeamBreakdownAccordionProps {
 teamBreakdown: Record<string, { total: number; stale: number }>;
 staleAgentIds: string[];
 agents: AgentIdentity[];
 onSuspend: (agentId: string) => void;
 onDecommission: (agentId: string) => void;
}

export const TeamBreakdownAccordion: React.FC<TeamBreakdownAccordionProps> = ({
 teamBreakdown,
 staleAgentIds,
 agents,
 onSuspend,
 onDecommission,
}) => {
 // Track open accordion sections (default open all)
 const teams = Object.keys(teamBreakdown || {});
 const [openTeams, setOpenTeams] = useState<Record<string, boolean>>(() => {
 const initial: Record<string, boolean> = {};
 teams.forEach((t) => {
 initial[t] = true;
 });
 return initial;
 });

 const toggleTeam = (team: string) => {
 setOpenTeams((prev) => ({ ...prev, [team]: !prev[team] }));
 };

 if (teams.length === 0) {
 return (
 <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400 italic">
 No team breakdown data available.
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
 Team Identity Breakdown
 </h3>

 <div className="space-y-3">
 {teams.map((team) => {
 const stats = teamBreakdown[team];
 const isOpen = !!openTeams[team];
 const teamAgents = agents.filter((a) => a.owningTeam === team);

 return (
 <div key={team} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
 {/* Accordion Trigger */}
 <button
 type="button"
 onClick={() => toggleTeam(team)}
 className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left select-none cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <span className="font-bold text-slate-800 text-sm">{team}</span>
 <span className="text-xs text-slate-500 font-medium">
 ({stats.total} agent{stats.total === 1 ? '' : 's'}
 {stats.stale > 0 ? `, ${stats.stale} stale` : ''})
 </span>

 {stats.stale > 0 && (
 <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold rounded-full flex items-center gap-1">
 <AlertTriangle className="w-3 h-3 text-amber-600" /> {stats.stale} Stale
 </span>
 )}
 </div>

 <ChevronDown
 className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
 isOpen ? 'rotate-180' : ''
 }`}
 />
 </button>

 {/* Accordion Content Table */}
 {isOpen && (
 <div className="p-4 border-t border-slate-200/80 overflow-x-auto">
 {teamAgents.length === 0 ? (
 <p className="text-xs text-slate-400 italic p-3 text-center">
 No agent records registered under {team}.
 </p>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
 <th className="py-2.5 px-3">Agent Name</th>
 <th className="py-2.5 px-3">Status</th>
 <th className="py-2.5 px-3">Last API Call</th>
 <th className="py-2.5 px-3 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs">
 {teamAgents.map((agent) => {
 const isStale = staleAgentIds.includes(agent.agentId);
 return (
 <tr
 key={agent.agentId}
 className={`transition-colors ${
 isStale ? 'bg-amber-50/70 border-amber-200' : 'hover:bg-slate-50'
 }`}
 >
 {/* Name */}
 <td className="py-3 px-3">
 <div className="font-semibold text-slate-900">{agent.name}</div>
 <div className="font-mono text-[11px] text-slate-400">{agent.agentId}</div>
 </td>

 {/* Status */}
 <td className="py-3 px-3">
 {isStale ? (
 <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full inline-flex items-center gap-1">
 <AlertTriangle className="w-3 h-3 text-amber-600" /> STALE
 </span>
 ) : (
 <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 text-[10px] font-semibold rounded-full inline-flex items-center gap-1">
 <CheckCircle className="w-3 h-3 text-green-600" /> Healthy
 </span>
 )}
 </td>

 {/* Last API Call */}
 <td className="py-3 px-3 font-mono text-slate-600">
 {agent.lastApiCallAt || agent.lastActiveAt
 ? formatDateTime((agent.lastApiCallAt || agent.lastActiveAt)!)
 : 'Never'}
 </td>

 {/* Actions */}
 <td className="py-3 px-3 text-right">
 {isStale ? (
 <div className="flex items-center justify-end gap-2">
 <button
 type="button"
 onClick={() => onSuspend(agent.agentId)}
 className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
 >
 <PauseCircle className="w-3 h-3" /> Suspend
 </button>
 <button
 type="button"
 onClick={() => onDecommission(agent.agentId)}
 className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
 >
 <Trash2 className="w-3 h-3" /> Decommission
 </button>
 </div>
 ) : (
 <span className="text-slate-400 text-xs italic">No action needed</span>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
};

export default TeamBreakdownAccordion;
