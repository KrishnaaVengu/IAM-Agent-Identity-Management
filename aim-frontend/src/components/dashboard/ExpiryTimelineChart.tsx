import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { daysUntil } from '../../lib/utils';

interface ExpiryTimelineChartProps {
  data: { agentId: string; name: string; expiresAt: string }[];
  simNow: string;
}

export const ExpiryTimelineChart: React.FC<ExpiryTimelineChartProps> = ({
  data,
  simNow,
}) => {
  const chartData = data.map((item) => {
    const daysLeft = daysUntil(item.expiresAt, simNow);
    return {
      agentId: item.agentId,
      name: item.name.length > 14 ? `${item.name.substring(0, 12)}...` : item.name,
      fullName: item.name,
      daysLeft: Math.max(0, daysLeft),
      rawDaysLeft: daysLeft,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
        Agent Expiry Timeline (Days Remaining)
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(_: any, __: any, item: any) => {
                const days = item.payload.rawDaysLeft;
                if (days <= 0) return ['Expired', 'Status'];
                return [`${days} days remaining`, 'Expiry'];
              }}
              labelFormatter={(_, items) => items[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="daysLeft" radius={[4, 4, 0, 0]} barSize={24}>
              {chartData.map((entry, index) => {
                let fill = '#10b981'; // Green (>7 days)
                if (entry.rawDaysLeft <= 0) {
                  fill = '#ef4444'; // Red (Expired)
                } else if (entry.rawDaysLeft <= 7) {
                  fill = '#f59e0b'; // Amber (1-7 days)
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpiryTimelineChart;
