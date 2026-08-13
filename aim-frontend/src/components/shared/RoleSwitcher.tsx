import React from 'react';
import { useRoleStore, type RoleStore } from '../../stores/roleStore';

const roles: RoleStore['role'][] = ['Admin', 'Team Owner', 'Viewer'];

export const RoleSwitcher: React.FC = () => {
 const { role, setRole } = useRoleStore();

 return (
 <div className="bg-slate-100 rounded-lg p-1 flex gap-1 text-xs">
 {roles.map((r) => {
 const isActive = role === r;
 return (
 <button
 key={r}
 onClick={() => setRole(r)}
 className={`px-2.5 py-1 rounded-md transition-all ${
 isActive
 ? 'bg-white shadow text-slate-900 font-medium'
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 {r}
 </button>
 );
 })}
 </div>
 );
};

export default RoleSwitcher;
