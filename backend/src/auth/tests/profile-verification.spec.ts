import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';

describe('AuthService - Profile Verification', () => {
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

  describe('Email Verification', () => {
    // Helper function to register a user
    const registerUser = async (userData: CreateUserDto) => {
      return service.register(userData);
    };

    it('should automatically generate email verification code on registration', async () => {
      // Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);
      
      // Verify user is not verified yet
      expect(user.isVerified).toBe(false);
      
      // Verify verification code was generated (check internal service state)
      const authServiceWithPrivateAccess = service as any;
      const codeRecord = authServiceWithPrivateAccess.emailVerificationCodes.find(c => c.userId === user.id);
      expect(codeRecord).toBeDefined();
      expect(codeRecord.code).toBeDefined();
      expect(codeRecord.expiresAt).toBeDefined();
    });

    it('should allow requesting a new email verification code', async () => {
      // Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);
      
      // Request a new verification code
      const result = await service.requestEmailVerification(user.id);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Email verification code sent');
      expect(result.code).toBeDefined(); // For testing purposes
    });

    it('should verify email with valid verification code', async () => {
      // Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);
      
      // Get the verification code
      const requestResult = await service.requestEmailVerification(user.id);
      
      // Verify email
      const verifyResult = await service.verifyEmail(user.id, requestResult.code);
      
      expect(verifyResult).toBeDefined();
      expect(verifyResult.message).toBe('Email verified successfully');
      
      // Check if user is now verified
      const authServiceWithPrivateAccess = service as any;
      const updatedUser = authServiceWithPrivateAccess.users.find(u => u.id === user.id);
      expect(updatedUser.isVerified).toBe(true);
      
      // Check that the verification code was removed
      const codeRecord = authServiceWithPrivateAccess.emailVerificationCodes.find(c => c.userId === user.id);
      expect(codeRecord).toBeUndefined();
    });

    it('should throw an error when verifying with invalid email verification code', async () => {
      // Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);
      
      // Request a verification code (just to make sure one exists)
      await service.requestEmailVerification(user.id);
      
      // Try to verify with invalid code
      await expect(service.verifyEmail(user.id, 'invalid-code')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error when verifying already verified email', async () => {
      // Register a user
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerUser(userData);
      
      // Get the verification code and verify email
      const requestResult = await service.requestEmailVerification(user.id);
      await service.verifyEmail(user.id, requestResult.code);
      
      // Try to verify again
      await expect(service.verifyEmail(user.id, requestResult.code)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Phone Verification', () => {
    // Helper function to register a user with verified email
    const registerVerifiedUser = async (userData: CreateUserDto) => {
      const user = await service.register(userData);
      
      // Get the email verification code and verify email
      const requestResult = await service.requestEmailVerification(user.id);
      await service.verifyEmail(user.id, requestResult.code);
      
      // Get the updated user
      const authServiceWithPrivateAccess = service as any;
      return authServiceWithPrivateAccess.users.find(u => u.id === user.id);
    };

    it('should add a phone number to user profile', async () => {
      // Register a user with verified email
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerVerifiedUser(userData);
      
      // Add phone number
      const phoneNumber = '+15551234567';
      const result = await service.addPhoneNumber(user.id, phoneNumber);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Phone number added. Verification code sent.');
      expect(result.code).toBeDefined(); // For testing purposes
      
      // Check if phone number was added to user profile
      const authServiceWithPrivateAccess = service as any;
      const updatedUser = authServiceWithPrivateAccess.users.find(u => u.id === user.id);
      expect(updatedUser.phoneNumber).toBe(phoneNumber);
      expect(updatedUser.isPhoneVerified).toBe(false);
    });

    it('should throw an error when adding invalid phone number', async () => {
      // Register a user with verified email
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerVerifiedUser(userData);
      
      // Try to add invalid phone number
      await expect(service.addPhoneNumber(user.id, 'invalid-phone')).rejects.toThrow(BadRequestException);
    });

    it('should allow requesting a phone verification code', async () => {
      // Register a user with verified email
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerVerifiedUser(userData);
      
      // Add phone number
      const phoneNumber = '+15551234567';
      await service.addPhoneNumber(user.id, phoneNumber);
      
      // Request phone verification
      const result = await service.requestPhoneVerification(user.id);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Phone verification code sent');
      expect(result.code).toBeDefined(); // For testing purposes
    });

    it('should verify phone number with valid verification code', async () => {
      // Register a user with verified email
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerVerifiedUser(userData);
      
      // Add phone number
      const phoneNumber = '+15551234567';
      const addResult = await service.addPhoneNumber(user.id, phoneNumber);
      
      // Verify phone number
      const verifyResult = await service.verifyPhone(user.id, addResult.code);
      
      expect(verifyResult).toBeDefined();
      expect(verifyResult.message).toBe('Phone number verified successfully');
      
      // Check if phone is now verified
      const authServiceWithPrivateAccess = service as any;
      const updatedUser = authServiceWithPrivateAccess.users.find(u => u.id === user.id);
      expect(updatedUser.isPhoneVerified).toBe(true);
      
      // Check that the verification code was removed
      const codeRecord = authServiceWithPrivateAccess.phoneVerificationCodes.find(c => c.userId === user.id);
      expect(codeRecord).toBeUndefined();
    });

    it('should throw an error when verifying with invalid phone verification code', async () => {
      // Register a user with verified email
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerVerifiedUser(userData);
      
      // Add phone number
      const phoneNumber = '+15551234567';
      await service.addPhoneNumber(user.id, phoneNumber);
      
      // Try to verify with invalid code
      await expect(service.verifyPhone(user.id, 'invalid-code')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error when attempting to verify without a phone number', async () => {
      // Register a user with verified email
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      const user = await registerVerifiedUser(userData);
      
      // Try to verify without adding a phone number
      await expect(service.verifyPhone(user.id, '123456')).rejects.toThrow(BadRequestException);
    });
  });
}); 