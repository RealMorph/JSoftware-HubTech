export type Role = 'admin' | 'user' | 'editor' | 'viewer' | 'subscriber';

export interface UserRoles {
  roles: Role[];
  customClaims?: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
}

// Predefined permissions
export const PERMISSIONS: Record<string, Permission> = {
  READ_CONTENT: {
    id: 'read_content',
    name: 'Read Content',
    description: 'Can read all content'
  },
  CREATE_CONTENT: {
    id: 'create_content',
    name: 'Create Content',
    description: 'Can create new content'
  },
  EDIT_CONTENT: {
    id: 'edit_content',
    name: 'Edit Content',
    description: 'Can edit existing content'
  },
  DELETE_CONTENT: {
    id: 'delete_content',
    name: 'Delete Content',
    description: 'Can delete content'
  },
  MANAGE_USERS: {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Can manage user accounts'
  },
  MANAGE_ROLES: {
    id: 'manage_roles',
    name: 'Manage Roles',
    description: 'Can assign and manage roles'
  },
  BILLING_ADMIN: {
    id: 'billing_admin',
    name: 'Billing Admin',
    description: 'Can manage billing and subscriptions'
  }
};

// Predefined role definitions
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features',
    permissions: Object.keys(PERMISSIONS)
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can create and edit content',
    permissions: [
      PERMISSIONS.READ_CONTENT.id,
      PERMISSIONS.CREATE_CONTENT.id,
      PERMISSIONS.EDIT_CONTENT.id
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      PERMISSIONS.READ_CONTENT.id
    ]
  },
  {
    id: 'subscriber',
    name: 'Subscriber',
    description: 'Paid subscriber with access to premium features',
    permissions: [
      PERMISSIONS.READ_CONTENT.id
    ]
  },
  {
    id: 'user',
    name: 'Regular User',
    description: 'Standard user permissions',
    permissions: [
      PERMISSIONS.READ_CONTENT.id
    ]
  }
]; 