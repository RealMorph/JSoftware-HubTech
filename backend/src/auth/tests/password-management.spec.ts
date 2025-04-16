import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';

describe('AuthService - Password Management', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Password Reset', () => {
    // Helper function to register a user
    const registerUser = async (userData: CreateUserDto) => {
      return service.register(userData);
    };

    // Helper to modify user properties after registration
    const modifyUserInArray = (email: string, modifications: Record<string, any>) => {
      // Access the private users array using type assertion
      const authServiceWithPrivateAccess = service as any;
      const userIndex = authServiceWithPrivateAccess.users.findIndex(u => u.email === email);
      
      if (userIndex !== -1) {
        authServiceWithPrivateAccess.users[userIndex] = {
          ...authServiceWithPrivateAccess.users[userIndex],
          ...modifications
        };
      }
    };

    it('should request password reset with valid email', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);

      // Request password reset
      const result = await service.requestPasswordReset(userData.email);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('If your email exists in our system, you will receive a password reset link');
      expect(result.token).toBeDefined(); // For testing purposes, we're returning the token
    });

    it('should still return success for non-existent email', async () => {
      const result = await service.requestPasswordReset('nonexistent@example.com');
      
      expect(result).toBeDefined();
      expect(result.message).toBe('If your email exists in our system, you will receive a password reset link');
      expect(result.token).toBeUndefined(); // No token for non-existent email
    });

    it('should throw an error when requesting password reset with invalid email format', async () => {
      await expect(service.requestPasswordReset('invalid-email')).rejects.toThrow(BadRequestException);
    });

    it('should reset password with valid token', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);

      // Request password reset
      const resetRequest = await service.requestPasswordReset(userData.email);
      
      // Reset password with the token
      const result = await service.resetPassword(resetRequest.token, 'NewPassword123!');
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Password has been reset successfully');

      // Verify the password was changed by trying to login
      // First mark the user as verified since we need that for login
      modifyUserInArray(userData.email, { isVerified: true });

      // Login should fail with old password
      await expect(service.login(userData.email, userData.password)).rejects.toThrow();
      
      // Login should succeed with new password
      const loginResult = await service.login(userData.email, 'NewPassword123!');
      expect(loginResult).toBeDefined();
      expect(loginResult.user.email).toBe(userData.email);
    });

    it('should throw an error when resetting password with expired token', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);

      // Request password reset
      const resetRequest = await service.requestPasswordReset(userData.email);
      
      // Manually expire the token
      const authServiceWithPrivateAccess = service as any;
      const tokenIndex = authServiceWithPrivateAccess.passwordResetTokens.findIndex(
        t => t.token === resetRequest.token
      );
      
      if (tokenIndex !== -1) {
        // Set expiration to 1 hour in the past
        const expiredDate = new Date();
        expiredDate.setHours(expiredDate.getHours() - 1);
        authServiceWithPrivateAccess.passwordResetTokens[tokenIndex].expiresAt = expiredDate;
      }

      // Try to reset password with expired token
      await expect(service.resetPassword(resetRequest.token, 'NewPassword123!')).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when resetting password with invalid token', async () => {
      await expect(service.resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(BadRequestException);
    });
  });
}); 