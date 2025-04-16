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
exports.PaymentTransactionDto = exports.InvoiceDto = exports.InvoiceItemDto = exports.PaymentMethodDto = exports.InvoiceStatus = exports.PaymentStatus = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["PAYPAL"] = "paypal";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CRYPTO"] = "crypto";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
    PaymentStatus["PARTIALLY_REFUNDED"] = "partially_refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["OPEN"] = "open";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["OVERDUE"] = "overdue";
    InvoiceStatus["CANCELED"] = "canceled";
    InvoiceStatus["VOID"] = "void";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
class PaymentMethodDto {
}
exports.PaymentMethodDto = PaymentMethodDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentMethodDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentMethodDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentMethodDto.prototype, "details", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PaymentMethodDto.prototype, "isDefault", void 0);
class InvoiceItemDto {
}
exports.InvoiceItemDto = InvoiceItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "planId", void 0);
class InvoiceDto {
}
exports.InvoiceDto = InvoiceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(InvoiceStatus),
    __metadata("design:type", String)
], InvoiceDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], InvoiceDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], InvoiceDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceDto.prototype, "subtotal", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceDto.prototype, "tax", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceDto.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Array)
], InvoiceDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceDto.prototype, "notes", void 0);
class PaymentTransactionDto {
}
exports.PaymentTransactionDto = PaymentTransactionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentTransactionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentTransactionDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentTransactionDto.prototype, "invoiceId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], PaymentTransactionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentStatus),
    __metadata("design:type", String)
], PaymentTransactionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PaymentTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PaymentTransactionDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentTransactionDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentTransactionDto.prototype, "metadata", void 0);
//# sourceMappingURL=billing.dto.js.map