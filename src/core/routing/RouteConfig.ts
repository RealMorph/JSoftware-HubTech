import { ReactNode } from 'react';
import { RouteProtectionLevel, PermissionCheckOperator } from '../auth/ProtectedRoute';

/**
 * Interface defining a route configuration
 */
export interface RouteDefinition {
  path: string;
  element: ReactNode;
  title?: string;
  protectionLevel: RouteProtectionLevel;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  permissionCheckOperator?: PermissionCheckOperator;
  children?: RouteDefinition[];
  layout?: string;
  showInMenu?: boolean;
  menuOrder?: number;
  menuIcon?: string;
  redirectTo?: string;
  menuCategory?: string;
}

/**
 * Utility to create a route with sensible defaults
 */
export const createRoute = (
  config: Partial<RouteDefinition> & { path: string; element: ReactNode }
): RouteDefinition => {
  return {
    // Default values
    title: '', 
    protectionLevel: RouteProtectionLevel.AUTHENTICATED,
    requiredPermissions: [],
    requiredRoles: [],
    permissionCheckOperator: PermissionCheckOperator.AND,
    showInMenu: false,
    // User provided configuration (overrides defaults)
    ...config
  };
};

/**
 * Create a protected route (authenticated users only)
 */
export const createProtectedRoute = (
  config: Partial<RouteDefinition> & { path: string; element: ReactNode }
): RouteDefinition => {
  return createRoute({
    protectionLevel: RouteProtectionLevel.AUTHENTICATED,
    ...config
  });
};

/**
 * Create a public route (anyone can access)
 */
export const createPublicRoute = (
  config: Partial<RouteDefinition> & { path: string; element: ReactNode }
): RouteDefinition => {
  return createRoute({
    protectionLevel: RouteProtectionLevel.PUBLIC,
    ...config
  });
};

/**
 * Create a role-based route (users with specific roles only)
 */
export const createRoleBasedRoute = (
  config: Partial<RouteDefinition> & { path: string; element: ReactNode; requiredRoles: string[] }
): RouteDefinition => {
  return createRoute({
    protectionLevel: RouteProtectionLevel.ROLE_BASED,
    ...config
  });
};

/**
 * Create a permission-based route (users with specific permissions only)
 */
export const createPermissionBasedRoute = (
  config: Partial<RouteDefinition> & { path: string; element: ReactNode; requiredPermissions: string[] }
): RouteDefinition => {
  return createRoute({
    protectionLevel: RouteProtectionLevel.PERMISSION_BASED,
    ...config
  });
};

/**
 * Create a redirect route
 */
export const createRedirectRoute = (
  from: string,
  to: string
): RouteDefinition => {
  return {
    path: from,
    element: null,
    redirectTo: to,
    protectionLevel: RouteProtectionLevel.PUBLIC
  };
}; 