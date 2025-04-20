import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { RoleManagementService } from '../firebase/role-management-service';
import { Role } from '../types/user-roles';

interface UseAuthorizationReturn {
  roles: Role[];
  permissions: string[];
  hasRole: (role: Role) => boolean;
  hasPermission: (permissionId: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for role-based access control
 */
export const useAuthorization = (): UseAuthorizationReturn => {
  const { currentUser, isAuthenticated } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const roleService = RoleManagementService.getInstance();
  
  // Load user roles and permissions
  useEffect(() => {
    const loadUserRoles = async () => {
      if (!currentUser) {
        setRoles([]);
        setPermissions([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user roles
        const userRoles = await roleService.getUserRoles(currentUser.uid);
        setRoles(userRoles.roles);
        
        // Get user permissions
        const userPermissions = await roleService.getUserPermissions(currentUser.uid);
        setPermissions(userPermissions);
        
      } catch (err) {
        console.error('Error loading user roles:', err);
        setError('Failed to load authorization data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserRoles();
  }, [currentUser]);
  
  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: Role): boolean => {
    return roles.includes(role);
  }, [roles]);
  
  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permissionId: string): boolean => {
    return permissions.includes(permissionId);
  }, [permissions]);
  
  return {
    roles,
    permissions,
    hasRole,
    hasPermission,
    isLoading,
    error
  };
};

/**
 * Component props for AuthorizationGuard
 */
interface AuthorizationGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user roles/permissions
 */
export const AuthorizationGuard: React.FC<AuthorizationGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = null
}) => {
  const { hasRole, hasPermission, isLoading } = useAuthorization();
  
  if (isLoading) {
    return <div>Loading permissions...</div>;
  }
  
  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }
  
  // Check if user has required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }
  
  // User has required role/permission
  return <>{children}</>;
}; 