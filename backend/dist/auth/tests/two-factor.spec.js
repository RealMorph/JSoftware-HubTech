"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
describe('AuthService - Two-Factor Authentication', () => {
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
    describe('Two-Factor Authentication', () => {
        const registerUser = async (userData) => {
            const user = await service.register(userData);
            const authServiceWithPrivateAccess = service;
            const userIndex = authServiceWithPrivateAccess.users.findIndex(u => u.email === userData.email);
            if (userIndex !== -1) {
                authServiceWithPrivateAccess.users[userIndex].isVerified = true;
            }
            return user;
        };
        it('should enable two-factor authentication', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const result = await service.enableTwoFactor(user.id);
            expect(result).toBeDefined();
            expect(result.secret).toBeDefined();
            expect(result.otpauthUrl).toBeDefined();
            expect(result.otpauthUrl).toContain(result.secret);
        });
        it('should verify and fully enable two-factor authentication', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const setupResult = await service.enableTwoFactor(user.id);
            const verifyResult = await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
            expect(verifyResult).toBeDefined();
            expect(verifyResult.message).toBe('Two-factor authentication enabled successfully');
            const authServiceWithPrivateAccess = service;
            const secretRecord = authServiceWithPrivateAccess.twoFactorSecrets.find(s => s.userId === user.id);
            expect(secretRecord).toBeDefined();
            expect(secretRecord.isEnabled).toBe(true);
        });
        it('should require two-factor code when logging in with 2FA enabled', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const setupResult = await service.enableTwoFactor(user.id);
            await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
            const loginResult = await service.login(userData.email, userData.password);
            expect(loginResult).toBeDefined();
            expect(loginResult.requiresTwoFactor).toBe(true);
            expect(loginResult.tempToken).toBeDefined();
            expect(loginResult.user).toBeUndefined();
        });
        it('should complete login with valid two-factor code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const setupResult = await service.enableTwoFactor(user.id);
            await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
            const loginResult = await service.login(userData.email, userData.password);
            const finalResult = await service.verifyTwoFactorCode(loginResult.tempToken, setupResult.secret);
            expect(finalResult).toBeDefined();
            expect(finalResult.user).toBeDefined();
            expect(finalResult.user.email).toBe(userData.email);
            expect(finalResult.accessToken).toBeDefined();
        });
        it('should throw an error when verifying with invalid two-factor code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const setupResult = await service.enableTwoFactor(user.id);
            await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
            const loginResult = await service.login(userData.email, userData.password);
            await expect(service.verifyTwoFactorCode(loginResult.tempToken, 'invalid-code')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should disable two-factor authentication', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const setupResult = await service.enableTwoFactor(user.id);
            await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
            const disableResult = await service.disableTwoFactor(user.id, setupResult.secret);
            expect(disableResult).toBeDefined();
            expect(disableResult.message).toBe('Two-factor authentication disabled successfully');
            const authServiceWithPrivateAccess = service;
            const secretRecord = authServiceWithPrivateAccess.twoFactorSecrets.find(s => s.userId === user.id);
            expect(secretRecord).toBeUndefined();
            const loginResult = await service.login(userData.email, userData.password);
            expect(loginResult.requiresTwoFactor).toBeUndefined();
            expect(loginResult.user).toBeDefined();
        });
        it('should throw an error when disabling 2FA with invalid code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const setupResult = await service.enableTwoFactor(user.id);
            await service.verifyAndEnableTwoFactor(user.id, setupResult.secret);
            await expect(service.disableTwoFactor(user.id, 'invalid-code')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
});
//# sourceMappingURL=two-factor.spec.js.map