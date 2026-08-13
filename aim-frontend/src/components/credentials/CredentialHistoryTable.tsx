import React from 'react';
import type { Credential } from '../../types/credential';
import { formatDateTime } from '../../lib/utils';
import EmptyState from '../shared/EmptyState';

interface CredentialHistoryTableProps {
 credentials: Credential[];
 simNow?: string;
}

export const CredentialHistoryTable: React.FC<CredentialHistoryTableProps> = ({
 credentials,
}) => {
 if (!credentials || credentials.length === 0) {
 return (
 <EmptyState
 title="No credentials found"
 description="No credential issuance history exists for this agent."
 />
 );
 }

 // Sort credentials descending by issuedAt date
 const sorted = [...credentials].sort(
 (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
 );

 return (
 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
 <th className="py-3 px-4">Credential ID</th>
 <th className="py-3 px-4">Token Preview</th>
 <th className="py-3 px-4">Issued</th>
 <th className="py-3 px-4">Expires</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4">Revoked At</th>
 <th className="py-3 px-4">Reason</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs font-mono">
 {sorted.map((c) => {
 const isActive = c.status === 'active';
 return (
 <tr
 key={c.credentialId}
 className={`transition-colors ${
 isActive ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50/80'
 }`}
 >
 {/* Credential ID */}
 <td className="py-3 px-4 text-slate-500">{c.credentialId}</td>

 {/* Token Preview */}
 <td className="py-3 px-4 text-slate-800 font-bold">{c.tokenPreview}</td>

 {/* Issued */}
 <td className="py-3 px-4 text-slate-600">{formatDateTime(c.issuedAt)}</td>

 {/* Expires */}
 <td className="py-3 px-4 text-slate-600">{formatDateTime(c.expiresAt)}</td>

 {/* Status */}
 <td className="py-3 px-4">
 {c.status === 'active' && (
 <span className="bg-green-100 text-green-800 border border-green-200 text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
 <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
 </span>
 )}
 {c.status === 'revoked' && (
 <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
 <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Revoked
 </span>
 )}
 {c.status === 'expired' && (
 <span className="bg-red-100 text-red-800 border border-red-200 text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-sans">
 <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Expired
 </span>
 )}
 </td>

 {/* Revoked At */}
 <td className="py-3 px-4 text-slate-500">
 {c.revokedAt ? formatDateTime(c.revokedAt) : '-'}
 </td>

 {/* Reason */}
 <td className="py-3 px-4 text-slate-500 capitalize">
 {c.revokedReason ? c.revokedReason.replace('_', ' ') : '-'}
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

export default CredentialHistoryTable;
