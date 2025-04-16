"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
describe('AuthService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
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
            await expect(service.register(createUserDto)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw an error when registering with weak password', async () => {
            const createUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: '123',
            };
            await expect(service.register(createUserDto)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw an error when registering with duplicate email', async () => {
            const createUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
            };
            await service.register(createUserDto);
            await expect(service.register(createUserDto)).rejects.toThrow(common_1.ConflictException);
        });
        it('should throw an error when registering with missing required fields', async () => {
            const createUserDto = {
                firstName: '',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
            };
            await expect(service.register(createUserDto)).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map