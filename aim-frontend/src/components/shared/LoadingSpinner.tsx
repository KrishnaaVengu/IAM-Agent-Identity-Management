import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
 return (
 <div className="flex h-full min-h-[300px] w-full items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
 </div>
 );
};

export default LoadingSpinner;
