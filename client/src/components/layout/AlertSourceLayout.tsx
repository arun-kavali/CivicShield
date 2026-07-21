import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AlertSourceLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}