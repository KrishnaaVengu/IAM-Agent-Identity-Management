import React from 'react';
import { Users, AlertTriangle, Percent, Lock } from 'lucide-react';
import type { AccessReviewReport } from '../../types/review';

export interface ReviewReportCardProps {
  report: AccessReviewReport;
}

export const ReviewReportCard: React.FC<ReviewReportCardProps> = ({ report }) => {
  const totalActive = report.totalActiveAgents || 0;
  const staleCount = report.staleAgentIds?.length || 0;
  const stalePercent = totalActive > 0 ? ((staleCount / totalActive) * 100).toFixed(1) : '0.0';
  const sensitiveCount = report.sensitiveScopeHolders?.length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Active Agents */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{totalActive}</div>
          <div className="text-xs font-medium text-slate-500">Total Active Agents</div>
        </div>
      </div>

      {/* Stale Agents */}
      <div
        className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 ${
          staleCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
        }`}
      >
        <div
          className={`p-3 rounded-xl border ${
            staleCount > 0
              ? 'bg-amber-100 border-amber-200 text-amber-700'
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div
            className={`text-2xl font-bold ${
              staleCount > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {staleCount}
          </div>
          <div className="text-xs font-medium text-slate-500">Stale Agents</div>
        </div>
      </div>

      {/* Stale % */}
      <div
        className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 ${
          staleCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
        }`}
      >
        <div
          className={`p-3 rounded-xl border ${
            staleCount > 0
              ? 'bg-amber-100 border-amber-200 text-amber-700'
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          <Percent className="w-6 h-6" />
        </div>
        <div>
          <div
            className={`text-2xl font-bold ${
              staleCount > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {stalePercent}%
          </div>
          <div className="text-xs font-medium text-slate-500">Stale Agent Ratio</div>
        </div>
      </div>

      {/* Sensitive Scope Holders */}
      <div
        className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 ${
          sensitiveCount > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
        }`}
      >
        <div
          className={`p-3 rounded-xl border ${
            sensitiveCount > 0
              ? 'bg-amber-100 border-amber-200 text-amber-700'
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <div
            className={`text-2xl font-bold ${
              sensitiveCount > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}
          >
            {sensitiveCount}
          </div>
          <div className="text-xs font-medium text-slate-500">Sensitive Scope Holders</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewReportCard;
