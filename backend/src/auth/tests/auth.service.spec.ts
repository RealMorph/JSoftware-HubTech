import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
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

  describe('Registration', () => {
    it('should register with valid data', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      const result = await service.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.lastName).toBe(createUserDto.lastName);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw an error when registering with invalid email format', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'Password123!',
      };

      await expect(service.register(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when registering with weak password', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123', // Too short
      };

      await expect(service.register(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when registering with duplicate email', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      // First registration should succeed
      await service.register(createUserDto);

      // Second registration with same email should fail
      await expect(service.register(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw an error when registering with missing required fields', async () => {
      const createUserDto = {
        firstName: '',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
      };

      await expect(service.register(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });
}); 