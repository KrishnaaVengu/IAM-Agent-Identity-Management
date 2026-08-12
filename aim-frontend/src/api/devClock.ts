import client from './client';

export const devClockApi = {
  get: (): Promise<{ data: { simNow: string; offsetMs: number } }> =>
    client.get('/dev-clock'),

  advance: (
    days: number
  ): Promise<{
    data: {
      previousSimTime: string;
      newSimTime: string;
      autoRevokedAgentIds: string[];
    };
  }> => client.post('/dev-clock/advance', { days, days_to_advance: days }),

  reset: (): Promise<{ data: { simNow: string } }> =>
    client.post('/dev-clock/reset'),
};
