import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';

export const useAuthRedirect = (requireAuth = true, redirectPath = '/login') => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        navigate(redirectPath);
      } else if (!requireAuth && isAuthenticated) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, loading, navigate, redirectPath, requireAuth]);

  return { isAuthenticated, loading };
}; 