"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
describe('AuthService - Password Management', () => {
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
    describe('Password Reset', () => {
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
        it('should request password reset with valid email', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            const result = await service.requestPasswordReset(userData.email);
            expect(result).toBeDefined();
            expect(result.message).toBe('If your email exists in our system, you will receive a password reset link');
            expect(result.token).toBeDefined();
        });
        it('should still return success for non-existent email', async () => {
            const result = await service.requestPasswordReset('nonexistent@example.com');
            expect(result).toBeDefined();
            expect(result.message).toBe('If your email exists in our system, you will receive a password reset link');
            expect(result.token).toBeUndefined();
        });
        it('should throw an error when requesting password reset with invalid email format', async () => {
            await expect(service.requestPasswordReset('invalid-email')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should reset password with valid token', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            const resetRequest = await service.requestPasswordReset(userData.email);
            const result = await service.resetPassword(resetRequest.token, 'NewPassword123!');
            expect(result).toBeDefined();
            expect(result.message).toBe('Password has been reset successfully');
            modifyUserInArray(userData.email, { isVerified: true });
            await expect(service.login(userData.email, userData.password)).rejects.toThrow();
            const loginResult = await service.login(userData.email, 'NewPassword123!');
            expect(loginResult).toBeDefined();
            expect(loginResult.user.email).toBe(userData.email);
        });
        it('should throw an error when resetting password with expired token', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            await registerUser(userData);
            const resetRequest = await service.requestPasswordReset(userData.email);
            const authServiceWithPrivateAccess = service;
            const tokenIndex = authServiceWithPrivateAccess.passwordResetTokens.findIndex(t => t.token === resetRequest.token);
            if (tokenIndex !== -1) {
                const expiredDate = new Date();
                expiredDate.setHours(expiredDate.getHours() - 1);
                authServiceWithPrivateAccess.passwordResetTokens[tokenIndex].expiresAt = expiredDate;
            }
            await expect(service.resetPassword(resetRequest.token, 'NewPassword123!')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw an error when resetting password with invalid token', async () => {
            await expect(service.resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=password-management.spec.js.map