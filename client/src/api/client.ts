import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api', withCredentials: true });

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) { accessToken = token; }

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (error.response?.status !== 401 || original?._retried || original?.url?.includes('/auth/refresh')) return Promise.reject(error);
  original._retried = true;
  refreshPromise ??= api.post('/auth/refresh').then((response) => response.data.data.accessToken as string).catch(() => null).finally(() => { refreshPromise = null; });
  const token = await refreshPromise;
  if (!token) { setAccessToken(null); return Promise.reject(error); }
  setAccessToken(token);
  original.headers.Authorization = `Bearer ${token}`;
  return api(original);
});
