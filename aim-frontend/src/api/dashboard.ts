import client from './client';
import type { DashboardStats } from '../types/dashboard';

export type { DashboardStats };

export const dashboardApi = {
  getStats: (): Promise<{ data: DashboardStats }> =>
    client.get('/dashboard/stats'),
};
