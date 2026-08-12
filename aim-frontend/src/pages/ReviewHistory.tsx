import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardCheck, Play, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { useReviewList, useRunReview } from '../hooks/useReviews';
import { usePermission } from '../hooks/usePermission';
import { useToastStore } from '../stores/toastStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorBanner from '../components/shared/ErrorBanner';
import EmptyState from '../components/shared/EmptyState';
import { formatDateTime } from '../lib/utils';

export const ReviewHistory: React.FC = () => {
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.push);
  const canRunReview = usePermission('run_review');

  const { data: reviewList, isLoading, error, refetch } = useReviewList();
  const runReviewMutation = useRunReview();

  const reviews = Array.isArray(reviewList) ? reviewList : (reviewList as any)?.reviews || [];

  const handleRunReview = async () => {
    try {
      const res = await runReviewMutation.mutateAsync('Admin');
      const report = res.data;
      pushToast({
        title: 'Access Review Generated',
        description: `Successfully executed audit sweep for ${report.totalActiveAgents} active agents.`,
        variant: 'default',
      });
      navigate(`/reviews/${report.reviewId}`);
    } catch (err: any) {
      pushToast({
        title: 'Review Execution Failed',
        description: err?.response?.data?.error?.message || 'Failed to trigger access review.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message="Failed to load access review history." onRetry={refetch} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            Access Reviews
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periodic machine access auditing and stale identity remediation reports.
          </p>
        </div>

        {canRunReview && (
          <button
            type="button"
            onClick={handleRunReview}
            disabled={runReviewMutation.isPending}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {runReviewMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Review...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>+ Run New Review</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Content */}
      {reviews.length === 0 ? (
        <EmptyState
          title="No Access Reviews Generated Yet"
          description="Periodic reviews help identify stale agents, unused permissions, and unreviewed sensitive scopes across all engineering teams."
          action={
            <button
              onClick={handleRunReview}
              disabled={runReviewMutation.isPending}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>+ Run First Access Review</span>
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Review Timestamp</th>
                  <th className="py-3.5 px-4">Run By</th>
                  <th className="py-3.5 px-4">Total Active</th>
                  <th className="py-3.5 px-4">Stale Count</th>
                  <th className="py-3.5 px-4">Stale %</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reviews.map((rev: any) => {
                  const staleCount = rev.staleAgentIds?.length || 0;
                  const totalActive = rev.totalActiveAgents || 0;
                  const staleRatio = totalActive > 0 ? ((staleCount / totalActive) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={rev.reviewId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-4 px-4 font-mono font-medium text-slate-900">
                        {formatDateTime(rev.runAt)}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rev.reviewId}</div>
                      </td>

                      {/* Run By */}
                      <td className="py-4 px-4 font-medium text-slate-700">{rev.runBy || 'Admin'}</td>

                      {/* Total Active */}
                      <td className="py-4 px-4 font-bold text-slate-900">{totalActive}</td>

                      {/* Stale Count */}
                      <td className="py-4 px-4">
                        {staleCount > 0 ? (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> {staleCount} Stale
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0 Stale</span>
                        )}
                      </td>

                      {/* Stale % */}
                      <td className="py-4 px-4 font-mono font-semibold">
                        <span className={staleCount > 0 ? 'text-amber-800' : 'text-slate-600'}>
                          {staleRatio}%
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/reviews/${rev.reviewId}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>View Report</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewHistory;
