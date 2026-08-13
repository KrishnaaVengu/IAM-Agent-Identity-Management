import React from 'react';
import type { AgentStatus } from '../../types/agent';

interface AgentStatusBadgeProps {
 status: AgentStatus;
}

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ status }) => {
 const styles = {
 active: 'bg-green-100 text-green-800 border-green-200',
 suspended: 'bg-amber-100 text-amber-800 border-amber-200',
 decommissioned: 'bg-red-100 text-red-800 border-red-200',
 };

 const labels = {
 active: 'Active',
 suspended: 'Suspended',
 decommissioned: 'Decommissioned',
 };

 return (
 <span
 className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
 styles[status] || styles.active
 }`}
 >
 <span className="w-1.5 h-1.5 rounded-full bg-current" />
 {labels[status] || status}
 </span>
 );
};

export default AgentStatusBadge;
