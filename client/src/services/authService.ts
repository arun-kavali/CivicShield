import { api } from '@/api/client';

export type ClientRole = 'organization_admin' | 'security_officer' | 'security_analyst';
export interface CurrentUser { id: string; organizationId: string; name: string; email: string; role: ClientRole; active: boolean; lastLogin: string | null; }
export interface Organization { _id: string; name: string; slug: string; plan: string; status: string; settings: Record<string, unknown>; }

export const authService = {
  register: async (payload: { name: string; email: string; password: string; organizationName: string }) => (await api.post('/auth/register', payload)).data.data,
  login: async (payload: { email: string; password: string }) => (await api.post('/auth/login', payload)).data.data,
  refresh: async () => (await api.post('/auth/refresh')).data.data,
  logout: async () => api.post('/auth/logout'),
  profile: async () => (await api.get('/auth/profile')).data.data.user as CurrentUser,
  organization: async () => (await api.get('/organizations/me')).data.data.organization as Organization,
};
