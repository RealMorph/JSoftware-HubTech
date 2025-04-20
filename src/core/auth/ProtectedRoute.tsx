import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

// Define route protection levels
export enum RouteProtectionLevel {
  PUBLIC = 'public',       // No authentication required
  AUTHENTICATED = 'authenticated', // Basic authentication required
  ROLE_BASED = 'role-based',    // Specific role required
  PERMISSION_BASED = 'permission-based' // Specific permissions required
}

// Define permission check operators
export enum PermissionCheckOperator {
  AND = 'and', // User must have ALL permissions
  OR = 'or'    // User must have AT LEAST ONE permission
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  permissionCheckOperator?: PermissionCheckOperator;
  protectionLevel?: RouteProtectionLevel;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * ProtectedRoute - Higher-order component for route protection
 * Supports multiple protection strategies:
 * - Basic authentication
 * - Role-based access control
 * - Permission-based access control
 * - Configurable permission checking (AND/OR)
 * - Custom unauthorized and loading components
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = '/login',
  requiredPermissions = [],
  requiredRoles = [],
  permissionCheckOperator = PermissionCheckOperator.AND,
  protectionLevel = RouteProtectionLevel.AUTHENTICATED,
  loadingComponent = <div>Loading...</div>,
  unauthorizedComponent = null,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Log access attempts for security auditing
  useEffect(() => {
    if (!isLoading) {
      const routePath = location.pathname;
      const accessStatus = isAuthenticated ? 'allowed' : 'denied';
      console.debug(`Route access attempt: ${routePath} - ${accessStatus}`);
    }
  }, [isLoading, isAuthenticated, location.pathname]);

  // While checking authentication status, show loading component
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // For public routes, always render children
  if (protectionLevel === RouteProtectionLevel.PUBLIC) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If only basic authentication is required, and we're authenticated, render children
  if (protectionLevel === RouteProtectionLevel.AUTHENTICATED) {
    return <>{children}</>;
  }

  // If we're here, we need to check roles or permissions
  let hasAccess = true;

  // Check for required roles
  if (requiredRoles.length > 0 && user) {
    hasAccess = requiredRoles.some(role => 
      user.roles?.includes(role)
    );
  }

  // Check for required permissions
  if (hasAccess && requiredPermissions.length > 0 && user) {
    if (permissionCheckOperator === PermissionCheckOperator.AND) {
      // User must have ALL required permissions
      hasAccess = requiredPermissions.every(permission => 
        user.permissions?.includes(permission)
      );
    } else {
      // User must have AT LEAST ONE required permission
      hasAccess = requiredPermissions.some(permission => 
        user.permissions?.includes(permission)
      );
    }
  }

  // If access check failed, handle unauthorized
  if (!hasAccess) {
    // If a custom unauthorized component is provided, render it
    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }
    // Otherwise, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}; 