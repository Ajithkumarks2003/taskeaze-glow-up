
import { Navigate, Outlet } from 'react-router-dom';

type ProtectedRouteProps = {
  requiredRole?: 'admin' | 'user';
  redirectPath?: string;
};

export function ProtectedRoute({ 
  requiredRole, 
  redirectPath = '/login' 
}: ProtectedRouteProps) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // If role is required and user doesn't have it, redirect
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
