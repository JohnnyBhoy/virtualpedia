export interface User {
  _id: string;
  googleId: string;
  name: string;
  email: string;
  avatar: string;
  isActive: boolean;
  role: 'parent';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalChats: number;
  totalMessages: number;
}
