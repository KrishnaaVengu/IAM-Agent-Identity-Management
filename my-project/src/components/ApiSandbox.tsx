import React, { useState, useEffect } from 'react';
import { Send, Terminal, Play, RotateCcw, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  team: string;
  status: 'active' | 'suspended' | 'expired' | 'revoked';
  scopes: string[];
  token: string;
}

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  requiredScope: string;
  description: string;
}

export const ApiSandbox: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState('doc-summarizer');
  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [isSimTimeTravel, setIsSimTimeTravel] = useState(false);
  
  // Animation/Process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [simResult, setSimResult] = useState<{ ok: boolean; status: number; code: string; message: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ timestamp: string; agent: string; action: string; status: 'ALLOW' | 'DENY'; detail: string }>>([
    { timestamp: '14:20:10', agent: 'ticket-triage-agent', action: 'POST /tickets', status: 'ALLOW', detail: '200 OK - Authorized' },
    { timestamp: '14:22:35', agent: 'doc-summarizer-bot', action: 'POST /financial_records', status: 'DENY', detail: '403 Forbidden - Insufficient Scope' }
  ]);

  const agents: Agent[] = [
    {
      id: 'doc-summarizer',
      name: 'doc-summarizer-bot',
      team: 'Data Eng',
      status: 'active',
      scopes: ['read:documents'],
      token: 'sk_agt_doc_sum_8f2a7c1d44e2'
    },
    {
      id: 'ticket-triage',
      name: 'ticket-triage-agent',
      team: 'Support-Bot Ops',
      status: 'active',
      scopes: ['read:tickets', 'write:tickets'],
      token: 'sk_agt_tkt_tri_7c8d9e2a1b3c'
    },
    {
      id: 'billing-reconciler',
      name: 'billing-reconciler-bot',
      team: 'Finance-Automation',
      status: isSimTimeTravel ? 'expired' : 'active',
      scopes: ['read:financial_records', 'write:financial_records'],
      token: 'sk_agt_bil_rec_3d4e5f6g7h8i'
    },
    {
      id: 'attacker-bot',
      name: 'malicious-attacker-bot',
      team: 'Growth (Shadow IT)',
      status: 'revoked',
      scopes: ['delete:users'],
      token: 'sk_agt_revoked_key_00000000'
    }
  ];

  const endpoints: Endpoint[] = [
    { method: 'GET', path: '/documents', requiredScope: 'read:documents', description: 'Retrieve document repository index' },
    { method: 'POST', path: '/tickets', requiredScope: 'write:tickets', description: 'Create support request ticket' },
    { method: 'POST', path: '/financial_records', requiredScope: 'write:financial_records', description: 'Submit ledger invoice batch (SENSITIVE)' },
    { method: 'DELETE', path: '/users/usr_2894', requiredScope: 'delete:users', description: 'Permanently purge user profile (SENSITIVE)' }
  ];

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const activeEndpoint = endpoints[selectedEndpointIndex];

  // Auto scroll output window
  useEffect(() => {
    const el = document.getElementById('terminal-logs');
    if (el) el.scrollTop = el.scrollHeight;
  }, [processLogs]);

  const handleSimClockToggle = () => {
    setIsSimTimeTravel(!isSimTimeTravel);
    setAuditLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        agent: 'SYSTEM',
        action: `CLOCK_ADVANCED (+30 Days)`,
        status: 'ALLOW',
        detail: `Simulated clock moved forward. billing-reconciler-bot credentials expired.`
      },
      ...prev
    ]);
  };

  const executeSimulation = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setSimResult(null);
    setProcessLogs(['[SYSTEM] Initializing Policy Enforcement API request...']);

    // Step 1: Check Token validity
    setTimeout(() => {
      setProcessLogs(prev => [...prev, `[GATEWAY] Inspecting token tokenPreview: "${activeAgent.token.substring(0, 10)}••••••••"`]);
      if (activeAgent.id === 'attacker-bot') {
        setProcessLogs(prev => [...prev, `[SECURITY] ❌ Token has been manually revoked by Admin. Access denied.`]);
        finishSim(false, 403, 'CREDENTIAL_REVOKED', 'The security token has been revoked by an administrator.');
        return;
      }
      setProcessLogs(prev => [...prev, `[SECURITY] ✅ Token recognized as valid signature. Mapping to agent: "${activeAgent.name}".`]);

      // Step 2: Check Agent Status
      setTimeout(() => {
        setProcessLogs(prev => [...prev, `[REGISTRY] Verifying agent operational status...`]);
        if (activeAgent.status === 'suspended') {
          setProcessLogs(prev => [...prev, `[REGISTRY] ❌ Agent status is "suspended". Rejecting request.`]);
          finishSim(false, 403, 'AGENT_SUSPENDED', 'Identity is temporarily suspended by compliance policy.');
          return;
        }
        setProcessLogs(prev => [...prev, `[REGISTRY] ✅ Agent status is "active".`]);

        // Step 3: Check Expiry
        setTimeout(() => {
          setProcessLogs(prev => [...prev, `[EXPIRY] Verifying credential lease expiry...`]);
          if (activeAgent.status === 'expired') {
            setProcessLogs(prev => [...prev, `[EXPIRY] ❌ Token lease expired at sim clock threshold. Auto-revoke triggered.`]);
            finishSim(false, 401, 'CREDENTIAL_EXPIRED', 'Token credential lease has expired. Rotate credential.');
            return;
          }
          setProcessLogs(prev => [
            ...prev, 
            isSimTimeTravel && activeAgent.id === 'billing-reconciler' 
              ? `[EXPIRY] ❌ Token lease expired at sim clock threshold. Auto-revoke triggered.`
              : `[EXPIRY] ✅ Credential lease is active (expires in ${activeAgent.id === 'billing-reconciler' ? '2 days' : '30 days'}).`
          ]);
          
          if (isSimTimeTravel && activeAgent.id === 'billing-reconciler') {
            finishSim(false, 401, 'CREDENTIAL_EXPIRED', 'Token credential lease has expired. Rotate credential.');
            return;
          }

          // Step 4: Check Scope
          setTimeout(() => {
            setProcessLogs(prev => [
              ...prev, 
              `[POLICY] Required permission: "${activeEndpoint.requiredScope}"`,
              `[POLICY] Agent granted permissions: [${activeAgent.scopes.map(s => `"${s}"`).join(', ')}]`
            ]);

            const hasScope = activeAgent.scopes.includes(activeEndpoint.requiredScope);
            if (hasScope) {
              setProcessLogs(prev => [...prev, `[POLICY] ✅ Scope validation passed.`]);
              finishSim(true, 200, 'OK', 'API Request Authorized successfully.');
            } else {
              setProcessLogs(prev => [...prev, `[POLICY] ❌ Scope validation failed. Insufficient permission scope.`]);
              finishSim(false, 403, 'INSUFFICIENT_SCOPE', `Credential lacks required permission scope: "${activeEndpoint.requiredScope}".`);
            }
          }, 800);

        }, 700);

      }, 600);

    }, 600);
  };

  const finishSim = (ok: boolean, status: number, code: string, message: string) => {
    setIsProcessing(false);
    setSimResult({ ok, status, code, message });
    
    // Log to Global Auditing
    const timestamp = new Date().toLocaleTimeString();
    setAuditLogs(prev => [
      {
        timestamp,
        agent: activeAgent.name,
        action: `${activeEndpoint.method} ${activeEndpoint.path}`,
        status: ok ? 'ALLOW' : 'DENY',
        detail: `${status} ${code} - ${message}`
      },
      ...prev
    ]);
  };

  return (
    <section id="simulator" className="py-20 px-6 max-w-7xl mx-auto border-x border-zinc-900 bg-[#090909] text-left relative">
      
      <div className="max-w-3xl mx-auto mb-16 text-center">
        <span className="meta-label">(Interactive Sandbox)</span>
        <h2 className="text-3xl font-light text-zinc-100 mt-3 tracking-tight">
          Verify operational rules against the central policy registry
        </h2>
        <p className="mt-3 text-xs text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Tweak client identities, adjust simulation clock thresholds, and trace authorization execution states step-by-step.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left Side: selectors */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Clock controls */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded">
            <div className="flex items-center justify-between">
              <div>
                <span className="meta-label font-mono uppercase text-[9px] block">(01. Simulation Clock Control)</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Toggle simulated lease expiry</span>
              </div>
              <button 
                onClick={handleSimClockToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                  isSimTimeTravel 
                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/35' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isSimTimeTravel ? '+30 Days Simulated' : 'Fast-Forward 30 Days'}</span>
              </button>
            </div>
            
            {isSimTimeTravel && (
              <div className="mt-3 px-3 py-2 bg-orange-500/5 border border-orange-500/15 rounded flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-orange-400 leading-normal font-sans">
                  Time fast-forwarded. 30-day token lifecycles (like <strong>billing-reconciler-bot</strong>) are now expired. API requests from them will fail.
                </span>
              </div>
            )}
          </div>

          {/* Select Agent */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded">
            <div className="mb-4">
              <span className="meta-label font-mono uppercase text-[9px] block">(02. Identity Selection)</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">Choose agent credential profile</span>
            </div>
            
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    if (!isProcessing) setSelectedAgentId(agent.id);
                  }}
                  disabled={isProcessing}
                  className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all cursor-pointer ${
                    selectedAgentId === agent.id
                      ? 'border-brand-cyan bg-brand-cyan/5'
                      : 'border-zinc-900 bg-black/40 hover:border-zinc-800'
                  } disabled:opacity-50`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200 font-mono">{agent.name}</span>
                    <span className="text-[9px] text-zinc-500 mt-1">Team: {agent.team}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-zinc-500">
                      {agent.scopes.length} scope{agent.scopes.length !== 1 ? 's' : ''}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase border font-mono ${
                      agent.status === 'active' 
                        ? 'bg-brand-cyan/5 text-brand-cyan border-brand-cyan/20'
                        : agent.status === 'expired' 
                        ? 'bg-orange-500/5 text-orange-500 border-orange-500/20'
                        : 'bg-red-500/5 text-red-400 border-red-500/20'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Endpoint */}
          <div className="p-6 bg-zinc-950 border border-zinc-900 rounded">
            <div className="mb-4">
              <span className="meta-label font-mono uppercase text-[9px] block">(03. Action/Resource Specification)</span>
              <span className="text-[10px] text-zinc-500 mt-1 block">Specify target API path and required scope</span>
            </div>
            
            <div className="space-y-2">
              {endpoints.map((ep, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isProcessing) setSelectedEndpointIndex(idx);
                  }}
                  disabled={isProcessing}
                  className={`w-full flex items-start gap-3 p-3 rounded border text-left transition-all cursor-pointer ${
                    selectedEndpointIndex === idx
                      ? 'border-brand-cyan bg-brand-cyan/5'
                      : 'border-zinc-900 bg-black/40 hover:border-zinc-800'
                  } disabled:opacity-50`}
                >
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                    ep.method === 'GET' 
                      ? 'bg-zinc-900 text-zinc-300 border-zinc-800' 
                      : ep.method === 'POST'
                      ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {ep.method}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-200 font-mono leading-none">{ep.path}</span>
                      {(ep.requiredScope.includes('financial') || ep.requiredScope.includes('delete')) && (
                        <span className="text-[8px] font-bold text-orange-500 bg-orange-500/5 px-1 py-0.2 border border-orange-500/20 rounded font-mono">SENSITIVE</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{ep.description}</p>
                    <div className="text-[9px] text-zinc-500 mt-2 font-mono">
                      Scope: <code className="text-brand-cyan bg-zinc-950 px-1 border border-zinc-900 font-mono text-[9px]">{ep.requiredScope}</code>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Terminal & Logs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Terminal window */}
          <div className="bg-black border border-zinc-900 rounded overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                <span>aim_policy_engine_sandbox.log</span>
              </div>
              <span className="font-bold text-[10px] tracking-wider text-brand-cyan">ONLINE</span>
            </div>

            {/* Output screen */}
            <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-3 min-h-[300px] max-h-[350px] relative text-zinc-300" id="terminal-logs">
              {processLogs.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-zinc-700 p-6 font-sans">
                  <Terminal className="w-10 h-10 text-zinc-800 mb-3" />
                  <p className="text-xs">Configure the identity scopes and click</p>
                  <p className="text-xs font-bold text-brand-cyan mt-1">"Dispatch Request" to trace policy engine execution.</p>
                </div>
              )}
              
              {processLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-l border-zinc-900 pl-3">
                  <span className="text-zinc-600 mr-2">aim-sandbox$</span>
                  <span className={`${
                    log.includes('✅') 
                      ? 'text-brand-cyan' 
                      : log.includes('❌') 
                      ? 'text-orange-500'
                      : log.includes('[POLICY]')
                      ? 'text-indigo-400 font-bold'
                      : 'text-zinc-300'
                  }`}>
                    {log}
                  </span>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-brand-cyan pl-3 mt-3 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping"></span>
                  <span>Executing policy evaluation pipeline...</span>
                </div>
              )}
            </div>

            {/* Footer run panel */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-zinc-600 max-w-xs font-sans">
                Inspecting cryptographic credentials against client policies.
              </span>
              <button
                onClick={executeSimulation}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-brand-cyan hover:bg-brand-cyan/95 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Dispatch Request</span>
                <Send className="w-3 h-3 text-black fill-current" />
              </button>
            </div>
          </div>

          {/* Result JSON Box */}
          {simResult && (
            <div className={`p-5 rounded border animate-in slide-in-from-bottom-2 duration-300 ${
              simResult.ok 
                ? 'bg-brand-cyan/5 border-brand-cyan/20 text-brand-cyan' 
                : 'bg-orange-500/5 border-orange-500/25 text-orange-500'
            }`}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  {simResult.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                  ) : (
                    <XCircle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-xs font-bold font-mono tracking-wider">
                      {simResult.ok ? 'GATE_ACCESS_ALLOWED' : 'GATE_ACCESS_DENIED'}
                    </h4>
                    <span className="text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold uppercase">
                      CODE {simResult.status} - {simResult.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-2 font-medium">
                    {simResult.message}
                  </p>
                  
                  {/* JSON Payload */}
                  <pre className="mt-3 p-3 bg-black border border-zinc-900 rounded text-[9px] text-zinc-400 font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify({
                      timestamp: new Date().toISOString(),
                      client: activeAgent.name,
                      resource: `${activeEndpoint.method} ${activeEndpoint.path}`,
                      authorized: simResult.ok,
                      policyResponse: {
                        statusCode: simResult.status,
                        errorCode: simResult.ok ? null : simResult.code,
                        transactionId: `tx_` + Math.random().toString(36).substring(2, 10)
                      }
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs History */}
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="meta-label font-mono uppercase text-[9px] block">(04. Audit Log Trace)</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Live security audit database</span>
              </div>
              <button 
                onClick={() => setAuditLogs([])}
                className="text-[10px] flex items-center gap-1 text-zinc-500 hover:text-zinc-300 cursor-pointer font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET_DB</span>
              </button>
            </div>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-[10px] text-zinc-700 py-3 text-center font-mono">NO_AUDIT_RECORDS_FOUND</p>
              ) : (
                auditLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4 p-2 bg-black border border-zinc-900 font-mono text-[9px] leading-relaxed">
                    <div className="flex gap-2">
                      <span className="text-zinc-600">[{log.timestamp}]</span>
                      <span className="text-brand-cyan">{log.agent}:</span>
                      <span className="text-zinc-300">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold shrink-0">
                      <span className={`text-[8px] px-1 rounded ${
                        log.status === 'ALLOW' 
                          ? 'bg-brand-cyan/10 text-brand-cyan' 
                          : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
