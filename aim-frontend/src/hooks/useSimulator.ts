import { useQuery, useMutation } from '@tanstack/react-query';
import { simulatorApi } from '../api/simulator';

export const useSimulatorCall = () => {
  return useMutation({
    mutationFn: ({ agentId, endpointId }: { agentId: string; endpointId: string }) =>
      simulatorApi.call(agentId, endpointId),
  });
};

export const useEndpointList = () => {
  return useQuery({
    queryKey: ['endpoints'],
    queryFn: async () => {
      const res = await simulatorApi.listEndpoints();
      return (res.data as any)?.endpoints ?? res.data ?? [];
    },
  });
};
