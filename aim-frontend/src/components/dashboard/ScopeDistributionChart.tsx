import React from 'react';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 CartesianGrid,
 Cell,
} from 'recharts';

interface ScopeDistributionChartProps {
 data: { scope: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
 <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
 <p className="text-sm font-bold text-cyan-400">{payload[0].value} Agents</p>
 </div>
 );
 }
 return null;
};

export const ScopeDistributionChart: React.FC<ScopeDistributionChartProps> = ({ data }) => {
 return (
 <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-colors">
 <h3 className="text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">
 Scope Distribution
 </h3>
 <div className="w-full" style={{ height: 260 }}>
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 layout="vertical"
 data={data}
 margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
 >
 <defs>
 <linearGradient id="colorCount" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
 <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
 <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
 <YAxis
 type="category"
 dataKey="scope"
 stroke="#94a3b8"
 fontSize={11}
 width={110}
 axisLine={false}
 tickLine={false}
 tickFormatter={(val) => (val.length > 16 ? `${val.substring(0, 14)}...` : val)}
 />
 <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
 <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
 {data.map((_, index) => (
 <Cell key={`cell-${index}`} fill="url(#colorCount)" />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 );
};

export default ScopeDistributionChart;
