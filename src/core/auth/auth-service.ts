import { ApiClient } from '../api/api-client';
import { TokenService } from './token-service';
import { WebSocketService } from '../firebase/websocket-service';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private apiClient: ApiClient;
  private currentUser: User | null = null;
  private webSocketService: WebSocketService;

  constructor() {
    this.apiClient = new ApiClient();
    this.webSocketService = WebSocketService.getInstance();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Store tokens securely
    TokenService.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    });
    
    // Store current user
    this.currentUser = response.user;
    
    // Log the login activity
    this.webSocketService.publishActivity({
      type: 'user_login',
      entityType: 'user',
      entityId: response.user.id,
      data: {
        email: response.user.email,
        timestamp: new Date().toISOString()
      }
    });
    
    return response;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && TokenService.hasValidAccessToken();
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      const currentUser = this.currentUser;
      
      if (refreshToken) {
        await this.apiClient.post('/auth/logout', { refreshToken });
      }
      
      // Log the logout activity if we have a current user
      if (currentUser) {
        this.webSocketService.publishActivity({
          type: 'user_login', // We'll use the same type but differentiate in data
          entityType: 'user',
          entityId: currentUser.id,
          data: {
            email: currentUser.email,
            action: 'logout',
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data regardless of API response
      TokenService.clearTokens();
      this.currentUser = null;
      window.location.href = '/login';
    }
  }

  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const refreshToken = TokenService.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh-tokens',
      { refreshToken }
    );
    
    TokenService.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    });
    
    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>('/auth/register', credentials);
    
    // Store tokens securely
    TokenService.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn
    });
    
    // Store current user
    this.currentUser = response.user;
    
    return response;
  }

  async resetPassword(email: string): Promise<void> {
    await this.apiClient.post('/auth/reset-password', { email });
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.apiClient.put<User>('/auth/profile', profileData);
    
    // Update current user
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...response };
    }
    
    return response;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/auth/change-password', { oldPassword, newPassword });
  }
} 