import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Eye,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  AlertTriangle
} from 'lucide-react';
import type { AgentIdentity } from '../../types/agent';
import { usePermission } from '../../hooks/usePermission';

interface AgentActionMenuProps {
  agent: AgentIdentity;
  onSuspend?: () => void;
  onReactivate?: () => void;
  onRotate?: () => void;
  onDecommission?: () => void;
}

export const AgentActionMenu: React.FC<AgentActionMenuProps> = ({
  agent,
  onSuspend,
  onReactivate,
  onRotate,
  onDecommission,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canRotate = usePermission('rotate');
  const canSuspend = usePermission('suspend');
  const canReactivate = usePermission('reactivate');
  const canDecommission = usePermission('decommission');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="Agent Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-40 text-xs">
          {/* View Detail */}
          <button
            onClick={() => {
              setOpen(false);
              navigate(`/agents/${agent.agentId}`);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View Detail</span>
          </button>

          {/* Rotate Credential */}
          {canRotate && agent.status === 'active' && onRotate && (
            <button
              onClick={() => {
                setOpen(false);
                onRotate();
              }}
              className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>Rotate Credential</span>
            </button>
          )}

          {(canSuspend || canReactivate || canDecommission) && (
            <div className="my-1 border-t border-slate-100" />
          )}

          {/* Suspend */}
          {canSuspend && agent.status === 'active' && onSuspend && (
            <button
              onClick={() => {
                setOpen(false);
                onSuspend();
              }}
              className="w-full text-left px-3 py-2 text-amber-700 hover:bg-amber-50 flex items-center gap-2 font-medium"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Suspend</span>
            </button>
          )}

          {/* Reactivate */}
          {canReactivate && agent.status === 'suspended' && onReactivate && (
            <button
              onClick={() => {
                setOpen(false);
                onReactivate();
              }}
              className="w-full text-left px-3 py-2 text-green-700 hover:bg-green-50 flex items-center gap-2 font-medium"
            >
              <PlayCircle className="w-3.5 h-3.5 text-green-500" />
              <span>Reactivate</span>
            </button>
          )}

          {/* Decommission */}
          {canDecommission && agent.status !== 'decommissioned' && onDecommission && (
            <button
              onClick={() => {
                setOpen(false);
                onDecommission();
              }}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Decommission</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentActionMenu;
