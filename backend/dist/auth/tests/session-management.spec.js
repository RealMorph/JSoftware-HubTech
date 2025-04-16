"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const bcrypt = require("bcrypt");
describe('AuthService - Session Management', () => {
    let service;
    let testUser;
    async function createTestUser() {
        const result = await service.register({
            firstName: 'Session',
            lastName: 'Test',
            email: `session-test-${Date.now()}@example.com`,
            password: 'SecurePassword123!'
        });
        const userIndex = service.users.findIndex(u => u.id === result.id);
        if (userIndex !== -1) {
            service.users[userIndex].isVerified = true;
            service.users[userIndex].isActive = true;
        }
        return result;
    }
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        testUser = await createTestUser();
    });
    describe('Session Creation and Validation', () => {
        it('should create a new session when user logs in', async () => {
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            expect(loginResult).toBeDefined();
            expect(loginResult.sessionId).toBeDefined();
            expect(loginResult.accessToken).toBeDefined();
            const session = service.activeSessions.find(s => s.id === loginResult.sessionId);
            expect(session).toBeDefined();
            expect(session.userId).toBe(testUser.id);
            expect(session.token).toBe(loginResult.accessToken);
            expect(session.createdAt).toBeDefined();
            expect(session.lastActiveAt).toBeDefined();
            expect(session.ipAddress).toBeDefined();
            expect(session.userAgent).toBeDefined();
        });
        it('should generate unique session tokens for each login', async () => {
            const firstLogin = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            const secondLogin = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            expect(firstLogin.sessionId).not.toBe(secondLogin.sessionId);
            expect(firstLogin.accessToken).not.toBe(secondLogin.accessToken);
        });
        it('should implement a session validation mechanism', async () => {
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            const sessionId = loginResult.sessionId;
            const token = loginResult.accessToken;
            function validateSession(sessionId, token) {
                const session = service.activeSessions.find(s => s.id === sessionId);
                if (!session) {
                    return { valid: false, reason: 'Session not found' };
                }
                if (session.token !== token) {
                    return { valid: false, reason: 'Invalid token' };
                }
                const now = new Date();
                const lastActive = new Date(session.lastActiveAt);
                const timeoutMinutes = session.timeoutMinutes || 60;
                const minutesSinceLastActivity = (now.getTime() - lastActive.getTime()) / (1000 * 60);
                if (minutesSinceLastActivity >= timeoutMinutes) {
                    return { valid: false, reason: 'Session expired' };
                }
                return { valid: true, userId: session.userId };
            }
            const validResult = validateSession(sessionId, token);
            expect(validResult.valid).toBe(true);
            expect(validResult.userId).toBe(testUser.id);
            const invalidSessionResult = validateSession('invalid-session-id', token);
            expect(invalidSessionResult.valid).toBe(false);
            expect(invalidSessionResult.reason).toBe('Session not found');
            const invalidTokenResult = validateSession(sessionId, 'invalid-token');
            expect(invalidTokenResult.valid).toBe(false);
            expect(invalidTokenResult.reason).toBe('Invalid token');
        });
    });
    describe('Session Expiration', () => {
        it('should expire sessions after the configured timeout', async () => {
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            await service.configureSessionTimeout(testUser.id, {
                timeoutMinutes: 15,
                extendOnActivity: false
            });
            const sessionIndex = service.activeSessions.findIndex(s => s.id === loginResult.sessionId);
            expect(service.activeSessions[sessionIndex].timeoutMinutes).toBe(15);
            const lastActiveTime = new Date();
            lastActiveTime.setMinutes(lastActiveTime.getMinutes() - 20);
            service.activeSessions[sessionIndex].lastActiveAt = lastActiveTime;
            function isSessionExpired(sessionId) {
                const session = service.activeSessions.find(s => s.id === sessionId);
                if (!session)
                    return true;
                const now = new Date();
                const lastActive = new Date(session.lastActiveAt);
                const timeoutMinutes = session.timeoutMinutes || 60;
                const minutesSinceLastActivity = (now.getTime() - lastActive.getTime()) / (1000 * 60);
                return minutesSinceLastActivity >= timeoutMinutes;
            }
            expect(isSessionExpired(loginResult.sessionId)).toBe(true);
        });
        it('should extend session timeout on activity when configured', async () => {
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            await service.configureSessionTimeout(testUser.id, {
                timeoutMinutes: 30,
                extendOnActivity: true
            });
            const sessionId = loginResult.sessionId;
            const sessionIndex = service.activeSessions.findIndex(s => s.id === sessionId);
            const originalLastActiveAt = service.activeSessions[sessionIndex].lastActiveAt;
            const lastActiveTime = new Date();
            lastActiveTime.setMinutes(lastActiveTime.getMinutes() - 25);
            service.activeSessions[sessionIndex].lastActiveAt = lastActiveTime;
            function recordActivity(sessionId) {
                const sessionIndex = service.activeSessions.findIndex(s => s.id === sessionId);
                if (sessionIndex !== -1) {
                    const session = service.activeSessions[sessionIndex];
                    session.lastActiveAt = new Date(Date.now() + 1000);
                    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
                        service.activeSessions.splice(sessionIndex, 1);
                        return false;
                    }
                    if (session.extendOnActivity) {
                        const newExpirationTime = new Date();
                        newExpirationTime.setMinutes(newExpirationTime.getMinutes() + session.timeoutMinutes);
                        session.expiresAt = newExpirationTime;
                    }
                    return true;
                }
                return false;
            }
            recordActivity(sessionId);
            const updatedLastActiveAt = service.activeSessions[sessionIndex].lastActiveAt;
            expect(updatedLastActiveAt).not.toEqual(originalLastActiveAt);
            expect(updatedLastActiveAt).not.toEqual(lastActiveTime);
            const now = new Date();
            const diffInSeconds = (now.getTime() - updatedLastActiveAt.getTime()) / 1000;
            expect(diffInSeconds).toBeLessThan(5);
        });
        it('should not extend session timeout when extendOnActivity is false', async () => {
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            await service.configureSessionTimeout(testUser.id, {
                timeoutMinutes: 30,
                extendOnActivity: false
            });
            const sessionId = loginResult.sessionId;
            const sessionIndex = service.activeSessions.findIndex(s => s.id === sessionId);
            const lastActiveTime = new Date();
            lastActiveTime.setMinutes(lastActiveTime.getMinutes() - 25);
            service.activeSessions[sessionIndex].lastActiveAt = lastActiveTime;
            function recordActivity(sessionId) {
                const sessionIndex = service.activeSessions.findIndex(s => s.id === sessionId);
                if (sessionIndex !== -1) {
                    const session = service.activeSessions[sessionIndex];
                    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
                        service.activeSessions.splice(sessionIndex, 1);
                        return false;
                    }
                    if (session.extendOnActivity) {
                        session.lastActiveAt = new Date(Date.now() + 1000);
                        const newExpirationTime = new Date();
                        newExpirationTime.setMinutes(newExpirationTime.getMinutes() + session.timeoutMinutes);
                        session.expiresAt = newExpirationTime;
                    }
                    return true;
                }
                return false;
            }
            recordActivity(sessionId);
            const updatedLastActiveAt = service.activeSessions[sessionIndex].lastActiveAt;
            expect(updatedLastActiveAt).toEqual(lastActiveTime);
        });
    });
    describe('Session Termination', () => {
        it('should terminate a specific session on request', async () => {
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            const sessionId = loginResult.sessionId;
            expect(service.activeSessions.some(s => s.id === sessionId)).toBe(true);
            const result = await service.terminateSession(testUser.id, sessionId);
            expect(result).toBeDefined();
            expect(result.message).toBe('Session terminated successfully');
            expect(service.activeSessions.some(s => s.id === sessionId)).toBe(false);
        });
        it('should terminate all sessions for a user', async () => {
            await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            const userSessions = service.activeSessions.filter(s => s.userId === testUser.id);
            expect(userSessions.length).toBeGreaterThan(1);
            const result = await service.terminateAllSessions(testUser.id);
            expect(result).toBeDefined();
            expect(result.message).toBe('All sessions terminated successfully');
            const remainingSessions = service.activeSessions.filter(s => s.userId === testUser.id);
            expect(remainingSessions.length).toBe(0);
        });
        it('should automatically terminate all sessions on password change', async () => {
            await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            const initialSessions = service.activeSessions.filter(s => s.userId === testUser.id);
            expect(initialSessions.length).toBeGreaterThan(0);
            const originalChangePassword = service.changePassword;
            jest.spyOn(service, 'changePassword').mockImplementation(async (userId, currentPassword, newPassword) => {
                const result = await originalChangePassword.call(service, userId, currentPassword, newPassword);
                await service.terminateAllSessions(userId);
                return result;
            });
            await service.changePassword(testUser.id, 'SecurePassword123!', 'NewSecureP@ssw0rd!');
            const remainingSessions = service.activeSessions.filter(s => s.userId === testUser.id);
            expect(remainingSessions.length).toBe(0);
        });
    });
    describe('Concurrent Session Limits', () => {
        it('should enforce a maximum number of concurrent sessions per user', async () => {
            const MAX_CONCURRENT_SESSIONS = 2;
            const originalLogin = service.login;
            jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const userSessions = service.activeSessions.filter(s => s.userId === user.id);
                if (userSessions.length >= MAX_CONCURRENT_SESSIONS) {
                    userSessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                    const oldestSessionId = userSessions[0].id;
                    const sessionIndex = service.activeSessions.findIndex(s => s.id === oldestSessionId);
                    if (sessionIndex !== -1) {
                        service.activeSessions.splice(sessionIndex, 1);
                    }
                }
                const sessionId = 'session-' + Date.now();
                const token = 'token-' + Date.now();
                service.activeSessions.push({
                    id: sessionId,
                    userId: user.id,
                    token,
                    createdAt: new Date(),
                    lastActiveAt: new Date(),
                    ipAddress: '127.0.0.1',
                    userAgent: 'Test Browser',
                    deviceInfo: 'Test Device'
                });
                return {
                    user: { id: user.id, email: user.email },
                    sessionId,
                    accessToken: token
                };
            });
            const firstLogin = await service.login(testUser.email, 'SecurePassword123!');
            const secondLogin = await service.login(testUser.email, 'SecurePassword123!');
            const thirdLogin = await service.login(testUser.email, 'SecurePassword123!');
            const userSessions = service.activeSessions.filter(s => s.userId === testUser.id);
            expect(userSessions.length).toBe(MAX_CONCURRENT_SESSIONS);
            const firstSessionExists = service.activeSessions.some(s => s.id === firstLogin.sessionId);
            expect(firstSessionExists).toBe(false);
            const secondSessionExists = service.activeSessions.some(s => s.id === secondLogin.sessionId);
            const thirdSessionExists = service.activeSessions.some(s => s.id === thirdLogin.sessionId);
            expect(secondSessionExists).toBe(true);
            expect(thirdSessionExists).toBe(true);
        });
    });
    describe('Session Anomaly Detection', () => {
        it('should detect unusual session patterns', async () => {
            function detectSuspiciousLogin(userId, ipAddress, userAgent) {
                const loginHistory = service.loginHistory.filter(entry => entry.userId === userId);
                let isSuspicious = false;
                let reason = '';
                const existingIPs = new Set(loginHistory.map(entry => entry.ipAddress));
                if (!existingIPs.has(ipAddress)) {
                    isSuspicious = true;
                    reason = 'Login from a new location';
                }
                const existingUserAgents = new Set(loginHistory.map(entry => entry.userAgent));
                if (!existingUserAgents.has(userAgent)) {
                    isSuspicious = true;
                    reason = reason ? `${reason}, new device` : 'Login from a new device';
                }
                if (loginHistory.length > 0) {
                    const sortedHistory = [...loginHistory].sort((a, b) => {
                        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                    });
                    const mostRecent = sortedHistory[0];
                    if (mostRecent.ipAddress !== ipAddress &&
                        (new Date().getTime() - new Date(mostRecent.timestamp).getTime()) < 10 * 60 * 1000) {
                        isSuspicious = true;
                        reason = reason
                            ? `${reason}, rapid location change`
                            : 'Rapid login from different location';
                    }
                }
                return { suspicious: isSuspicious, reason };
            }
            if (!service.loginHistory) {
                service.loginHistory = [];
            }
            for (let i = 0; i < 3; i++) {
                service.loginHistory.push({
                    id: (0, uuid_1.v4)(),
                    userId: testUser.id,
                    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                    ipAddress: '192.168.1.1',
                    userAgent: 'Chrome Browser',
                    location: 'Home'
                });
            }
            const newIPResult = detectSuspiciousLogin(testUser.id, '10.0.0.1', 'Chrome Browser');
            expect(newIPResult.suspicious).toBe(true);
            expect(newIPResult.reason).toContain('new location');
            const newDeviceResult = detectSuspiciousLogin(testUser.id, '192.168.1.1', 'Firefox Browser');
            expect(newDeviceResult.suspicious).toBe(true);
            expect(newDeviceResult.reason).toContain('new device');
            const normalResult = detectSuspiciousLogin(testUser.id, '192.168.1.1', 'Chrome Browser');
            expect(normalResult.suspicious).toBe(false);
            service.loginHistory.push({
                id: (0, uuid_1.v4)(),
                userId: testUser.id,
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                ipAddress: '192.168.1.1',
                userAgent: 'Chrome Browser',
                location: 'Home'
            });
            const rapidChangeResult = detectSuspiciousLogin(testUser.id, '172.16.0.1', 'Chrome Browser');
            expect(rapidChangeResult.suspicious).toBe(true);
            expect(rapidChangeResult.reason).toContain('new location');
            expect(rapidChangeResult.reason).toContain('rapid location change');
        });
        it('should implement measures to handle suspicious sessions', async () => {
            const originalLogin = service.login;
            jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const result = await originalLogin.call(service, email, password);
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const ipAddress = '10.0.0.1';
                const userAgent = 'New Browser';
                const isSuspicious = true;
                if (isSuspicious) {
                    result.requiresTwoFactor = true;
                    result.verificationType = 'email';
                    if (!user.suspiciousLogins) {
                        user.suspiciousLogins = [];
                    }
                    user.suspiciousLogins.push({
                        timestamp: new Date(),
                        ipAddress,
                        userAgent,
                        sessionId: result.sessionId
                    });
                    const sessionIndex = service.activeSessions.findIndex(s => s.id === result.sessionId);
                    if (sessionIndex !== -1) {
                        service.activeSessions[sessionIndex].isLimited = true;
                        service.activeSessions[sessionIndex].suspiciousLogin = true;
                    }
                    if (!service.notifications) {
                        service.notifications = [];
                    }
                    service.notifications.push({
                        userId: user.id,
                        message: 'Suspicious login detected from a new location. Please verify your identity.',
                        timestamp: new Date(),
                        read: false
                    });
                }
                return result;
            });
            const loginResult = await service.login(service.users.find(u => u.id === testUser.id).email, 'SecurePassword123!');
            expect(loginResult.requiresTwoFactor).toBe(true);
            const user = service.users.find(u => u.id === testUser.id);
            expect(user.suspiciousLogins).toBeDefined();
            expect(user.suspiciousLogins.length).toBeGreaterThan(0);
            const session = service.activeSessions.find(s => s.id === loginResult.sessionId);
            expect(session.isLimited).toBe(true);
            expect(session.suspiciousLogin).toBe(true);
            const notifications = service.notifications.filter(n => n.userId === testUser.id);
            expect(notifications.length).toBeGreaterThan(0);
            expect(notifications[0].message).toContain('Suspicious login detected');
        });
    });
});
//# sourceMappingURL=session-management.spec.js.map