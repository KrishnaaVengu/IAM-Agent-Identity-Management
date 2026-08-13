import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Home, AlertTriangle } from 'lucide-react';

export const NotFound: React.FC = () => {
 return (
 <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans transition-colors">
 <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xl max-w-md w-full">
 <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
 <AlertTriangle className="w-8 h-8" />
 </div>
 
 <h1 className="text-4xl font-black text-slate-900 mb-2 font-mono">404</h1>
 <h2 className="text-xl font-bold text-slate-800 mb-4">Route Not Found</h2>
 
 <p className="text-sm text-slate-500 mb-8 leading-relaxed">
 The requested agent endpoint or page could not be located in the current workspace. Please verify the path and try again.
 </p>

 <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
 <Link
 to="/"
 className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm"
 >
 <Home className="w-4 h-4" />
 Dashboard
 </Link>
 <Link
 to="/agents"
 className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors w-full sm:w-auto justify-center"
 >
 <Bot className="w-4 h-4" />
 Agent Registry
 </Link>
 </div>
 </div>
 </div>
 );
};

export default NotFound;
