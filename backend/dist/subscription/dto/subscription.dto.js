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
exports.SubscriptionFeatureDto = exports.CancelSubscriptionDto = exports.ChangeSubscriptionDto = exports.SubscriptionDto = exports.SubscriptionPlanDto = exports.PlanFeatureDto = exports.SubscriptionStatus = exports.BillingCycle = exports.SubscriptionPlanType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var SubscriptionPlanType;
(function (SubscriptionPlanType) {
    SubscriptionPlanType["FREE"] = "free";
    SubscriptionPlanType["BASIC"] = "basic";
    SubscriptionPlanType["PREMIUM"] = "premium";
    SubscriptionPlanType["ENTERPRISE"] = "enterprise";
})(SubscriptionPlanType || (exports.SubscriptionPlanType = SubscriptionPlanType = {}));
var BillingCycle;
(function (BillingCycle) {
    BillingCycle["MONTHLY"] = "monthly";
    BillingCycle["QUARTERLY"] = "quarterly";
    BillingCycle["ANNUAL"] = "annual";
})(BillingCycle || (exports.BillingCycle = BillingCycle = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELED"] = "canceled";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["PENDING"] = "pending";
    SubscriptionStatus["PAST_DUE"] = "past_due";
    SubscriptionStatus["TRIAL"] = "trial";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
class PlanFeatureDto {
}
exports.PlanFeatureDto = PlanFeatureDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanFeatureDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlanFeatureDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PlanFeatureDto.prototype, "included", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PlanFeatureDto.prototype, "limit", void 0);
class SubscriptionPlanDto {
}
exports.SubscriptionPlanDto = SubscriptionPlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionPlanDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SubscriptionPlanType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionPlanDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionPlanDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionPlanDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SubscriptionPlanDto.prototype, "monthlyPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SubscriptionPlanDto.prototype, "annualPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SubscriptionPlanDto.prototype, "setupFee", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlanFeatureDto),
    __metadata("design:type", Array)
], SubscriptionPlanDto.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SubscriptionPlanDto.prototype, "isPopular", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SubscriptionPlanDto.prototype, "isAvailable", void 0);
class SubscriptionDto {
}
exports.SubscriptionDto = SubscriptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SubscriptionStatus),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(BillingCycle),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "billingCycle", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "canceledAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "trialEndDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SubscriptionDto.prototype, "autoRenew", void 0);
class ChangeSubscriptionDto {
}
exports.ChangeSubscriptionDto = ChangeSubscriptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangeSubscriptionDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(BillingCycle),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChangeSubscriptionDto.prototype, "billingCycle", void 0);
class CancelSubscriptionDto {
}
exports.CancelSubscriptionDto = CancelSubscriptionDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CancelSubscriptionDto.prototype, "immediateEffect", void 0);
class SubscriptionFeatureDto extends PlanFeatureDto {
}
exports.SubscriptionFeatureDto = SubscriptionFeatureDto;
//# sourceMappingURL=subscription.dto.js.map