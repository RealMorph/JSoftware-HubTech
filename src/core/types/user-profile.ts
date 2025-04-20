export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  phoneNumber?: string;
  createdAt: number;
  updatedAt: number;
  preferences?: {
    theme?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    cookieConsent?: {
      analytics?: boolean;
      marketing?: boolean;
    };
  };
  metadata?: Record<string, any>;
} 