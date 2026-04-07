import api from './axios';

export const getStats = () => api.get('/admin/stats');
export const getUsers = (params?: { page?: number; limit?: number; search?: string }) =>
  api.get('/admin/users', { params });
export const getUserById = (id: string) => api.get(`/admin/users/${id}`);
export const updateUserStatus = (id: string, isActive: boolean) =>
  api.put(`/admin/users/${id}/status`, { isActive });
export const getUserChat = (id: string) => api.get(`/admin/users/${id}/chat`);
