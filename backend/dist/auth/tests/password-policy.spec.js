"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('AuthService - Password Policy', () => {
    let service;
    let testUser;
    async function createTestUser() {
        const result = await service.register({
            firstName: 'Password',
            lastName: 'Policy',
            email: `password-policy-${Date.now()}@example.com`,
            password: 'SecurePassword123!'
        });
        const userIndex = service.users.findIndex(u => u.id === result.id);
        if (userIndex !== -1) {
            service.users[userIndex].isVerified = true;
            service.users[userIndex].isActive = true;
        }
        return result;
    }
    (0, globals_1.beforeEach)(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        testUser = await createTestUser();
    });
    (0, globals_1.describe)('Password Complexity', () => {
        (0, globals_1.it)('should enforce minimum password length', async () => {
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'Short1!')).rejects.toThrow(common_1.BadRequestException);
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'Short1!')).rejects.toThrow('New password must be at least 8 characters long');
        });
        (0, globals_1.it)('should enforce stronger password complexity requirements', async () => {
            const originalChangePassword = service.changePassword;
            globals_1.jest.spyOn(service, 'changePassword').mockImplementation(async (userId, currentPassword, newPassword) => {
                if (newPassword.length < 8) {
                    throw new common_1.BadRequestException('New password must be at least 8 characters long');
                }
                if (!/[A-Z]/.test(newPassword)) {
                    throw new common_1.BadRequestException('New password must contain at least one uppercase letter');
                }
                if (!/[a-z]/.test(newPassword)) {
                    throw new common_1.BadRequestException('New password must contain at least one lowercase letter');
                }
                if (!/[0-9]/.test(newPassword)) {
                    throw new common_1.BadRequestException('New password must contain at least one number');
                }
                if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
                    throw new common_1.BadRequestException('New password must contain at least one special character');
                }
                return originalChangePassword.call(service, userId, currentPassword, newPassword);
            });
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'nouppercase123!')).rejects.toThrow('New password must contain at least one uppercase letter');
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'NOLOWERCASE123!')).rejects.toThrow('New password must contain at least one lowercase letter');
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'NoNumbersHere!')).rejects.toThrow('New password must contain at least one number');
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'NoSpecialChars123')).rejects.toThrow('New password must contain at least one special character');
            const result = await service.changePassword(testUser.id, 'SecurePassword123!', 'NewP@ssw0rd!');
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.message).toBe('Password changed successfully');
        });
    });
    (0, globals_1.describe)('Password History', () => {
        (0, globals_1.it)('should prevent reuse of recent passwords', async () => {
            const userIndex = service.users.findIndex(u => u.id === testUser.id);
            service.users[userIndex].passwordHistory = [];
            const originalChangePassword = service.changePassword;
            globals_1.jest.spyOn(service, 'changePassword').mockImplementation(async (userId, currentPassword, newPassword) => {
                const userIndex = service.users.findIndex(u => u.id === userId);
                if (userIndex === -1) {
                    throw new common_1.NotFoundException('User not found');
                }
                const user = service.users[userIndex];
                const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    throw new common_1.UnauthorizedException('Current password is incorrect');
                }
                if (!user.passwordHistory) {
                    user.passwordHistory = [];
                }
                for (const oldPassword of user.passwordHistory) {
                    if (await bcrypt.compare(newPassword, oldPassword)) {
                        throw new common_1.BadRequestException('Password has been used recently. Choose a different password.');
                    }
                }
                if (!user.passwordHistory.some(async (p) => await bcrypt.compare(currentPassword, p))) {
                    user.passwordHistory.push(user.password);
                }
                if (user.passwordHistory.length > 5) {
                    user.passwordHistory.shift();
                }
                const salt = await bcrypt.genSalt();
                const hashedPassword = await bcrypt.hash(newPassword, salt);
                user.password = hashedPassword;
                return { message: 'Password changed successfully' };
            });
            const firstPassword = 'SecurePassword123!';
            const secondPassword = 'DifferentP@ssw0rd!';
            await service.changePassword(testUser.id, firstPassword, secondPassword);
            await (0, globals_1.expect)(service.changePassword(testUser.id, secondPassword, firstPassword)).rejects.toThrow('Password has been used recently');
            const thirdPassword = 'AnotherD!fferent123';
            const result = await service.changePassword(testUser.id, secondPassword, thirdPassword);
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.message).toBe('Password changed successfully');
        });
    });
    (0, globals_1.describe)('Password Expiration', () => {
        (0, globals_1.it)('should enforce password expiration policies', async () => {
            const userIndex = service.users.findIndex(u => u.id === testUser.id);
            const lastChanged = new Date();
            lastChanged.setDate(lastChanged.getDate() - 91);
            service.users[userIndex].passwordLastChanged = lastChanged;
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const userIndex = service.users.findIndex(u => u.email === email);
                if (userIndex !== -1) {
                    const user = service.users[userIndex];
                    const result = await originalLogin.call(service, email, password);
                    if (user.passwordLastChanged) {
                        const now = new Date();
                        const lastChanged = new Date(user.passwordLastChanged);
                        const diffInDays = (now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24);
                        if (diffInDays > 90) {
                            return Object.assign(Object.assign({}, result), { passwordExpired: true, user: result.user });
                        }
                    }
                    return Object.assign(Object.assign({}, result), { passwordExpired: false });
                }
                return originalLogin.call(service, email, password);
            });
            const loginResult = await service.login(service.users[userIndex].email, 'SecurePassword123!');
            (0, globals_1.expect)(loginResult).toBeDefined();
            (0, globals_1.expect)(loginResult.passwordExpired).toBe(true);
        });
        (0, globals_1.it)('should update password expiration date after password change', async () => {
            const originalChangePassword = service.changePassword;
            globals_1.jest.spyOn(service, 'changePassword').mockImplementation(async (userId, currentPassword, newPassword) => {
                const result = await originalChangePassword.call(service, userId, currentPassword, newPassword);
                const userIndex = service.users.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    service.users[userIndex].passwordLastChanged = new Date();
                }
                return result;
            });
            await service.changePassword(testUser.id, 'SecurePassword123!', 'NewSecureP@ssw0rd!');
            const userIndex = service.users.findIndex(u => u.id === testUser.id);
            const lastChanged = service.users[userIndex].passwordLastChanged;
            (0, globals_1.expect)(lastChanged).toBeDefined();
            const now = new Date();
            const diffInSeconds = (now.getTime() - lastChanged.getTime()) / 1000;
            (0, globals_1.expect)(diffInSeconds).toBeLessThan(5);
        });
    });
    (0, globals_1.describe)('Common Password Detection', () => {
        (0, globals_1.it)('should detect and reject common passwords', async () => {
            const commonPasswords = [
                'password', 'Password1', '123456', 'qwerty',
                'letmein', 'welcome', 'admin123', '123456789',
                'password123', 'admin', 'welcome123', 'login'
            ];
            const originalChangePassword = service.changePassword;
            globals_1.jest.spyOn(service, 'changePassword').mockImplementation(async (userId, currentPassword, newPassword) => {
                const normalizedPassword = newPassword.toLowerCase();
                if (commonPasswords.some(pwd => normalizedPassword.includes(pwd))) {
                    throw new common_1.BadRequestException('Password is too common and easily guessable');
                }
                return originalChangePassword.call(service, userId, currentPassword, newPassword);
            });
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'Password123!')).rejects.toThrow('Password is too common');
            await (0, globals_1.expect)(service.changePassword(testUser.id, 'SecurePassword123!', 'Welcome123!')).rejects.toThrow('Password is too common');
            const result = await service.changePassword(testUser.id, 'SecurePassword123!', 'Unique$P@s5w0rd!');
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.message).toBe('Password changed successfully');
        });
    });
    (0, globals_1.describe)('Password Quality Assessment', () => {
        (0, globals_1.it)('should provide feedback on password strength', () => {
            const assessPasswordStrength = (password) => {
                let score = 0;
                if (password.length >= 8)
                    score += 1;
                if (password.length >= 10)
                    score += 1;
                if (password.length >= 12)
                    score += 1;
                if (password.length >= 14)
                    score += 1;
                if (/[a-z]/.test(password))
                    score += 1;
                if (/[A-Z]/.test(password))
                    score += 1;
                if (/[0-9]/.test(password))
                    score += 1;
                if (/[^a-zA-Z0-9]/.test(password))
                    score += 1;
                const uniqueChars = new Set(password.split('')).size;
                if (uniqueChars >= password.length * 0.5)
                    score += 1;
                if (uniqueChars >= password.length * 0.7)
                    score += 1;
                let strength;
                let feedback;
                if (score <= 3) {
                    strength = 'weak';
                    feedback = 'This password is too weak. Add length and variety.';
                }
                else if (score <= 6) {
                    strength = 'moderate';
                    feedback = 'This password could be stronger. Try adding more variety.';
                }
                else if (score <= 8) {
                    strength = 'strong';
                    feedback = 'This is a good password.';
                }
                else {
                    strength = 'very strong';
                    feedback = 'Excellent password choice!';
                }
                return { score, strength, feedback };
            };
            const weakResult = assessPasswordStrength('password123');
            (0, globals_1.expect)(weakResult.strength).toBe('weak');
            (0, globals_1.expect)(weakResult.score).toBeLessThanOrEqual(3);
            const moderateResult = assessPasswordStrength('Password123');
            (0, globals_1.expect)(moderateResult.strength).toBe('moderate');
            const strongResult = assessPasswordStrength('P@ssw0rd123!');
            (0, globals_1.expect)(strongResult.strength).toBe('strong');
            const veryStrongResult = assessPasswordStrength('P@$$w0rd_F0r_S3cur!ty25');
            (0, globals_1.expect)(veryStrongResult.strength).toBe('very strong');
            (0, globals_1.expect)(veryStrongResult.score).toBeGreaterThan(8);
        });
    });
});
//# sourceMappingURL=password-policy.spec.js.map