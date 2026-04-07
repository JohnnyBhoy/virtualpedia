import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast.error('Authentication failed');
      navigate('/');
      return;
    }
    login(token).then(() => navigate('/chat')).catch(() => {
      toast.error('Failed to sign in');
      navigate('/');
    });
  }, []);

  return <Loader fullScreen />;
};

export default OAuthSuccess;
