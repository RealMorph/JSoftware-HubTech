"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const dto_1 = require("./dto");
let SubscriptionService = class SubscriptionService {
    constructor() {
        this.plans = this.initializeDefaultPlans();
        this.subscriptions = [];
        this.invoices = [];
        this.paymentTransactions = [];
        this.paymentMethods = {};
        this.resourceUsage = {};
    }
    initializeDefaultPlans() {
        return [
            {
                id: 'free-plan',
                type: dto_1.SubscriptionPlanType.FREE,
                name: 'Free',
                description: 'Basic features for individuals',
                monthlyPrice: 0,
                annualPrice: 0,
                features: [
                    { name: 'Projects', description: 'Up to 3 projects', included: true, limit: '3' },
                    { name: 'Storage', description: 'Up to 1GB storage', included: true, limit: '1GB' },
                    { name: 'Team members', description: 'Collaborate with up to 2 team members', included: true, limit: '2' },
                    { name: 'Support', description: 'Community support', included: true },
                    { name: 'API Access', description: 'API access', included: false },
                    { name: 'Advanced security', description: 'Advanced security features', included: false }
                ],
                isPopular: false,
                isAvailable: true
            },
            {
                id: 'basic-plan',
                type: dto_1.SubscriptionPlanType.BASIC,
                name: 'Basic',
                description: 'For small teams and professionals',
                monthlyPrice: 9.99,
                annualPrice: 99.99,
                features: [
                    { name: 'Projects', description: 'Up to 10 projects', included: true, limit: '10' },
                    { name: 'Storage', description: 'Up to 10GB storage', included: true, limit: '10GB' },
                    { name: 'Team members', description: 'Collaborate with up to 5 team members', included: true, limit: '5' },
                    { name: 'Support', description: 'Email support', included: true },
                    { name: 'API Access', description: 'API access with rate limits', included: true, limit: '1000 requests/day' },
                    { name: 'Advanced security', description: 'Advanced security features', included: false }
                ],
                isPopular: true,
                isAvailable: true
            },
            {
                id: 'premium-plan',
                type: dto_1.SubscriptionPlanType.PREMIUM,
                name: 'Premium',
                description: 'For growing businesses and teams',
                monthlyPrice: 29.99,
                annualPrice: 299.99,
                features: [
                    { name: 'Projects', description: 'Up to 50 projects', included: true, limit: '50' },
                    { name: 'Storage', description: 'Up to 100GB storage', included: true, limit: '100GB' },
                    { name: 'Team members', description: 'Collaborate with up to 20 team members', included: true, limit: '20' },
                    { name: 'Support', description: 'Priority email and chat support', included: true },
                    { name: 'API Access', description: 'API access with higher rate limits', included: true, limit: '10000 requests/day' },
                    { name: 'Advanced security', description: 'Advanced security features', included: true }
                ],
                isPopular: false,
                isAvailable: true
            },
            {
                id: 'enterprise-plan',
                type: dto_1.SubscriptionPlanType.ENTERPRISE,
                name: 'Enterprise',
                description: 'For large organizations with advanced needs',
                monthlyPrice: 99.99,
                annualPrice: 999.99,
                features: [
                    { name: 'Projects', description: 'Unlimited projects', included: true },
                    { name: 'Storage', description: 'Unlimited storage', included: true },
                    { name: 'Team members', description: 'Unlimited team members', included: true },
                    { name: 'Support', description: 'Dedicated account manager and 24/7 support', included: true },
                    { name: 'API Access', description: 'Unlimited API access', included: true },
                    { name: 'Advanced security', description: 'Advanced security features with custom configurations', included: true }
                ],
                isPopular: false,
                isAvailable: true
            }
        ];
    }
    async getPlans() {
        return this.plans.filter(plan => plan.isAvailable);
    }
    async getPlanById(planId) {
        const plan = this.plans.find(plan => plan.id === planId && plan.isAvailable);
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        return plan;
    }
    async getUserSubscription(userId) {
        const subscription = this.subscriptions.find(sub => sub.userId === userId && sub.status !== dto_1.SubscriptionStatus.EXPIRED);
        return subscription || null;
    }
    async createSubscription(userId, planId, billingCycle = dto_1.BillingCycle.MONTHLY) {
        const existingSubscription = await this.getUserSubscription(userId);
        if (existingSubscription && existingSubscription.status === dto_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.ConflictException('User already has an active subscription');
        }
        const plan = await this.getPlanById(planId);
        const startDate = new Date();
        const endDate = new Date(startDate);
        switch (billingCycle) {
            case dto_1.BillingCycle.MONTHLY:
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case dto_1.BillingCycle.QUARTERLY:
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case dto_1.BillingCycle.ANNUAL:
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }
        const subscription = {
            id: (0, uuid_1.v4)(),
            userId,
            planId,
            status: plan.type === dto_1.SubscriptionPlanType.FREE ? dto_1.SubscriptionStatus.ACTIVE : dto_1.SubscriptionStatus.PENDING,
            billingCycle,
            startDate,
            endDate,
            autoRenew: true
        };
        this.subscriptions.push(subscription);
        if (plan.type !== dto_1.SubscriptionPlanType.FREE) {
            await this.createInvoiceForSubscription(subscription, plan);
        }
        return subscription;
    }
    async changeSubscription(userId, changeDto) {
        const currentSubscription = await this.getUserSubscription(userId);
        if (!currentSubscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        const newPlan = await this.getPlanById(changeDto.planId);
        const currentPlan = await this.getPlanById(currentSubscription.planId);
        const isUpgrade = this.getPlanPriority(newPlan.type) > this.getPlanPriority(currentPlan.type);
        if (!isUpgrade && newPlan.type !== dto_1.SubscriptionPlanType.FREE) {
            const warnings = await this.handleDowngradeResourceCleanup(userId, currentSubscription.planId, changeDto.planId);
            if (warnings.length > 0) {
                console.warn(`Resource warnings for user ${userId}:`, warnings);
            }
        }
        if (!isUpgrade && currentSubscription.status === dto_1.SubscriptionStatus.ACTIVE) {
            currentSubscription.autoRenew = false;
            const pendingSubscription = {
                id: (0, uuid_1.v4)(),
                userId,
                planId: changeDto.planId,
                status: dto_1.SubscriptionStatus.PENDING,
                billingCycle: changeDto.billingCycle || currentSubscription.billingCycle,
                startDate: new Date(currentSubscription.endDate),
                endDate: this.calculateEndDate(new Date(currentSubscription.endDate), changeDto.billingCycle || currentSubscription.billingCycle),
                autoRenew: true
            };
            this.subscriptions.push(pendingSubscription);
            return pendingSubscription;
        }
        if (isUpgrade) {
            await this.handlePlanChangeAccess(userId, currentSubscription.planId, changeDto.planId);
            currentSubscription.planId = changeDto.planId;
            if (changeDto.billingCycle) {
                currentSubscription.billingCycle = changeDto.billingCycle;
                currentSubscription.endDate = this.calculateEndDate(new Date(currentSubscription.startDate), changeDto.billingCycle);
            }
            await this.createInvoiceForSubscription(currentSubscription, newPlan);
            return currentSubscription;
        }
        if (newPlan.type === dto_1.SubscriptionPlanType.FREE) {
            currentSubscription.planId = changeDto.planId;
            currentSubscription.status = dto_1.SubscriptionStatus.ACTIVE;
            return currentSubscription;
        }
        if (!isUpgrade && currentSubscription.status === dto_1.SubscriptionStatus.PENDING) {
            currentSubscription.planId = changeDto.planId;
            if (changeDto.billingCycle) {
                currentSubscription.billingCycle = changeDto.billingCycle;
                currentSubscription.endDate = this.calculateEndDate(new Date(currentSubscription.startDate), changeDto.billingCycle);
            }
            return currentSubscription;
        }
        throw new common_1.BadRequestException('Could not process subscription change');
    }
    async cancelSubscription(userId, cancelDto = {}) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        if (cancelDto.immediateEffect || this.isPlanFree(subscription.planId)) {
            subscription.status = dto_1.SubscriptionStatus.CANCELED;
            subscription.canceledAt = new Date();
            return { message: 'Subscription has been canceled immediately' };
        }
        subscription.autoRenew = false;
        subscription.canceledAt = new Date();
        return { message: 'Subscription will be canceled at the end of the current billing period' };
    }
    async getSubscriptionHistory(userId) {
        return this.subscriptions
            .filter(sub => sub.userId === userId)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }
    async getUserInvoices(userId) {
        return this.invoices
            .filter(invoice => invoice.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    async getInvoice(invoiceId, userId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId && inv.userId === userId);
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return invoice;
    }
    async getUserPaymentTransactions(userId) {
        return this.paymentTransactions
            .filter(transaction => transaction.userId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    async createInvoiceForSubscription(subscription, plan) {
        const price = subscription.billingCycle === dto_1.BillingCycle.ANNUAL
            ? plan.annualPrice
            : subscription.billingCycle === dto_1.BillingCycle.QUARTERLY
                ? plan.monthlyPrice * 3 * 0.9
                : plan.monthlyPrice;
        const tax = price * 0.1;
        const total = price + tax;
        const invoice = {
            id: (0, uuid_1.v4)(),
            userId: subscription.userId,
            invoiceNumber: `INV-${Date.now().toString().substring(0, 10)}`,
            status: dto_1.InvoiceStatus.OPEN,
            date: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            subtotal: price,
            tax,
            total,
            items: [
                {
                    description: `${plan.name} Plan (${subscription.billingCycle})`,
                    quantity: 1,
                    unitPrice: price,
                    amount: price,
                    planId: plan.id
                }
            ]
        };
        this.invoices.push(invoice);
        return invoice;
    }
    calculateEndDate(startDate, billingCycle) {
        const endDate = new Date(startDate);
        switch (billingCycle) {
            case dto_1.BillingCycle.MONTHLY:
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case dto_1.BillingCycle.QUARTERLY:
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case dto_1.BillingCycle.ANNUAL:
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
        }
        return endDate;
    }
    isPlanFree(planId) {
        const plan = this.plans.find(p => p.id === planId);
        return (plan === null || plan === void 0 ? void 0 : plan.type) === dto_1.SubscriptionPlanType.FREE;
    }
    getPlanPriority(planType) {
        switch (planType) {
            case dto_1.SubscriptionPlanType.FREE:
                return 0;
            case dto_1.SubscriptionPlanType.BASIC:
                return 1;
            case dto_1.SubscriptionPlanType.PREMIUM:
                return 2;
            case dto_1.SubscriptionPlanType.ENTERPRISE:
                return 3;
            default:
                return -1;
        }
    }
    async addPaymentMethod(userId, paymentMethodDto) {
        if (!this.paymentMethods[userId]) {
            this.paymentMethods[userId] = [];
        }
        const existingMethod = this.paymentMethods[userId].find(method => method.id === paymentMethodDto.id);
        if (existingMethod) {
            throw new common_1.ConflictException('Payment method already exists');
        }
        if (!paymentMethodDto.id) {
            paymentMethodDto.id = (0, uuid_1.v4)();
        }
        if (this.paymentMethods[userId].length === 0 || paymentMethodDto.isDefault) {
            this.paymentMethods[userId].forEach(method => {
                method.isDefault = false;
            });
            paymentMethodDto.isDefault = true;
        }
        this.paymentMethods[userId].push(paymentMethodDto);
        return paymentMethodDto;
    }
    async getUserPaymentMethods(userId) {
        return this.paymentMethods[userId] || [];
    }
    async getPaymentMethod(userId, paymentMethodId) {
        const methods = this.paymentMethods[userId] || [];
        const method = methods.find(m => m.id === paymentMethodId);
        if (!method) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        return method;
    }
    async setDefaultPaymentMethod(userId, paymentMethodId) {
        const methods = this.paymentMethods[userId] || [];
        const defaultMethod = methods.find(m => m.id === paymentMethodId);
        if (!defaultMethod) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        methods.forEach(method => {
            method.isDefault = false;
        });
        defaultMethod.isDefault = true;
        return defaultMethod;
    }
    async removePaymentMethod(userId, paymentMethodId) {
        const methods = this.paymentMethods[userId] || [];
        const methodIndex = methods.findIndex(m => m.id === paymentMethodId);
        if (methodIndex === -1) {
            throw new common_1.NotFoundException('Payment method not found');
        }
        const method = methods[methodIndex];
        if (method.isDefault && methods.length > 1) {
            throw new common_1.BadRequestException('Cannot remove default payment method. Set another method as default first.');
        }
        methods.splice(methodIndex, 1);
        if (methods.length === 0) {
            return { message: 'Payment method removed successfully' };
        }
        if (method.isDefault && methods.length > 0) {
            methods[0].isDefault = true;
        }
        return { message: 'Payment method removed successfully' };
    }
    async processPayment(userId, invoiceId, paymentMethodId) {
        const invoice = await this.getInvoice(invoiceId, userId);
        if (invoice.status === dto_1.InvoiceStatus.PAID) {
            throw new common_1.BadRequestException('Invoice already paid');
        }
        const methods = this.paymentMethods[userId] || [];
        let paymentMethod;
        if (paymentMethodId) {
            paymentMethod = methods.find(m => m.id === paymentMethodId);
            if (!paymentMethod) {
                throw new common_1.NotFoundException('Payment method not found');
            }
        }
        else {
            paymentMethod = methods.find(m => m.isDefault);
            if (!paymentMethod) {
                throw new common_1.BadRequestException('No default payment method found');
            }
        }
        const isSuccessful = this.simulatePaymentProcessing();
        const transaction = {
            id: (0, uuid_1.v4)(),
            userId,
            invoiceId,
            paymentMethod: paymentMethod.type,
            status: isSuccessful ? dto_1.PaymentStatus.COMPLETED : dto_1.PaymentStatus.FAILED,
            amount: invoice.total,
            date: new Date(),
            transactionId: `trx-${Date.now()}`,
            metadata: {
                paymentMethodId: paymentMethod.id
            }
        };
        this.paymentTransactions.push(transaction);
        if (isSuccessful) {
            invoice.status = dto_1.InvoiceStatus.PAID;
            const subscriptions = this.subscriptions.filter(sub => sub.userId === userId &&
                sub.status === dto_1.SubscriptionStatus.PENDING);
            for (const subscription of subscriptions) {
                const invoiceForSub = this.invoices.find(inv => inv.id === invoice.id &&
                    inv.items.some(item => item.planId === subscription.planId));
                if (invoiceForSub) {
                    subscription.status = dto_1.SubscriptionStatus.ACTIVE;
                }
            }
        }
        return transaction;
    }
    simulatePaymentProcessing() {
        return Math.random() > 0.1;
    }
    async retryFailedPayment(userId, transactionId) {
        var _a;
        const failedTransaction = this.paymentTransactions.find(trx => trx.id === transactionId &&
            trx.userId === userId &&
            trx.status === dto_1.PaymentStatus.FAILED);
        if (!failedTransaction) {
            throw new common_1.NotFoundException('Failed transaction not found');
        }
        const newTransaction = await this.processPayment(userId, failedTransaction.invoiceId, (_a = failedTransaction.metadata) === null || _a === void 0 ? void 0 : _a.paymentMethodId);
        return newTransaction;
    }
    async generateInvoicePdf(invoiceId, userId) {
        const invoice = await this.getInvoice(invoiceId, userId);
        const pdfUrl = `https://example.com/invoices/${invoice.invoiceNumber}.pdf`;
        return { url: pdfUrl };
    }
    async hasFeatureAccess(userId, featureName) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription || subscription.status !== dto_1.SubscriptionStatus.ACTIVE) {
            return false;
        }
        const plan = await this.getPlanById(subscription.planId);
        const feature = plan.features.find(f => f.name === featureName);
        return (feature === null || feature === void 0 ? void 0 : feature.included) || false;
    }
    async getResourceLimit(userId, resourceName) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription || subscription.status !== dto_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.ForbiddenException('No active subscription found');
        }
        const plan = await this.getPlanById(subscription.planId);
        const feature = plan.features.find(f => f.name === resourceName);
        if (!(feature === null || feature === void 0 ? void 0 : feature.included)) {
            throw new common_1.ForbiddenException(`The current plan does not include ${resourceName}`);
        }
        return feature.limit || null;
    }
    async verifyResourceLimit(userId, resourceName, requestedAmount = 1) {
        const limitStr = await this.getResourceLimit(userId, resourceName);
        if (limitStr === null) {
            return true;
        }
        const limit = this.parseResourceLimit(limitStr);
        if (limit === null) {
            return true;
        }
        if (!this.resourceUsage[userId]) {
            this.resourceUsage[userId] = {};
        }
        let currentUsage = 0;
        switch (resourceName) {
            case 'Projects':
                currentUsage = this.resourceUsage[userId].projects || 0;
                break;
            case 'Storage':
                currentUsage = this.resourceUsage[userId].storage || 0;
                if (limitStr.includes('GB')) {
                    currentUsage = currentUsage / (1024 * 1024 * 1024);
                }
                break;
            case 'Team members':
                currentUsage = this.resourceUsage[userId].teamMembers || 0;
                break;
            case 'API Access':
                currentUsage = this.resourceUsage[userId].apiRequests || 0;
                break;
        }
        return (currentUsage + requestedAmount) <= limit;
    }
    async trackResourceUsage(userId, resource, amount) {
        if (!this.resourceUsage[userId]) {
            this.resourceUsage[userId] = {};
        }
        switch (resource) {
            case 'Projects':
                this.resourceUsage[userId].projects = (this.resourceUsage[userId].projects || 0) + amount;
                break;
            case 'Storage':
                this.resourceUsage[userId].storage = (this.resourceUsage[userId].storage || 0) + amount;
                break;
            case 'Team members':
                this.resourceUsage[userId].teamMembers = (this.resourceUsage[userId].teamMembers || 0) + amount;
                break;
            case 'API Access':
                this.resourceUsage[userId].apiRequests = (this.resourceUsage[userId].apiRequests || 0) + amount;
                break;
        }
    }
    async getUserResourceUsage(userId) {
        return this.resourceUsage[userId] || {};
    }
    async getSubscriptionFeatures(userId) {
        const subscription = await this.getUserSubscription(userId);
        if (!subscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        const plan = await this.getPlanById(subscription.planId);
        const usage = await this.getUserResourceUsage(userId);
        return plan.features.map(feature => {
            var _a;
            let currentUsage = null;
            switch (feature.name) {
                case 'Projects':
                    currentUsage = usage.projects || 0;
                    break;
                case 'Storage':
                    currentUsage = usage.storage || 0;
                    if ((_a = feature.limit) === null || _a === void 0 ? void 0 : _a.includes('GB')) {
                        currentUsage = Math.round((currentUsage / (1024 * 1024 * 1024)) * 100) / 100;
                    }
                    break;
                case 'Team members':
                    currentUsage = usage.teamMembers || 0;
                    break;
                case 'API Access':
                    currentUsage = usage.apiRequests || 0;
                    break;
            }
            let usagePercentage = null;
            if (currentUsage !== null && feature.limit) {
                const limit = this.parseResourceLimit(feature.limit);
                if (limit !== null) {
                    usagePercentage = Math.min(100, Math.round((currentUsage / limit) * 100));
                }
            }
            return Object.assign(Object.assign({}, feature), { currentUsage: currentUsage !== null ? currentUsage.toString() : null, usagePercentage });
        });
    }
    async handlePlanChangeAccess(userId, oldPlanId, newPlanId) {
        const oldPlan = await this.getPlanById(oldPlanId);
        const newPlan = await this.getPlanById(newPlanId);
        const isUpgrade = this.getPlanPriority(newPlan.type) > this.getPlanPriority(oldPlan.type);
        if (isUpgrade) {
            return;
        }
        else {
        }
    }
    async handleDowngradeResourceCleanup(userId, oldPlanId, newPlanId) {
        const oldPlan = await this.getPlanById(oldPlanId);
        const newPlan = await this.getPlanById(newPlanId);
        const usage = await this.getUserResourceUsage(userId);
        const warnings = [];
        for (const newFeature of newPlan.features) {
            if (!newFeature.included || !newFeature.limit) {
                continue;
            }
            const newLimit = this.parseResourceLimit(newFeature.limit);
            if (newLimit === null) {
                continue;
            }
            let currentUsage = 0;
            switch (newFeature.name) {
                case 'Projects':
                    currentUsage = usage.projects || 0;
                    if (currentUsage > newLimit) {
                        warnings.push(`You will need to reduce your projects from ${currentUsage} to ${newLimit} before the downgrade takes effect.`);
                    }
                    break;
                case 'Storage':
                    currentUsage = usage.storage || 0;
                    if (newFeature.limit.includes('GB')) {
                        currentUsage = Math.round((currentUsage / (1024 * 1024 * 1024)) * 100) / 100;
                    }
                    if (currentUsage > newLimit) {
                        warnings.push(`You will need to reduce your storage usage from ${currentUsage}${newFeature.limit.includes('GB') ? 'GB' : ''} to ${newLimit}${newFeature.limit.includes('GB') ? 'GB' : ''} before the downgrade takes effect.`);
                    }
                    break;
                case 'Team members':
                    currentUsage = usage.teamMembers || 0;
                    if (currentUsage > newLimit) {
                        warnings.push(`You will need to reduce your team members from ${currentUsage} to ${newLimit} before the downgrade takes effect.`);
                    }
                    break;
            }
        }
        return warnings;
    }
    parseResourceLimit(limitStr) {
        if (/^\d+$/.test(limitStr)) {
            return parseInt(limitStr, 10);
        }
        if (/^(\d+)GB$/.test(limitStr)) {
            const match = limitStr.match(/^(\d+)GB$/);
            return match ? parseInt(match[1], 10) : null;
        }
        if (/^(\d+) requests\/day$/.test(limitStr)) {
            const match = limitStr.match(/^(\d+) requests\/day$/);
            return match ? parseInt(match[1], 10) : null;
        }
        return null;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)()
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map