import React from 'react';
import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from 'recharts';

// Modern Tailwind color palette: Indigo, Cyan, Emerald, Blue, Violet, Pink, Teal
const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

interface AgentsByTeamChartProps {
 data: { team: string; count: number }[];
}

const CustomTooltip = ({ active, payload }: any) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl flex items-center gap-3">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
 <div>
 <p className="text-xs font-semibold text-slate-300 mb-1">{payload[0].name}</p>
 <p className="text-sm font-bold text-white">{payload[0].value} Agents</p>
 </div>
 </div>
 );
 }
 return null;
};

export const AgentsByTeamChart: React.FC<AgentsByTeamChartProps> = ({ data }) => {
 const total = data.reduce((acc, curr) => acc + curr.count, 0);

 return (
 <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
 <h3 className="text-sm font-semibold text-slate-800 mb-2 uppercase tracking-wider">
 Agents by Team
 </h3>
 <div className="w-full relative flex items-center justify-center" style={{ height: 260 }}>
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="45%"
 innerRadius={75}
 outerRadius={105}
 paddingAngle={4}
 dataKey="count"
 nameKey="team"
 stroke="none"
 >
 {data.map((_, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip content={<CustomTooltip />} />
 <Legend
 verticalAlign="bottom"
 align="center"
 iconType="circle"
 wrapperStyle={{ paddingTop: '20px', lineHeight: '24px' }}
 formatter={(val) => (
 <span className="text-xs text-slate-600 font-medium mr-2">{val}</span>
 )}
 />
 </PieChart>
 </ResponsiveContainer>
 {/* Center Total Count Overlay */}
 <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
 <div className="text-3xl font-bold font-mono text-slate-900 ">{total}</div>
 <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</div>
 </div>
 </div>
 </div>
 );
};

export default AgentsByTeamChart;
