import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect role-mismatched users to their default dashboard
    const defaultRedirect = user.role === 'admin' 
      ? '/admin' 
      : user.role === 'delivery_agent' 
        ? '/agent' 
        : '/ai-search';
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
}
