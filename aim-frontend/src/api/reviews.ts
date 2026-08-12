import client from './client';
import type { AccessReviewReport } from '../types/review';

export const reviewsApi = {
  list: (): Promise<{ data: AccessReviewReport[] }> =>
    client.get('/reviews'),

  get: (reviewId: string): Promise<{ data: AccessReviewReport }> =>
    client.get(`/reviews/${reviewId}`),

  run: (runBy: string): Promise<{ data: AccessReviewReport }> =>
    client.post('/reviews/run', { runBy }),
};
