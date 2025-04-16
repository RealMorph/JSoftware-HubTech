"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
describe('AuthService - Profile Verification', () => {
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
    describe('Email Verification', () => {
        const registerUser = async (userData) => {
            return service.register(userData);
        };
        it('should automatically generate email verification code on registration', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            expect(user.isVerified).toBe(false);
            const authServiceWithPrivateAccess = service;
            const codeRecord = authServiceWithPrivateAccess.emailVerificationCodes.find(c => c.userId === user.id);
            expect(codeRecord).toBeDefined();
            expect(codeRecord.code).toBeDefined();
            expect(codeRecord.expiresAt).toBeDefined();
        });
        it('should allow requesting a new email verification code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const result = await service.requestEmailVerification(user.id);
            expect(result).toBeDefined();
            expect(result.message).toBe('Email verification code sent');
            expect(result.code).toBeDefined();
        });
        it('should verify email with valid verification code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const requestResult = await service.requestEmailVerification(user.id);
            const verifyResult = await service.verifyEmail(user.id, requestResult.code);
            expect(verifyResult).toBeDefined();
            expect(verifyResult.message).toBe('Email verified successfully');
            const authServiceWithPrivateAccess = service;
            const updatedUser = authServiceWithPrivateAccess.users.find(u => u.id === user.id);
            expect(updatedUser.isVerified).toBe(true);
            const codeRecord = authServiceWithPrivateAccess.emailVerificationCodes.find(c => c.userId === user.id);
            expect(codeRecord).toBeUndefined();
        });
        it('should throw an error when verifying with invalid email verification code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.requestEmailVerification(user.id);
            await expect(service.verifyEmail(user.id, 'invalid-code')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw an error when verifying already verified email', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const requestResult = await service.requestEmailVerification(user.id);
            await service.verifyEmail(user.id, requestResult.code);
            await expect(service.verifyEmail(user.id, requestResult.code)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Phone Verification', () => {
        const registerVerifiedUser = async (userData) => {
            const user = await service.register(userData);
            const requestResult = await service.requestEmailVerification(user.id);
            await service.verifyEmail(user.id, requestResult.code);
            const authServiceWithPrivateAccess = service;
            return authServiceWithPrivateAccess.users.find(u => u.id === user.id);
        };
        it('should add a phone number to user profile', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerVerifiedUser(userData);
            const phoneNumber = '+15551234567';
            const result = await service.addPhoneNumber(user.id, phoneNumber);
            expect(result).toBeDefined();
            expect(result.message).toBe('Phone number added. Verification code sent.');
            expect(result.code).toBeDefined();
            const authServiceWithPrivateAccess = service;
            const updatedUser = authServiceWithPrivateAccess.users.find(u => u.id === user.id);
            expect(updatedUser.phoneNumber).toBe(phoneNumber);
            expect(updatedUser.isPhoneVerified).toBe(false);
        });
        it('should throw an error when adding invalid phone number', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerVerifiedUser(userData);
            await expect(service.addPhoneNumber(user.id, 'invalid-phone')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should allow requesting a phone verification code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerVerifiedUser(userData);
            const phoneNumber = '+15551234567';
            await service.addPhoneNumber(user.id, phoneNumber);
            const result = await service.requestPhoneVerification(user.id);
            expect(result).toBeDefined();
            expect(result.message).toBe('Phone verification code sent');
            expect(result.code).toBeDefined();
        });
        it('should verify phone number with valid verification code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerVerifiedUser(userData);
            const phoneNumber = '+15551234567';
            const addResult = await service.addPhoneNumber(user.id, phoneNumber);
            const verifyResult = await service.verifyPhone(user.id, addResult.code);
            expect(verifyResult).toBeDefined();
            expect(verifyResult.message).toBe('Phone number verified successfully');
            const authServiceWithPrivateAccess = service;
            const updatedUser = authServiceWithPrivateAccess.users.find(u => u.id === user.id);
            expect(updatedUser.isPhoneVerified).toBe(true);
            const codeRecord = authServiceWithPrivateAccess.phoneVerificationCodes.find(c => c.userId === user.id);
            expect(codeRecord).toBeUndefined();
        });
        it('should throw an error when verifying with invalid phone verification code', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerVerifiedUser(userData);
            const phoneNumber = '+15551234567';
            await service.addPhoneNumber(user.id, phoneNumber);
            await expect(service.verifyPhone(user.id, 'invalid-code')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw an error when attempting to verify without a phone number', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerVerifiedUser(userData);
            await expect(service.verifyPhone(user.id, '123456')).rejects.toThrow(common_1.BadRequestException);
        });
    });
});
//# sourceMappingURL=profile-verification.spec.js.map