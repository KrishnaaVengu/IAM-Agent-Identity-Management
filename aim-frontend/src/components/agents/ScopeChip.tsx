import React from 'react';

export interface ScopeChipProps {
  scope: string;
}

export const ScopeChip: React.FC<ScopeChipProps> = ({ scope }) => {
  return (
    <span className="bg-slate-100 text-slate-700 text-xs font-mono px-1.5 py-0.5 rounded border border-slate-200 inline-block">
      {scope}
    </span>
  );
};

export interface ScopeChipListProps {
  scopes: string[];
  max?: number;
}

export const ScopeChipList: React.FC<ScopeChipListProps> = ({ scopes, max = 2 }) => {
  if (!scopes || scopes.length === 0) {
    return <span className="text-slate-400 text-xs italic">None</span>;
  }

  const visible = scopes.slice(0, max);
  const remaining = scopes.length - max;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((s) => (
        <ScopeChip key={s} scope={s} />
      ))}
      {remaining > 0 && (
        <span className="text-slate-500 text-xs font-medium">+{remaining} more</span>
      )}
    </div>
  );
};

export default ScopeChip;
