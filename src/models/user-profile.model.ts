export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt: Date;
  roles: string[];
  lastLoginAt?: Date;
  settings?: {
    notifications?: boolean;
    theme?: string;
  };
}

export interface UserProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  roles?: string[];
  settings?: {
    notifications?: boolean;
    theme?: string;
  };
}

// User roles enum for type safety
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator'
} 