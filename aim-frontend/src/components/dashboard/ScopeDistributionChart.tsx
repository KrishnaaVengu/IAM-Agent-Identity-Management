import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface ScopeDistributionChartProps {
  data: { scope: string; count: number }[];
}

export const ScopeDistributionChart: React.FC<ScopeDistributionChartProps> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
        Scope Distribution
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="scope"
              stroke="#64748b"
              fontSize={11}
              width={110}
              tickFormatter={(val) => (val.length > 16 ? `${val.substring(0, 14)}...` : val)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value} Agents`, 'Count']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScopeDistributionChart;
