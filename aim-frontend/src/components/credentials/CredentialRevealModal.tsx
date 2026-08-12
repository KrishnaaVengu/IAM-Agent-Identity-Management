import React, { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Check, Key } from 'lucide-react';
import type { CredentialWithToken } from '../../types/credential';
import { formatDateTime } from '../../lib/utils';
import { ScopeChipList } from '../agents/ScopeChip';

export interface CredentialRevealModalProps {
  open: boolean;
  credential: CredentialWithToken | null;
  agentName: string;
  onClose: () => void;
}

export const CredentialRevealModal: React.FC<CredentialRevealModalProps> = ({
  open,
  credential,
  agentName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setIsChecked(false);
    }
  }, [open]);

  if (!open || !credential) return null;

  const handleCopy = () => {
    if (credential.fullToken) {
      navigator.clipboard.writeText(credential.fullToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (isChecked) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden p-6">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Save your credential — it won't be shown again
            </h3>
            <p className="text-xs text-slate-500">
              Generated for <span className="font-semibold text-slate-700">{agentName}</span>
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 mb-5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            This is the <strong>only time</strong> this token will be displayed. Store it in a secure secrets manager before closing.
          </span>
        </div>

        {/* Token Box */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-5 relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Full API Token</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="font-mono text-sm text-green-400 break-all select-all leading-relaxed">
            {credential.fullToken}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Token Preview</span>
            <span className="font-mono font-medium text-slate-800">{credential.tokenPreview}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Expires At</span>
            <span className="font-mono font-medium text-slate-800">{formatDateTime(credential.expiresAt)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block mb-1">Approved Scopes</span>
            <ScopeChipList scopes={credential.scopes} max={6} />
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer select-none mb-6">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
          />
          <span>I have copied this credential to a secure location</span>
        </label>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={handleClose}
            disabled={!isChecked}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialRevealModal;
