import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, LoginCredentials, RegisterCredentials, User } from './auth-service';
import { TokenService } from './token-service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development when authentication is not set up
const MOCK_USER: User = {
  id: 'mock-user-123',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const authService = new AuthService();
  
  // Check if we're in development mode or Firebase is properly configured
  const isDevelopment = import.meta.env.DEV;
  const hasValidFirebaseConfig = !!import.meta.env.VITE_FIREBASE_API_KEY && 
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('AIzaSyDOCAbC123dEf456GhI789jKl01-MnO');
  
  // Use mock auth for development or when Firebase isn't configured
  const useMockAuth = isDevelopment && !hasValidFirebaseConfig;
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (useMockAuth) {
          // In development with no valid Firebase config, use mock user
          console.log('Using mock authentication for development');
          setUser(MOCK_USER);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Try to refresh the token if it exists
          const refreshToken = TokenService.getRefreshToken();
          if (refreshToken) {
            const success = await authService.refreshTokens();
            if (success) {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              setIsAuthenticated(true);
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [useMockAuth]);
  
  // Set up a token refresh interval
  useEffect(() => {
    if (!isAuthenticated || useMockAuth) return;
    
    // Check token every minute and refresh if needed
    const intervalId = setInterval(async () => {
      if (TokenService.isTokenExpired()) {
        const success = await authService.refreshTokens();
        if (!success) {
          // If refresh fails, log out
          setUser(null);
          setIsAuthenticated(false);
          // Redirect handled by auth service
          await authService.logout();
        }
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, useMockAuth]);
  
  const login = async (credentials: LoginCredentials): Promise<void> => {
    if (useMockAuth) {
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    if (useMockAuth) {
      setUser(MOCK_USER);
      setIsAuthenticated(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    if (useMockAuth) {
      // For mock auth, just clear the user
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string): Promise<void> => {
    if (useMockAuth) {
      console.log('Mock reset password for:', email);
      return;
    }
    
    await authService.resetPassword(email);
  };
  
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 