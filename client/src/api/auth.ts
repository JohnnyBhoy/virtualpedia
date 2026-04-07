import api from './axios';

export const getMe = () => api.get('/auth/me');
export const adminLogin = (email: string, password: string) =>
  api.post('/auth/admin/login', { email, password });
export const logout = () => api.post('/auth/logout');
