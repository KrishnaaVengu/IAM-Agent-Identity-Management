import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.getStats();
      return res.data;
    },
  });
};
