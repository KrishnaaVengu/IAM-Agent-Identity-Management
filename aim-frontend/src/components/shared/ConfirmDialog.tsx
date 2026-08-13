import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 title: string;
 description: string;
 confirmLabel?: string;
 requireTypedConfirmation?: string;
 onConfirm: () => void;
 isLoading?: boolean;
 variant?: 'destructive' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
 open,
 onOpenChange,
 title,
 description,
 confirmLabel = 'Confirm',
 requireTypedConfirmation,
 onConfirm,
 isLoading = false,
 variant = 'default',
}) => {
 const [inputValue, setInputValue] = useState('');

 useEffect(() => {
 if (!open) {
 setInputValue('');
 }
 }, [open]);

 if (!open) return null;

 const isConfirmed = requireTypedConfirmation
 ? inputValue === requireTypedConfirmation
 : true;

 const handleConfirm = () => {
 if (isConfirmed && !isLoading) {
 onConfirm();
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
 <button
 onClick={() => onOpenChange(false)}
 className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
 >
 <X className="w-4 h-4" />
 </button>

 <div className="flex items-start gap-4 mb-4">
 {variant === 'destructive' && (
 <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
 <AlertTriangle className="w-5 h-5 text-red-600" />
 </div>
 )}
 <div>
 <h3 className="text-lg font-bold text-slate-900">{title}</h3>
 <p className="text-sm text-slate-500 mt-1">{description}</p>
 </div>
 </div>

 {requireTypedConfirmation && (
 <div className="mt-4 mb-2">
 <label className="block text-xs font-medium text-slate-700 mb-1.5">
 To confirm, type <span className="font-mono font-bold text-slate-900">{requireTypedConfirmation}</span> below:
 </label>
 <input
 type="text"
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 placeholder={requireTypedConfirmation}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
 />
 </div>
 )}

 <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
 <button
 type="button"
 onClick={() => onOpenChange(false)}
 disabled={isLoading}
 className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
 >
 Cancel
 </button>

 <button
 type="button"
 onClick={handleConfirm}
 disabled={!isConfirmed || isLoading}
 className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-sm ${
 variant === 'destructive'
 ? 'bg-red-600 hover:bg-red-500 text-white disabled:bg-red-300'
 : 'bg-blue-600 hover:bg-blue-500 text-white disabled:bg-blue-300'
 }`}
 >
 {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
 <span>{confirmLabel}</span>
 </button>
 </div>
 </div>
 </div>
 );
};

export default ConfirmDialog;
