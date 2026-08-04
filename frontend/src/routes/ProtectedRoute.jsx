import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/hooks';

/**
 * Guards a route subtree behind authentication, and optionally a set of
 * allowed roles (STUDENT | TRAINER | ADMIN). Unauthenticated users are
 * redirected to /login with the attempted location preserved so they can
 * be sent back after signing in. Authenticated users lacking the required
 * role are redirected to their own dashboard rather than shown a blank
 * page or a raw 403.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback =
      role === 'ADMIN' ? '/admin' : role === 'TRAINER' ? '/trainer' : '/student';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
