import React, { useMemo, useState } from 'react';
import {
 AreaChart, Area, LineChart, Line, BarChart, Bar,
 XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { daysUntil } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface ExpiryTimelineChartProps {
 data: { agentId: string; name: string; expiresAt: string }[];
 simNow: string;
}

const CustomAreaTooltip = ({ active, payload, label }: any) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
 <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
 <p className="text-sm font-bold text-indigo-400">{payload[0].value} Agents Expiring</p>
 </div>
 );
 }
 return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
 if (active && payload && payload.length) {
 return (
 <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-xl">
 <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
 {payload.map((entry: any, index: number) => (
   <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
     {entry.name}: {entry.value}
   </p>
 ))}
 </div>
 );
 }
 return null;
};

export const ExpiryTimelineChart: React.FC<ExpiryTimelineChartProps> = ({
 data,
 simNow,
}) => {
 const [activeView, setActiveView] = useState('expiry');

 const expiryData = useMemo(() => {
 const buckets = { 'Expired': 2, '0-7 Days': 5, '8-15 Days': 12, '16-30 Days': 8, '31-60 Days': 4, '60+ Days': 3 };
 data.forEach((item) => {
 const daysLeft = daysUntil(item.expiresAt, simNow);
 if (daysLeft <= 0) buckets['Expired']++;
 else if (daysLeft <= 7) buckets['0-7 Days']++;
 else if (daysLeft <= 15) buckets['8-15 Days']++;
 else if (daysLeft <= 30) buckets['16-30 Days']++;
 else if (daysLeft <= 60) buckets['31-60 Days']++;
 else buckets['60+ Days']++;
 });
 return [
 { name: 'Expired', count: buckets['Expired'] },
 { name: '0-7 Days', count: buckets['0-7 Days'] },
 { name: '8-15 Days', count: buckets['8-15 Days'] },
 { name: '16-30 Days', count: buckets['16-30 Days'] },
 { name: '31-60 Days', count: buckets['31-60 Days'] },
 { name: '60+ Days', count: buckets['60+ Days'] },
 ];
 }, [data, simNow]);

 const trendData = [
  { date: 'Mon', registrations: 4, activity: 120 },
  { date: 'Tue', registrations: 7, activity: 250 },
  { date: 'Wed', registrations: 3, activity: 180 },
  { date: 'Thu', registrations: 8, activity: 300 },
  { date: 'Fri', registrations: 2, activity: 220 },
  { date: 'Sat', registrations: 5, activity: 150 },
  { date: 'Sun', registrations: 9, activity: 280 }
 ];

 const teamRiskData = [
  { team: 'Frontend', Read: 12, Write: 4, Admin: 1 },
  { team: 'Backend', Read: 18, Write: 14, Admin: 5 },
  { team: 'Platform', Read: 8, Write: 12, Admin: 10 },
  { team: 'Data Science', Read: 25, Write: 2, Admin: 0 },
 ];

 const inactivityData = [
  { range: '< 7 Days', agents: 45 },
  { range: '7-14 Days', agents: 22 },
  { range: '15-29 Days', agents: 14 },
  { range: '30+ Days Stale', agents: 8 },
 ];

 return (
 <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-colors flex flex-col h-[320px] md:h-[400px]">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 z-10">
     <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
       Visual Analytics
     </h3>
     <div id="tour-chart-switcher" className="relative">
       <select
         value={activeView}
         onChange={(e) => setActiveView(e.target.value)}
         className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 pr-9 cursor-pointer shadow-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
       >
         <option value="expiry">Agent Expiry Timeline</option>
         <option value="trend">Registration & Activity Trend</option>
         <option value="team">Team Risk & Scope Distribution</option>
         <option value="inactivity">Inactivity Heatmap</option>
       </select>
       <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
     </div>
   </div>

   <div className="w-full flex-1 relative">
     <AnimatePresence mode="wait">
       <motion.div
         key={activeView}
         initial={{ opacity: 0, y: 10, scale: 0.98 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: -10, scale: 0.98 }}
         transition={{ duration: 0.3 }}
         className="absolute inset-0"
       >
         <ResponsiveContainer width="100%" height="100%">
           {activeView === 'expiry' ? (
             <AreaChart data={expiryData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
               <defs>
                 <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                   <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
               <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
               <Tooltip cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} content={<CustomAreaTooltip />} />
               <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
             </AreaChart>
           ) : activeView === 'trend' ? (
             <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="date" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
               <YAxis yAxisId="left" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
               <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
               <Tooltip content={<CustomTooltip />} />
               <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }} />
               <Line yAxisId="left" type="monotone" dataKey="registrations" name="New Agents" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
               <Line yAxisId="right" type="monotone" dataKey="activity" name="API Calls" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
             </LineChart>
           ) : activeView === 'team' ? (
             <BarChart data={teamRiskData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="team" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
               <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
               <Tooltip content={<CustomTooltip />} />
               <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }} />
               <Bar dataKey="Read" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
               <Bar dataKey="Write" stackId="a" fill="#f59e0b" />
               <Bar dataKey="Admin" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
             </BarChart>
           ) : (
             <BarChart data={inactivityData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="range" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
               <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
               <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
               <Bar dataKey="agents" name="Agents" fill="#6366f1" radius={[4, 4, 0, 0]} />
             </BarChart>
           )}
         </ResponsiveContainer>
       </motion.div>
     </AnimatePresence>
   </div>
 </div>
 );
};

export default ExpiryTimelineChart;
