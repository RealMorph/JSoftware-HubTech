"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const user_settings_dto_1 = require("./dto/user-settings.dto");
const security_settings_dto_1 = require("./dto/security-settings.dto");
let AuthService = class AuthService {
    constructor() {
        this.users = [];
        this.passwordResetTokens = [];
        this.twoFactorSecrets = [];
        this.twoFactorTempTokens = [];
        this.emailVerificationCodes = [];
        this.phoneVerificationCodes = [];
        this.loginHistory = [];
        this.activeSessions = [];
        this.notifications = [];
        this.apiKeys = [];
        this.validLanguageCodes = [
            'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko', 'ar'
        ];
        this.validTimezones = [
            'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
            'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
        ];
        this.failedLoginAttempts = new Map();
        this.loginAttemptTimestamps = new Map();
        this.userLockouts = new Map();
        this.ipLoginAttempts = new Map();
        this.globalAttempts = [];
        this.routeAttempts = new Map();
        this.MAX_FAILED_ATTEMPTS = 5;
        this.LOCKOUT_DURATION_MINUTES = 30;
        this.IP_RATE_LIMIT = 60;
        this.IP_RATE_LIMIT_WINDOW_MINUTES = 10;
        this.GLOBAL_RATE_LIMIT = 1000;
        this.GLOBAL_RATE_LIMIT_WINDOW_MINUTES = 1;
        this.ROUTE_LIMITS = {
            login: { points: 10, window: 5 },
            passwordReset: { points: 5, window: 10 }
        };
    }
    getRecentFailedAttempts(email) {
        return Promise.resolve(this.failedLoginAttempts.get(email) || 0);
    }
    recordFailedLoginAttempt(email) {
        const currentAttempts = this.failedLoginAttempts.get(email) || 0;
        this.failedLoginAttempts.set(email, currentAttempts + 1);
        const timestamps = this.loginAttemptTimestamps.get(email) || [];
        timestamps.push(new Date());
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        this.loginAttemptTimestamps.set(email, timestamps.filter(date => date > oneDayAgo));
        this.updateLockoutStatus(email);
    }
    resetFailedLoginAttempts(email) {
        this.failedLoginAttempts.set(email, 0);
        this.userLockouts.delete(email);
    }
    updateLockoutStatus(email) {
        const attempts = this.failedLoginAttempts.get(email) || 0;
        if (attempts >= this.MAX_FAILED_ATTEMPTS) {
            const lockoutUntil = new Date();
            lockoutUntil.setMinutes(lockoutUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES);
            this.userLockouts.set(email, lockoutUntil);
        }
        else if (attempts > 1) {
            const delaySeconds = Math.pow(2, attempts - 2);
            const nextAllowedAttempt = new Date();
            nextAllowedAttempt.setSeconds(nextAllowedAttempt.getSeconds() + delaySeconds);
            this.userLockouts.set(email, nextAllowedAttempt);
        }
    }
    isUserLocked(email) {
        const lockoutTime = this.userLockouts.get(email);
        return !!lockoutTime && lockoutTime > new Date();
    }
    getLockoutRemainingMinutes(email) {
        const lockoutTime = this.userLockouts.get(email);
        if (!lockoutTime || lockoutTime <= new Date()) {
            return 0;
        }
        return Math.ceil((lockoutTime.getTime() - new Date().getTime()) / (1000 * 60));
    }
    recordIPAttempt(ipAddress) {
        const timestamps = this.ipLoginAttempts.get(ipAddress) || [];
        timestamps.push(new Date());
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.IP_RATE_LIMIT_WINDOW_MINUTES);
        this.ipLoginAttempts.set(ipAddress, timestamps.filter(date => date > windowStart));
    }
    isIPRateLimited(ipAddress) {
        const timestamps = this.ipLoginAttempts.get(ipAddress) || [];
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.IP_RATE_LIMIT_WINDOW_MINUTES);
        const recentAttempts = timestamps.filter(date => date > windowStart);
        return recentAttempts.length >= this.IP_RATE_LIMIT;
    }
    recordGlobalAttempt() {
        this.globalAttempts.push(new Date());
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.GLOBAL_RATE_LIMIT_WINDOW_MINUTES);
        this.globalAttempts = this.globalAttempts.filter(date => date > windowStart);
    }
    isGlobalRateLimited() {
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.GLOBAL_RATE_LIMIT_WINDOW_MINUTES);
        const recentAttempts = this.globalAttempts.filter(date => date > windowStart);
        return recentAttempts.length >= this.GLOBAL_RATE_LIMIT;
    }
    recordRouteAttempt(route, ipAddress) {
        const key = `${route}:${ipAddress}`;
        const timestamps = this.routeAttempts.get(key) || [];
        timestamps.push(new Date());
        if (this.ROUTE_LIMITS[route]) {
            const windowStart = new Date();
            windowStart.setMinutes(windowStart.getMinutes() - this.ROUTE_LIMITS[route].window);
            this.routeAttempts.set(key, timestamps.filter(date => date > windowStart));
        }
    }
    isRouteLimited(route, ipAddress) {
        if (!this.ROUTE_LIMITS[route]) {
            return false;
        }
        const key = `${route}:${ipAddress}`;
        const timestamps = this.routeAttempts.get(key) || [];
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.ROUTE_LIMITS[route].window);
        const recentAttempts = timestamps.filter(date => date > windowStart);
        return recentAttempts.length >= this.ROUTE_LIMITS[route].points;
    }
    verifyCaptcha(token) {
        return Promise.resolve(!!token && token.length > 0);
    }
    async register(createUserDto) {
        const { email, password, firstName, lastName } = createUserDto;
        if (!firstName || !lastName || !email || !password) {
            throw new common_1.BadRequestException('All fields are required');
        }
        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        if (password.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
            id: (0, uuid_1.v4)(),
            firstName,
            lastName,
            email,
            password: hashedPassword,
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
                language: 'en',
                timezone: 'UTC',
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
                dashboard: {
                    layout: user_settings_dto_1.DashboardLayout.GRID,
                    widgets: [
                        {
                            id: (0, uuid_1.v4)(),
                            type: user_settings_dto_1.WidgetType.ACTIVITY,
                            title: 'Recent Activity',
                            position: { x: 0, y: 0, width: 2, height: 2 },
                            config: {}
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            type: user_settings_dto_1.WidgetType.STATS,
                            title: 'Account Stats',
                            position: { x: 2, y: 0, width: 1, height: 1 },
                            config: {}
                        },
                        {
                            id: (0, uuid_1.v4)(),
                            type: user_settings_dto_1.WidgetType.NOTIFICATIONS,
                            title: 'Notifications',
                            position: { x: 0, y: 2, width: 3, height: 1 },
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
        this.users.push(newUser);
        this.generateEmailVerificationCode(newUser.id);
        const { password: _ } = newUser, result = __rest(newUser, ["password"]);
        return result;
    }
    async login(email, password, options) {
        const ipAddress = (options === null || options === void 0 ? void 0 : options.ipAddress) || '127.0.0.1';
        const startTime = Date.now();
        try {
            this.recordGlobalAttempt();
            if (this.isGlobalRateLimited()) {
                throw new common_1.ForbiddenException('Too many login attempts. Please try again later.');
            }
            this.recordIPAttempt(ipAddress);
            if (this.isIPRateLimited(ipAddress)) {
                throw new common_1.ForbiddenException('Too many login attempts from your IP address. Please try again later.');
            }
            this.recordRouteAttempt('login', ipAddress);
            if (this.isRouteLimited('login', ipAddress)) {
                throw new common_1.ForbiddenException('Rate limit exceeded for login. Please try again later.');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new common_1.BadRequestException('Invalid email format');
            }
            if (this.isUserLocked(email)) {
                const recentFailedAttempts = await this.getRecentFailedAttempts(email);
                if (recentFailedAttempts >= 5) {
                    if (!(options === null || options === void 0 ? void 0 : options.captchaToken)) {
                        throw new common_1.UnauthorizedException('CAPTCHA required after too many failed attempts');
                    }
                    const isCaptchaValid = await this.verifyCaptcha(options.captchaToken);
                    if (!isCaptchaValid) {
                        throw new common_1.UnauthorizedException('Invalid CAPTCHA');
                    }
                    if (this.getLockoutRemainingMinutes(email) > 0) {
                        const remainingMinutes = this.getLockoutRemainingMinutes(email);
                        throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`);
                    }
                }
                else {
                    const remainingMinutes = this.getLockoutRemainingMinutes(email);
                    throw new common_1.ForbiddenException(`Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`);
                }
            }
            const user = this.users.find(u => u.email === email);
            if (!user) {
                await bcrypt.compare(password, '$2b$10$mockHashForNonExistentUser');
                this.recordFailedLoginAttempt(email);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                this.recordFailedLoginAttempt(email);
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (!user.isVerified) {
                throw new common_1.ForbiddenException('Email not verified');
            }
            if (!user.isActive) {
                throw new common_1.ForbiddenException('Account is inactive');
            }
            const previousFailedAttempts = await this.getRecentFailedAttempts(email);
            this.resetFailedLoginAttempts(email);
            const loginHistoryEntry = {
                id: (0, uuid_1.v4)(),
                userId: user.id,
                timestamp: new Date(),
                ipAddress: ipAddress,
                userAgent: (options === null || options === void 0 ? void 0 : options.userAgent) || 'Unknown',
                location: 'Unknown'
            };
            this.loginHistory.push(loginHistoryEntry);
            const sessionId = (0, uuid_1.v4)();
            const token = (0, uuid_1.v4)();
            const session = {
                id: sessionId,
                userId: user.id,
                token,
                createdAt: new Date(),
                lastActiveAt: new Date(),
                ipAddress: ipAddress,
                userAgent: (options === null || options === void 0 ? void 0 : options.userAgent) || 'Unknown',
                deviceInfo: 'Unknown'
            };
            this.activeSessions.push(session);
            const twoFactorSecret = this.twoFactorSecrets.find(s => s.userId === user.id);
            if (twoFactorSecret && twoFactorSecret.isEnabled) {
                const tempToken = (0, uuid_1.v4)();
                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + 5);
                this.twoFactorTempTokens.push({
                    token: tempToken,
                    userId: user.id,
                    expiresAt
                });
                return {
                    requiresTwoFactor: true,
                    tempToken,
                    previousFailedAttempts
                };
            }
            const { password: _ } = user, result = __rest(user, ["password"]);
            return {
                user: result,
                sessionId,
                accessToken: token,
                previousFailedAttempts
            };
        }
        catch (error) {
            const elapsedTime = Date.now() - startTime;
            const MIN_RESPONSE_TIME = 200;
            if (elapsedTime < MIN_RESPONSE_TIME) {
                await new Promise(resolve => setTimeout(resolve, MIN_RESPONSE_TIME - elapsedTime));
            }
            throw error;
        }
    }
    async requestPasswordReset(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        const user = this.users.find(u => u.email === email);
        if (!user) {
            return { message: 'If your email exists in our system, you will receive a password reset link' };
        }
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        this.passwordResetTokens.push({
            token,
            userId: user.id,
            expiresAt
        });
        return {
            message: 'If your email exists in our system, you will receive a password reset link',
            token
        };
    }
    async resetPassword(token, newPassword) {
        if (!newPassword || newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long');
        }
        const tokenRecord = this.passwordResetTokens.find(t => t.token === token);
        if (!tokenRecord) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
        if (new Date() > tokenRecord.expiresAt) {
            this.passwordResetTokens = this.passwordResetTokens.filter(t => t.token !== token);
            throw new common_1.BadRequestException('Token has expired');
        }
        const user = this.users.find(u => u.id === tokenRecord.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        this.passwordResetTokens = this.passwordResetTokens.filter(t => t.token !== token);
        return { message: 'Password has been reset successfully' };
    }
    async enableTwoFactor(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const existingSecret = this.twoFactorSecrets.find(s => s.userId === userId);
        if (existingSecret && existingSecret.isEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is already enabled');
        }
        const secret = Math.random().toString(36).substr(2, 10);
        if (existingSecret) {
            existingSecret.secret = secret;
            existingSecret.isEnabled = false;
        }
        else {
            this.twoFactorSecrets.push({
                userId,
                secret,
                isEnabled: false
            });
        }
        return {
            secret,
            otpauthUrl: `otpauth://totp/WebEnginePlatform:${user.email}?secret=${secret}&issuer=WebEnginePlatform`
        };
    }
    async verifyAndEnableTwoFactor(userId, code) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const secretRecord = this.twoFactorSecrets.find(s => s.userId === userId);
        if (!secretRecord) {
            throw new common_1.BadRequestException('Two-factor authentication not set up');
        }
        if (code !== secretRecord.secret) {
            throw new common_1.UnauthorizedException('Invalid verification code');
        }
        secretRecord.isEnabled = true;
        return { message: 'Two-factor authentication enabled successfully' };
    }
    async verifyTwoFactorCode(tempToken, code) {
        const tokenRecord = this.twoFactorTempTokens.find(t => t.token === tempToken);
        if (!tokenRecord) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        if (new Date() > tokenRecord.expiresAt) {
            this.twoFactorTempTokens = this.twoFactorTempTokens.filter(t => t.token !== tempToken);
            throw new common_1.UnauthorizedException('Token has expired');
        }
        const user = this.users.find(u => u.id === tokenRecord.userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const secretRecord = this.twoFactorSecrets.find(s => s.userId === user.id);
        if (!secretRecord) {
            throw new common_1.BadRequestException('Two-factor authentication not set up');
        }
        if (code !== secretRecord.secret) {
            throw new common_1.UnauthorizedException('Invalid verification code');
        }
        this.twoFactorTempTokens = this.twoFactorTempTokens.filter(t => t.token !== tempToken);
        const { password: _ } = user, result = __rest(user, ["password"]);
        return {
            user: result,
            accessToken: 'dummy-jwt-token'
        };
    }
    async disableTwoFactor(userId, code) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const secretRecord = this.twoFactorSecrets.find(s => s.userId === userId);
        if (!secretRecord) {
            throw new common_1.BadRequestException('Two-factor authentication not set up');
        }
        if (!secretRecord.isEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is not enabled');
        }
        if (code !== secretRecord.secret) {
            throw new common_1.UnauthorizedException('Invalid verification code');
        }
        this.twoFactorSecrets = this.twoFactorSecrets.filter(s => s.userId !== userId);
        return { message: 'Two-factor authentication disabled successfully' };
    }
    generateEmailVerificationCode(userId) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const existingCode = this.emailVerificationCodes.find(c => c.userId === userId);
        if (existingCode) {
            existingCode.code = code;
            existingCode.expiresAt = expiresAt;
        }
        else {
            this.emailVerificationCodes.push({
                userId,
                code,
                expiresAt
            });
        }
        return code;
    }
    async requestEmailVerification(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        const code = this.generateEmailVerificationCode(userId);
        return {
            message: 'Email verification code sent',
            code
        };
    }
    async verifyEmail(userId, code) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        const codeRecord = this.emailVerificationCodes.find(c => c.userId === userId);
        if (!codeRecord) {
            throw new common_1.BadRequestException('No verification code found. Please request a new one.');
        }
        if (new Date() > codeRecord.expiresAt) {
            this.emailVerificationCodes = this.emailVerificationCodes.filter(c => c.userId !== userId);
            throw new common_1.BadRequestException('Verification code has expired. Please request a new one.');
        }
        if (code !== codeRecord.code) {
            throw new common_1.UnauthorizedException('Invalid verification code');
        }
        user.isVerified = true;
        this.emailVerificationCodes = this.emailVerificationCodes.filter(c => c.userId !== userId);
        return { message: 'Email verified successfully' };
    }
    async addPhoneNumber(userId, phoneNumber) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            throw new common_1.BadRequestException('Invalid phone number format');
        }
        const existingUserWithPhone = this.users.find(u => u.phoneNumber === phoneNumber && u.id !== userId);
        if (existingUserWithPhone) {
            throw new common_1.ConflictException('Phone number is already in use');
        }
        user.phoneNumber = phoneNumber;
        user.isPhoneVerified = false;
        const code = this.generatePhoneVerificationCode(userId);
        return {
            message: 'Phone number added. Verification code sent.',
            code
        };
    }
    generatePhoneVerificationCode(userId) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        const existingCode = this.phoneVerificationCodes.find(c => c.userId === userId);
        if (existingCode) {
            existingCode.code = code;
            existingCode.expiresAt = expiresAt;
        }
        else {
            this.phoneVerificationCodes.push({
                userId,
                code,
                expiresAt
            });
        }
        return code;
    }
    async requestPhoneVerification(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.phoneNumber) {
            throw new common_1.BadRequestException('No phone number associated with this account');
        }
        if (user.isPhoneVerified) {
            throw new common_1.BadRequestException('Phone number is already verified');
        }
        const code = this.generatePhoneVerificationCode(userId);
        return {
            message: 'Phone verification code sent',
            code
        };
    }
    async verifyPhone(userId, code) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.phoneNumber) {
            throw new common_1.BadRequestException('No phone number associated with this account');
        }
        if (user.isPhoneVerified) {
            throw new common_1.BadRequestException('Phone number is already verified');
        }
        const codeRecord = this.phoneVerificationCodes.find(c => c.userId === userId);
        if (!codeRecord) {
            throw new common_1.BadRequestException('No verification code found. Please request a new one.');
        }
        if (new Date() > codeRecord.expiresAt) {
            this.phoneVerificationCodes = this.phoneVerificationCodes.filter(c => c.userId !== userId);
            throw new common_1.BadRequestException('Verification code has expired. Please request a new one.');
        }
        if (code !== codeRecord.code) {
            throw new common_1.UnauthorizedException('Invalid verification code');
        }
        user.isPhoneVerified = true;
        this.phoneVerificationCodes = this.phoneVerificationCodes.filter(c => c.userId !== userId);
        return { message: 'Phone number verified successfully' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            throw new common_1.BadRequestException('Current and new passwords are required');
        }
        if (newPassword.length < 8) {
            throw new common_1.BadRequestException('New password must be at least 8 characters long');
        }
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        return { message: 'Password changed successfully' };
    }
    async setSecurityQuestions(userId, questions) {
        if (!questions || !Array.isArray(questions)) {
            throw new common_1.BadRequestException('Security questions are required');
        }
        const MIN_REQUIRED_QUESTIONS = 2;
        if (questions.length < MIN_REQUIRED_QUESTIONS) {
            throw new common_1.BadRequestException(`At least ${MIN_REQUIRED_QUESTIONS} security questions are required`);
        }
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const securityQuestionsWithHashedAnswers = await Promise.all(questions.map(async (q) => {
            const salt = await bcrypt.genSalt();
            const hashedAnswer = await bcrypt.hash(q.answer, salt);
            return {
                question: q.question,
                answer: hashedAnswer
            };
        }));
        user.securityQuestions = securityQuestionsWithHashedAnswers;
        return { message: 'Security questions set successfully' };
    }
    async getLoginHistory(userId, limit) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let history = this.loginHistory.filter(h => h.userId === userId);
        history = history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (limit && typeof limit === 'number' && limit > 0) {
            history = history.slice(0, limit);
        }
        return history;
    }
    async getActiveSessions(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const sessions = this.activeSessions.filter(s => s.userId === userId);
        return sessions.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
    }
    async terminateSession(userId, sessionId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const sessionIndex = this.activeSessions.findIndex(s => s.userId === userId && s.id === sessionId);
        if (sessionIndex === -1) {
            throw new common_1.NotFoundException('Session not found');
        }
        this.activeSessions.splice(sessionIndex, 1);
        return { message: 'Session terminated successfully' };
    }
    async terminateAllSessions(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        this.activeSessions = this.activeSessions.filter(s => s.userId !== userId);
        return { message: 'All sessions terminated successfully' };
    }
    async updateThemeMode(userId, mode) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.settings.theme.mode = mode;
        return { message: 'Theme mode updated successfully' };
    }
    async updateThemeColor(userId, color) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.settings.theme.color = color;
        return { message: 'Theme color updated successfully' };
    }
    async updateLanguage(userId, language) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!this.validLanguageCodes.includes(language)) {
            throw new common_1.BadRequestException('Invalid language code');
        }
        user.settings.language = language;
        return { message: 'Language updated successfully' };
    }
    async updateTimezone(userId, timezone) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!this.validTimezones.includes(timezone)) {
            throw new common_1.BadRequestException('Invalid timezone');
        }
        user.settings.timezone = timezone;
        return { message: 'Timezone updated successfully' };
    }
    async getFormattedDateTime(userId, dateTimeString) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        let formattedDate;
        let formattedTime;
        switch (user.settings.language) {
            case 'fr':
                formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                break;
            case 'de':
                formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                break;
            default:
                formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                const hours12 = date.getHours() % 12 || 12;
                formattedTime = `${hours12}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
        }
        return {
            formattedDate,
            formattedTime,
            language: user.settings.language,
            timezone: user.settings.timezone
        };
    }
    async updateEmailNotificationPreferences(userId, preferences) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.settings.notifications.email = Object.assign(Object.assign({}, user.settings.notifications.email), preferences);
        return { message: 'Email notification preferences updated successfully' };
    }
    async updatePushNotificationPreferences(userId, preferences) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.settings.notifications.push = Object.assign(Object.assign({}, user.settings.notifications.push), preferences);
        return { message: 'Push notification preferences updated successfully' };
    }
    async updateSmsNotificationPreferences(userId, preferences) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.settings.notifications.sms = Object.assign(Object.assign({}, user.settings.notifications.sms), preferences);
        return { message: 'SMS notification preferences updated successfully' };
    }
    async updateNotificationFrequency(userId, frequencies) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.settings.notifications.frequency) {
            user.settings.notifications.frequency = {
                email: user_settings_dto_1.NotificationFrequency.DAILY,
                push: user_settings_dto_1.NotificationFrequency.IMMEDIATELY,
                sms: user_settings_dto_1.NotificationFrequency.WEEKLY
            };
        }
        Object.keys(frequencies).forEach(channel => {
            if (channel in user.settings.notifications.frequency &&
                Object.values(user_settings_dto_1.NotificationFrequency).includes(frequencies[channel])) {
                user.settings.notifications.frequency[channel] = frequencies[channel];
            }
        });
        return {
            message: 'Notification frequency updated successfully',
            frequencies: user.settings.notifications.frequency
        };
    }
    async sendTestNotification(userId, channel) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const validChannels = ['email', 'push', 'sms'];
        if (!validChannels.includes(channel)) {
            throw new common_1.BadRequestException('Invalid notification channel');
        }
        const channelPreferences = user.settings.notifications[channel];
        if (!channelPreferences || !Object.values(channelPreferences).some(enabled => enabled === true)) {
            throw new common_1.BadRequestException(`${channel} notifications are not enabled`);
        }
        const notificationId = (0, uuid_1.v4)();
        const notification = {
            id: notificationId,
            userId,
            channel,
            title: 'Test Notification',
            content: `This is a test ${channel} notification.`,
            sentAt: new Date(),
            status: 'delivered'
        };
        this.notifications.push(notification);
        return {
            message: `Test ${channel} notification sent successfully`,
            notification
        };
    }
    async updateDashboardLayout(userId, layout) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.settings.dashboard) {
            user.settings.dashboard = {
                layout: user_settings_dto_1.DashboardLayout.GRID,
                widgets: []
            };
        }
        user.settings.dashboard.layout = layout;
        return {
            message: 'Dashboard layout updated successfully',
            layout
        };
    }
    async updateDashboardWidgets(userId, widgets) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!Array.isArray(widgets)) {
            throw new common_1.BadRequestException('Widgets must be an array');
        }
        for (const widget of widgets) {
            if (!widget.id || !widget.type || !widget.title || !widget.position) {
                throw new common_1.BadRequestException('Invalid widget format');
            }
            if (!Object.values(user_settings_dto_1.WidgetType).includes(widget.type)) {
                throw new common_1.BadRequestException(`Invalid widget type: ${widget.type}`);
            }
            const { x, y, width, height } = widget.position;
            if (typeof x !== 'number' || typeof y !== 'number' ||
                typeof width !== 'number' || typeof height !== 'number' ||
                x < 0 || y < 0 || width < 1 || height < 1) {
                throw new common_1.BadRequestException('Invalid widget position');
            }
        }
        if (!user.settings.dashboard) {
            user.settings.dashboard = {
                layout: user_settings_dto_1.DashboardLayout.GRID,
                widgets: []
            };
        }
        user.settings.dashboard.widgets = widgets;
        return {
            message: 'Dashboard widgets updated successfully',
            widgets
        };
    }
    async addDashboardWidget(userId, widget) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!widget.type || !widget.title || !widget.position) {
            throw new common_1.BadRequestException('Invalid widget format');
        }
        if (!Object.values(user_settings_dto_1.WidgetType).includes(widget.type)) {
            throw new common_1.BadRequestException(`Invalid widget type: ${widget.type}`);
        }
        const { x, y, width, height } = widget.position;
        if (typeof x !== 'number' || typeof y !== 'number' ||
            typeof width !== 'number' || typeof height !== 'number' ||
            x < 0 || y < 0 || width < 1 || height < 1) {
            throw new common_1.BadRequestException('Invalid widget position');
        }
        if (!user.settings.dashboard) {
            user.settings.dashboard = {
                layout: user_settings_dto_1.DashboardLayout.GRID,
                widgets: []
            };
        }
        const newWidget = {
            id: (0, uuid_1.v4)(),
            type: widget.type,
            title: widget.title,
            position: widget.position,
            config: widget.config || {}
        };
        user.settings.dashboard.widgets.push(newWidget);
        return {
            message: 'Widget added to dashboard successfully',
            widget: newWidget
        };
    }
    async removeDashboardWidget(userId, widgetId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.settings.dashboard || !user.settings.dashboard.widgets) {
            throw new common_1.BadRequestException('No dashboard widgets found');
        }
        const widgetIndex = user.settings.dashboard.widgets.findIndex(w => w.id === widgetId);
        if (widgetIndex === -1) {
            throw new common_1.NotFoundException('Widget not found');
        }
        user.settings.dashboard.widgets.splice(widgetIndex, 1);
        return {
            message: 'Widget removed from dashboard successfully',
            widgetId
        };
    }
    async saveDashboardConfiguration(userId, configuration) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!configuration) {
            throw new common_1.BadRequestException('Invalid dashboard configuration');
        }
        if (!user.settings.dashboard) {
            user.settings.dashboard = {
                layout: user_settings_dto_1.DashboardLayout.GRID,
                widgets: []
            };
        }
        if (configuration.layout && Object.values(user_settings_dto_1.DashboardLayout).includes(configuration.layout)) {
            user.settings.dashboard.layout = configuration.layout;
        }
        if (Array.isArray(configuration.widgets)) {
            for (const widget of configuration.widgets) {
                if (!widget.id || !widget.type || !widget.title || !widget.position) {
                    throw new common_1.BadRequestException('Invalid widget format');
                }
                if (!Object.values(user_settings_dto_1.WidgetType).includes(widget.type)) {
                    throw new common_1.BadRequestException(`Invalid widget type: ${widget.type}`);
                }
                const { x, y, width, height } = widget.position;
                if (typeof x !== 'number' || typeof y !== 'number' ||
                    typeof width !== 'number' || typeof height !== 'number' ||
                    x < 0 || y < 0 || width < 1 || height < 1) {
                    throw new common_1.BadRequestException('Invalid widget position');
                }
            }
            user.settings.dashboard.widgets = configuration.widgets;
        }
        return {
            message: 'Dashboard configuration saved successfully',
            dashboard: user.settings.dashboard
        };
    }
    async updatePrivacySettings(userId, privacySettings) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.settings.security) {
            user.settings.security = {
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
            };
        }
        if (privacySettings.dataSharingLevel === security_settings_dto_1.DataSharingLevel.CUSTOM) {
            const hasEnabledSetting = privacySettings.showProfileToPublic ||
                privacySettings.showActivityHistory ||
                privacySettings.allowThirdPartyDataSharing ||
                privacySettings.allowAnalyticsCookies;
            if (!hasEnabledSetting) {
                throw new common_1.BadRequestException('Custom data sharing level requires at least one enabled privacy setting');
            }
        }
        if (privacySettings.dataSharingLevel !== security_settings_dto_1.DataSharingLevel.CUSTOM) {
            switch (privacySettings.dataSharingLevel) {
                case security_settings_dto_1.DataSharingLevel.MINIMAL:
                    privacySettings.showProfileToPublic = false;
                    privacySettings.showActivityHistory = false;
                    privacySettings.allowThirdPartyDataSharing = false;
                    privacySettings.allowAnalyticsCookies = false;
                    break;
                case security_settings_dto_1.DataSharingLevel.BASIC:
                    privacySettings.showProfileToPublic = true;
                    privacySettings.showActivityHistory = false;
                    privacySettings.allowThirdPartyDataSharing = false;
                    privacySettings.allowAnalyticsCookies = true;
                    break;
                case security_settings_dto_1.DataSharingLevel.FULL:
                    privacySettings.showProfileToPublic = true;
                    privacySettings.showActivityHistory = true;
                    privacySettings.allowThirdPartyDataSharing = true;
                    privacySettings.allowAnalyticsCookies = true;
                    break;
            }
        }
        user.settings.security.privacy = Object.assign(Object.assign({}, user.settings.security.privacy), privacySettings);
        return {
            message: 'Privacy settings updated successfully',
            privacy: user.settings.security.privacy
        };
    }
    async createApiKey(userId, apiKeyData) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!apiKeyData.name || !apiKeyData.permissions || !Array.isArray(apiKeyData.permissions)) {
            throw new common_1.BadRequestException('Invalid API key data');
        }
        for (const permission of apiKeyData.permissions) {
            if (!Object.values(security_settings_dto_1.ApiKeyPermission).includes(permission)) {
                throw new common_1.BadRequestException(`Invalid permission: ${permission}`);
            }
        }
        const keyPrefix = 'apk_';
        const randomPart = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const key = `${keyPrefix}${randomPart}`;
        const newApiKey = {
            id: (0, uuid_1.v4)(),
            userId,
            name: apiKeyData.name,
            key,
            permissions: apiKeyData.permissions,
            description: apiKeyData.description || '',
            createdAt: new Date().toISOString(),
            lastUsedAt: null,
            isActive: true
        };
        this.apiKeys.push(newApiKey);
        return {
            message: 'API key created successfully',
            apiKey: newApiKey
        };
    }
    async getApiKeys(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userApiKeys = this.apiKeys
            .filter(key => key.userId === userId && key.isActive)
            .map(key => {
            const maskedKey = `${key.key.substring(0, 6)}...${key.key.substring(key.key.length - 4)}`;
            return {
                id: key.id,
                name: key.name,
                permissions: key.permissions,
                description: key.description,
                key: maskedKey,
                createdAt: key.createdAt,
                lastUsedAt: key.lastUsedAt
            };
        });
        return userApiKeys;
    }
    async revokeApiKey(userId, keyId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const apiKeyIndex = this.apiKeys.findIndex(key => key.id === keyId && key.userId === userId);
        if (apiKeyIndex === -1) {
            throw new common_1.NotFoundException('API key not found');
        }
        this.apiKeys[apiKeyIndex].isActive = false;
        return { message: 'API key revoked successfully' };
    }
    async updateApiKey(userId, keyId, updateData) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const apiKeyIndex = this.apiKeys.findIndex(key => key.id === keyId && key.userId === userId && key.isActive);
        if (apiKeyIndex === -1) {
            throw new common_1.NotFoundException('API key not found or already revoked');
        }
        if (updateData.name !== undefined) {
            this.apiKeys[apiKeyIndex].name = updateData.name;
        }
        if (updateData.description !== undefined) {
            this.apiKeys[apiKeyIndex].description = updateData.description;
        }
        if (updateData.permissions !== undefined && Array.isArray(updateData.permissions)) {
            for (const permission of updateData.permissions) {
                if (!Object.values(security_settings_dto_1.ApiKeyPermission).includes(permission)) {
                    throw new common_1.BadRequestException(`Invalid permission: ${permission}`);
                }
            }
            this.apiKeys[apiKeyIndex].permissions = updateData.permissions;
        }
        return {
            message: 'API key updated successfully',
            apiKey: {
                id: this.apiKeys[apiKeyIndex].id,
                name: this.apiKeys[apiKeyIndex].name,
                permissions: this.apiKeys[apiKeyIndex].permissions,
                description: this.apiKeys[apiKeyIndex].description,
                createdAt: this.apiKeys[apiKeyIndex].createdAt,
                lastUsedAt: this.apiKeys[apiKeyIndex].lastUsedAt
            }
        };
    }
    async configureSessionTimeout(userId, timeoutSettings) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (timeoutSettings.timeoutMinutes !== undefined) {
            if (typeof timeoutSettings.timeoutMinutes !== 'number' ||
                timeoutSettings.timeoutMinutes < 5 ||
                timeoutSettings.timeoutMinutes > 1440) {
                throw new common_1.BadRequestException('Session timeout must be between 5 and 1440 minutes');
            }
        }
        if (!user.settings.security) {
            user.settings.security = {
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
            };
        }
        user.settings.security.sessionTimeout = Object.assign(Object.assign({}, user.settings.security.sessionTimeout), timeoutSettings);
        const userSessions = this.activeSessions.filter(session => session.userId === userId);
        for (const session of userSessions) {
            session.timeoutMinutes = user.settings.security.sessionTimeout.timeoutMinutes;
            session.extendOnActivity = user.settings.security.sessionTimeout.extendOnActivity;
        }
        return {
            message: 'Session timeout configured successfully',
            sessionTimeout: user.settings.security.sessionTimeout
        };
    }
    async validateApiKey(key, requiredPermissions = []) {
        const apiKey = this.apiKeys.find(k => k.key === key && k.isActive);
        if (!apiKey) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const user = this.users.find(u => u.id === apiKey.userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        for (const permission of requiredPermissions) {
            if (!apiKey.permissions.includes(permission)) {
                throw new common_1.ForbiddenException(`Missing required permission: ${permission}`);
            }
        }
        apiKey.lastUsedAt = new Date().toISOString();
        return {
            userId: user.id,
            permissions: apiKey.permissions
        };
    }
    async getApiKeyInfo(key) {
        const apiKey = this.apiKeys.find(k => k.key === key && k.isActive);
        if (!apiKey) {
            throw new common_1.UnauthorizedException('Invalid or inactive API key');
        }
        let tier = 'standard';
        if (apiKey.permissions.includes(security_settings_dto_1.ApiKeyPermission.ADMIN)) {
            tier = 'premium';
        }
        return {
            id: apiKey.id,
            userId: apiKey.userId,
            permissions: apiKey.permissions,
            tier,
            createdAt: apiKey.createdAt,
            lastUsedAt: apiKey.lastUsedAt
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map