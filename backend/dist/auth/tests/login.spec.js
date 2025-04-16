"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
describe('AuthService - Login', () => {
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
    describe('Login', () => {
        const registerUser = async (userData) => {
            return service.register(userData);
        };
        const modifyUserInArray = (email, modifications) => {
            const authServiceWithPrivateAccess = service;
            const userIndex = authServiceWithPrivateAccess.users.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                authServiceWithPrivateAccess.users[userIndex] = Object.assign(Object.assign({}, authServiceWithPrivateAccess.users[userIndex]), modifications);
            }
        };
        it('should login with valid credentials', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            modifyUserInArray(userData.email, { isVerified: true });
            const result = await service.login(userData.email, userData.password);
            expect(result).toBeDefined();
            expect(result.accessToken).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(userData.email);
        });
        it('should throw an error when logging in with invalid email', async () => {
            await expect(service.login('invalid-email', 'Password123!')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw an error when logging in with incorrect password', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            modifyUserInArray(userData.email, { isVerified: true });
            await expect(service.login(userData.email, 'WrongPassword123!')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw an error when logging in with unverified email', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            await expect(service.login(userData.email, userData.password)).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw an error when logging in with inactive account', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            modifyUserInArray(userData.email, { isVerified: true, isActive: false });
            await expect(service.login(userData.email, userData.password)).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=login.spec.js.map