import { create } from 'zustand';

export interface Toast {
 id: string;
 title: string;
 description: string;
 variant: 'default' | 'destructive';
}

export interface ToastStore {
 toasts: Toast[];
 push: (toast: Omit<Toast, 'id'>) => void;
 dismiss: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastStore>()((set) => ({
 toasts: [],
 push: (toast) =>
 set((state) => ({
 toasts: [...state.toasts, { ...toast, id: generateId() }],
 })),
 dismiss: (id) =>
 set((state) => ({
 toasts: state.toasts.filter((t) => t.id !== id),
 })),
}));
