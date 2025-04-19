import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  sub: string;
  // Add other token payload fields as needed
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// Use in-memory storage for access token (more secure than localStorage)
let inMemoryToken: string | null = null;

export class TokenService {
  // Store refresh token in HTTP-only cookie via dedicated endpoint 
  // or fallback to localStorage if needed
  
  static setTokens(tokens: Tokens): void {
    // Store access token in memory only
    inMemoryToken = tokens.accessToken;
    
    // Store refresh token in localStorage (in production, this should be an HTTP-only cookie)
    localStorage.setItem('refresh_token', tokens.refreshToken);
    
    // Calculate and store expiration time
    const expiresAt = tokens.expiresIn 
      ? Date.now() + tokens.expiresIn * 1000 
      : this.getExpirationFromToken(tokens.accessToken);
      
    if (expiresAt) {
      localStorage.setItem('expires_at', expiresAt.toString());
    }
  }
  
  static getAccessToken(): string | null {
    return inMemoryToken;
  }
  
  static getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
  
  static clearTokens(): void {
    // Clear in-memory token
    inMemoryToken = null;
    
    // Clear stored tokens
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
  }
  
  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expires_at');
    if (!expiresAt) return true;
    
    // Check if current time is past expiration
    return Date.now() > parseInt(expiresAt, 10);
  }
  
  private static getExpirationFromToken(token: string): number | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Convert exp from seconds to milliseconds
      return decoded.exp * 1000;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
} 