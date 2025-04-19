import { ApiClient } from '../api/api-client';
import { TokenService } from './token-service';

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
  companyName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  private apiClient: ApiClient;
  private currentUser: User | null = null;

  constructor() {
    this.apiClient = new ApiClient();
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

  async logout(): Promise<void> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      if (refreshToken) {
        await this.apiClient.post('/auth/logout', { refreshToken });
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

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) return false;

      const response = await this.apiClient.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn?: number;
      }>('/auth/refresh', { refreshToken });

      TokenService.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  isAuthenticated(): boolean {
    // Check if we have a token and it's not expired
    const hasToken = !!TokenService.getAccessToken();
    return hasToken && !TokenService.isTokenExpired();
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const user = await this.apiClient.get<User>('/users/me');
      this.currentUser = user;
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    await this.apiClient.post('/auth/password-reset', { email });
  }

  async updatePassword(password: string, token: string): Promise<void> {
    await this.apiClient.post(`/auth/password-reset/${token}`, { password });
  }
} 