import React from 'react';
import { useToastStore } from '../../stores/toastStore';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export const Toaster: React.FC = () => {
 const { toasts, dismiss } = useToastStore();

 if (toasts.length === 0) return null;

 return (
 <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
 {toasts.map((toast) => (
 <div
 key={toast.id}
 className={`flex items-start justify-between p-4 rounded-xl shadow-lg border text-sm transition-all ${
 toast.variant === 'destructive'
 ? 'bg-red-900 border-red-700 text-white'
 : 'bg-slate-900 border-slate-800 text-white'
 }`}
 >
 <div className="flex gap-3">
 {toast.variant === 'destructive' ? (
 <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
 ) : (
 <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
 )}
 <div>
 <div className="font-semibold text-white">{toast.title}</div>
 <div className="text-slate-300 text-xs mt-0.5">{toast.description}</div>
 </div>
 </div>
 <button
 onClick={() => dismiss(toast.id)}
 className="text-slate-400 hover:text-white p-1"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 );
};

export default Toaster;
