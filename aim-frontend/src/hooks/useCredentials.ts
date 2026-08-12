import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { credentialsApi } from '../api/credentials';

export const useCredentialHistory = (agentId: string) => {
  return useQuery({
    queryKey: ['credentials', agentId],
    queryFn: async () => {
      const res = await credentialsApi.history(agentId);
      return res.data;
    },
    enabled: !!agentId,
  });
};

export const useRotateCredential = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, lifetimeDays }: { agentId: string; lifetimeDays?: number }) =>
      credentialsApi.rotate(agentId, lifetimeDays),
    onSuccess: (_, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: ['credentials', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
