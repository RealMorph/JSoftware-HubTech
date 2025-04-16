"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
describe('AuthService - Profile Security', () => {
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
    const registerUser = async (userData) => {
        const user = await service.register(userData);
        const authServiceWithPrivateAccess = service;
        const userIndex = authServiceWithPrivateAccess.users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            authServiceWithPrivateAccess.users[userIndex].isVerified = true;
        }
        return user;
    };
    const getPrivateUser = (userId) => {
        const authServiceWithPrivateAccess = service;
        return authServiceWithPrivateAccess.users.find(u => u.id === userId);
    };
    describe('Change Password', () => {
        it('should change password with valid current password', async () => {
            const userData = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const result = await service.changePassword(user.id, userData.password, 'NewPassword456!');
            expect(result).toBeDefined();
            expect(result.message).toBe('Password changed successfully');
            await expect(service.login(userData.email, userData.password)).rejects.toThrow();
            const loginResult = await service.login(userData.email, 'NewPassword456!');
            expect(loginResult).toBeDefined();
            expect(loginResult.user.email).toBe(userData.email);
        });
        it('should throw error when changing password with incorrect current password', async () => {
            const userData = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane2.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await expect(service.changePassword(user.id, 'WrongPassword123!', 'NewPassword456!')).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw error when changing password with invalid new password', async () => {
            const userData = {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane3.doe@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await expect(service.changePassword(user.id, userData.password, 'short')).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Security Questions', () => {
        it('should set security questions for a user', async () => {
            const userData = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const securityQuestions = [
                { question: 'What was your first pet\'s name?', answer: 'Fluffy' },
                { question: 'What was the name of your first school?', answer: 'Lincoln Elementary' },
                { question: 'What is your mother\'s maiden name?', answer: 'Johnson' }
            ];
            const result = await service.setSecurityQuestions(user.id, securityQuestions);
            expect(result).toBeDefined();
            expect(result.message).toBe('Security questions set successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.securityQuestions).toBeDefined();
            expect(privateUser.securityQuestions.length).toBe(3);
            for (let i = 0; i < securityQuestions.length; i++) {
                expect(privateUser.securityQuestions[i].question).toBe(securityQuestions[i].question);
                expect(privateUser.securityQuestions[i].answer).not.toBe(securityQuestions[i].answer);
                const isMatch = await bcrypt.compare(securityQuestions[i].answer, privateUser.securityQuestions[i].answer);
                expect(isMatch).toBe(true);
            }
        });
        it('should update security questions for a user', async () => {
            const userData = {
                firstName: 'Alice',
                lastName: 'Brown',
                email: 'alice.brown@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const initialQuestions = [
                { question: 'What was your first pet\'s name?', answer: 'Fluffy' },
                { question: 'What was the name of your first school?', answer: 'Lincoln Elementary' }
            ];
            await service.setSecurityQuestions(user.id, initialQuestions);
            const updatedQuestions = [
                { question: 'What was your first pet\'s name?', answer: 'Buddy' },
                { question: 'What was the name of your first school?', answer: 'Washington High' },
                { question: 'What is your favorite book?', answer: 'Pride and Prejudice' }
            ];
            const result = await service.setSecurityQuestions(user.id, updatedQuestions);
            expect(result).toBeDefined();
            expect(result.message).toBe('Security questions set successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.securityQuestions).toBeDefined();
            expect(privateUser.securityQuestions.length).toBe(3);
            expect(privateUser.securityQuestions[0].question).toBe(updatedQuestions[0].question);
            for (let i = 0; i < updatedQuestions.length; i++) {
                const isMatch = await bcrypt.compare(updatedQuestions[i].answer, privateUser.securityQuestions[i].answer);
                expect(isMatch).toBe(true);
            }
        });
        it('should throw error when setting less than required security questions', async () => {
            const userData = {
                firstName: 'Bob',
                lastName: 'Williams',
                email: 'bob.williams@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const questions = [
                { question: 'What was your first pet\'s name?', answer: 'Rex' }
            ];
            await expect(service.setSecurityQuestions(user.id, questions)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Login History', () => {
        it('should record login history when user logs in', async () => {
            const userData = {
                firstName: 'Thomas',
                lastName: 'Clark',
                email: 'thomas.clark@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.login(userData.email, userData.password);
            const history = await service.getLoginHistory(user.id);
            expect(history).toBeDefined();
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].userId).toBe(user.id);
            expect(history[0].timestamp).toBeDefined();
            expect(history[0].ipAddress).toBeDefined();
            expect(history[0].userAgent).toBeDefined();
        });
        it('should retrieve limited login history entries', async () => {
            const userData = {
                firstName: 'Sarah',
                lastName: 'Jones',
                email: 'sarah.jones@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.login(userData.email, userData.password);
            const authServiceWithPrivateAccess = service;
            for (let i = 0; i < 10; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                authServiceWithPrivateAccess.loginHistory.push({
                    id: `history-${i}`,
                    userId: user.id,
                    timestamp: date,
                    ipAddress: '192.168.1.1',
                    userAgent: 'Test Browser',
                    location: 'Test Location'
                });
            }
            const limitedHistory = await service.getLoginHistory(user.id, 5);
            expect(limitedHistory).toBeDefined();
            expect(limitedHistory.length).toBe(5);
            for (let i = 0; i < limitedHistory.length - 1; i++) {
                expect(new Date(limitedHistory[i].timestamp).getTime())
                    .toBeGreaterThanOrEqual(new Date(limitedHistory[i + 1].timestamp).getTime());
            }
        });
    });
    describe('Active Sessions', () => {
        it('should list active sessions for a user', async () => {
            const userData = {
                firstName: 'Emily',
                lastName: 'Davis',
                email: 'emily.davis@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const loginResult = await service.login(userData.email, userData.password);
            const sessions = await service.getActiveSessions(user.id);
            expect(sessions).toBeDefined();
            expect(sessions.length).toBeGreaterThan(0);
            expect(sessions[0].userId).toBe(user.id);
            expect(sessions[0].createdAt).toBeDefined();
            expect(sessions[0].lastActiveAt).toBeDefined();
            expect(sessions[0].ipAddress).toBeDefined();
            expect(sessions[0].userAgent).toBeDefined();
        });
        it('should terminate specific session for a user', async () => {
            const userData = {
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michael.johnson@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.login(userData.email, userData.password);
            const sessions = await service.getActiveSessions(user.id);
            const sessionId = sessions[0].id;
            const result = await service.terminateSession(user.id, sessionId);
            expect(result).toBeDefined();
            expect(result.message).toBe('Session terminated successfully');
            const updatedSessions = await service.getActiveSessions(user.id);
            const terminatedSession = updatedSessions.find(s => s.id === sessionId);
            expect(terminatedSession).toBeUndefined();
        });
        it('should terminate all sessions for a user', async () => {
            const userData = {
                firstName: 'David',
                lastName: 'Miller',
                email: 'david.miller@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.login(userData.email, userData.password);
            const authServiceWithPrivateAccess = service;
            for (let i = 0; i < 3; i++) {
                authServiceWithPrivateAccess.activeSessions.push({
                    id: `session-${i}`,
                    userId: user.id,
                    token: `token-${i}`,
                    createdAt: new Date(),
                    lastActiveAt: new Date(),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Test Browser',
                    deviceInfo: 'Test Device'
                });
            }
            const sessions = await service.getActiveSessions(user.id);
            expect(sessions.length).toBeGreaterThan(1);
            const result = await service.terminateAllSessions(user.id);
            expect(result).toBeDefined();
            expect(result.message).toBe('All sessions terminated successfully');
            const updatedSessions = await service.getActiveSessions(user.id);
            expect(updatedSessions.length).toBe(0);
        });
        it('should throw error when terminating non-existent session', async () => {
            const userData = {
                firstName: 'Lisa',
                lastName: 'Wilson',
                email: 'lisa.wilson@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await expect(service.terminateSession(user.id, 'non-existent-session-id')).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=profile-security.spec.js.map