import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

interface Props {
  children: React.ReactNode;
  allowedRole: 'parent' | 'admin';
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (role !== allowedRole) return <Navigate to={role === 'admin' ? '/admin' : '/chat'} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
