import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentsApi } from '../api/agents';
import type { AgentFilters, RegisterAgentPayload } from '../types/agent';

export const useAgentList = (filters?: AgentFilters) => {
 return useQuery({
 queryKey: ['agents', filters],
 queryFn: async () => {
 const res = await agentsApi.list(filters);
 return res.data?.agents ?? [];
 },
 });
};

export const useAgentDetail = (agentId: string) => {
 return useQuery({
 queryKey: ['agent', agentId],
 queryFn: async () => {
 const res = await agentsApi.get(agentId);
 return res.data?.agent;
 },
 enabled: !!agentId,
 });
};

export const useRegisterAgent = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (payload: RegisterAgentPayload) => agentsApi.register(payload),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['agents'] });
 queryClient.invalidateQueries({ queryKey: ['dashboard'] });
 },
 });
};

export const useSuspendAgent = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (agentId: string) => agentsApi.suspend(agentId),
 onSuccess: (_, agentId) => {
 queryClient.invalidateQueries({ queryKey: ['agents'] });
 queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
 },
 });
};

export const useReactivateAgent = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (agentId: string) => agentsApi.reactivate(agentId),
 onSuccess: (_, agentId) => {
 queryClient.invalidateQueries({ queryKey: ['agents'] });
 queryClient.invalidateQueries({ queryKey: ['agent', agentId] });
 },
 });
};

export const useDecommissionAgent = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: ({ agentId, confirmedName }: { agentId: string; confirmedName: string }) =>
 agentsApi.decommission(agentId, confirmedName),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['agents'] });
 },
 });
};
