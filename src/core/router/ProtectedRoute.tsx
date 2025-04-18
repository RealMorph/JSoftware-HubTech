import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../auth/auth-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const authService = new AuthService();

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 