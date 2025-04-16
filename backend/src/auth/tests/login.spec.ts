import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';

describe('AuthService - Login', () => {
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

  describe('Login', () => {
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

    it('should login with valid credentials', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);
      
      // Mark email as verified (since by default it's not verified)
      modifyUserInArray(userData.email, { isVerified: true });

      // Attempt to login
      const result = await service.login(userData.email, userData.password);
      
      // Verify the response structure
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw an error when logging in with invalid email', async () => {
      await expect(service.login('invalid-email', 'Password123!')).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when logging in with incorrect password', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);
      
      // Mark email as verified
      modifyUserInArray(userData.email, { isVerified: true });

      // Attempt to login with wrong password
      await expect(service.login(userData.email, 'WrongPassword123!')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error when logging in with unverified email', async () => {
      // Register a user first (by default is unverified)
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);

      // Attempt to login without verifying email
      await expect(service.login(userData.email, userData.password)).rejects.toThrow(ForbiddenException);
    });

    it('should throw an error when logging in with inactive account', async () => {
      // Register a user first
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!'
      };
      await registerUser(userData);
      
      // Mark email as verified but account as inactive
      modifyUserInArray(userData.email, { isVerified: true, isActive: false });

      // Attempt to login with inactive account
      await expect(service.login(userData.email, userData.password)).rejects.toThrow(ForbiddenException);
    });
  });
}); 