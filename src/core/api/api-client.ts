import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenService } from '../auth/token-service';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

const BASE_URL = 'http://localhost:3001';

export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
    config: InternalAxiosRequestConfig;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;
        
        // If error is unauthorized and not a refresh token request
        if (error.response?.status === 401 && 
            originalRequest && 
            !originalRequest.url?.includes('auth/refresh')) {
          
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          this.isRefreshing = true;
          
          try {
            const refreshToken = TokenService.getRefreshToken();
            
            if (!refreshToken) {
              // No refresh token available, redirect to login
              this.redirectToLogin();
              return Promise.reject(error);
            }
            
            // Try to refresh the token
            const response = await this.client.post<RefreshResponse>('/auth/refresh', {
              refreshToken,
            });
            
            if (response.data) {
              // Update tokens
              TokenService.setTokens(response.data);
              
              // Retry all failed requests
              this.processQueue(null, originalRequest);
              
              // Retry the original request
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Token refresh failed
            this.processQueue(refreshError, null);
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        // Handle other errors
        if (error.response?.status === 403) {
          // Handle forbidden / permission denied
          console.error('Permission denied:', error);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: InternalAxiosRequestConfig | null): void {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(this.client(config));
      }
    });
    
    this.failedQueue = [];
  }
  
  private redirectToLogin(): void {
    TokenService.clearTokens();
    window.location.href = '/login';
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
} 