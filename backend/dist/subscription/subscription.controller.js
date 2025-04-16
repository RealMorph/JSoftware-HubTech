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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const dto_1 = require("./dto");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getPlans() {
        return this.subscriptionService.getPlans();
    }
    async getPlanById(planId) {
        return this.subscriptionService.getPlanById(planId);
    }
    async getUserSubscription(userId) {
        const subscription = await this.subscriptionService.getUserSubscription(userId);
        if (!subscription) {
            return { message: 'User has no active subscription' };
        }
        return subscription;
    }
    async createSubscription(userId, planId, billingCycle) {
        return this.subscriptionService.createSubscription(userId, planId, billingCycle);
    }
    async changeSubscription(userId, changeDto) {
        return this.subscriptionService.changeSubscription(userId, changeDto);
    }
    async cancelSubscription(userId, cancelDto) {
        return this.subscriptionService.cancelSubscription(userId, cancelDto);
    }
    async getSubscriptionHistory(userId) {
        return this.subscriptionService.getSubscriptionHistory(userId);
    }
    async getUserInvoices(userId) {
        return this.subscriptionService.getUserInvoices(userId);
    }
    async getInvoice(userId, invoiceId) {
        return this.subscriptionService.getInvoice(invoiceId, userId);
    }
    async getUserPaymentTransactions(userId) {
        return this.subscriptionService.getUserPaymentTransactions(userId);
    }
    async addPaymentMethod(userId, paymentMethodDto) {
        return this.subscriptionService.addPaymentMethod(userId, paymentMethodDto);
    }
    async getUserPaymentMethods(userId) {
        return this.subscriptionService.getUserPaymentMethods(userId);
    }
    async getPaymentMethod(userId, methodId) {
        return this.subscriptionService.getPaymentMethod(userId, methodId);
    }
    async setDefaultPaymentMethod(userId, methodId) {
        return this.subscriptionService.setDefaultPaymentMethod(userId, methodId);
    }
    async removePaymentMethod(userId, methodId) {
        return this.subscriptionService.removePaymentMethod(userId, methodId);
    }
    async processPayment(userId, invoiceId, paymentMethodId) {
        return this.subscriptionService.processPayment(userId, invoiceId, paymentMethodId);
    }
    async retryFailedPayment(userId, transactionId) {
        return this.subscriptionService.retryFailedPayment(userId, transactionId);
    }
    async generateInvoicePdf(userId, invoiceId) {
        return this.subscriptionService.generateInvoicePdf(invoiceId, userId);
    }
    async getSubscriptionFeatures(userId) {
        return this.subscriptionService.getSubscriptionFeatures(userId);
    }
    async hasFeatureAccess(userId, featureName) {
        const hasAccess = await this.subscriptionService.hasFeatureAccess(userId, featureName);
        return { hasAccess };
    }
    async getResourceLimit(userId, resourceName) {
        const limit = await this.subscriptionService.getResourceLimit(userId, resourceName);
        return { limit };
    }
    async verifyResourceLimit(userId, resourceName, requestedAmount) {
        const allowed = await this.subscriptionService.verifyResourceLimit(userId, resourceName, requestedAmount);
        return { allowed };
    }
    async getUserResourceUsage(userId) {
        return this.subscriptionService.getUserResourceUsage(userId);
    }
    async trackResourceUsage(userId, resource, amount) {
        await this.subscriptionService.trackResourceUsage(userId, resource, amount);
        return { success: true };
    }
    async previewPlanChange(userId, newPlanId) {
        const currentSubscription = await this.subscriptionService.getUserSubscription(userId);
        if (!currentSubscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        const warnings = await this.subscriptionService.handleDowngradeResourceCleanup(userId, currentSubscription.planId, newPlanId);
        return { warnings };
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Get)('plans/:planId'),
    __param(0, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getPlanById", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserSubscription", null);
__decorate([
    (0, common_1.Post)('user/:userId/subscribe'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('planId')),
    __param(2, (0, common_1.Body)('billingCycle')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Patch)('user/:userId/change'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ChangeSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "changeSubscription", null);
__decorate([
    (0, common_1.Delete)('user/:userId/cancel'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CancelSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('user/:userId/history'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionHistory", null);
__decorate([
    (0, common_1.Get)('user/:userId/invoices'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserInvoices", null);
__decorate([
    (0, common_1.Get)('user/:userId/invoices/:invoiceId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Get)('user/:userId/transactions'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserPaymentTransactions", null);
__decorate([
    (0, common_1.Post)('payment-methods/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.PaymentMethodDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "addPaymentMethod", null);
__decorate([
    (0, common_1.Get)('payment-methods/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserPaymentMethods", null);
__decorate([
    (0, common_1.Get)('payment-methods/:userId/:methodId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('methodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getPaymentMethod", null);
__decorate([
    (0, common_1.Patch)('payment-methods/:userId/:methodId/default'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('methodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "setDefaultPaymentMethod", null);
__decorate([
    (0, common_1.Delete)('payment-methods/:userId/:methodId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('methodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "removePaymentMethod", null);
__decorate([
    (0, common_1.Post)('process-payment/:userId/:invoiceId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('invoiceId')),
    __param(2, (0, common_1.Body)('paymentMethodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Post)('retry-payment/:userId/:transactionId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "retryFailedPayment", null);
__decorate([
    (0, common_1.Get)('invoice-pdf/:userId/:invoiceId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "generateInvoicePdf", null);
__decorate([
    (0, common_1.Get)('features/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionFeatures", null);
__decorate([
    (0, common_1.Get)('user/:userId/feature-access/:featureName'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('featureName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "hasFeatureAccess", null);
__decorate([
    (0, common_1.Get)('user/:userId/resource-limit/:resourceName'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('resourceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getResourceLimit", null);
__decorate([
    (0, common_1.Post)('user/:userId/verify-limit'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('resourceName')),
    __param(2, (0, common_1.Body)('requestedAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "verifyResourceLimit", null);
__decorate([
    (0, common_1.Get)('user/:userId/resource-usage'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserResourceUsage", null);
__decorate([
    (0, common_1.Post)('user/:userId/track-usage'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('resource')),
    __param(2, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "trackResourceUsage", null);
__decorate([
    (0, common_1.Post)('user/:userId/change-plan-preview'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('newPlanId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "previewPlanChange", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map