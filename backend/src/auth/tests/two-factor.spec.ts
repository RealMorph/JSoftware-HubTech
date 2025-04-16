import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';

describe('AuthService - Two-Factor Authentication', () => {
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

  describe('Two-Factor Authentication', () => {
    // Helper function to register a user
    const registerUser = async (userData: CreateUserDto) => {
      const user = await service.register(userData);
      
      // Mark as verified for login
      const authServiceWithPrivateAccess = service as any;
      const userIndex = authServiceWithPrivateAccess.users.findIndex(u => u.email === userData.email);
      
      if (userIndex !== -1) {
        authServiceWithPrivateAccess.users[userIndex].isVerified = true;
      }
      
      return user;
    };

    it('should enable two-factor authentication', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable 2FA
      const result = await service.enableTwoFactor(user.id);
      
      expect(result).toBeDefined();
      expect(result.secret).toBeDefined();
      expect(result.otpauthUrl).toBeDefined();
      expect(result.otpauthUrl).toContain(result.secret);
    });

    it('should verify and fully enable two-factor authentication', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable 2FA
      const setupResult = await service.enableTwoFactor(user.id);
      
      // Verify and fully enable 2FA
      const verifyResult = await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
      
      expect(verifyResult).toBeDefined();
      expect(verifyResult.message).toBe('Two-factor authentication enabled successfully');
      
      // Check if 2FA is actually enabled
      const authServiceWithPrivateAccess = service as any;
      const secretRecord = authServiceWithPrivateAccess.twoFactorSecrets.find(s => s.userId === user.id);
      expect(secretRecord).toBeDefined();
      expect(secretRecord.isEnabled).toBe(true);
    });

    it('should require two-factor code when logging in with 2FA enabled', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable and verify 2FA
      const setupResult = await service.enableTwoFactor(user.id);
      await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
      
      // Try to login
      const loginResult = await service.login(userData.email, userData.password);
      
      expect(loginResult).toBeDefined();
      expect(loginResult.requiresTwoFactor).toBe(true);
      expect(loginResult.tempToken).toBeDefined();
      expect(loginResult.user).toBeUndefined(); // User data shouldn't be returned until 2FA verification
    });

    it('should complete login with valid two-factor code', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable and verify 2FA
      const setupResult = await service.enableTwoFactor(user.id);
      await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
      
      // Start login
      const loginResult = await service.login(userData.email, userData.password);
      
      // Complete login with 2FA code
      const finalResult = await service.verifyTwoFactorCode(loginResult.tempToken, setupResult.secret);
      
      expect(finalResult).toBeDefined();
      expect(finalResult.user).toBeDefined();
      expect(finalResult.user.email).toBe(userData.email);
      expect(finalResult.accessToken).toBeDefined();
    });

    it('should throw an error when verifying with invalid two-factor code', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable and verify 2FA
      const setupResult = await service.enableTwoFactor(user.id);
      await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
      
      // Start login
      const loginResult = await service.login(userData.email, userData.password);
      
      // Try to complete login with invalid 2FA code
      await expect(service.verifyTwoFactorCode(loginResult.tempToken, 'invalid-code')).rejects.toThrow(UnauthorizedException);
    });

    it('should disable two-factor authentication', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable and verify 2FA
      const setupResult = await service.enableTwoFactor(user.id);
      await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
      
      // Disable 2FA
      const disableResult = await service.disableTwoFactor(user.id, setupResult.secret);
      
      expect(disableResult).toBeDefined();
      expect(disableResult.message).toBe('Two-factor authentication disabled successfully');
      
      // Check if 2FA is actually disabled
      const authServiceWithPrivateAccess = service as any;
      const secretRecord = authServiceWithPrivateAccess.twoFactorSecrets.find(s => s.userId === user.id);
      expect(secretRecord).toBeUndefined();
      
      // Login should not require 2FA anymore
      const loginResult = await service.login(userData.email, userData.password);
      expect(loginResult.requiresTwoFactor).toBeUndefined();
      expect(loginResult.user).toBeDefined();
    });

    it('should throw an error when disabling 2FA with invalid code', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);

      // Enable and verify 2FA
      const setupResult = await service.enableTwoFactor(user.id);
      await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
      
      // Try to disable 2FA with invalid code
      await expect(service.disableTwoFactor(user.id, 'invalid-code')).rejects.toThrow(UnauthorizedException);
    });
  });
}); 