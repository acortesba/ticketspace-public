import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#0a0e17]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user has at least one of them or is super_admin
  if (allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const isSuperAdmin = userRoles.includes('super_admin');
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!isSuperAdmin && !hasRole) {
      // Redirect to appropriate dashboard based on role, or home if none
      if (userRoles.includes('buyer')) return <Navigate to="/dashboard" replace />;
      if (userRoles.includes('host')) return <Navigate to="/host" replace />;
      if (userRoles.includes('admin')) return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
