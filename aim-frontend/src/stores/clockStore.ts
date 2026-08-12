import { create } from 'zustand';

export interface ClockStore {
  simNow: string;
  setSimNow: (t: string) => void;
  autoRevokedIds: string[];
  setAutoRevokedIds: (ids: string[]) => void;
}

export const useClockStore = create<ClockStore>()((set) => ({
  simNow: new Date().toISOString(),
  setSimNow: (simNow) => set({ simNow }),
  autoRevokedIds: [],
  setAutoRevokedIds: (autoRevokedIds) => set({ autoRevokedIds }),
}));
