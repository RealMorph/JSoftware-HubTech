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
exports.SessionTimeoutDto = exports.ApiKeyResponseDto = exports.ApiKeyDto = exports.PrivacySettingsDto = exports.ApiKeyPermission = exports.DataSharingLevel = void 0;
const class_validator_1 = require("class-validator");
var DataSharingLevel;
(function (DataSharingLevel) {
    DataSharingLevel["NONE"] = "none";
    DataSharingLevel["BASIC"] = "basic";
    DataSharingLevel["ENHANCED"] = "enhanced";
    DataSharingLevel["MINIMAL"] = "minimal";
    DataSharingLevel["FULL"] = "full";
    DataSharingLevel["CUSTOM"] = "custom";
})(DataSharingLevel || (exports.DataSharingLevel = DataSharingLevel = {}));
var ApiKeyPermission;
(function (ApiKeyPermission) {
    ApiKeyPermission["READ"] = "read";
    ApiKeyPermission["WRITE"] = "write";
    ApiKeyPermission["ADMIN"] = "admin";
    ApiKeyPermission["DELETE"] = "delete";
})(ApiKeyPermission || (exports.ApiKeyPermission = ApiKeyPermission = {}));
class PrivacySettingsDto {
}
exports.PrivacySettingsDto = PrivacySettingsDto;
__decorate([
    (0, class_validator_1.IsEnum)(DataSharingLevel),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PrivacySettingsDto.prototype, "dataSharingLevel", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PrivacySettingsDto.prototype, "showProfileToPublic", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PrivacySettingsDto.prototype, "showActivityHistory", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PrivacySettingsDto.prototype, "allowThirdPartyDataSharing", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PrivacySettingsDto.prototype, "allowAnalyticsCookies", void 0);
class ApiKeyDto {
}
exports.ApiKeyDto = ApiKeyDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApiKeyDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ApiKeyPermission, { each: true }),
    __metadata("design:type", Array)
], ApiKeyDto.prototype, "permissions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApiKeyDto.prototype, "description", void 0);
class ApiKeyResponseDto {
}
exports.ApiKeyResponseDto = ApiKeyResponseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ApiKeyResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApiKeyResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ApiKeyPermission, { each: true }),
    __metadata("design:type", Array)
], ApiKeyResponseDto.prototype, "permissions", void 0);
class SessionTimeoutDto {
}
exports.SessionTimeoutDto = SessionTimeoutDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionTimeoutDto.prototype, "timeoutMinutes", void 0);
//# sourceMappingURL=security-settings.dto.js.map