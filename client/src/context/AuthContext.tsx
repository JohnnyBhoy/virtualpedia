import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, logout as logoutApi } from '../api/auth';
import { User, AdminUser } from '../types';

interface AuthContextType {
  user: User | AdminUser | null;
  role: 'parent' | 'admin' | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AdminUser | null>(null);
  const [role, setRole] = useState<'parent' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await getMe();
      const u = res.data.data.user;
      setUser(u);
      setRole(u.role);
    } catch {
      localStorage.removeItem('vp_token');
      setUser(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('vp_token');
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (token: string) => {
    localStorage.setItem('vp_token', token);
    await fetchUser();
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.removeItem('vp_token');
    setUser(null);
    setRole(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
