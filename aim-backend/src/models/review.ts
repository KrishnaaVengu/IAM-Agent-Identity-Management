export interface TeamBreakdown {
  total: number;
  stale: number;
}

export interface AccessReviewReport {
  reviewId: string;
  runAt: string;
  runBy: string;
  totalActiveAgents: number;
  staleAgentIds: string[];
  teamBreakdown: Record<string, TeamBreakdown>;
  sensitiveScopeHolders: string[];
}
