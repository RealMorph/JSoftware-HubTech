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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsDto = exports.DashboardWidgetsDto = exports.DashboardLayoutDto = exports.WidgetDto = exports.WidgetPositionDto = exports.NotificationFrequencyPreferencesDto = exports.SmsNotificationPreferencesDto = exports.PushNotificationPreferencesDto = exports.EmailNotificationPreferencesDto = exports.NotificationFrequencyDto = exports.NotificationChannelPreferencesDto = exports.DateTimeFormatRequestDto = exports.TimezoneDto = exports.LanguageDto = exports.ThemeColorDto = exports.ThemeModeDto = exports.DashboardLayout = exports.WidgetType = exports.NotificationFrequency = exports.ThemeColor = exports.ThemeMode = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ThemeMode;
(function (ThemeMode) {
    ThemeMode["LIGHT"] = "light";
    ThemeMode["DARK"] = "dark";
    ThemeMode["SYSTEM"] = "system";
})(ThemeMode || (exports.ThemeMode = ThemeMode = {}));
var ThemeColor;
(function (ThemeColor) {
    ThemeColor["BLUE"] = "blue";
    ThemeColor["GREEN"] = "green";
    ThemeColor["PURPLE"] = "purple";
    ThemeColor["RED"] = "red";
    ThemeColor["ORANGE"] = "orange";
    ThemeColor["TEAL"] = "teal";
})(ThemeColor || (exports.ThemeColor = ThemeColor = {}));
var NotificationFrequency;
(function (NotificationFrequency) {
    NotificationFrequency["IMMEDIATELY"] = "immediately";
    NotificationFrequency["HOURLY"] = "hourly";
    NotificationFrequency["DAILY"] = "daily";
    NotificationFrequency["WEEKLY"] = "weekly";
    NotificationFrequency["NEVER"] = "never";
})(NotificationFrequency || (exports.NotificationFrequency = NotificationFrequency = {}));
var WidgetType;
(function (WidgetType) {
    WidgetType["ACTIVITY"] = "activity";
    WidgetType["STATS"] = "stats";
    WidgetType["CHART"] = "chart";
    WidgetType["CALENDAR"] = "calendar";
    WidgetType["TASKS"] = "tasks";
    WidgetType["NOTIFICATIONS"] = "notifications";
    WidgetType["NEWS"] = "news";
})(WidgetType || (exports.WidgetType = WidgetType = {}));
var DashboardLayout;
(function (DashboardLayout) {
    DashboardLayout["GRID"] = "grid";
    DashboardLayout["LIST"] = "list";
    DashboardLayout["COMPACT"] = "compact";
    DashboardLayout["EXPANDED"] = "expanded";
})(DashboardLayout || (exports.DashboardLayout = DashboardLayout = {}));
class ThemeModeDto {
}
exports.ThemeModeDto = ThemeModeDto;
__decorate([
    (0, class_validator_1.IsEnum)(ThemeMode),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ThemeModeDto.prototype, "mode", void 0);
class ThemeColorDto {
}
exports.ThemeColorDto = ThemeColorDto;
__decorate([
    (0, class_validator_1.IsEnum)(ThemeColor),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ThemeColorDto.prototype, "color", void 0);
class LanguageDto {
}
exports.LanguageDto = LanguageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LanguageDto.prototype, "language", void 0);
class TimezoneDto {
}
exports.TimezoneDto = TimezoneDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TimezoneDto.prototype, "timezone", void 0);
class DateTimeFormatRequestDto {
}
exports.DateTimeFormatRequestDto = DateTimeFormatRequestDto;
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DateTimeFormatRequestDto.prototype, "dateTime", void 0);
class NotificationChannelPreferencesDto {
}
exports.NotificationChannelPreferencesDto = NotificationChannelPreferencesDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationChannelPreferencesDto.prototype, "marketing", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationChannelPreferencesDto.prototype, "securityAlerts", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationChannelPreferencesDto.prototype, "accountUpdates", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationChannelPreferencesDto.prototype, "newFeatures", void 0);
class NotificationFrequencyDto {
}
exports.NotificationFrequencyDto = NotificationFrequencyDto;
__decorate([
    (0, class_validator_1.IsEnum)(NotificationFrequency),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NotificationFrequencyDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(NotificationFrequency),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NotificationFrequencyDto.prototype, "push", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(NotificationFrequency),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], NotificationFrequencyDto.prototype, "sms", void 0);
class EmailNotificationPreferencesDto {
}
exports.EmailNotificationPreferencesDto = EmailNotificationPreferencesDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelPreferencesDto),
    __metadata("design:type", NotificationChannelPreferencesDto)
], EmailNotificationPreferencesDto.prototype, "preferences", void 0);
class PushNotificationPreferencesDto {
}
exports.PushNotificationPreferencesDto = PushNotificationPreferencesDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelPreferencesDto),
    __metadata("design:type", NotificationChannelPreferencesDto)
], PushNotificationPreferencesDto.prototype, "preferences", void 0);
class SmsNotificationPreferencesDto {
}
exports.SmsNotificationPreferencesDto = SmsNotificationPreferencesDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelPreferencesDto),
    __metadata("design:type", NotificationChannelPreferencesDto)
], SmsNotificationPreferencesDto.prototype, "preferences", void 0);
class NotificationFrequencyPreferencesDto {
}
exports.NotificationFrequencyPreferencesDto = NotificationFrequencyPreferencesDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationFrequencyDto),
    __metadata("design:type", NotificationFrequencyDto)
], NotificationFrequencyPreferencesDto.prototype, "frequency", void 0);
class WidgetPositionDto {
}
exports.WidgetPositionDto = WidgetPositionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WidgetPositionDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WidgetPositionDto.prototype, "y", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WidgetPositionDto.prototype, "width", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WidgetPositionDto.prototype, "height", void 0);
class WidgetDto {
}
exports.WidgetDto = WidgetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WidgetDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(WidgetType),
    __metadata("design:type", String)
], WidgetDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WidgetDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WidgetPositionDto),
    __metadata("design:type", WidgetPositionDto)
], WidgetDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], WidgetDto.prototype, "config", void 0);
class DashboardLayoutDto {
}
exports.DashboardLayoutDto = DashboardLayoutDto;
__decorate([
    (0, class_validator_1.IsEnum)(DashboardLayout),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DashboardLayoutDto.prototype, "type", void 0);
class DashboardWidgetsDto {
}
exports.DashboardWidgetsDto = DashboardWidgetsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WidgetDto),
    __metadata("design:type", Array)
], DashboardWidgetsDto.prototype, "widgets", void 0);
class UserSettingsDto {
}
exports.UserSettingsDto = UserSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeModeDto),
    __metadata("design:type", ThemeModeDto)
], UserSettingsDto.prototype, "themeMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ThemeColorDto),
    __metadata("design:type", ThemeColorDto)
], UserSettingsDto.prototype, "themeColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelPreferencesDto),
    __metadata("design:type", NotificationChannelPreferencesDto)
], UserSettingsDto.prototype, "emailNotifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelPreferencesDto),
    __metadata("design:type", NotificationChannelPreferencesDto)
], UserSettingsDto.prototype, "pushNotifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationChannelPreferencesDto),
    __metadata("design:type", NotificationChannelPreferencesDto)
], UserSettingsDto.prototype, "smsNotifications", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => NotificationFrequencyDto),
    __metadata("design:type", NotificationFrequencyDto)
], UserSettingsDto.prototype, "notificationFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(DashboardLayout),
    __metadata("design:type", String)
], UserSettingsDto.prototype, "dashboardLayout", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WidgetDto),
    __metadata("design:type", Array)
], UserSettingsDto.prototype, "dashboardWidgets", void 0);
//# sourceMappingURL=user-settings.dto.js.map