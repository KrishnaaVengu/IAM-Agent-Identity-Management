import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviews';

export const useReviewList = () => {
 return useQuery({
 queryKey: ['reviews'],
 queryFn: async () => {
 const res = await reviewsApi.list();
 return res.data;
 },
 });
};

export const useReviewDetail = (reviewId: string) => {
 return useQuery({
 queryKey: ['review', reviewId],
 queryFn: async () => {
 const res = await reviewsApi.get(reviewId);
 return res.data;
 },
 enabled: !!reviewId,
 });
};

export const useRunReview = () => {
 const queryClient = useQueryClient();
 return useMutation({
 mutationFn: (runBy: string = 'Admin') => reviewsApi.run(runBy),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['reviews'] });
 queryClient.invalidateQueries({ queryKey: ['agents'] });
 },
 });
};
