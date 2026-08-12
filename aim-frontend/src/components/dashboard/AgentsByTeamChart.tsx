import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface AgentsByTeamChartProps {
  data: { team: string; count: number }[];
}

export const AgentsByTeamChart: React.FC<AgentsByTeamChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wider">
        Agents by Team
      </h3>
      <div className="h-[240px] w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
              nameKey="team"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
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
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(val) => (
                <span className="text-xs text-slate-600 font-medium">{val}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Total Count Overlay */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-2xl font-bold font-mono text-slate-900">{total}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</div>
        </div>
      </div>
    </div>
  );
};

export default AgentsByTeamChart;
