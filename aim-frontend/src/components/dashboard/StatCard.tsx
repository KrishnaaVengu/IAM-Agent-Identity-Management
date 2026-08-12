import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'default',
}) => {
  const iconContainerStyles = {
    default: 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-red-50 text-red-600 border-red-100',
  };

  const valueStyles = {
    default: 'text-slate-900',
    success: 'text-slate-900',
    warning: 'text-amber-700',
    danger: 'text-red-700',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
      <div>
        <div className={`text-3xl font-bold font-mono tracking-tight ${valueStyles[variant]}`}>
          {value}
        </div>
        <div className="text-sm font-medium text-slate-500 mt-1">{label}</div>
      </div>
      <div
        className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconContainerStyles[variant]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
