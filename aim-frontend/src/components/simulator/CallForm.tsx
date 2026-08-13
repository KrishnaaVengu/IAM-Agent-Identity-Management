import React from 'react';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';
import type { AgentIdentity } from '../../types/agent';
import type { EndpointDefinition } from '../../types/scopeCatalog';

export interface CallFormProps {
 agents: AgentIdentity[];
 endpoints: EndpointDefinition[];
 selectedAgentId: string;
 selectedEndpointId: string;
 onAgentChange: (agentId: string) => void;
 onEndpointChange: (endpointId: string) => void;
 onSubmit: (agentId: string, endpointId: string) => void;
 isLoading: boolean;
 lockedAgentId?: string;
}

export const CallForm: React.FC<CallFormProps> = ({
 agents,
 endpoints,
 selectedAgentId,
 selectedEndpointId,
 onAgentChange,
 onEndpointChange,
 onSubmit,
 isLoading,
 lockedAgentId,
}) => {
 const safeAgents: AgentIdentity[] = Array.isArray(agents) ? agents : [];
 const safeEndpoints: EndpointDefinition[] = Array.isArray(endpoints) ? endpoints : (endpoints as any)?.endpoints || [];

 const currentAgent = safeAgents.find((a) => a.agentId === selectedAgentId || a.name === selectedAgentId);
 const currentEndpoint = safeEndpoints.find((e) => e.endpointId === selectedEndpointId);

 const hasScope = currentAgent && currentEndpoint
 ? currentAgent.approvedScopes.includes(currentEndpoint.requiredScope)
 : false;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (selectedAgentId && selectedEndpointId) {
 onSubmit(selectedAgentId, selectedEndpointId);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
 {/* Agent Selector */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
 Select Agent Identity
 </label>
 {lockedAgentId ? (
 <input
 type="text"
 readOnly
 value={currentAgent ? `${currentAgent.name} (${currentAgent.owningTeam})` : lockedAgentId}
 className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 cursor-not-allowed"
 />
 ) : (
 <select
 value={selectedAgentId}
 onChange={(e) => onAgentChange(e.target.value)}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 {safeAgents.map((agent) => (
 <option key={agent.agentId} value={agent.agentId}>
 {agent.name} ({agent.owningTeam}) · {agent.status}
 </option>
 ))}
 </select>
 )}
 </div>

 {/* Endpoint Selector */}
 <div>
 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
 Select Target API Endpoint
 </label>
 <select
 value={selectedEndpointId}
 onChange={(e) => onEndpointChange(e.target.value)}
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
 >
 {safeEndpoints.map((ep) => (
 <option key={ep.endpointId} value={ep.endpointId}>
 {ep.label || ep.endpointId} (requires: {ep.requiredScope})
 </option>
 ))}
 </select>
 </div>

 {/* Scope-Match Indicator */}
 {currentAgent && currentEndpoint && (
 <div className="pt-1">
 {hasScope ? (
 <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 p-2.5 rounded-lg border border-green-200">
 <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
 <span>✅ Agent has this scope ({currentEndpoint.requiredScope})</span>
 </div>
 ) : (
 <div className="flex items-center gap-1.5 text-xs text-red-700 font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
 <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
 <span>❌ Agent lacks this scope ({currentEndpoint.requiredScope})</span>
 </div>
 )}
 </div>
 )}

 {/* Submit Button */}
 <button
 type="submit"
 disabled={isLoading || !selectedAgentId || !selectedEndpointId}
 className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
 >
 {isLoading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin text-white" />
 <span>Simulating API Call...</span>
 </>
 ) : (
 <>
 <Send className="w-3.5 h-3.5" />
 <span>Send Test Call</span>
 </>
 )}
 </button>
 </form>
 );
};

export default CallForm;
