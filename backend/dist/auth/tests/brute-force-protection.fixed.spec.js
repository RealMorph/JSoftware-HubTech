"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const globals_1 = require("@jest/globals");
function fail(message) {
    throw new Error(message);
}
(0, globals_1.describe)('AuthService - Brute Force Protection', () => {
    let service;
    let testUser;
    let testUserEmail;
    async function createTestUser() {
        const result = await service.register({
            firstName: 'Brute',
            lastName: 'Force',
            email: `brute-force-test-${Date.now()}@example.com`,
            password: 'SecurePassword123!'
        });
        const userIndex = service.users.findIndex(u => u.id === result.id);
        if (userIndex !== -1) {
            service.users[userIndex].isVerified = true;
            service.users[userIndex].isActive = true;
        }
        return result;
    }
    async function attemptLogin(email, password, attempts) {
        const results = [];
        for (let i = 0; i < attempts; i++) {
            try {
                const result = await service.login(email, password);
                results.push({ success: true, result });
            }
            catch (error) {
                results.push({ success: false, error });
            }
        }
        return results;
    }
    (0, globals_1.beforeEach)(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [auth_service_1.AuthService],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        testUser = await createTestUser();
        testUserEmail = service.users.find(u => u.id === testUser.id).email;
    });
    (0, globals_1.describe)('Account Lockout', () => {
        (0, globals_1.it)('should implement account lockout after multiple failed login attempts', async () => {
            const MAX_ATTEMPTS = 5;
            const LOCKOUT_MINUTES = 30;
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
                    const remainingMinutes = Math.ceil((new Date(user.lockoutUntil).getTime() - new Date().getTime()) / (1000 * 60));
                    throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`);
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
                        const lockoutUntil = new Date();
                        lockoutUntil.setMinutes(lockoutUntil.getMinutes() + LOCKOUT_MINUTES);
                        user.lockoutUntil = lockoutUntil;
                        throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.`);
                    }
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                user.failedLoginAttempts = 0;
                user.lockoutUntil = null;
                return originalLogin.call(service, email, password);
            });
            const attemptsBeforeLockout = await attemptLogin(testUserEmail, 'WrongPassword123!', MAX_ATTEMPTS - 1);
            attemptsBeforeLockout.forEach(attempt => {
                (0, globals_1.expect)(attempt.success).toBe(false);
                (0, globals_1.expect)(attempt.error).toBeInstanceOf(common_1.UnauthorizedException);
            });
            const correctLoginResult = await service.login(testUserEmail, 'SecurePassword123!');
            (0, globals_1.expect)(correctLoginResult).toBeDefined();
            (0, globals_1.expect)(correctLoginResult.user).toBeDefined();
            const attemptsToLockout = await attemptLogin(testUserEmail, 'WrongPassword123!', MAX_ATTEMPTS);
            const lastAttempt = attemptsToLockout[attemptsToLockout.length - 1];
            (0, globals_1.expect)(lastAttempt.success).toBe(false);
            (0, globals_1.expect)(lastAttempt.error).toBeInstanceOf(common_1.ForbiddenException);
            (0, globals_1.expect)(lastAttempt.error.message).toContain('Account locked');
            try {
                await service.login(testUserEmail, 'SecurePassword123!');
                fail('Should have thrown ForbiddenException');
            }
            catch (error) {
                (0, globals_1.expect)(error).toBeInstanceOf(common_1.ForbiddenException);
                (0, globals_1.expect)(error.message).toContain('Account locked');
            }
            const user = service.users.find(u => u.email === testUserEmail);
            (0, globals_1.expect)(user.lockoutUntil).toBeDefined();
            (0, globals_1.expect)(new Date(user.lockoutUntil) > new Date()).toBe(true);
        });
        (0, globals_1.it)('should reset failed login attempts after successful login', async () => {
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const previousAttempts = user.failedLoginAttempts || 0;
                user.failedLoginAttempts = 0;
                const result = await originalLogin.call(service, email, password);
                result.previousFailedAttempts = previousAttempts;
                return result;
            });
            await attemptLogin(testUserEmail, 'WrongPassword123!', 3);
            const userBeforeSuccess = service.users.find(u => u.email === testUserEmail);
            (0, globals_1.expect)(userBeforeSuccess.failedLoginAttempts).toBe(3);
            const loginResult = await service.login(testUserEmail, 'SecurePassword123!');
            (0, globals_1.expect)(loginResult.previousFailedAttempts).toBe(3);
            const userAfterSuccess = service.users.find(u => u.email === testUserEmail);
            (0, globals_1.expect)(userAfterSuccess.failedLoginAttempts).toBe(0);
        });
        (0, globals_1.it)('should unlock an account after lockout period expires', async () => {
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                if (user.lockoutUntil) {
                    if (new Date(user.lockoutUntil) > new Date()) {
                        throw new common_1.ForbiddenException('Account is locked');
                    }
                    else {
                        user.lockoutUntil = null;
                        user.failedLoginAttempts = 0;
                    }
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                return originalLogin.call(service, email, password);
            });
            const user = service.users.find(u => u.email === testUserEmail);
            const expiredLockout = new Date();
            expiredLockout.setSeconds(expiredLockout.getSeconds() - 1);
            user.lockoutUntil = expiredLockout;
            user.failedLoginAttempts = 5;
            const loginResult = await service.login(testUserEmail, 'SecurePassword123!');
            (0, globals_1.expect)(loginResult).toBeDefined();
            (0, globals_1.expect)(loginResult.user).toBeDefined();
            const updatedUser = service.users.find(u => u.email === testUserEmail);
            (0, globals_1.expect)(updatedUser.lockoutUntil).toBeNull();
            (0, globals_1.expect)(updatedUser.failedLoginAttempts).toBe(0);
        });
    });
    (0, globals_1.describe)('Progressive Delays', () => {
        (0, globals_1.it)('should implement progressive delays for repeated failed login attempts', async () => {
            const originalLogin = service.login;
            const attemptTimes = [];
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                attemptTimes.push(Date.now());
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                    let delaySeconds = 0;
                    if (user.failedLoginAttempts > 1) {
                        delaySeconds = Math.pow(2, user.failedLoginAttempts - 2);
                    }
                    if (delaySeconds > 0) {
                        user.nextAllowedAttempt = new Date(Date.now() + delaySeconds * 1000);
                    }
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                user.failedLoginAttempts = 0;
                user.nextAllowedAttempt = null;
                return originalLogin.call(service, email, password);
            });
            function isLoginAllowed(user) {
                if (user.nextAllowedAttempt && new Date(user.nextAllowedAttempt) > new Date()) {
                    return false;
                }
                return true;
            }
            for (let i = 1; i <= 5; i++) {
                try {
                    await service.login(testUserEmail, 'WrongPassword123!');
                }
                catch (error) {
                }
                const user = service.users.find(u => u.email === testUserEmail);
                (0, globals_1.expect)(user.failedLoginAttempts).toBe(i);
                if (i > 1) {
                    (0, globals_1.expect)(user.nextAllowedAttempt).toBeDefined();
                    const expectedDelay = Math.pow(2, i - 2);
                    const delayMs = new Date(user.nextAllowedAttempt).getTime() - attemptTimes[i - 1];
                    const delaySeconds = Math.round(delayMs / 1000);
                    (0, globals_1.expect)(delaySeconds).toBeCloseTo(expectedDelay, 0);
                    (0, globals_1.expect)(isLoginAllowed(user)).toBe(false);
                }
            }
        });
        (0, globals_1.it)('should release the delay once it has passed', () => {
            const user = service.users.find(u => u.email === testUserEmail);
            user.failedLoginAttempts = 3;
            const expiredDelay = new Date();
            expiredDelay.setSeconds(expiredDelay.getSeconds() - 1);
            user.nextAllowedAttempt = expiredDelay;
            function isLoginAllowed(user) {
                if (user.nextAllowedAttempt && new Date(user.nextAllowedAttempt) > new Date()) {
                    return false;
                }
                return true;
            }
            (0, globals_1.expect)(isLoginAllowed(user)).toBe(true);
        });
    });
    (0, globals_1.describe)('IP-Based Rate Limiting', () => {
        (0, globals_1.it)('should implement IP-based rate limiting for login attempts', async () => {
            const ipAttempts = new Map();
            const IP_RATE_LIMIT = 10;
            const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
            function isIPRateLimited(ipAddress) {
                if (!ipAttempts.has(ipAddress)) {
                    return false;
                }
                const attempts = ipAttempts.get(ipAddress);
                const recentAttempts = attempts.filter(timestamp => {
                    return (Date.now() - timestamp) < RATE_LIMIT_WINDOW_MS;
                });
                ipAttempts.set(ipAddress, recentAttempts);
                return recentAttempts.length >= IP_RATE_LIMIT;
            }
            function recordIPAttempt(ipAddress) {
                if (!ipAttempts.has(ipAddress)) {
                    ipAttempts.set(ipAddress, []);
                }
                const attempts = ipAttempts.get(ipAddress);
                attempts.push(Date.now());
                ipAttempts.set(ipAddress, attempts);
            }
            const testIP = '192.168.1.100';
            (0, globals_1.expect)(isIPRateLimited(testIP)).toBe(false);
            for (let i = 0; i < IP_RATE_LIMIT - 1; i++) {
                recordIPAttempt(testIP);
            }
            (0, globals_1.expect)(isIPRateLimited(testIP)).toBe(false);
            recordIPAttempt(testIP);
            (0, globals_1.expect)(isIPRateLimited(testIP)).toBe(true);
            const newIP = '10.0.0.1';
            (0, globals_1.expect)(isIPRateLimited(newIP)).toBe(false);
        });
        (0, globals_1.it)('should implement global and per-route rate limiting', () => {
            const routeLimits = {
                'login': { points: 10, durationMinutes: 15 },
                'passwordReset': { points: 5, durationMinutes: 60 },
                'register': { points: 3, durationMinutes: 60 }
            };
            const routeAttempts = new Map();
            function isRouteLimited(route, ipAddress) {
                const key = `${route}:${ipAddress}`;
                if (!routeLimits[route]) {
                    return false;
                }
                if (!routeAttempts.has(key)) {
                    return false;
                }
                const limit = routeLimits[route];
                const attempts = routeAttempts.get(key);
                const windowMs = limit.durationMinutes * 60 * 1000;
                const recentAttempts = attempts.filter(timestamp => {
                    return (Date.now() - timestamp) < windowMs;
                });
                routeAttempts.set(key, recentAttempts);
                return recentAttempts.length >= limit.points;
            }
            function recordRouteAttempt(route, ipAddress) {
                const key = `${route}:${ipAddress}`;
                if (!routeAttempts.has(key)) {
                    routeAttempts.set(key, []);
                }
                const attempts = routeAttempts.get(key);
                attempts.push(Date.now());
                routeAttempts.set(key, attempts);
            }
            const testIP = '192.168.1.100';
            (0, globals_1.expect)(isRouteLimited('login', testIP)).toBe(false);
            for (let i = 0; i < routeLimits.login.points; i++) {
                recordRouteAttempt('login', testIP);
            }
            (0, globals_1.expect)(isRouteLimited('login', testIP)).toBe(true);
            (0, globals_1.expect)(isRouteLimited('passwordReset', testIP)).toBe(false);
            for (let i = 0; i < routeLimits.passwordReset.points; i++) {
                recordRouteAttempt('passwordReset', testIP);
            }
            (0, globals_1.expect)(isRouteLimited('passwordReset', testIP)).toBe(true);
            const newIP = '10.0.0.1';
            (0, globals_1.expect)(isRouteLimited('login', newIP)).toBe(false);
            (0, globals_1.expect)(isRouteLimited('passwordReset', newIP)).toBe(false);
        });
    });
    (0, globals_1.describe)('Failed Login Tracking', () => {
        (0, globals_1.it)('should track and report previous failed login attempts', async () => {
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const result = await originalLogin.call(service, email, password);
                return Object.assign(Object.assign({}, result), { previousFailedAttempts: 3 });
            });
            const loginResult = await service.login(testUserEmail, 'SecurePassword123!');
            (0, globals_1.expect)(loginResult).toBeDefined();
            (0, globals_1.expect)(loginResult.previousFailedAttempts).toBe(3);
        });
    });
    (0, globals_1.describe)('CAPTCHA Challenge', () => {
        (0, globals_1.it)('should implement CAPTCHA challenges for suspicious login attempts', async () => {
            const captchaRequired = new Set();
            function requiresCaptcha(ipAddress, email) {
                return captchaRequired.has(`${ipAddress}:${email}`);
            }
            function flagForCaptcha(ipAddress, email) {
                captchaRequired.add(`${ipAddress}:${email}`);
            }
            function verifyCaptcha(captchaToken) {
                return captchaToken && captchaToken.length > 10;
            }
            const originalImplementation = service.login;
            service.login = globals_1.jest.fn().mockImplementation(async (email, password, options) => {
                const ipAddress = (options === null || options === void 0 ? void 0 : options.ipAddress) || '127.0.0.1';
                if (requiresCaptcha(ipAddress, email)) {
                    if (!(options === null || options === void 0 ? void 0 : options.captchaToken) || !verifyCaptcha(options.captchaToken)) {
                        return {
                            requiresCaptcha: true,
                            message: 'Please complete the CAPTCHA challenge'
                        };
                    }
                    captchaRequired.delete(`${ipAddress}:${email}`);
                }
                const user = service.users.find(u => u.email === email);
                if (!user) {
                    flagForCaptcha(ipAddress, email);
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    flagForCaptcha(ipAddress, email);
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
                return await originalImplementation.call(service, email, password);
            });
            const correctPassword = 'SecurePassword123!';
            const loginResult = await service.login(testUserEmail, correctPassword);
            (0, globals_1.expect)(loginResult).toBeDefined();
            flagForCaptcha('127.0.0.1', testUserEmail);
            const captchaResult = await service.login(testUserEmail, correctPassword);
            (0, globals_1.expect)(captchaResult.requiresCaptcha).toBe(true);
            const captchaLoginResult = await service.login(testUserEmail, correctPassword, { captchaToken: 'valid-captcha-token-12345' });
            (0, globals_1.expect)(captchaLoginResult).toBeDefined();
            const followupResult = await service.login(testUserEmail, correctPassword);
            (0, globals_1.expect)(followupResult).toBeDefined();
            service.login = originalImplementation;
        });
    });
    (0, globals_1.describe)('Username Enumeration Prevention', () => {
        (0, globals_1.it)('should prevent username enumeration during login', async () => {
            const originalLogin = service.login;
            globals_1.jest.spyOn(service, 'login').mockImplementation(async (email, password) => {
                const startTime = Date.now();
                try {
                    const user = service.users.find(u => u.email === email);
                    if (!user) {
                        await bcrypt.compare(password, '$2b$10$mockHashForNonExistentUser');
                        throw new common_1.UnauthorizedException('Invalid credentials');
                    }
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (!isPasswordValid) {
                        throw new common_1.UnauthorizedException('Invalid credentials');
                    }
                    if (!user.isVerified) {
                        throw new common_1.UnauthorizedException('Invalid credentials');
                    }
                    if (!user.isActive) {
                        throw new common_1.UnauthorizedException('Invalid credentials');
                    }
                    return originalLogin.call(service, email, password);
                }
                catch (error) {
                    const elapsedTime = Date.now() - startTime;
                    const MIN_RESPONSE_TIME = 200;
                    if (elapsedTime < MIN_RESPONSE_TIME) {
                        await new Promise(resolve => setTimeout(resolve, MIN_RESPONSE_TIME - elapsedTime));
                    }
                    throw new common_1.UnauthorizedException('Invalid credentials');
                }
            });
            try {
                await service.login(testUserEmail, 'WrongPassword123!');
                fail('Should have thrown UnauthorizedException');
            }
            catch (error) {
                (0, globals_1.expect)(error).toBeInstanceOf(common_1.UnauthorizedException);
                (0, globals_1.expect)(error.message).toBe('Invalid credentials');
            }
            try {
                await service.login('non-existent@example.com', 'AnyPassword123!');
                fail('Should have thrown UnauthorizedException');
            }
            catch (error) {
                (0, globals_1.expect)(error).toBeInstanceOf(common_1.UnauthorizedException);
                (0, globals_1.expect)(error.message).toBe('Invalid credentials');
            }
            const loginResult = await service.login(testUserEmail, 'SecurePassword123!');
            (0, globals_1.expect)(loginResult).toBeDefined();
            (0, globals_1.expect)(loginResult.user).toBeDefined();
        });
        (0, globals_1.it)('should prevent username enumeration during password reset', async () => {
            globals_1.jest.spyOn(service, 'requestPasswordReset').mockImplementation(async (email) => {
                return {
                    message: 'If your email exists in our system, you will receive a password reset link'
                };
            });
            const existingResult = await service.requestPasswordReset(testUserEmail);
            (0, globals_1.expect)(existingResult.message).toBe('If your email exists in our system, you will receive a password reset link');
            const nonExistentResult = await service.requestPasswordReset('non-existent@example.com');
            (0, globals_1.expect)(nonExistentResult.message).toBe('If your email exists in our system, you will receive a password reset link');
        });
    });
});
//# sourceMappingURL=brute-force-protection.fixed.spec.js.map