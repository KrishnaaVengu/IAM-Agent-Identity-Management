export interface TeamBreakdownEntry {
 total: number;
 stale: number;
}

export interface AccessReviewReport {
 reviewId: string;
 runAt: string;
 runBy: string;
 totalActiveAgents: number;
 staleAgentIds: string[];
 teamBreakdown: Record<string, TeamBreakdownEntry>;
 sensitiveScopeHolders: string[];
}
