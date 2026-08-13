export interface DashboardStats {
 summary: {
 totalAgents: number;
 active: number;
 suspended: number;
 decommissioned: number;
 stale: number;
 expiringWithin7Days: number;
 };
 scopeDistribution: { scope: string; count: number }[];
 agentsByTeam: { team: string; count: number }[];
 expiryTimeline: { agentId: string; name: string; expiresAt: string }[];
 attentionNeeded: {
 expiringSoon: string[];
 stale: string[];
 sensitiveScopesUnreviewed: string[];
 };
}
