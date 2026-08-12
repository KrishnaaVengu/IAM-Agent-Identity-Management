import axios from 'axios';
import { useRoleStore } from '../stores/roleStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const role = useRoleStore.getState().role;
  if (role) {
    config.headers['X-Role'] = role;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error ?? {
      code: 'NETWORK_ERROR',
      message: error.message || 'An unknown network error occurred',
    };
    return Promise.reject(errorPayload);
  }
);

export default client;
