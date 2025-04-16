import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../auth.service';

// Define the LoginReturnType based on what AuthService returns
export interface LoginReturnType {
  accessToken?: string;
  user?: any;
  sessionId?: string;
  requiresTwoFactor?: boolean;
  tempToken?: string;
}

// Login options interface for tests
export interface LoginOptions {
  captchaToken?: string;
  ipAddress?: string;
}

// Enhanced test types
export interface EnhancedLoginResult extends LoginReturnType {
  previousFailedAttempts?: number;
  requiresCaptcha?: boolean;
  message?: string;
}

// Extended AuthService for tests with CAPTCHA functionality
export interface TestAuthService extends AuthService {
  getRecentFailedAttempts(email: string): Promise<number>;
  verifyCaptcha(token: string): Promise<boolean>;
}

// Helper functions for tests
export function createMockResponse(data: any = {}) {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    data
  };
  return response;
}

// Define a function to implement fail since it's not in @jest/globals
export function fail(message: string): never {
  throw new Error(message);
}

// Export all for use in tests
export { jest, describe, it, expect, beforeEach }; 