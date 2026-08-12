import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { AgentFilters as AgentFiltersType, AgentStatus } from '../../types/agent';
import { SCOPE_CATALOG } from '../../lib/scopeCatalog';

const TEAMS = [
  'Engineering',
  'Security',
  'Data-Platform',
  'Customer-Support',
  'Finance-Automation',
  'Product-Analytics',
];

interface AgentFiltersProps {
  filters: AgentFiltersType;
  onChange: (filters: AgentFiltersType) => void;
}

export const AgentFilters: React.FC<AgentFiltersProps> = ({ filters, onChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [qInput, setQInput] = useState(filters.q || '');

  // Debounce search query input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qInput !== filters.q) {
        updateFilter('q', qInput || undefined);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [qInput]);

  const updateFilter = (key: keyof AgentFiltersType, value: any) => {
    const nextFilters = { ...filters, [key]: value };
    if (!value) delete nextFilters[key];

    onChange(nextFilters);

    // Sync with searchParams
    const newParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== '' && value !== false) {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, ID, purpose..."
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* Team Select */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Team:</label>
        <select
          value={filters.team || ''}
          onChange={(e) => updateFilter('team', e.target.value || undefined)}
          className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Teams</option>
          {TEAMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Status Select */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Status:</label>
        <select
          value={filters.status || ''}
          onChange={(e) => updateFilter('status', (e.target.value as AgentStatus) || undefined)}
          className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="decommissioned">Decommissioned</option>
        </select>
      </div>

      {/* Scope Select */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Scope:</label>
        <select
          value={filters.scope || ''}
          onChange={(e) => updateFilter('scope', e.target.value || undefined)}
          className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Scopes</option>
          {SCOPE_CATALOG.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}
            </option>
          ))}
        </select>
      </div>

      {/* Stale Only Checkbox */}
      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none border-l border-slate-200 pl-4 py-1">
        <input
          type="checkbox"
          checked={!!filters.stale}
          onChange={(e) => updateFilter('stale', e.target.checked || undefined)}
          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
        />
        <span>Stale Only (30+ days)</span>
      </label>
    </div>
  );
};

export default AgentFilters;
