"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const security_settings_dto_1 = require("../dto/security-settings.dto");
describe('AuthService - Data Security', () => {
    let service;
    let testUserEmail;
    let testUserId;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        testUserEmail = `security-test-${Date.now()}@example.com`;
        const testUserData = {
            firstName: 'Security',
            lastName: 'Test',
            email: testUserEmail,
            password: 'SecureP@ssw0rd123!'
        };
        const userResponse = await service.register(testUserData);
        testUserId = userResponse.id;
        const userIndex = service.users.findIndex(u => u.id === testUserId);
        if (userIndex >= 0) {
            service.users[userIndex].isVerified = true;
        }
    });
    describe('Data Encryption', () => {
        it('should encrypt sensitive data before storing', async () => {
            const users = service.users;
            const createdUser = users.find(u => u.id === testUserId);
            expect(createdUser.password).not.toBe('SecureP@ssw0rd123!');
            expect(createdUser.password.startsWith('$2')).toBe(true);
            const loginResult = await service.login(testUserEmail, 'SecureP@ssw0rd123!');
            expect(loginResult).toBeDefined();
            expect(loginResult.user.id).toBe(testUserId);
        });
        it('should securely handle password reset tokens', async () => {
            const resetResponse = await service.requestPasswordReset(testUserEmail);
            expect(resetResponse).toBeDefined();
            expect(resetResponse.message).toContain('reset link');
        });
    });
    describe('Secure Storage', () => {
        it('should store sensitive data securely', async () => {
            await service.setSecurityQuestions(testUserId, [
                { question: "What was your first pet's name?", answer: "Fluffy" },
                { question: "What city were you born in?", answer: "New York" }
            ]);
            const users = service.users;
            const user = users.find(u => u.id === testUserId);
            expect(user.securityQuestions).toBeDefined();
            user.securityQuestions.forEach(sq => {
                expect(sq.question).toBeDefined();
                expect(sq.answer).toBeDefined();
                expect(sq.answer).not.toBe("Fluffy");
                expect(sq.answer).not.toBe("New York");
            });
        });
        it('should have proper session storage security', async () => {
            const loginResult = await service.login(testUserEmail, 'SecureP@ssw0rd123!');
            expect(loginResult.accessToken).toBeDefined();
            const activeSessions = service.activeSessions;
            const userSession = activeSessions.find(s => s.userId === testUserId);
            expect(userSession).toBeDefined();
            expect(userSession.token).toBeDefined();
            expect(userSession.token.length).toBeGreaterThan(16);
            expect(userSession.userAgent).toBeDefined();
            expect(userSession.ipAddress).toBeDefined();
        });
    });
    describe('Data Access Controls', () => {
        it('should enforce permission-based access to user data', async () => {
            const secondUserEmail = `access-control-test-${Date.now()}@example.com`;
            const secondUser = await service.register({
                email: secondUserEmail,
                password: 'AnotherSecure123!',
                firstName: 'Access',
                lastName: 'Control'
            });
            const userIndex = service.users.findIndex(u => u.id === secondUser.id);
            if (userIndex >= 0) {
                service.users[userIndex].isVerified = true;
            }
            const activeSessions = await service.getActiveSessions(testUserId);
            expect(activeSessions).toBeDefined();
            try {
                const firstUserSessions = await service.getActiveSessions(testUserId);
                if (firstUserSessions.length > 0) {
                    await service.terminateSession(secondUser.id, firstUserSessions[0].id);
                    fail('Should not be able to terminate another user\'s session');
                }
            }
            catch (error) {
                expect(error).toBeInstanceOf(common_1.ForbiddenException);
            }
        });
        it('should enforce data sharing privacy settings', async () => {
            await service.updatePrivacySettings(testUserId, {
                dataSharingLevel: security_settings_dto_1.DataSharingLevel.MINIMAL,
                showProfileToPublic: false,
                showActivityHistory: false,
                allowThirdPartyDataSharing: false,
                allowAnalyticsCookies: false
            });
            const users = service.users;
            const user = users.find(u => u.id === testUserId);
            expect(user.settings.security.privacy.dataSharingLevel).toBe(security_settings_dto_1.DataSharingLevel.MINIMAL);
            expect(user.settings.security.privacy.showProfileToPublic).toBe(false);
            expect(user.settings.security.privacy.showActivityHistory).toBe(false);
            expect(user.settings.security.privacy.allowThirdPartyDataSharing).toBe(false);
            expect(user.settings.security.privacy.allowAnalyticsCookies).toBe(false);
        });
        it('should ensure data access is properly logged and auditable', async () => {
            await service.login(testUserEmail, 'SecureP@ssw0rd123!');
            const loginHistory = await service.getLoginHistory(testUserId);
            expect(loginHistory).toBeDefined();
            expect(loginHistory.length).toBeGreaterThan(0);
            const lastLogin = loginHistory[0];
            expect(lastLogin.userId).toBe(testUserId);
            expect(lastLogin.ipAddress).toBeDefined();
            expect(lastLogin.timestamp).toBeDefined();
            expect(lastLogin.userAgent).toBeDefined();
        });
    });
});
//# sourceMappingURL=data-security.spec.js.map