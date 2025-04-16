import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../subscription.service';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { 
  SubscriptionPlanType, 
  BillingCycle, 
  SubscriptionStatus,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus
} from '../dto';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let userId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionService],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
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
      await expect(service.getPlanById('non-existent-plan')).rejects.toThrow(NotFoundException);
    });
  });

  describe('User Subscriptions', () => {
    it('should create a new free subscription', async () => {
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      
      const subscription = await service.createSubscription(userId, freePlan.id);
      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.planId).toBe(freePlan.id);
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);  // Free plans are active immediately
    });

    it('should create a new paid subscription', async () => {
      const plans = await service.getPlans();
      const paidPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      const subscription = await service.createSubscription(userId, paidPlan.id);
      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.planId).toBe(paidPlan.id);
      expect(subscription.status).toBe(SubscriptionStatus.PENDING);  // Paid plans start as pending
    });

    it('should throw ConflictException if user already has an active subscription', async () => {
      // Create initial subscription
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await service.createSubscription(userId, freePlan.id);
      
      // Try to create another subscription
      await expect(service.createSubscription(userId, freePlan.id)).rejects.toThrow(ConflictException);
    });

    it('should get the current subscription for a user', async () => {
      // Create a subscription
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await service.createSubscription(userId, freePlan.id);
      
      // Get the subscription
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
      // Create initial free subscription
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      await service.createSubscription(userId, freePlan.id);
      
      // Upgrade to Basic plan
      const upgradedSubscription = await service.changeSubscription(userId, { 
        planId: basicPlan.id 
      });
      
      expect(upgradedSubscription).toBeDefined();
      expect(upgradedSubscription.planId).toBe(basicPlan.id);
    });

    it('should downgrade a subscription', async () => {
      // Create initial premium subscription
      const plans = await service.getPlans();
      const premiumPlan = plans.find(plan => plan.type === SubscriptionPlanType.PREMIUM);
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      await service.createSubscription(userId, premiumPlan.id);
      
      // Downgrade to Basic plan
      const downgradedSubscription = await service.changeSubscription(userId, { 
        planId: basicPlan.id 
      });
      
      expect(downgradedSubscription).toBeDefined();
      expect(downgradedSubscription.planId).toBe(basicPlan.id);
      // Downgrade creates a pending subscription for next billing cycle
      expect(downgradedSubscription.status).toBe(SubscriptionStatus.PENDING);
    });

    it('should cancel a subscription', async () => {
      // Create a subscription
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await service.createSubscription(userId, freePlan.id);
      
      // Cancel the subscription
      const result = await service.cancelSubscription(userId);
      expect(result).toBeDefined();
      expect(result.message).toContain('canceled');
      
      // Verify the subscription is canceled
      const subscription = await service.getUserSubscription(userId);
      expect(subscription.status).toBe(SubscriptionStatus.CANCELED);
      expect(subscription.canceledAt).toBeDefined();
    });

    it('should throw NotFoundException when canceling a non-existent subscription', async () => {
      await expect(service.cancelSubscription('non-existent-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Billing and Invoices', () => {
    it('should create invoices for paid subscriptions', async () => {
      // Create a paid subscription
      const plans = await service.getPlans();
      const paidPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      await service.createSubscription(userId, paidPlan.id);
      
      // Check that an invoice was created
      const invoices = await service.getUserInvoices(userId);
      expect(invoices).toBeDefined();
      expect(invoices.length).toBeGreaterThan(0);
      
      // Verify invoice details
      const invoice = invoices[0];
      expect(invoice.userId).toBe(userId);
      expect(invoice.status).toBe(InvoiceStatus.OPEN);
      expect(invoice.items[0].description).toContain(paidPlan.name);
    });

    it('should not create invoices for free subscriptions', async () => {
      // Create a free subscription
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await service.createSubscription(userId, freePlan.id);
      
      // Check that no invoice was created
      const invoices = await service.getUserInvoices(userId);
      expect(invoices).toBeDefined();
      expect(invoices.length).toBe(0);
    });

    it('should get a specific invoice', async () => {
      // Create a paid subscription to generate an invoice
      const plans = await service.getPlans();
      const paidPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      await service.createSubscription(userId, paidPlan.id);
      
      // Get the invoice
      const invoices = await service.getUserInvoices(userId);
      const invoiceId = invoices[0].id;
      
      const invoice = await service.getInvoice(invoiceId, userId);
      expect(invoice).toBeDefined();
      expect(invoice.id).toBe(invoiceId);
    });

    it('should throw NotFoundException for non-existent invoice', async () => {
      await expect(service.getInvoice('non-existent-invoice', userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Payment Method Management', () => {
    it('should add a payment method', async () => {
      const paymentMethod = {
        type: PaymentMethod.CREDIT_CARD,
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
      expect(result.type).toBe(PaymentMethod.CREDIT_CARD);
      expect(result.isDefault).toBe(true);
    });

    it('should get all payment methods for a user', async () => {
      // Add two payment methods
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      await service.addPaymentMethod(userId, {
        type: PaymentMethod.PAYPAL,
        id: 'pp_123456',
        details: { email: 'user@example.com' },
        isDefault: false
      });

      const methods = await service.getUserPaymentMethods(userId);
      expect(methods).toBeDefined();
      expect(methods.length).toBe(2);
      expect(methods.some(m => m.type === PaymentMethod.CREDIT_CARD)).toBe(true);
      expect(methods.some(m => m.type === PaymentMethod.PAYPAL)).toBe(true);
      
      // Only one should be default
      const defaultMethods = methods.filter(m => m.isDefault);
      expect(defaultMethods.length).toBe(1);
      expect(defaultMethods[0].type).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('should set a payment method as default', async () => {
      // Add two payment methods
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      await service.addPaymentMethod(userId, {
        type: PaymentMethod.PAYPAL,
        id: 'pp_123456',
        details: { email: 'user@example.com' },
        isDefault: false
      });

      // Set PayPal as default
      const result = await service.setDefaultPaymentMethod(userId, 'pp_123456');
      expect(result).toBeDefined();
      expect(result.id).toBe('pp_123456');
      expect(result.isDefault).toBe(true);

      // Verify credit card is no longer default
      const creditCard = await service.getPaymentMethod(userId, 'card_123456');
      expect(creditCard.isDefault).toBe(false);
    });

    it('should remove a payment method', async () => {
      // Add a payment method
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      // Remove it
      const result = await service.removePaymentMethod(userId, 'card_123456');
      expect(result).toBeDefined();
      expect(result.message).toContain('removed successfully');

      // Verify it's gone
      const methods = await service.getUserPaymentMethods(userId);
      expect(methods.length).toBe(0);
    });

    it('should not allow removing the default payment method if others exist', async () => {
      // Add two payment methods
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      await service.addPaymentMethod(userId, {
        type: PaymentMethod.PAYPAL,
        id: 'pp_123456',
        details: { email: 'user@example.com' },
        isDefault: false
      });

      // Try to remove the default
      await expect(service.removePaymentMethod(userId, 'card_123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Payment Processing', () => {
    let invoiceId: string;

    beforeEach(async () => {
      // Setup: Create a subscription with an invoice
      const plans = await service.getPlans();
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      await service.createSubscription(userId, basicPlan.id);
      
      // Get the invoice ID
      const invoices = await service.getUserInvoices(userId);
      invoiceId = invoices[0].id;
      
      // Add a payment method
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });
    });

    it('should process a payment for an invoice', async () => {
      // Mock the random payment processing to always succeed
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      
      const transaction = await service.processPayment(userId, invoiceId);
      expect(transaction).toBeDefined();
      expect(transaction.userId).toBe(userId);
      expect(transaction.invoiceId).toBe(invoiceId);
      expect(transaction.status).toBe(PaymentStatus.COMPLETED);
      
      // Check that the invoice was marked as paid
      const invoice = await service.getInvoice(invoiceId, userId);
      expect(invoice.status).toBe(InvoiceStatus.PAID);
      
      // Check that the subscription was activated
      const subscription = await service.getUserSubscription(userId);
      expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should handle failed payments', async () => {
      // Mock the random payment processing to always fail
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(false);
      
      const transaction = await service.processPayment(userId, invoiceId);
      expect(transaction).toBeDefined();
      expect(transaction.userId).toBe(userId);
      expect(transaction.invoiceId).toBe(invoiceId);
      expect(transaction.status).toBe(PaymentStatus.FAILED);
      
      // Check that the invoice is still open
      const invoice = await service.getInvoice(invoiceId, userId);
      expect(invoice.status).toBe(InvoiceStatus.OPEN);
      
      // Check that the subscription is still pending
      const subscription = await service.getUserSubscription(userId);
      expect(subscription.status).toBe(SubscriptionStatus.PENDING);
    });

    it('should retry a failed payment', async () => {
      // First create a failed payment
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(false);
      const failedTransaction = await service.processPayment(userId, invoiceId);
      
      // Then retry with success
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      const retryTransaction = await service.retryFailedPayment(userId, failedTransaction.id);
      
      expect(retryTransaction).toBeDefined();
      expect(retryTransaction.status).toBe(PaymentStatus.COMPLETED);
      
      // Check that the invoice is now paid
      const invoice = await service.getInvoice(invoiceId, userId);
      expect(invoice.status).toBe(InvoiceStatus.PAID);
    });

    it('should generate an invoice PDF URL', async () => {
      const result = await service.generateInvoicePdf(invoiceId, userId);
      expect(result).toBeDefined();
      expect(result.url).toContain('invoices/');
      expect(result.url).toContain('.pdf');
    });

    it('should not allow payment for already paid invoices', async () => {
      // First successfully pay the invoice
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      await service.processPayment(userId, invoiceId);
      
      // Try to pay it again
      await expect(service.processPayment(userId, invoiceId)).rejects.toThrow(BadRequestException);
    });

    it('should use specific payment method when provided', async () => {
      // Add another payment method
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.PAYPAL,
        id: 'pp_123456',
        details: { email: 'user@example.com' },
        isDefault: false
      });
      
      // Process payment with specific method
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      const transaction = await service.processPayment(userId, invoiceId, 'pp_123456');
      
      expect(transaction).toBeDefined();
      expect(transaction.paymentMethod).toBe(PaymentMethod.PAYPAL);
      expect(transaction.metadata.paymentMethodId).toBe('pp_123456');
    });

    it('should throw error when no payment method is available', async () => {
      // Remove all payment methods
      const methods = await service.getUserPaymentMethods(userId);
      for (const method of methods) {
        await service.removePaymentMethod(userId, method.id);
      }
      
      // Try to process payment
      await expect(service.processPayment(userId, invoiceId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Feature Access and Plan Limits', () => {
    beforeEach(async () => {
      // Create a basic subscription
      const plans = await service.getPlans();
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      // Mock the payment flow to create an active subscription
      await service.createSubscription(userId, basicPlan.id);
      
      // Get invoice and add payment method
      const invoices = await service.getUserInvoices(userId);
      const invoiceId = invoices[0].id;
      
      await service.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });
      
      // Process payment to activate subscription
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      await service.processPayment(userId, invoiceId);
    });

    it('should check if user has access to a feature', async () => {
      // Basic plan has API access
      const hasApiAccess = await service.hasFeatureAccess(userId, 'API Access');
      expect(hasApiAccess).toBe(true);
      
      // Basic plan doesn't have advanced security
      const hasAdvancedSecurity = await service.hasFeatureAccess(userId, 'Advanced security');
      expect(hasAdvancedSecurity).toBe(false);
      
      // Non-existent feature
      const hasNonExistentFeature = await service.hasFeatureAccess(userId, 'Non-existent feature');
      expect(hasNonExistentFeature).toBe(false);
    });

    it('should return false for feature access with no active subscription', async () => {
      const nonExistentUser = 'non-existent-user';
      const hasFeature = await service.hasFeatureAccess(nonExistentUser, 'API Access');
      expect(hasFeature).toBe(false);
    });

    it('should get resource limit for a feature', async () => {
      // Projects limit in Basic plan
      const projectsLimit = await service.getResourceLimit(userId, 'Projects');
      expect(projectsLimit).toBe('10');
      
      // Storage limit in Basic plan
      const storageLimit = await service.getResourceLimit(userId, 'Storage');
      expect(storageLimit).toBe('10GB');
      
      // Team members limit in Basic plan
      const teamMembersLimit = await service.getResourceLimit(userId, 'Team members');
      expect(teamMembersLimit).toBe('5');
    });

    it('should throw ForbiddenException when getting limit for non-included feature', async () => {
      await expect(service.getResourceLimit(userId, 'Advanced security')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when getting limit with no active subscription', async () => {
      const nonExistentUser = 'non-existent-user';
      await expect(service.getResourceLimit(nonExistentUser, 'Projects')).rejects.toThrow(ForbiddenException);
    });

    it('should verify if an operation is within resource limits', async () => {
      // Initially no tracked usage, so it should be allowed
      const canAddProject = await service.verifyResourceLimit(userId, 'Projects', 1);
      expect(canAddProject).toBe(true);
      
      // Add 9 projects to reach the limit
      await service.trackResourceUsage(userId, 'Projects', 9);
      
      // Adding one more project should still be allowed (reaching the limit)
      const canAddOneMoreProject = await service.verifyResourceLimit(userId, 'Projects', 1);
      expect(canAddOneMoreProject).toBe(true);
      
      // Adding two more projects should exceed the limit
      const canAddTwoMoreProjects = await service.verifyResourceLimit(userId, 'Projects', 2);
      expect(canAddTwoMoreProjects).toBe(false);
    });

    it('should return true for unlimited resources', async () => {
      // Upgrade to Enterprise plan for unlimited projects
      const plans = await service.getPlans();
      const enterprisePlan = plans.find(plan => plan.type === SubscriptionPlanType.ENTERPRISE);
      
      // Modify the current subscription directly for the test
      const subscription = await service.getUserSubscription(userId);
      subscription.planId = enterprisePlan.id;
      
      // Enterprise plan has unlimited projects
      const canAddManyProjects = await service.verifyResourceLimit(userId, 'Projects', 1000);
      expect(canAddManyProjects).toBe(true);
    });

    it('should track resource usage', async () => {
      // Track project usage
      await service.trackResourceUsage(userId, 'Projects', 3);
      let usage = await service.getUserResourceUsage(userId);
      expect(usage.projects).toBe(3);
      
      // Track more project usage
      await service.trackResourceUsage(userId, 'Projects', 2);
      usage = await service.getUserResourceUsage(userId);
      expect(usage.projects).toBe(5);
      
      // Track storage usage (in bytes)
      const oneMegabyte = 1024 * 1024;
      await service.trackResourceUsage(userId, 'Storage', oneMegabyte);
      usage = await service.getUserResourceUsage(userId);
      expect(usage.storage).toBe(oneMegabyte);
    });

    it('should get subscription features with usage information', async () => {
      // Track some usage first
      await service.trackResourceUsage(userId, 'Projects', 5);
      await service.trackResourceUsage(userId, 'Team members', 3);
      
      // Get features with usage
      const features = await service.getSubscriptionFeatures(userId);
      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
      
      // Find the projects feature
      const projectsFeature = features.find(f => f.name === 'Projects');
      expect(projectsFeature).toBeDefined();
      expect(projectsFeature.currentUsage).toBe('5');
      expect(projectsFeature.usagePercentage).toBe(50); // 5 out of 10 = 50%
      
      // Find the team members feature
      const teamMembersFeature = features.find(f => f.name === 'Team members');
      expect(teamMembersFeature).toBeDefined();
      expect(teamMembersFeature.currentUsage).toBe('3');
      expect(teamMembersFeature.usagePercentage).toBe(60); // 3 out of 5 = 60%
    });

    it('should provide warnings when downgrading would exceed new plan limits', async () => {
      // Track usage that would exceed Free plan limits
      await service.trackResourceUsage(userId, 'Projects', 5); // Free plan allows 3
      
      // Get warnings for downgrade to Free plan
      const plans = await service.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      
      const warnings = await service.handleDowngradeResourceCleanup(
        userId,
        (await service.getUserSubscription(userId)).planId,
        freePlan.id
      );
      
      expect(warnings).toBeDefined();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toContain('reduce your projects from 5 to 3');
    });

    it('should handle plan upgrades', async () => {
      // Start with a basic plan
      const plans = await service.getPlans();
      const premiumPlan = plans.find(plan => plan.type === SubscriptionPlanType.PREMIUM);
      
      // Track some usage
      await service.trackResourceUsage(userId, 'Projects', 8); // Basic plan allows 10
      
      // Upgrade to Premium
      const upgradedSubscription = await service.changeSubscription(
        userId,
        { planId: premiumPlan.id }
      );
      
      expect(upgradedSubscription).toBeDefined();
      expect(upgradedSubscription.planId).toBe(premiumPlan.id);
      
      // Verify new limits
      const newLimit = await service.getResourceLimit(userId, 'Projects');
      expect(newLimit).toBe('50');
      
      // Verify we can now add more projects
      const canAddMoreProjects = await service.verifyResourceLimit(userId, 'Projects', 20);
      expect(canAddMoreProjects).toBe(true);
    });
  });
}); 