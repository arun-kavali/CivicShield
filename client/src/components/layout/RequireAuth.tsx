import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen bg-background" />;
  return user ? <Outlet /> : <Navigate to="/auth" replace state={{ from: location }} />;
}
