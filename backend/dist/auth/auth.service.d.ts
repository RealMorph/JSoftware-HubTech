import { CreateUserDto } from '../users/dto/create-user.dto';
import { ThemeMode, ThemeColor, NotificationFrequency, DashboardLayout, WidgetType } from './dto/user-settings.dto';
import { DataSharingLevel, ApiKeyPermission } from './dto/security-settings.dto';
export declare class AuthService {
    private users;
    private passwordResetTokens;
    private twoFactorSecrets;
    private twoFactorTempTokens;
    private emailVerificationCodes;
    private phoneVerificationCodes;
    private loginHistory;
    private activeSessions;
    private notifications;
    private apiKeys;
    private readonly validLanguageCodes;
    private readonly validTimezones;
    private failedLoginAttempts;
    private loginAttemptTimestamps;
    private userLockouts;
    private ipLoginAttempts;
    private globalAttempts;
    private routeAttempts;
    private readonly MAX_FAILED_ATTEMPTS;
    private readonly LOCKOUT_DURATION_MINUTES;
    private readonly IP_RATE_LIMIT;
    private readonly IP_RATE_LIMIT_WINDOW_MINUTES;
    private readonly GLOBAL_RATE_LIMIT;
    private readonly GLOBAL_RATE_LIMIT_WINDOW_MINUTES;
    private readonly ROUTE_LIMITS;
    getRecentFailedAttempts(email: string): Promise<number>;
    recordFailedLoginAttempt(email: string): void;
    resetFailedLoginAttempts(email: string): void;
    updateLockoutStatus(email: string): void;
    isUserLocked(email: string): boolean;
    getLockoutRemainingMinutes(email: string): number;
    recordIPAttempt(ipAddress: string): void;
    isIPRateLimited(ipAddress: string): boolean;
    recordGlobalAttempt(): void;
    isGlobalRateLimited(): boolean;
    recordRouteAttempt(route: string, ipAddress: string): void;
    isRouteLimited(route: string, ipAddress: string): boolean;
    verifyCaptcha(token: string): Promise<boolean>;
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
                    email: NotificationFrequency;
                    push: NotificationFrequency;
                    sms: NotificationFrequency;
                };
            };
            dashboard: {
                layout: DashboardLayout;
                widgets: {
                    id: string;
                    type: WidgetType;
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
                    dataSharingLevel: DataSharingLevel;
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
    login(email: string, password: string, options?: {
        ipAddress?: string;
        userAgent?: string;
        captchaToken?: string;
    }): Promise<{
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
    requestPasswordReset(email: string): Promise<{
        message: string;
        token?: undefined;
    } | {
        message: string;
        token: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    enableTwoFactor(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    verifyAndEnableTwoFactor(userId: string, code: string): Promise<{
        message: string;
    }>;
    verifyTwoFactorCode(tempToken: string, code: string): Promise<{
        user: any;
        accessToken: string;
    }>;
    disableTwoFactor(userId: string, code: string): Promise<{
        message: string;
    }>;
    private generateEmailVerificationCode;
    requestEmailVerification(userId: string): Promise<{
        message: string;
        code: string;
    }>;
    verifyEmail(userId: string, code: string): Promise<{
        message: string;
    }>;
    addPhoneNumber(userId: string, phoneNumber: string): Promise<{
        message: string;
        code: string;
    }>;
    private generatePhoneVerificationCode;
    requestPhoneVerification(userId: string): Promise<{
        message: string;
        code: string;
    }>;
    verifyPhone(userId: string, code: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    setSecurityQuestions(userId: string, questions: Array<{
        question: string;
        answer: string;
    }>): Promise<{
        message: string;
    }>;
    getLoginHistory(userId: string, limit?: number): Promise<any[]>;
    getActiveSessions(userId: string): Promise<any[]>;
    terminateSession(userId: string, sessionId: string): Promise<{
        message: string;
    }>;
    terminateAllSessions(userId: string): Promise<{
        message: string;
    }>;
    updateThemeMode(userId: string, mode: ThemeMode): Promise<{
        message: string;
    }>;
    updateThemeColor(userId: string, color: ThemeColor): Promise<{
        message: string;
    }>;
    updateLanguage(userId: string, language: string): Promise<{
        message: string;
    }>;
    updateTimezone(userId: string, timezone: string): Promise<{
        message: string;
    }>;
    getFormattedDateTime(userId: string, dateTimeString: string): Promise<{
        formattedDate: any;
        formattedTime: any;
        language: any;
        timezone: any;
    }>;
    updateEmailNotificationPreferences(userId: string, preferences: any): Promise<{
        message: string;
    }>;
    updatePushNotificationPreferences(userId: string, preferences: any): Promise<{
        message: string;
    }>;
    updateSmsNotificationPreferences(userId: string, preferences: any): Promise<{
        message: string;
    }>;
    updateNotificationFrequency(userId: string, frequencies: any): Promise<{
        message: string;
        frequencies: any;
    }>;
    sendTestNotification(userId: string, channel: string): Promise<{
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
    updateDashboardLayout(userId: string, layout: DashboardLayout): Promise<{
        message: string;
        layout: DashboardLayout;
    }>;
    updateDashboardWidgets(userId: string, widgets: any[]): Promise<{
        message: string;
        widgets: any[];
    }>;
    addDashboardWidget(userId: string, widget: any): Promise<{
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
    updatePrivacySettings(userId: string, privacySettings: any): Promise<{
        message: string;
        privacy: any;
    }>;
    createApiKey(userId: string, apiKeyData: any): Promise<{
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
    updateApiKey(userId: string, keyId: string, updateData: any): Promise<{
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
    configureSessionTimeout(userId: string, timeoutSettings: any): Promise<{
        message: string;
        sessionTimeout: any;
    }>;
    validateApiKey(key: string, requiredPermissions?: ApiKeyPermission[]): Promise<{
        userId: any;
        permissions: any;
    }>;
    getApiKeyInfo(key: string): Promise<{
        id: any;
        userId: any;
        permissions: any;
        tier: string;
        createdAt: any;
        lastUsedAt: any;
    }>;
}
