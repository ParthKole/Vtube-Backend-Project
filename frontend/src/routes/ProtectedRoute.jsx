/**
 * PROTECTED ROUTE
 * ===============
 * Wraps routes that require authentication.
 * - If not logged in, redirects to /login
 * - If logged in, renders the child component
 *
 * PUBLIC vs PRIVATE routes:
 * - Public: Login, Register, Home, Watch page - no token required
 * - Private: Upload, Dashboard, Profile, Tweets (for posting) - token required
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
