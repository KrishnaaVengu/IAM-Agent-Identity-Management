import React from 'react';
import { daysUntil } from '../../lib/utils';

interface ExpiryProgressBarProps {
 issuedAt: string;
 expiresAt: string;
 simNow: string;
}

export const ExpiryProgressBar: React.FC<ExpiryProgressBarProps> = ({
 issuedAt,
 expiresAt,
 simNow,
}) => {
 const startMs = new Date(issuedAt).getTime();
 const endMs = new Date(expiresAt).getTime();
 const nowMs = new Date(simNow).getTime();

 const totalMs = Math.max(1, endMs - startMs);
 const elapsedMs = Math.max(0, nowMs - startMs);
 const pct = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

 const daysLeft = daysUntil(expiresAt, simNow);

 let fillColor = 'bg-green-500';
 let textColor = 'text-slate-600';
 let textLabel = `${daysLeft} days remaining`;

 if (daysLeft <= 0) {
 fillColor = 'bg-red-500';
 textColor = 'text-red-600 font-medium';
 textLabel = 'Expired';
 } else if (daysLeft <= 7) {
 fillColor = 'bg-amber-500';
 textColor = 'text-amber-700 font-medium';
 textLabel = `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} remaining`;
 }

 return (
 <div className="w-full max-w-[140px]">
 <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden w-full">
 <div
 className={`h-full ${fillColor} transition-all duration-300`}
 style={{ width: `${pct}%` }}
 />
 </div>
 <div className={`text-xs ${textColor} mt-1 flex items-center justify-between`}>
 <span>{textLabel}</span>
 </div>
 </div>
 );
};

export default ExpiryProgressBar;
