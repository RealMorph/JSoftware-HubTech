import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsObject, ValidateNested, IsISO8601, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export enum ThemeColor {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  RED = 'red',
  ORANGE = 'orange',
  TEAL = 'teal'
}

export enum NotificationFrequency {
  IMMEDIATELY = 'immediately',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never'
}

export enum WidgetType {
  ACTIVITY = 'activity',
  STATS = 'stats',
  CHART = 'chart',
  CALENDAR = 'calendar',
  TASKS = 'tasks',
  NOTIFICATIONS = 'notifications',
  NEWS = 'news'
}

export enum DashboardLayout {
  GRID = 'grid',
  LIST = 'list',
  COMPACT = 'compact',
  EXPANDED = 'expanded'
}

export class ThemeModeDto {
  @IsEnum(ThemeMode)
  @IsNotEmpty()
  mode: ThemeMode;
}

export class ThemeColorDto {
  @IsEnum(ThemeColor)
  @IsNotEmpty()
  color: ThemeColor;
}

export class LanguageDto {
  @IsString()
  @IsNotEmpty()
  language: string;
}

export class TimezoneDto {
  @IsString()
  @IsNotEmpty()
  timezone: string;
}

export class DateTimeFormatRequestDto {
  @IsISO8601()
  @IsNotEmpty()
  dateTime: string;
}

export class NotificationChannelPreferencesDto {
  @IsBoolean()
  marketing: boolean;

  @IsBoolean()
  securityAlerts: boolean;

  @IsBoolean()
  accountUpdates: boolean;

  @IsBoolean()
  newFeatures: boolean;
}

export class NotificationFrequencyDto {
  @IsEnum(NotificationFrequency)
  @IsNotEmpty()
  email: NotificationFrequency;

  @IsEnum(NotificationFrequency)
  @IsNotEmpty()
  push: NotificationFrequency;

  @IsEnum(NotificationFrequency)
  @IsNotEmpty()
  sms: NotificationFrequency;
}

export class EmailNotificationPreferencesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationChannelPreferencesDto)
  preferences: NotificationChannelPreferencesDto;
}

export class PushNotificationPreferencesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationChannelPreferencesDto)
  preferences: NotificationChannelPreferencesDto;
}

export class SmsNotificationPreferencesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationChannelPreferencesDto)
  preferences: NotificationChannelPreferencesDto;
}

export class NotificationFrequencyPreferencesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationFrequencyDto)
  frequency: NotificationFrequencyDto;
}

export class WidgetPositionDto {
  @IsNumber()
  @Min(0)
  x: number;

  @IsNumber()
  @Min(0)
  y: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;
}

export class WidgetDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(WidgetType)
  type: WidgetType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WidgetPositionDto)
  position: WidgetPositionDto;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class DashboardLayoutDto {
  @IsEnum(DashboardLayout)
  @IsNotEmpty()
  type: DashboardLayout;
}

export class DashboardWidgetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetDto)
  widgets: WidgetDto[];
}

export class UserSettingsDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeModeDto)
  themeMode?: ThemeModeDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ThemeColorDto)
  themeColor?: ThemeColorDto;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationChannelPreferencesDto)
  emailNotifications?: NotificationChannelPreferencesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationChannelPreferencesDto)
  pushNotifications?: NotificationChannelPreferencesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationChannelPreferencesDto)
  smsNotifications?: NotificationChannelPreferencesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationFrequencyDto)
  notificationFrequency?: NotificationFrequencyDto;

  @IsOptional()
  @IsEnum(DashboardLayout)
  dashboardLayout?: DashboardLayout;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetDto)
  dashboardWidgets?: WidgetDto[];
} 