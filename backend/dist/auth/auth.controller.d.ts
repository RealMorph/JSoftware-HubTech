import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto, RequestPasswordResetDto, ResetPasswordDto, VerifyTwoFactorDto, TwoFactorCodeVerificationDto, DisableTwoFactorDto, VerificationCodeDto, PhoneNumberDto, ChangePasswordDto, SecurityQuestionsDto, LoginHistoryQueryDto, ThemeModeDto, ThemeColorDto, LanguageDto, TimezoneDto, DateTimeFormatRequestDto, EmailNotificationPreferencesDto, PushNotificationPreferencesDto, SmsNotificationPreferencesDto, ThemeMode, ThemeColor, NotificationFrequencyDto, DashboardLayoutDto, DashboardWidgetsDto, WidgetDto } from './dto';
import { PrivacySettingsDto, ApiKeyDto, SessionTimeoutDto } from './dto/security-settings.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: Date;
        isVerified: boolean;
        isActive: boolean;
        phoneNumber: any;
        isPhoneVerified: boolean;
        settings: {
            theme: {
                mode: ThemeMode;
                color: ThemeColor;
            };
            language: string;
            timezone: string;
            notifications: {
                email: {
                    marketing: boolean;
                    securityAlerts: boolean;
                    accountUpdates: boolean;
                    newFeatures: boolean;
                };
                push: {
                    marketing: boolean;
                    securityAlerts: boolean;
                    accountUpdates: boolean;
                    newFeatures: boolean;
                };
                sms: {
                    marketing: boolean;
                    securityAlerts: boolean;
                    accountUpdates: boolean;
                    newFeatures: boolean;
                };
                frequency: {
                    email: import("./dto").NotificationFrequency;
                    push: import("./dto").NotificationFrequency;
                    sms: import("./dto").NotificationFrequency;
                };
            };
            dashboard: {
                layout: import("./dto").DashboardLayout;
                widgets: {
                    id: string;
                    type: import("./dto").WidgetType;
                    title: string;
                    position: {
                        x: number;
                        y: number;
                        width: number;
                        height: number;
                    };
                    config: {};
                }[];
            };
            security: {
                privacy: {
                    dataSharingLevel: import("./dto").DataSharingLevel;
                    showProfileToPublic: boolean;
                    showActivityHistory: boolean;
                    allowThirdPartyDataSharing: boolean;
                    allowAnalyticsCookies: boolean;
                };
                sessionTimeout: {
                    timeoutMinutes: number;
                    extendOnActivity: boolean;
                };
            };
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        requiresTwoFactor: boolean;
        tempToken: string;
        previousFailedAttempts: number;
        user?: undefined;
        sessionId?: undefined;
        accessToken?: undefined;
    } | {
        user: any;
        sessionId: string;
        accessToken: string;
        previousFailedAttempts: number;
        requiresTwoFactor?: undefined;
        tempToken?: undefined;
    }>;
    requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto): Promise<{
        message: string;
        token?: undefined;
    } | {
        message: string;
        token: string;
    }>;
    resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    enableTwoFactor(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    verifyTwoFactor(userId: string, verifyTwoFactorDto: VerifyTwoFactorDto): Promise<{
        message: string;
    }>;
    verifyTwoFactorCode(body: TwoFactorCodeVerificationDto): Promise<{
        user: any;
        accessToken: string;
    }>;
    disableTwoFactor(userId: string, disableTwoFactorDto: DisableTwoFactorDto): Promise<{
        message: string;
    }>;
    requestEmailVerification(userId: string): Promise<{
        message: string;
        code: string;
    }>;
    verifyEmail(userId: string, verificationCodeDto: VerificationCodeDto): Promise<{
        message: string;
    }>;
    addPhoneNumber(userId: string, phoneNumberDto: PhoneNumberDto): Promise<{
        message: string;
        code: string;
    }>;
    requestPhoneVerification(userId: string): Promise<{
        message: string;
        code: string;
    }>;
    verifyPhone(userId: string, verificationCodeDto: VerificationCodeDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    setSecurityQuestions(userId: string, securityQuestionsDto: SecurityQuestionsDto): Promise<{
        message: string;
    }>;
    getLoginHistory(userId: string, query: LoginHistoryQueryDto): Promise<any[]>;
    getActiveSessions(userId: string): Promise<any[]>;
    terminateSession(userId: string, sessionId: string): Promise<{
        message: string;
    }>;
    terminateAllSessions(userId: string): Promise<{
        message: string;
    }>;
    updateThemeMode(userId: string, themeModeDto: ThemeModeDto): Promise<{
        message: string;
    }>;
    updateThemeColor(userId: string, themeColorDto: ThemeColorDto): Promise<{
        message: string;
    }>;
    updateLanguage(userId: string, languageDto: LanguageDto): Promise<{
        message: string;
    }>;
    updateTimezone(userId: string, timezoneDto: TimezoneDto): Promise<{
        message: string;
    }>;
    getFormattedDateTime(userId: string, dateTimeFormatDto: DateTimeFormatRequestDto): Promise<{
        formattedDate: any;
        formattedTime: any;
        language: any;
        timezone: any;
    }>;
    updateEmailNotificationPreferences(userId: string, emailPrefsDto: EmailNotificationPreferencesDto): Promise<{
        message: string;
    }>;
    updatePushNotificationPreferences(userId: string, pushPrefsDto: PushNotificationPreferencesDto): Promise<{
        message: string;
    }>;
    updateSmsNotificationPreferences(userId: string, smsPrefsDto: SmsNotificationPreferencesDto): Promise<{
        message: string;
    }>;
    updateNotificationFrequency(userId: string, frequencyDto: NotificationFrequencyDto): Promise<{
        message: string;
        frequencies: any;
    }>;
    sendTestNotification(userId: string, body: {
        channel: string;
    }): Promise<{
        message: string;
        notification: {
            id: string;
            userId: string;
            channel: string;
            title: string;
            content: string;
            sentAt: Date;
            status: string;
        };
    }>;
    updateDashboardLayout(userId: string, layoutDto: DashboardLayoutDto): Promise<{
        message: string;
        layout: import("./dto").DashboardLayout;
    }>;
    updateDashboardWidgets(userId: string, widgetsDto: DashboardWidgetsDto): Promise<{
        message: string;
        widgets: any[];
    }>;
    addDashboardWidget(userId: string, widgetDto: WidgetDto): Promise<{
        message: string;
        widget: {
            id: string;
            type: any;
            title: any;
            position: any;
            config: any;
        };
    }>;
    removeDashboardWidget(userId: string, widgetId: string): Promise<{
        message: string;
        widgetId: string;
    }>;
    saveDashboardConfiguration(userId: string, configuration: any): Promise<{
        message: string;
        dashboard: any;
    }>;
    updatePrivacySettings(userId: string, privacySettingsDto: PrivacySettingsDto): Promise<{
        message: string;
        privacy: any;
    }>;
    createApiKey(userId: string, apiKeyDto: ApiKeyDto): Promise<{
        message: string;
        apiKey: {
            id: string;
            userId: string;
            name: any;
            key: string;
            permissions: any;
            description: any;
            createdAt: string;
            lastUsedAt: any;
            isActive: boolean;
        };
    }>;
    getApiKeys(userId: string): Promise<{
        id: any;
        name: any;
        permissions: any;
        description: any;
        key: string;
        createdAt: any;
        lastUsedAt: any;
    }[]>;
    revokeApiKey(userId: string, keyId: string): Promise<{
        message: string;
    }>;
    updateApiKey(userId: string, keyId: string, updateData: Partial<ApiKeyDto>): Promise<{
        message: string;
        apiKey: {
            id: any;
            name: any;
            permissions: any;
            description: any;
            createdAt: any;
            lastUsedAt: any;
        };
    }>;
    configureSessionTimeout(userId: string, timeoutSettingsDto: SessionTimeoutDto): Promise<{
        message: string;
        sessionTimeout: any;
    }>;
    validateApiKey(body: {
        key: string;
        requiredPermissions?: string[];
    }): Promise<{
        userId: any;
        permissions: any;
    }>;
}
