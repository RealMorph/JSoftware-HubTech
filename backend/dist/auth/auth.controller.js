"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const dto_1 = require("./dto");
const security_settings_dto_1 = require("./dto/security-settings.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(createUserDto) {
        return this.authService.register(createUserDto);
    }
    login(loginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
    requestPasswordReset(requestPasswordResetDto) {
        return this.authService.requestPasswordReset(requestPasswordResetDto.email);
    }
    resetPassword(token, resetPasswordDto) {
        return this.authService.resetPassword(token, resetPasswordDto.newPassword);
    }
    enableTwoFactor(userId) {
        return this.authService.enableTwoFactor(userId);
    }
    verifyTwoFactor(userId, verifyTwoFactorDto) {
        return this.authService.verifyAndEnableTwoFactor(userId, verifyTwoFactorDto.code);
    }
    verifyTwoFactorCode(body) {
        return this.authService.verifyTwoFactorCode(body.tempToken, body.code);
    }
    disableTwoFactor(userId, disableTwoFactorDto) {
        return this.authService.disableTwoFactor(userId, disableTwoFactorDto.code);
    }
    requestEmailVerification(userId) {
        return this.authService.requestEmailVerification(userId);
    }
    verifyEmail(userId, verificationCodeDto) {
        return this.authService.verifyEmail(userId, verificationCodeDto.code);
    }
    addPhoneNumber(userId, phoneNumberDto) {
        return this.authService.addPhoneNumber(userId, phoneNumberDto.phoneNumber);
    }
    requestPhoneVerification(userId) {
        return this.authService.requestPhoneVerification(userId);
    }
    verifyPhone(userId, verificationCodeDto) {
        return this.authService.verifyPhone(userId, verificationCodeDto.code);
    }
    changePassword(userId, changePasswordDto) {
        return this.authService.changePassword(userId, changePasswordDto.currentPassword, changePasswordDto.newPassword);
    }
    setSecurityQuestions(userId, securityQuestionsDto) {
        return this.authService.setSecurityQuestions(userId, securityQuestionsDto.questions);
    }
    getLoginHistory(userId, query) {
        return this.authService.getLoginHistory(userId, query.limit);
    }
    getActiveSessions(userId) {
        return this.authService.getActiveSessions(userId);
    }
    terminateSession(userId, sessionId) {
        return this.authService.terminateSession(userId, sessionId);
    }
    terminateAllSessions(userId) {
        return this.authService.terminateAllSessions(userId);
    }
    updateThemeMode(userId, themeModeDto) {
        return this.authService.updateThemeMode(userId, themeModeDto.mode);
    }
    updateThemeColor(userId, themeColorDto) {
        return this.authService.updateThemeColor(userId, themeColorDto.color);
    }
    updateLanguage(userId, languageDto) {
        return this.authService.updateLanguage(userId, languageDto.language);
    }
    updateTimezone(userId, timezoneDto) {
        return this.authService.updateTimezone(userId, timezoneDto.timezone);
    }
    getFormattedDateTime(userId, dateTimeFormatDto) {
        return this.authService.getFormattedDateTime(userId, dateTimeFormatDto.dateTime);
    }
    updateEmailNotificationPreferences(userId, emailPrefsDto) {
        return this.authService.updateEmailNotificationPreferences(userId, emailPrefsDto.preferences);
    }
    updatePushNotificationPreferences(userId, pushPrefsDto) {
        return this.authService.updatePushNotificationPreferences(userId, pushPrefsDto.preferences);
    }
    updateSmsNotificationPreferences(userId, smsPrefsDto) {
        return this.authService.updateSmsNotificationPreferences(userId, smsPrefsDto.preferences);
    }
    async updateNotificationFrequency(userId, frequencyDto) {
        return this.authService.updateNotificationFrequency(userId, frequencyDto);
    }
    async sendTestNotification(userId, body) {
        if (!body || !body.channel) {
            throw new common_1.BadRequestException('Notification channel is required');
        }
        return this.authService.sendTestNotification(userId, body.channel);
    }
    async updateDashboardLayout(userId, layoutDto) {
        return this.authService.updateDashboardLayout(userId, layoutDto.type);
    }
    async updateDashboardWidgets(userId, widgetsDto) {
        return this.authService.updateDashboardWidgets(userId, widgetsDto.widgets);
    }
    async addDashboardWidget(userId, widgetDto) {
        return this.authService.addDashboardWidget(userId, widgetDto);
    }
    async removeDashboardWidget(userId, widgetId) {
        return this.authService.removeDashboardWidget(userId, widgetId);
    }
    async saveDashboardConfiguration(userId, configuration) {
        return this.authService.saveDashboardConfiguration(userId, configuration);
    }
    async updatePrivacySettings(userId, privacySettingsDto) {
        return this.authService.updatePrivacySettings(userId, privacySettingsDto);
    }
    async createApiKey(userId, apiKeyDto) {
        return this.authService.createApiKey(userId, apiKeyDto);
    }
    async getApiKeys(userId) {
        return this.authService.getApiKeys(userId);
    }
    async revokeApiKey(userId, keyId) {
        return this.authService.revokeApiKey(userId, keyId);
    }
    async updateApiKey(userId, keyId, updateData) {
        return this.authService.updateApiKey(userId, keyId, updateData);
    }
    async configureSessionTimeout(userId, timeoutSettingsDto) {
        return this.authService.configureSessionTimeout(userId, timeoutSettingsDto);
    }
    async validateApiKey(body) {
        var _a;
        const permissions = ((_a = body.requiredPermissions) === null || _a === void 0 ? void 0 : _a.map(p => p)) || [];
        return this.authService.validateApiKey(body.key, permissions);
    }
    refreshToken(refreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('password-reset-request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('password-reset/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('2fa/enable/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "enableTwoFactor", null);
__decorate([
    (0, common_1.Post)('2fa/verify/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.VerifyTwoFactorDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyTwoFactor", null);
__decorate([
    (0, common_1.Post)('2fa/authenticate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TwoFactorCodeVerificationDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyTwoFactorCode", null);
__decorate([
    (0, common_1.Post)('2fa/disable/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DisableTwoFactorDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "disableTwoFactor", null);
__decorate([
    (0, common_1.Post)('verify-email/request/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestEmailVerification", null);
__decorate([
    (0, common_1.Post)('verify-email/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.VerificationCodeDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('phone/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PhoneNumberDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "addPhoneNumber", null);
__decorate([
    (0, common_1.Post)('verify-phone/request/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "requestPhoneVerification", null);
__decorate([
    (0, common_1.Post)('verify-phone/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.VerificationCodeDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyPhone", null);
__decorate([
    (0, common_1.Post)('profile/change-password/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('profile/security-questions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SecurityQuestionsDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "setSecurityQuestions", null);
__decorate([
    (0, common_1.Get)('profile/login-history/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.LoginHistoryQueryDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getLoginHistory", null);
__decorate([
    (0, common_1.Get)('profile/sessions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getActiveSessions", null);
__decorate([
    (0, common_1.Delete)('profile/sessions/:userId/:sessionId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "terminateSession", null);
__decorate([
    (0, common_1.Delete)('profile/sessions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "terminateAllSessions", null);
__decorate([
    (0, common_1.Patch)('settings/theme/mode/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ThemeModeDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateThemeMode", null);
__decorate([
    (0, common_1.Patch)('settings/theme/color/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ThemeColorDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateThemeColor", null);
__decorate([
    (0, common_1.Patch)('settings/language/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.LanguageDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateLanguage", null);
__decorate([
    (0, common_1.Patch)('settings/timezone/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.TimezoneDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateTimezone", null);
__decorate([
    (0, common_1.Post)('settings/format-datetime/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DateTimeFormatRequestDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getFormattedDateTime", null);
__decorate([
    (0, common_1.Patch)('settings/notifications/email/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.EmailNotificationPreferencesDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateEmailNotificationPreferences", null);
__decorate([
    (0, common_1.Patch)('settings/notifications/push/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PushNotificationPreferencesDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updatePushNotificationPreferences", null);
__decorate([
    (0, common_1.Patch)('settings/notifications/sms/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SmsNotificationPreferencesDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateSmsNotificationPreferences", null);
__decorate([
    (0, common_1.Patch)('settings/notifications/frequency/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.NotificationFrequencyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateNotificationFrequency", null);
__decorate([
    (0, common_1.Post)('settings/notifications/test/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendTestNotification", null);
__decorate([
    (0, common_1.Patch)('settings/dashboard/layout/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DashboardLayoutDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateDashboardLayout", null);
__decorate([
    (0, common_1.Patch)('settings/dashboard/widgets/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.DashboardWidgetsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateDashboardWidgets", null);
__decorate([
    (0, common_1.Post)('settings/dashboard/widgets/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.WidgetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "addDashboardWidget", null);
__decorate([
    (0, common_1.Delete)('settings/dashboard/widgets/:userId/:widgetId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('widgetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "removeDashboardWidget", null);
__decorate([
    (0, common_1.Post)('settings/dashboard/save/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "saveDashboardConfiguration", null);
__decorate([
    (0, common_1.Patch)('security/privacy/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, security_settings_dto_1.PrivacySettingsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updatePrivacySettings", null);
__decorate([
    (0, common_1.Post)('security/api-keys/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, security_settings_dto_1.ApiKeyDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createApiKey", null);
__decorate([
    (0, common_1.Get)('security/api-keys/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getApiKeys", null);
__decorate([
    (0, common_1.Delete)('security/api-keys/:userId/:keyId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('keyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeApiKey", null);
__decorate([
    (0, common_1.Patch)('security/api-keys/:userId/:keyId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('keyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateApiKey", null);
__decorate([
    (0, common_1.Patch)('security/session-timeout/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, security_settings_dto_1.SessionTimeoutDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "configureSessionTimeout", null);
__decorate([
    (0, common_1.Post)('validate-api-key'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateApiKey", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map