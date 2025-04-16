"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const subscription_service_1 = require("../subscription.service");
const common_1 = require("@nestjs/common");
const dto_1 = require("../dto");
describe('SubscriptionService', () => {
    let service;
    let userId;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [subscription_service_1.SubscriptionService],
        }).compile();
        service = module.get(subscription_service_1.SubscriptionService);
        userId = 'test-user-' + Date.now();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('Subscription Plans', () => {
        it('should return all available plans', async () => {
            const plans = await service.getPlans();
            expect(plans).toBeDefined();
            expect(Array.isArray(plans)).toBe(true);
            expect(plans.length).toBeGreaterThan(0);
            expect(plans.every(plan => plan.isAvailable)).toBe(true);
        });
        it('should get a specific plan by ID', async () => {
            const plans = await service.getPlans();
            const planId = plans[0].id;
            const plan = await service.getPlanById(planId);
            expect(plan).toBeDefined();
            expect(plan.id).toBe(planId);
        });
        it('should throw NotFoundException for non-existent plan', async () => {
            await expect(service.getPlanById('non-existent-plan')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('User Subscriptions', () => {
        it('should create a new free subscription', async () => {
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            const subscription = await service.createSubscription(userId, freePlan.id);
            expect(subscription).toBeDefined();
            expect(subscription.userId).toBe(userId);
            expect(subscription.planId).toBe(freePlan.id);
            expect(subscription.status).toBe(dto_1.SubscriptionStatus.ACTIVE);
        });
        it('should create a new paid subscription', async () => {
            const plans = await service.getPlans();
            const paidPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            const subscription = await service.createSubscription(userId, paidPlan.id);
            expect(subscription).toBeDefined();
            expect(subscription.userId).toBe(userId);
            expect(subscription.planId).toBe(paidPlan.id);
            expect(subscription.status).toBe(dto_1.SubscriptionStatus.PENDING);
        });
        it('should throw ConflictException if user already has an active subscription', async () => {
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            await service.createSubscription(userId, freePlan.id);
            await expect(service.createSubscription(userId, freePlan.id)).rejects.toThrow(common_1.ConflictException);
        });
        it('should get the current subscription for a user', async () => {
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            await service.createSubscription(userId, freePlan.id);
            const subscription = await service.getUserSubscription(userId);
            expect(subscription).toBeDefined();
            expect(subscription.userId).toBe(userId);
            expect(subscription.planId).toBe(freePlan.id);
        });
        it('should return null if user has no active subscription', async () => {
            const nonExistentUser = 'non-existent-user';
            const subscription = await service.getUserSubscription(nonExistentUser);
            expect(subscription).toBeNull();
        });
    });
    describe('Subscription Management', () => {
        it('should upgrade a subscription', async () => {
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            const basicPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            await service.createSubscription(userId, freePlan.id);
            const upgradedSubscription = await service.changeSubscription(userId, {
                planId: basicPlan.id
            });
            expect(upgradedSubscription).toBeDefined();
            expect(upgradedSubscription.planId).toBe(basicPlan.id);
        });
        it('should downgrade a subscription', async () => {
            const plans = await service.getPlans();
            const premiumPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.PREMIUM);
            const basicPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            await service.createSubscription(userId, premiumPlan.id);
            const downgradedSubscription = await service.changeSubscription(userId, {
                planId: basicPlan.id
            });
            expect(downgradedSubscription).toBeDefined();
            expect(downgradedSubscription.planId).toBe(basicPlan.id);
            expect(downgradedSubscription.status).toBe(dto_1.SubscriptionStatus.PENDING);
        });
        it('should cancel a subscription', async () => {
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            await service.createSubscription(userId, freePlan.id);
            const result = await service.cancelSubscription(userId);
            expect(result).toBeDefined();
            expect(result.message).toContain('canceled');
            const subscription = await service.getUserSubscription(userId);
            expect(subscription.status).toBe(dto_1.SubscriptionStatus.CANCELED);
            expect(subscription.canceledAt).toBeDefined();
        });
        it('should throw NotFoundException when canceling a non-existent subscription', async () => {
            await expect(service.cancelSubscription('non-existent-user')).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Billing and Invoices', () => {
        it('should create invoices for paid subscriptions', async () => {
            const plans = await service.getPlans();
            const paidPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            await service.createSubscription(userId, paidPlan.id);
            const invoices = await service.getUserInvoices(userId);
            expect(invoices).toBeDefined();
            expect(invoices.length).toBeGreaterThan(0);
            const invoice = invoices[0];
            expect(invoice.userId).toBe(userId);
            expect(invoice.status).toBe(dto_1.InvoiceStatus.OPEN);
            expect(invoice.items[0].description).toContain(paidPlan.name);
        });
        it('should not create invoices for free subscriptions', async () => {
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            await service.createSubscription(userId, freePlan.id);
            const invoices = await service.getUserInvoices(userId);
            expect(invoices).toBeDefined();
            expect(invoices.length).toBe(0);
        });
        it('should get a specific invoice', async () => {
            const plans = await service.getPlans();
            const paidPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            await service.createSubscription(userId, paidPlan.id);
            const invoices = await service.getUserInvoices(userId);
            const invoiceId = invoices[0].id;
            const invoice = await service.getInvoice(invoiceId, userId);
            expect(invoice).toBeDefined();
            expect(invoice.id).toBe(invoiceId);
        });
        it('should throw NotFoundException for non-existent invoice', async () => {
            await expect(service.getInvoice('non-existent-invoice', userId)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('Payment Method Management', () => {
        it('should add a payment method', async () => {
            const paymentMethod = {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: {
                    cardNumber: '**** **** **** 1234',
                    expiryDate: '12/25',
                    cardholderName: 'John Doe'
                },
                isDefault: true
            };
            const result = await service.addPaymentMethod(userId, paymentMethod);
            expect(result).toBeDefined();
            expect(result.id).toBe(paymentMethod.id);
            expect(result.type).toBe(dto_1.PaymentMethod.CREDIT_CARD);
            expect(result.isDefault).toBe(true);
        });
        it('should get all payment methods for a user', async () => {
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: { cardNumber: '**** **** **** 1234' },
                isDefault: true
            });
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.PAYPAL,
                id: 'pp_123456',
                details: { email: 'user@example.com' },
                isDefault: false
            });
            const methods = await service.getUserPaymentMethods(userId);
            expect(methods).toBeDefined();
            expect(methods.length).toBe(2);
            expect(methods.some(m => m.type === dto_1.PaymentMethod.CREDIT_CARD)).toBe(true);
            expect(methods.some(m => m.type === dto_1.PaymentMethod.PAYPAL)).toBe(true);
            const defaultMethods = methods.filter(m => m.isDefault);
            expect(defaultMethods.length).toBe(1);
            expect(defaultMethods[0].type).toBe(dto_1.PaymentMethod.CREDIT_CARD);
        });
        it('should set a payment method as default', async () => {
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: { cardNumber: '**** **** **** 1234' },
                isDefault: true
            });
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.PAYPAL,
                id: 'pp_123456',
                details: { email: 'user@example.com' },
                isDefault: false
            });
            const result = await service.setDefaultPaymentMethod(userId, 'pp_123456');
            expect(result).toBeDefined();
            expect(result.id).toBe('pp_123456');
            expect(result.isDefault).toBe(true);
            const creditCard = await service.getPaymentMethod(userId, 'card_123456');
            expect(creditCard.isDefault).toBe(false);
        });
        it('should remove a payment method', async () => {
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: { cardNumber: '**** **** **** 1234' },
                isDefault: true
            });
            const result = await service.removePaymentMethod(userId, 'card_123456');
            expect(result).toBeDefined();
            expect(result.message).toContain('removed successfully');
            const methods = await service.getUserPaymentMethods(userId);
            expect(methods.length).toBe(0);
        });
        it('should not allow removing the default payment method if others exist', async () => {
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: { cardNumber: '**** **** **** 1234' },
                isDefault: true
            });
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.PAYPAL,
                id: 'pp_123456',
                details: { email: 'user@example.com' },
                isDefault: false
            });
            await expect(service.removePaymentMethod(userId, 'card_123456')).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Payment Processing', () => {
        let invoiceId;
        beforeEach(async () => {
            const plans = await service.getPlans();
            const basicPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            await service.createSubscription(userId, basicPlan.id);
            const invoices = await service.getUserInvoices(userId);
            invoiceId = invoices[0].id;
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: { cardNumber: '**** **** **** 1234' },
                isDefault: true
            });
        });
        it('should process a payment for an invoice', async () => {
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(true);
            const transaction = await service.processPayment(userId, invoiceId);
            expect(transaction).toBeDefined();
            expect(transaction.userId).toBe(userId);
            expect(transaction.invoiceId).toBe(invoiceId);
            expect(transaction.status).toBe(dto_1.PaymentStatus.COMPLETED);
            const invoice = await service.getInvoice(invoiceId, userId);
            expect(invoice.status).toBe(dto_1.InvoiceStatus.PAID);
            const subscription = await service.getUserSubscription(userId);
            expect(subscription.status).toBe(dto_1.SubscriptionStatus.ACTIVE);
        });
        it('should handle failed payments', async () => {
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(false);
            const transaction = await service.processPayment(userId, invoiceId);
            expect(transaction).toBeDefined();
            expect(transaction.userId).toBe(userId);
            expect(transaction.invoiceId).toBe(invoiceId);
            expect(transaction.status).toBe(dto_1.PaymentStatus.FAILED);
            const invoice = await service.getInvoice(invoiceId, userId);
            expect(invoice.status).toBe(dto_1.InvoiceStatus.OPEN);
            const subscription = await service.getUserSubscription(userId);
            expect(subscription.status).toBe(dto_1.SubscriptionStatus.PENDING);
        });
        it('should retry a failed payment', async () => {
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(false);
            const failedTransaction = await service.processPayment(userId, invoiceId);
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(true);
            const retryTransaction = await service.retryFailedPayment(userId, failedTransaction.id);
            expect(retryTransaction).toBeDefined();
            expect(retryTransaction.status).toBe(dto_1.PaymentStatus.COMPLETED);
            const invoice = await service.getInvoice(invoiceId, userId);
            expect(invoice.status).toBe(dto_1.InvoiceStatus.PAID);
        });
        it('should generate an invoice PDF URL', async () => {
            const result = await service.generateInvoicePdf(invoiceId, userId);
            expect(result).toBeDefined();
            expect(result.url).toContain('invoices/');
            expect(result.url).toContain('.pdf');
        });
        it('should not allow payment for already paid invoices', async () => {
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(true);
            await service.processPayment(userId, invoiceId);
            await expect(service.processPayment(userId, invoiceId)).rejects.toThrow(common_1.BadRequestException);
        });
        it('should use specific payment method when provided', async () => {
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.PAYPAL,
                id: 'pp_123456',
                details: { email: 'user@example.com' },
                isDefault: false
            });
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(true);
            const transaction = await service.processPayment(userId, invoiceId, 'pp_123456');
            expect(transaction).toBeDefined();
            expect(transaction.paymentMethod).toBe(dto_1.PaymentMethod.PAYPAL);
            expect(transaction.metadata.paymentMethodId).toBe('pp_123456');
        });
        it('should throw error when no payment method is available', async () => {
            const methods = await service.getUserPaymentMethods(userId);
            for (const method of methods) {
                await service.removePaymentMethod(userId, method.id);
            }
            await expect(service.processPayment(userId, invoiceId)).rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Feature Access and Plan Limits', () => {
        beforeEach(async () => {
            const plans = await service.getPlans();
            const basicPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.BASIC);
            await service.createSubscription(userId, basicPlan.id);
            const invoices = await service.getUserInvoices(userId);
            const invoiceId = invoices[0].id;
            await service.addPaymentMethod(userId, {
                type: dto_1.PaymentMethod.CREDIT_CARD,
                id: 'card_123456',
                details: { cardNumber: '**** **** **** 1234' },
                isDefault: true
            });
            jest.spyOn(service, 'simulatePaymentProcessing').mockReturnValue(true);
            await service.processPayment(userId, invoiceId);
        });
        it('should check if user has access to a feature', async () => {
            const hasApiAccess = await service.hasFeatureAccess(userId, 'API Access');
            expect(hasApiAccess).toBe(true);
            const hasAdvancedSecurity = await service.hasFeatureAccess(userId, 'Advanced security');
            expect(hasAdvancedSecurity).toBe(false);
            const hasNonExistentFeature = await service.hasFeatureAccess(userId, 'Non-existent feature');
            expect(hasNonExistentFeature).toBe(false);
        });
        it('should return false for feature access with no active subscription', async () => {
            const nonExistentUser = 'non-existent-user';
            const hasFeature = await service.hasFeatureAccess(nonExistentUser, 'API Access');
            expect(hasFeature).toBe(false);
        });
        it('should get resource limit for a feature', async () => {
            const projectsLimit = await service.getResourceLimit(userId, 'Projects');
            expect(projectsLimit).toBe('10');
            const storageLimit = await service.getResourceLimit(userId, 'Storage');
            expect(storageLimit).toBe('10GB');
            const teamMembersLimit = await service.getResourceLimit(userId, 'Team members');
            expect(teamMembersLimit).toBe('5');
        });
        it('should throw ForbiddenException when getting limit for non-included feature', async () => {
            await expect(service.getResourceLimit(userId, 'Advanced security')).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should throw ForbiddenException when getting limit with no active subscription', async () => {
            const nonExistentUser = 'non-existent-user';
            await expect(service.getResourceLimit(nonExistentUser, 'Projects')).rejects.toThrow(common_1.ForbiddenException);
        });
        it('should verify if an operation is within resource limits', async () => {
            const canAddProject = await service.verifyResourceLimit(userId, 'Projects', 1);
            expect(canAddProject).toBe(true);
            await service.trackResourceUsage(userId, 'Projects', 9);
            const canAddOneMoreProject = await service.verifyResourceLimit(userId, 'Projects', 1);
            expect(canAddOneMoreProject).toBe(true);
            const canAddTwoMoreProjects = await service.verifyResourceLimit(userId, 'Projects', 2);
            expect(canAddTwoMoreProjects).toBe(false);
        });
        it('should return true for unlimited resources', async () => {
            const plans = await service.getPlans();
            const enterprisePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.ENTERPRISE);
            const subscription = await service.getUserSubscription(userId);
            subscription.planId = enterprisePlan.id;
            const canAddManyProjects = await service.verifyResourceLimit(userId, 'Projects', 1000);
            expect(canAddManyProjects).toBe(true);
        });
        it('should track resource usage', async () => {
            await service.trackResourceUsage(userId, 'Projects', 3);
            let usage = await service.getUserResourceUsage(userId);
            expect(usage.projects).toBe(3);
            await service.trackResourceUsage(userId, 'Projects', 2);
            usage = await service.getUserResourceUsage(userId);
            expect(usage.projects).toBe(5);
            const oneMegabyte = 1024 * 1024;
            await service.trackResourceUsage(userId, 'Storage', oneMegabyte);
            usage = await service.getUserResourceUsage(userId);
            expect(usage.storage).toBe(oneMegabyte);
        });
        it('should get subscription features with usage information', async () => {
            await service.trackResourceUsage(userId, 'Projects', 5);
            await service.trackResourceUsage(userId, 'Team members', 3);
            const features = await service.getSubscriptionFeatures(userId);
            expect(features).toBeDefined();
            expect(Array.isArray(features)).toBe(true);
            const projectsFeature = features.find(f => f.name === 'Projects');
            expect(projectsFeature).toBeDefined();
            expect(projectsFeature.currentUsage).toBe('5');
            expect(projectsFeature.usagePercentage).toBe(50);
            const teamMembersFeature = features.find(f => f.name === 'Team members');
            expect(teamMembersFeature).toBeDefined();
            expect(teamMembersFeature.currentUsage).toBe('3');
            expect(teamMembersFeature.usagePercentage).toBe(60);
        });
        it('should provide warnings when downgrading would exceed new plan limits', async () => {
            await service.trackResourceUsage(userId, 'Projects', 5);
            const plans = await service.getPlans();
            const freePlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.FREE);
            const warnings = await service.handleDowngradeResourceCleanup(userId, (await service.getUserSubscription(userId)).planId, freePlan.id);
            expect(warnings).toBeDefined();
            expect(warnings.length).toBeGreaterThan(0);
            expect(warnings[0]).toContain('reduce your projects from 5 to 3');
        });
        it('should handle plan upgrades', async () => {
            const plans = await service.getPlans();
            const premiumPlan = plans.find(plan => plan.type === dto_1.SubscriptionPlanType.PREMIUM);
            await service.trackResourceUsage(userId, 'Projects', 8);
            const upgradedSubscription = await service.changeSubscription(userId, { planId: premiumPlan.id });
            expect(upgradedSubscription).toBeDefined();
            expect(upgradedSubscription.planId).toBe(premiumPlan.id);
            const newLimit = await service.getResourceLimit(userId, 'Projects');
            expect(newLimit).toBe('50');
            const canAddMoreProjects = await service.verifyResourceLimit(userId, 'Projects', 20);
            expect(canAddMoreProjects).toBe(true);
        });
    });
});
//# sourceMappingURL=subscription.service.spec.js.map