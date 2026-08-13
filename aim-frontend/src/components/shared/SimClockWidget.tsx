import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, RotateCcw, Loader2, FastForward } from 'lucide-react';
import { useClockStore } from '../../stores/clockStore';
import { useToastStore } from '../../stores/toastStore';
import { devClockApi } from '../../api/devClock';
import { formatDate, formatDateTime } from '../../lib/utils';

export const SimClockWidget: React.FC = () => {
 const queryClient = useQueryClient();
 const { simNow, setSimNow, setAutoRevokedIds } = useClockStore();
 const pushToast = useToastStore((s) => s.push);

 const [expanded, setExpanded] = useState(false);
 const [loadingAction, setLoadingAction] = useState<string | null>(null);
 const [targetDate, setTargetDate] = useState('');
 const widgetRef = useRef<HTMLDivElement>(null);

 // Close dropdown on outside click
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
 setExpanded(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleAdvanceDays = async (days: number, actionId: string) => {
 try {
 setLoadingAction(actionId);
 const res = await devClockApi.advance(days);
 const { newSimTime, autoRevokedAgentIds } = res.data;

 setSimNow(newSimTime);
 if (autoRevokedAgentIds && autoRevokedAgentIds.length > 0) {
 setAutoRevokedIds(autoRevokedAgentIds);
 autoRevokedAgentIds.forEach((id) => {
 pushToast({
 title: 'Agent Decommissioned',
 description: `Agent ${id} was decommissioned — credential expired without renewal.`,
 variant: 'destructive',
 });
 });
 }

 await queryClient.invalidateQueries();
 setExpanded(false);
 } catch (err: any) {
 pushToast({
 title: 'Error advancing clock',
 description: err?.response?.data?.error?.message || 'Failed to advance simulation clock.',
 variant: 'destructive',
 });
 } finally {
 setLoadingAction(null);
 }
 };

 const handleJumpToDate = async () => {
 if (!targetDate) return;
 const targetMs = new Date(targetDate).getTime();
 const currentMs = new Date(simNow).getTime();

 if (isNaN(targetMs)) return;

 const diffDays = Math.ceil((targetMs - currentMs) / (1000 * 60 * 60 * 24));
 if (diffDays <= 0) {
 pushToast({
 title: 'Invalid target date',
 description: 'Please select a future date to advance simulation time.',
 variant: 'destructive',
 });
 return;
 }

 await handleAdvanceDays(diffDays, 'jump');
 };

 const handleReset = async () => {
 try {
 setLoadingAction('reset');
 const res = await devClockApi.reset();
 setSimNow(res.data.simNow);
 await queryClient.invalidateQueries();

 pushToast({
 title: 'Clock Reset',
 description: 'Clock reset to real time',
 variant: 'default',
 });
 setExpanded(false);
 } catch (err: any) {
 pushToast({
 title: 'Error resetting clock',
 description: err?.response?.data?.error?.message || 'Failed to reset clock.',
 variant: 'destructive',
 });
 } finally {
 setLoadingAction(null);
 }
 };

 return (
 <div id="tour-dev-clock" className="relative inline-block text-left" ref={widgetRef}>
 {/* Collapsed Pill Button */}
 <button
 type="button"
 onClick={() => setExpanded(!expanded)}
 className="bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-300/80 rounded-full px-3 py-1 text-xs font-semibold font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer select-none shadow-sm"
 >
 <Clock className="w-3.5 h-3.5 text-amber-700" />
 <span>SIM TIME · {formatDate(simNow)}</span>
 </button>

 {/* Expanded Dropdown Panel */}
 {expanded && (
 <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-80 absolute right-0 top-full mt-2 z-50 animate-fade-in font-sans">
 {/* Header */}
 <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
 <div className="flex items-center gap-2">
 <span className="text-base">🕐</span>
 <span className="font-bold text-slate-900 text-sm">Demo Clock</span>
 </div>
 <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border border-amber-200 uppercase tracking-wider">
 Simulated
 </span>
 </div>

 {/* Current Sim Time */}
 <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
 <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-0.5">
 Current Simulation Date
 </span>
 <span className="text-base font-bold font-mono text-slate-800">
 {formatDateTime(simNow)}
 </span>
 </div>

 {/* Advance Time Section */}
 <div className="mb-4">
 <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
 <FastForward className="w-3.5 h-3.5 text-slate-400" /> Advance Time
 </label>
 <div className="grid grid-cols-2 gap-1.5 mb-3">
 {[
 { label: '+1 day', days: 1, id: 'adv1' },
 { label: '+7 days', days: 7, id: 'adv7' },
 { label: '+30 days', days: 30, id: 'adv30' },
 { label: '+35 days (Stale Test)', days: 35, id: 'adv35' },
 ].map(({ label, days, id }) => (
 <button
 key={id}
 type="button"
 disabled={loadingAction !== null}
 onClick={() => handleAdvanceDays(days, id)}
 className="border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
 >
 {loadingAction === id ? (
 <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
 ) : (
 <span>{label}</span>
 )}
 </button>
 ))}
 </div>

 {/* Jump to Date */}
 <div className="flex items-center gap-2">
 <div className="relative flex-1">
 <input
 type="date"
 value={targetDate}
 onChange={(e) => setTargetDate(e.target.value)}
 className="w-full pl-3 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50"
 />
 </div>
 <button
 type="button"
 disabled={!targetDate || loadingAction !== null}
 onClick={handleJumpToDate}
 className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:bg-slate-200 disabled:text-slate-400 flex items-center gap-1"
 >
 {loadingAction === 'jump' ? (
 <Loader2 className="w-3 h-3 animate-spin text-white" />
 ) : (
 'Go'
 )}
 </button>
 </div>
 </div>

 {/* Reset Section */}
 <div className="mb-4 pt-2 border-t border-slate-100">
 <button
 type="button"
 disabled={loadingAction !== null}
 onClick={handleReset}
 className="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg w-full transition-colors flex items-center justify-center gap-1.5 font-medium disabled:opacity-50"
 >
 {loadingAction === 'reset' ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
 ) : (
 <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
 )}
 <span>Reset to real time</span>
 </button>
 </div>

 {/* Info Box */}
 <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 leading-normal">
 Clock advances trigger expiry sweeps. Agents whose credentials have passed their expiry date will be automatically decommissioned.
 </div>
 </div>
 )}
 </div>
 );
};

export default SimClockWidget;
