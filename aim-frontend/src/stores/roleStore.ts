import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface RoleStore {
 role: 'Admin' | 'Team Owner' | 'Viewer';
 setRole: (role: RoleStore['role']) => void;
}

export const useRoleStore = create<RoleStore>()(
 persist(
 (set) => ({
 role: 'Admin',
 setRole: (role) => set({ role }),
 }),
 {
 name: 'aim-role',
 storage: createJSONStorage(() => sessionStorage),
 }
 )
);
