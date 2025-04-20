import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseAuthService, ExtendedUser } from '../firebase';
import { UserProfileService } from '../firebase';
import { UserProfile } from '../types/user-profile';

export interface AuthContextType {
  currentUser: ExtendedUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ExtendedUser>;
  loginWithGoogle: () => Promise<ExtendedUser>;
  register: (
    email: string, 
    password: string, 
    displayName: string
  ) => Promise<ExtendedUser>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile>;
  uploadProfileImage: (file: File) => Promise<UserProfile>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  getUserById: (userId: string) => Promise<ExtendedUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const authService = FirebaseAuthService.getInstance();
  const profileService = UserProfileService.getInstance();
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user profile
          let profile = await profileService.getUserProfile(user.uid);
          
          // If profile doesn't exist, create one
          if (!profile) {
            profile = await profileService.createUserProfile(user);
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Set up profile listener when user changes
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = profileService.listenToProfileChanges(
      currentUser.uid,
      (profile) => {
        setUserProfile(profile);
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);
  
  // Auth methods
  const login = async (email: string, password: string): Promise<ExtendedUser> => {
    return await authService.loginWithEmailAndPassword(email, password);
  };
  
  const loginWithGoogle = async (): Promise<ExtendedUser> => {
    return await authService.loginWithGoogle();
  };
  
  const register = async (email: string, password: string): Promise<ExtendedUser> => {
    const user = await authService.registerWithEmailAndPassword(email, password);
    await profileService.createUserProfile(user);
    return user;
  };
  
  const logout = async (): Promise<void> => {
    await authService.logout();
  };
  
  // Profile methods
  const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
    if (!currentUser) throw new Error('No authenticated user');
    return await profileService.updateUserProfile(currentUser.uid, data);
  };
  
  const uploadProfileImage = async (file: File): Promise<UserProfile> => {
    if (!currentUser) throw new Error('No authenticated user');
    return await profileService.uploadProfileImage(currentUser.uid, file);
  };

  // Password and security methods
  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };
  
  const updatePassword = async (newPassword: string): Promise<void> => {
    await authService.updateUserPassword(newPassword);
  };
  
  const sendVerificationEmail = async (): Promise<void> => {
    await authService.sendVerificationEmail();
  };
  
  /**
   * Get a user by ID
   */
  const getUserById = async (userId: string): Promise<ExtendedUser | null> => {
    try {
      return await authService.getUserById(userId);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  };
  
  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    resetPassword,
    updatePassword,
    sendVerificationEmail,
    getUserById
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 