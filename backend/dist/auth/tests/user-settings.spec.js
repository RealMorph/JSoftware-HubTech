"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("../auth.service");
const common_1 = require("@nestjs/common");
const dto_1 = require("../dto");
describe('AuthService - User Settings', () => {
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
    describe('Theme Settings', () => {
        it('should update theme mode', async () => {
            const userData = {
                firstName: 'Alex',
                lastName: 'Johnson',
                email: 'alex.johnson@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            let result = await service.updateThemeMode(user.id, dto_1.ThemeMode.DARK);
            expect(result).toBeDefined();
            expect(result.message).toBe('Theme mode updated successfully');
            let privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.theme.mode).toBe(dto_1.ThemeMode.DARK);
            result = await service.updateThemeMode(user.id, dto_1.ThemeMode.LIGHT);
            expect(result.message).toBe('Theme mode updated successfully');
            privateUser = getPrivateUser(user.id);
            expect(privateUser.settings.theme.mode).toBe(dto_1.ThemeMode.LIGHT);
        });
        it('should update theme colors', async () => {
            const userData = {
                firstName: 'Emma',
                lastName: 'Wilson',
                email: 'emma.wilson@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const result = await service.updateThemeColor(user.id, dto_1.ThemeColor.BLUE);
            expect(result).toBeDefined();
            expect(result.message).toBe('Theme color updated successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.theme.color).toBe(dto_1.ThemeColor.BLUE);
        });
        it('should have theme settings persist across logins', async () => {
            const userData = {
                firstName: 'Noah',
                lastName: 'Brown',
                email: 'noah.brown@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.updateThemeMode(user.id, dto_1.ThemeMode.DARK);
            await service.updateThemeColor(user.id, dto_1.ThemeColor.PURPLE);
            const loginResult = await service.login(userData.email, userData.password);
            expect(loginResult.user.settings).toBeDefined();
            expect(loginResult.user.settings.theme.mode).toBe(dto_1.ThemeMode.DARK);
            expect(loginResult.user.settings.theme.color).toBe(dto_1.ThemeColor.PURPLE);
        });
        it('should throw error when updating theme mode for non-existent user', async () => {
            await expect(service.updateThemeMode('non-existent-id', dto_1.ThemeMode.LIGHT)).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw error when updating theme color for non-existent user', async () => {
            await expect(service.updateThemeColor('non-existent-id', dto_1.ThemeColor.GREEN)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Language & Timezone Settings', () => {
        it('should update language preference', async () => {
            const userData = {
                firstName: 'Sophie',
                lastName: 'Martin',
                email: 'sophie.martin@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const result = await service.updateLanguage(user.id, 'es');
            expect(result).toBeDefined();
            expect(result.message).toBe('Language updated successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.language).toBe('es');
        });
        it('should update timezone', async () => {
            const userData = {
                firstName: 'William',
                lastName: 'Taylor',
                email: 'william.taylor@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const result = await service.updateTimezone(user.id, 'Europe/Paris');
            expect(result).toBeDefined();
            expect(result.message).toBe('Timezone updated successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.timezone).toBe('Europe/Paris');
        });
        it('should verify date/time formatting based on user settings', async () => {
            const userData = {
                firstName: 'Olivia',
                lastName: 'Anderson',
                email: 'olivia.anderson@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await service.updateLanguage(user.id, 'fr');
            await service.updateTimezone(user.id, 'Europe/Paris');
            const dateString = '2023-05-15T12:30:00.000Z';
            const formatted = await service.getFormattedDateTime(user.id, dateString);
            expect(formatted).toBeDefined();
            expect(formatted.formattedDate).toBeDefined();
            expect(formatted.formattedTime).toBeDefined();
            expect(formatted.formattedDate).toMatch(/\d{2}\/\d{2}\/\d{4}/);
            expect(formatted.timezone).toBe('Europe/Paris');
        });
        it('should throw error when updating language with invalid code', async () => {
            const userData = {
                firstName: 'Lucas',
                lastName: 'Miller',
                email: 'lucas.miller@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await expect(service.updateLanguage(user.id, 'invalid-code')).rejects.toThrow(common_1.BadRequestException);
        });
        it('should throw error when updating timezone with invalid zone', async () => {
            const userData = {
                firstName: 'Amelia',
                lastName: 'Davis',
                email: 'amelia.davis@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            await expect(service.updateTimezone(user.id, 'Invalid/Zone')).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Notification Preferences', () => {
        it('should update email notification preferences', async () => {
            const userData = {
                firstName: 'Ethan',
                lastName: 'White',
                email: 'ethan.white@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const emailPreferences = {
                marketing: false,
                securityAlerts: true,
                accountUpdates: true,
                newFeatures: false
            };
            const result = await service.updateEmailNotificationPreferences(user.id, emailPreferences);
            expect(result).toBeDefined();
            expect(result.message).toBe('Email notification preferences updated successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.notifications.email).toEqual(emailPreferences);
        });
        it('should update push notification preferences', async () => {
            const userData = {
                firstName: 'Ava',
                lastName: 'Smith',
                email: 'ava.smith@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const pushPreferences = {
                marketing: false,
                securityAlerts: true,
                accountUpdates: false,
                newFeatures: true
            };
            const result = await service.updatePushNotificationPreferences(user.id, pushPreferences);
            expect(result).toBeDefined();
            expect(result.message).toBe('Push notification preferences updated successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.notifications.push).toEqual(pushPreferences);
        });
        it('should update SMS notification preferences', async () => {
            const userData = {
                firstName: 'Liam',
                lastName: 'Johnson',
                email: 'liam.johnson@example.com',
                password: 'Password123!'
            };
            const user = await registerUser(userData);
            const smsPreferences = {
                marketing: false,
                securityAlerts: true,
                accountUpdates: true,
                newFeatures: false
            };
            const result = await service.updateSmsNotificationPreferences(user.id, smsPreferences);
            expect(result).toBeDefined();
            expect(result.message).toBe('SMS notification preferences updated successfully');
            const privateUser = getPrivateUser(user.id);
            expect(privateUser.settings).toBeDefined();
            expect(privateUser.settings.notifications.sms).toEqual(smsPreferences);
        });
        it('should throw error when updating notification preferences for non-existent user', async () => {
            const preferences = {
                marketing: true,
                securityAlerts: true,
                accountUpdates: true,
                newFeatures: true
            };
            await expect(service.updateEmailNotificationPreferences('non-existent-id', preferences)).rejects.toThrow(common_1.NotFoundException);
        });
    });
});
//# sourceMappingURL=user-settings.spec.js.map