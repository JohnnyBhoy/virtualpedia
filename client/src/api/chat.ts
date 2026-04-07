import api from './axios';

export const getChatHistory = () => api.get('/chat/history');
export const clearChatHistory = () => api.delete('/chat/history');
