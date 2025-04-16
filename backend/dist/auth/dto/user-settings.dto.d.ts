export declare enum ThemeMode {
    LIGHT = "light",
    DARK = "dark",
    SYSTEM = "system"
}
export declare enum ThemeColor {
    BLUE = "blue",
    GREEN = "green",
    PURPLE = "purple",
    RED = "red",
    ORANGE = "orange",
    TEAL = "teal"
}
export declare enum NotificationFrequency {
    IMMEDIATELY = "immediately",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    NEVER = "never"
}
export declare enum WidgetType {
    ACTIVITY = "activity",
    STATS = "stats",
    CHART = "chart",
    CALENDAR = "calendar",
    TASKS = "tasks",
    NOTIFICATIONS = "notifications",
    NEWS = "news"
}
export declare enum DashboardLayout {
    GRID = "grid",
    LIST = "list",
    COMPACT = "compact",
    EXPANDED = "expanded"
}
export declare class ThemeModeDto {
    mode: ThemeMode;
}
export declare class ThemeColorDto {
    color: ThemeColor;
}
export declare class LanguageDto {
    language: string;
}
export declare class TimezoneDto {
    timezone: string;
}
export declare class DateTimeFormatRequestDto {
    dateTime: string;
}
export declare class NotificationChannelPreferencesDto {
    marketing: boolean;
    securityAlerts: boolean;
    accountUpdates: boolean;
    newFeatures: boolean;
}
export declare class NotificationFrequencyDto {
    email: NotificationFrequency;
    push: NotificationFrequency;
    sms: NotificationFrequency;
}
export declare class EmailNotificationPreferencesDto {
    preferences: NotificationChannelPreferencesDto;
}
export declare class PushNotificationPreferencesDto {
    preferences: NotificationChannelPreferencesDto;
}
export declare class SmsNotificationPreferencesDto {
    preferences: NotificationChannelPreferencesDto;
}
export declare class NotificationFrequencyPreferencesDto {
    frequency: NotificationFrequencyDto;
}
export declare class WidgetPositionDto {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class WidgetDto {
    id: string;
    type: WidgetType;
    title: string;
    position: WidgetPositionDto;
    config?: Record<string, any>;
}
export declare class DashboardLayoutDto {
    type: DashboardLayout;
}
export declare class DashboardWidgetsDto {
    widgets: WidgetDto[];
}
export declare class UserSettingsDto {
    themeMode?: ThemeModeDto;
    themeColor?: ThemeColorDto;
    language?: string;
    timezone?: string;
    emailNotifications?: NotificationChannelPreferencesDto;
    pushNotifications?: NotificationChannelPreferencesDto;
    smsNotifications?: NotificationChannelPreferencesDto;
    notificationFrequency?: NotificationFrequencyDto;
    dashboardLayout?: DashboardLayout;
    dashboardWidgets?: WidgetDto[];
}
