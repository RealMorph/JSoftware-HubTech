import { ApiClient } from '../api/api-client';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export class AuthService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout', {});
    } finally {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
} 