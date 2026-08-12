import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Loader2, X } from 'lucide-react';
import type { AgentIdentity } from '../../types/agent';
import { formatDate } from '../../lib/utils';

export interface RotateCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentIdentity;
  onConfirm: (lifetimeDays?: number) => void;
  isLoading?: boolean;
}

export const RotateCredentialDialog: React.FC<RotateCredentialDialogProps> = ({
  open,
  onOpenChange,
  agent,
  onConfirm,
  isLoading = false,
}) => {
  const [lifetimeDays, setLifetimeDays] = useState<number>(
    agent?.requestedLifetimeDays || 30
  );

  useEffect(() => {
    if (agent?.requestedLifetimeDays) {
      setLifetimeDays(agent.requestedLifetimeDays);
    }
  }, [agent]);

  if (!open || !agent) return null;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + lifetimeDays);
  const expiryPreview = formatDate(futureDate.toISOString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Rotate Credential</h3>
            <p className="text-xs text-slate-500 font-mono">{agent.name}</p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            Rotating will immediately revoke the current credential. Any process using the old token will stop working.
          </span>
        </div>

        {/* Lifetime Radio Options */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Credential Lifetime
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setLifetimeDays(days)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                  lifetimeDays === days
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Live Expiry Preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between mb-6">
          <span>New credential expires:</span>
          <span className="font-mono font-bold text-slate-900">{expiryPreview}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(lifetimeDays)}
            disabled={isLoading}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:bg-red-300"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>Rotate Credential</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RotateCredentialDialog;
