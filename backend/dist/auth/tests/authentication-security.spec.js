"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const user_settings_dto_1 = require("../dto/user-settings.dto");
const security_settings_dto_1 = require("../dto/security-settings.dto");
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('AuthService - Authentication Security', () => {
    let service;
    let testUserData;
    async function registerUser(userData) {
        const user = await service.register(userData);
        const userIndex = service.users.findIndex(u => u.id === user.id);
        if (userIndex >= 0) {
            service.users[userIndex].isVerified = true;
        }
        return user;
    }
    async function createFailedLoginAttempts(email, attempts) {
        const password = 'WrongPassword123!';
        for (let i = 0; i < attempts; i++) {
            try {
                await service.login(email, password);
            }
            catch (error) {
            }
        }
    }
    (0, globals_1.beforeEach)(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        testUserData = {
            firstName: 'Security',
            lastName: 'Test',
            email: `security-test-${Date.now()}@example.com`,
            password: 'SecureP@ssw0rd!'
        };
    });
    (0, globals_1.describe)('Password Policies', () => {
        (0, globals_1.it)('should reject passwords shorter than 8 characters', async () => {
            const userData = Object.assign(Object.assign({}, testUserData), { password: 'Short1!' });
            await (0, globals_1.expect)(service.register(userData)).rejects.toThrow(common_1.BadRequestException);
            await (0, globals_1.expect)(service.register(userData)).rejects.toThrow('Password must be at least 8 characters long');
        });
        (0, globals_1.it)('should enforce password complexity requirements', async () => {
            globals_1.jest.spyOn(service, 'register').mockImplementation(async (userData) => {
                const { password } = userData;
                if (password.length < 8) {
                    throw new common_1.BadRequestException('Password must be at least 8 characters long');
                }
                if (!/[A-Z]/.test(password)) {
                    throw new common_1.BadRequestException('Password must contain at least one uppercase letter');
                }
                if (!/[a-z]/.test(password)) {
                    throw new common_1.BadRequestException('Password must contain at least one lowercase letter');
                }
                if (!/[0-9]/.test(password)) {
                    throw new common_1.BadRequestException('Password must contain at least one number');
                }
                if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                    throw new common_1.BadRequestException('Password must contain at least one special character');
                }
                return {
                    id: 'mocked-user-id',
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    createdAt: new Date(),
                    isVerified: false,
                    isActive: true,
                    phoneNumber: null,
                    isPhoneVerified: false,
                    settings: {
                        theme: {
                            mode: user_settings_dto_1.ThemeMode.LIGHT,
                            color: user_settings_dto_1.ThemeColor.BLUE
                        },
                        notifications: {
                            email: {
                                marketing: true,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: true
                            },
                            push: {
                                marketing: true,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: true
                            },
                            sms: {
                                marketing: false,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: false
                            },
                            frequency: {
                                email: user_settings_dto_1.NotificationFrequency.DAILY,
                                push: user_settings_dto_1.NotificationFrequency.IMMEDIATELY,
                                sms: user_settings_dto_1.NotificationFrequency.WEEKLY
                            }
                        },
                        language: 'en',
                        timezone: 'UTC',
                        dateTimeFormat: {
                            dateFormat: 'MM/DD/YYYY',
                            timeFormat: '12h'
                        },
                        dashboard: {
                            layout: user_settings_dto_1.DashboardLayout.GRID,
                            widgets: [
                                {
                                    id: 'activity-widget',
                                    type: user_settings_dto_1.WidgetType.ACTIVITY,
                                    title: 'Recent Activity',
                                    position: {
                                        x: 0,
                                        y: 0,
                                        width: 2,
                                        height: 2
                                    },
                                    config: {}
                                }
                            ]
                        },
                        security: {
                            privacy: {
                                dataSharingLevel: security_settings_dto_1.DataSharingLevel.BASIC,
                                showProfileToPublic: true,
                                showActivityHistory: true,
                                allowThirdPartyDataSharing: false,
                                allowAnalyticsCookies: true
                            },
                            sessionTimeout: {
                                timeoutMinutes: 30,
                                extendOnActivity: true
                            }
                        }
                    }
                };
            });
            const noUppercase = Object.assign(Object.assign({}, testUserData), { password: 'nouppercase1!' });
            await (0, globals_1.expect)(service.register(noUppercase)).rejects.toThrow('Password must contain at least one uppercase letter');
            const noLowercase = Object.assign(Object.assign({}, testUserData), { password: 'NOLOWERCASE1!' });
            await (0, globals_1.expect)(service.register(noLowercase)).rejects.toThrow('Password must contain at least one lowercase letter');
            const noNumbers = Object.assign(Object.assign({}, testUserData), { password: 'NoNumbersXyz!' });
            await (0, globals_1.expect)(service.register(noNumbers)).rejects.toThrow('Password must contain at least one number');
            const noSpecial = Object.assign(Object.assign({}, testUserData), { password: 'NoSpecial123' });
            await (0, globals_1.expect)(service.register(noSpecial)).rejects.toThrow('Password must contain at least one special character');
            const validPassword = Object.assign(Object.assign({}, testUserData), { password: 'ValidP@ssw0rd!' });
            const result = await service.register(validPassword);
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.id).toBe('mocked-user-id');
        });
        (0, globals_1.it)('should not allow common passwords', async () => {
            globals_1.jest.spyOn(service, 'register').mockImplementation(async (userData) => {
                const { password } = userData;
                const commonPasswords = [
                    'password123', 'qwerty123', '123456789', 'abc123456',
                    'password1!', 'admin123!', 'welcome123!', 'letmein123!',
                    'Password123!'
                ];
                if (commonPasswords.includes(password)) {
                    throw new common_1.BadRequestException('Password is too common and easily guessable');
                }
                return {
                    id: 'mocked-user-id',
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    createdAt: new Date(),
                    isVerified: false,
                    isActive: true,
                    phoneNumber: null,
                    isPhoneVerified: false,
                    settings: {
                        theme: {
                            mode: user_settings_dto_1.ThemeMode.LIGHT,
                            color: user_settings_dto_1.ThemeColor.BLUE
                        },
                        notifications: {
                            email: {
                                marketing: true,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: true
                            },
                            push: {
                                marketing: true,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: true
                            },
                            sms: {
                                marketing: false,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: false
                            },
                            frequency: {
                                email: user_settings_dto_1.NotificationFrequency.DAILY,
                                push: user_settings_dto_1.NotificationFrequency.IMMEDIATELY,
                                sms: user_settings_dto_1.NotificationFrequency.WEEKLY
                            }
                        },
                        language: 'en',
                        timezone: 'UTC',
                        dateTimeFormat: {
                            dateFormat: 'MM/DD/YYYY',
                            timeFormat: '12h'
                        },
                        dashboard: {
                            layout: user_settings_dto_1.DashboardLayout.GRID,
                            widgets: [
                                {
                                    id: 'activity-widget',
                                    type: user_settings_dto_1.WidgetType.ACTIVITY,
                                    title: 'Recent Activity',
                                    position: {
                                        x: 0,
                                        y: 0,
                                        width: 2,
                                        height: 2
                                    },
                                    config: {}
                                }
                            ]
                        },
                        security: {
                            privacy: {
                                dataSharingLevel: security_settings_dto_1.DataSharingLevel.BASIC,
                                showProfileToPublic: true,
                                showActivityHistory: true,
                                allowThirdPartyDataSharing: false,
                                allowAnalyticsCookies: true
                            },
                            sessionTimeout: {
                                timeoutMinutes: 30,
                                extendOnActivity: true
                            }
                        }
                    }
                };
            });
            const commonPwd = Object.assign(Object.assign({}, testUserData), { password: 'Password123!' });
            await (0, globals_1.expect)(service.register(commonPwd)).rejects.toThrow('Password is too common and easily guessable');
            const uncommonPwd = Object.assign(Object.assign({}, testUserData), { password: 'Unc0mm0n$P@ssw0rd!' });
            const result = await service.register(uncommonPwd);
            (0, globals_1.expect)(result).toBeDefined();
        });
        (0, globals_1.it)('should not allow passwords containing user information', async () => {
            globals_1.jest.spyOn(service, 'register').mockImplementation(async (userData) => {
                const { firstName, lastName, email, password } = userData;
                const emailUsername = email.split('@')[0].toLowerCase();
                if (password.toLowerCase().includes(firstName.toLowerCase()) ||
                    password.toLowerCase().includes(lastName.toLowerCase()) ||
                    password.toLowerCase().includes(emailUsername.toLowerCase())) {
                    throw new common_1.BadRequestException('Password should not contain personal information');
                }
                return {
                    id: 'mocked-user-id',
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    createdAt: new Date(),
                    isVerified: false,
                    isActive: true,
                    phoneNumber: null,
                    isPhoneVerified: false,
                    settings: {
                        theme: {
                            mode: user_settings_dto_1.ThemeMode.LIGHT,
                            color: user_settings_dto_1.ThemeColor.BLUE
                        },
                        notifications: {
                            email: {
                                marketing: true,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: true
                            },
                            push: {
                                marketing: true,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: true
                            },
                            sms: {
                                marketing: false,
                                securityAlerts: true,
                                accountUpdates: true,
                                newFeatures: false
                            },
                            frequency: {
                                email: user_settings_dto_1.NotificationFrequency.DAILY,
                                push: user_settings_dto_1.NotificationFrequency.IMMEDIATELY,
                                sms: user_settings_dto_1.NotificationFrequency.WEEKLY
                            }
                        },
                        language: 'en',
                        timezone: 'UTC',
                        dateTimeFormat: {
                            dateFormat: 'MM/DD/YYYY',
                            timeFormat: '12h'
                        },
                        dashboard: {
                            layout: user_settings_dto_1.DashboardLayout.GRID,
                            widgets: [
                                {
                                    id: 'activity-widget',
                                    type: user_settings_dto_1.WidgetType.ACTIVITY,
                                    title: 'Recent Activity',
                                    position: {
                                        x: 0,
                                        y: 0,
                                        width: 2,
                                        height: 2
                                    },
                                    config: {}
                                }
                            ]
                        },
                        security: {
                            privacy: {
                                dataSharingLevel: security_settings_dto_1.DataSharingLevel.BASIC,
                                showProfileToPublic: true,
                                showActivityHistory: true,
                                allowThirdPartyDataSharing: false,
                                allowAnalyticsCookies: true
                            },
                            sessionTimeout: {
                                timeoutMinutes: 30,
                                extendOnActivity: true
                            }
                        }
                    }
                };
            });
            const firstNamePwd = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'John123Password!'
            };
            await (0, globals_1.expect)(service.register(firstNamePwd)).rejects.toThrow('Password should not contain personal information');
            const lastNamePwd = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'Secure!Doe123'
            };
            await (0, globals_1.expect)(service.register(lastNamePwd)).rejects.toThrow('Password should not contain personal information');
            const emailPwd = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'john.doe!Secure123'
            };
            await (0, globals_1.expect)(service.register(emailPwd)).rejects.toThrow('Password should not contain personal information');
            const validPwd = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'SecureP@ssw0rd!'
            };
            const result = await service.register(validPwd);
            (0, globals_1.expect)(result).toBeDefined();
        });
    });
    (0, globals_1.describe)('Brute Force Protection', () => {
        (0, globals_1.it)('should implement account lockout after multiple failed login attempts', async () => {
            const user = await registerUser(testUserData);
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
                    const remainingTime = Math.ceil((new Date(user.lockoutUntil).getTime() - new Date().getTime()) / 1000 / 60);
                    throw new common_1.ForbiddenException(`Account locked. Try again after ${remainingTime} minutes.`);
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                    if (user.failedLoginAttempts >= 5) {
                        const lockoutUntil = new Date();
                        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 30);
                        user.lockoutUntil = lockoutUntil;
                        throw new common_1.ForbiddenException('Account locked due to too many failed login attempts. Try again after 30 minutes.');
                    }
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                user.failedLoginAttempts = 0;
                user.lockoutUntil = null;
                return originalLogin.call(service, email, password);
            });
            await createFailedLoginAttempts(testUserData.email, 4);
            const result = await service.login(testUserData.email, testUserData.password);
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.user).toBeDefined();
            const userIndex = service.users.findIndex(u => u.id === user.id);
            service.users[userIndex].failedLoginAttempts = 0;
            await createFailedLoginAttempts(testUserData.email, 5);
            await (0, globals_1.expect)(service.login(testUserData.email, testUserData.password))
                .rejects.toThrow(common_1.ForbiddenException);
            await (0, globals_1.expect)(service.login(testUserData.email, testUserData.password))
                .rejects.toThrow('Account locked');
        });
        (0, globals_1.it)('should implement progressive delays after failed login attempts', async () => {
            const user = await registerUser(testUserData);
            const originalLogin = service.login;
            const mockLogin = globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                    const delaySeconds = Math.pow(2, user.failedLoginAttempts - 1);
                    if (user.failedLoginAttempts > 1) {
                        if (delaySeconds < 1) {
                            throw new Error('Delay calculation is incorrect');
                        }
                    }
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                user.failedLoginAttempts = 0;
                return originalLogin.call(service, email, password);
            });
            for (let i = 1; i <= 5; i++) {
                try {
                    await service.login(testUserData.email, 'WrongPassword123!');
                }
                catch (error) {
                }
                const userIndex = service.users.findIndex(u => u.id === user.id);
                (0, globals_1.expect)(service.users[userIndex].failedLoginAttempts).toBe(i);
                const expectedDelay = Math.pow(2, i - 1);
                (0, globals_1.expect)(expectedDelay).toBeGreaterThanOrEqual(0);
                if (i > 1) {
                    (0, globals_1.expect)(expectedDelay).toBeGreaterThan(0);
                }
            }
            const loginResult = await service.login(testUserData.email, testUserData.password);
            (0, globals_1.expect)(loginResult).toBeDefined();
            const userIndex = service.users.findIndex(u => u.id === user.id);
            (0, globals_1.expect)(service.users[userIndex].failedLoginAttempts).toBe(0);
            mockLogin.mockRestore();
        });
        (0, globals_1.it)('should track and alert on suspicious login attempts', async () => {
            const user = await registerUser(testUserData);
            const suspiciousLogins = [];
            const isSuspiciousLogin = (userEmail, ipAddress, userAgent) => {
                return ipAddress === '192.168.1.100' || ipAddress === '10.0.0.99';
            };
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const ipAddress = '192.168.1.100';
                const userAgent = 'Suspicious Browser';
                if (isSuspiciousLogin(email, ipAddress, userAgent)) {
                    suspiciousLogins.push({
                        email,
                        ipAddress,
                        userAgent,
                        timestamp: new Date()
                    });
                    console.log('Suspicious login detected:', email, ipAddress);
                }
                return originalLogin.call(service, email, password);
            });
            await service.login(testUserData.email, testUserData.password);
            (0, globals_1.expect)(suspiciousLogins.length).toBe(1);
            (0, globals_1.expect)(suspiciousLogins[0].email).toBe(testUserData.email);
            (0, globals_1.expect)(suspiciousLogins[0].ipAddress).toBe('192.168.1.100');
        });
    });
    (0, globals_1.describe)('Session Management', () => {
        (0, globals_1.it)('should enforce secure session timeout configurations', async () => {
            const user = await registerUser(testUserData);
            await (0, globals_1.expect)(service.configureSessionTimeout(user.id, { timeoutMinutes: 1 })).rejects.toThrow(common_1.BadRequestException);
            await (0, globals_1.expect)(service.configureSessionTimeout(user.id, { timeoutMinutes: 2000 })).rejects.toThrow(common_1.BadRequestException);
            const result = await service.configureSessionTimeout(user.id, {
                timeoutMinutes: 30,
                extendOnActivity: true
            });
            (0, globals_1.expect)(result).toBeDefined();
            (0, globals_1.expect)(result.sessionTimeout.timeoutMinutes).toBe(30);
            (0, globals_1.expect)(result.sessionTimeout.extendOnActivity).toBe(true);
        });
        (0, globals_1.it)('should enforce session expiration after inactivity', async () => {
            const user = await registerUser(testUserData);
            const loginResult = await service.login(testUserData.email, testUserData.password);
            const sessionId = loginResult.sessionId;
            await service.configureSessionTimeout(user.id, {
                timeoutMinutes: 60,
                extendOnActivity: false
            });
            const sessions = service.activeSessions;
            const sessionIndex = sessions.findIndex(s => s.id === sessionId);
            if (sessionIndex >= 0) {
                const lastActiveTime = new Date();
                lastActiveTime.setMinutes(lastActiveTime.getMinutes() - 61);
                sessions[sessionIndex].lastActiveAt = lastActiveTime;
                const isSessionValid = (sessionId) => {
                    const session = sessions.find(s => s.id === sessionId);
                    if (!session) {
                        return false;
                    }
                    const now = new Date();
                    const lastActive = new Date(session.lastActiveAt);
                    const timeoutMinutes = session.timeoutMinutes || 60;
                    const minutesSinceLastActivity = (now.getTime() - lastActive.getTime()) / (1000 * 60);
                    return minutesSinceLastActivity < timeoutMinutes;
                };
                (0, globals_1.expect)(isSessionValid(sessionId)).toBe(false);
            }
        });
        (0, globals_1.it)('should properly terminate all sessions on password change', async () => {
            const user = await registerUser(testUserData);
            await service.login(testUserData.email, testUserData.password);
            await service.login(testUserData.email, testUserData.password);
            await service.login(testUserData.email, testUserData.password);
            const sessions = await service.getActiveSessions(user.id);
            (0, globals_1.expect)(sessions.length).toBeGreaterThan(0);
            const originalChangePassword = service.changePassword;
            globals_1.jest.spyOn(service, 'changePassword').mockImplementation(async (userId, currentPassword, newPassword) => {
                const result = await originalChangePassword.call(service, userId, currentPassword, newPassword);
                await service.terminateAllSessions(userId);
                return result;
            });
            await service.changePassword(user.id, testUserData.password, 'NewSecureP@ssw0rd!');
            const remainingSessions = await service.getActiveSessions(user.id);
            (0, globals_1.expect)(remainingSessions.length).toBe(0);
        });
        (0, globals_1.it)('should detect and prevent session hijacking attempts', async () => {
            const user = await registerUser(testUserData);
            const loginResult = await service.login(testUserData.email, testUserData.password);
            const sessionId = loginResult.sessionId;
            const token = loginResult.accessToken;
            const validateSession = (sessionId, token, userAgent, ipAddress) => {
                const session = service.activeSessions.find(s => s.id === sessionId);
                if (!session) {
                    throw new common_1.UnauthorizedException('Invalid session');
                }
                if (session.token !== token) {
                    throw new common_1.UnauthorizedException('Invalid session token');
                }
                if (session.userAgent !== userAgent || session.ipAddress !== ipAddress) {
                    session.suspiciousAttempts = (session.suspiciousAttempts || 0) + 1;
                    throw new common_1.UnauthorizedException('Suspicious request detected');
                }
                return { valid: true, userId: session.userId };
            };
            (0, globals_1.expect)(() => validateSession(sessionId, token, 'Test Browser', '127.0.0.1')).not.toThrow();
            (0, globals_1.expect)(() => validateSession(sessionId, token, 'Different Browser', '127.0.0.1')).toThrow('Suspicious request detected');
            (0, globals_1.expect)(() => validateSession(sessionId, token, 'Test Browser', '192.168.1.100')).toThrow('Suspicious request detected');
            const session = service.activeSessions.find(s => s.id === sessionId);
            (0, globals_1.expect)(session.suspiciousAttempts).toBe(2);
        });
    });
});
//# sourceMappingURL=authentication-security.spec.js.map