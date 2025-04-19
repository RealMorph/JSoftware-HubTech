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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const authService = new AuthService();
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Try to refresh the token if it exists
          const refreshToken = TokenService.getRefreshToken();
          if (refreshToken) {
            const success = await authService.refreshToken();
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
  }, []);
  
  // Set up a token refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Check token every minute and refresh if needed
    const intervalId = setInterval(async () => {
      if (TokenService.isTokenExpired()) {
        const success = await authService.refreshToken();
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
  }, [isAuthenticated]);
  
  const login = async (credentials: LoginCredentials): Promise<void> => {
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