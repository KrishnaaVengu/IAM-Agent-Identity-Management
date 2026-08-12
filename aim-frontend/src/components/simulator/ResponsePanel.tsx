import React from 'react';
import { Terminal, CheckCircle2, XCircle, ChevronDown, Loader2 } from 'lucide-react';
import type { SimulatorCallResult } from '../../api/simulator';

export interface ResponsePanelProps {
  result: SimulatorCallResult | null;
  isLoading: boolean;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-700">Evaluating Access Policy...</p>
        <p className="text-xs text-slate-400">Verifying credential validity and scope grants.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px] space-y-3">
        <div className="p-3 bg-slate-100 rounded-full text-slate-400">
          <Terminal className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Send a test call to see the result</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Select an agent identity and target endpoint on the left, then click "Send Test Call" to simulate policy enforcement.
        </p>
      </div>
    );
  }

  const isAllowed = result.result === 'ALLOWED';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Header Bar */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isAllowed
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          {isAllowed ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span>
            {isAllowed ? '✅' : '❌'} {result.statusCode} {result.result}
          </span>
        </div>

        <div className="text-xs font-mono opacity-80">
          {result.endpoint} {result.requiredScope ? `· ${result.requiredScope}` : ''}
        </div>
      </div>

      {/* Details Table */}
      <div className="p-5 space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 block mb-0.5">Status Code</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{result.statusCode}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Evaluation Result</span>
            <span
              className={`font-semibold ${
                isAllowed ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {result.result}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Reason Code</span>
            <span className="font-mono font-semibold text-slate-800">{result.reasonCode}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Required Scope</span>
            <span className="font-mono text-slate-800">{result.requiredScope || 'None'}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 block mb-1">Message</span>
          <p className="p-3 bg-slate-100 rounded-lg text-slate-800 font-sans border border-slate-200">
            {result.message}
          </p>
        </div>

        {/* Collapsible Raw JSON Response */}
        <details className="group border border-slate-200 rounded-xl overflow-hidden bg-slate-900">
          <summary className="px-4 py-2.5 bg-slate-800 text-slate-300 font-mono text-xs font-semibold cursor-pointer flex items-center justify-between select-none hover:bg-slate-700/80 transition-colors">
            <span>Raw Response Payload (JSON)</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="p-4">
            <pre className="font-mono text-xs bg-slate-900 text-green-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ResponsePanel;
