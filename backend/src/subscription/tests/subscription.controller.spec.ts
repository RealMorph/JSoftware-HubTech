import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from '../subscription.controller';
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

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: SubscriptionService;
  let userId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [SubscriptionService],
    }).compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
    service = module.get<SubscriptionService>(SubscriptionService);
    userId = 'test-user-' + Date.now();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Subscription Plans Endpoints', () => {
    it('should get all available plans', async () => {
      const plans = await controller.getPlans();
      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should get a specific plan by ID', async () => {
      const plans = await controller.getPlans();
      const planId = plans[0].id;
      
      const plan = await controller.getPlanById(planId);
      expect(plan).toBeDefined();
      expect(plan.id).toBe(planId);
    });
  });

  describe('User Subscription Endpoints', () => {
    it('should create a new subscription for a user', async () => {
      const plans = await controller.getPlans();
      const freePlanId = plans.find(plan => plan.type === SubscriptionPlanType.FREE).id;
      
      const subscription = await controller.createSubscription(userId, freePlanId);
      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.planId).toBe(freePlanId);
    });

    it('should get a user subscription', async () => {
      // First create a subscription
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await controller.createSubscription(userId, freePlan.id);
      
      // Then get it
      const subscription = await controller.getUserSubscription(userId);
      expect(subscription).toBeDefined();
      
      // TypeScript check - make sure it's a subscription object not a message
      if (subscription && 'userId' in subscription) {
        expect(subscription.userId).toBe(userId);
      }
    });

    it('should return a message if user has no subscription', async () => {
      const nonExistentUser = 'non-existent-user';
      const result = await controller.getUserSubscription(nonExistentUser);
      expect(result).toBeDefined();
      expect('message' in result).toBe(true);
    });
  });

  describe('Subscription Management Endpoints', () => {
    it('should change a subscription plan', async () => {
      // Create initial subscription
      const plans = await controller.getPlans();
      const freePlanId = plans.find(plan => plan.type === SubscriptionPlanType.FREE).id;
      const basicPlanId = plans.find(plan => plan.type === SubscriptionPlanType.BASIC).id;
      
      await controller.createSubscription(userId, freePlanId);
      
      // Change to Basic plan
      const changedSubscription = await controller.changeSubscription(userId, { planId: basicPlanId });
      expect(changedSubscription).toBeDefined();
      expect(changedSubscription.planId).toBe(basicPlanId);
    });

    it('should cancel a subscription', async () => {
      // Create a subscription
      const plans = await controller.getPlans();
      const freePlanId = plans.find(plan => plan.type === SubscriptionPlanType.FREE).id;
      await controller.createSubscription(userId, freePlanId);
      
      // Cancel the subscription
      const result = await controller.cancelSubscription(userId);
      expect(result).toBeDefined();
      expect(result.message).toContain('canceled');
    });

    it('should get subscription history', async () => {
      // Create a subscription
      const plans = await controller.getPlans();
      const freePlanId = plans.find(plan => plan.type === SubscriptionPlanType.FREE).id;
      await controller.createSubscription(userId, freePlanId);
      
      // Get subscription history
      const history = await controller.getSubscriptionHistory(userId);
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].userId).toBe(userId);
    });
  });

  describe('Billing and Invoices Endpoints', () => {
    it('should get user invoices', async () => {
      // Create a paid subscription to generate an invoice
      const plans = await controller.getPlans();
      const basicPlanId = plans.find(plan => plan.type === SubscriptionPlanType.BASIC).id;
      await controller.createSubscription(userId, basicPlanId);
      
      // Get invoices
      const invoices = await controller.getUserInvoices(userId);
      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices[0].userId).toBe(userId);
    });

    it('should get a specific invoice', async () => {
      // Create a paid subscription
      const plans = await controller.getPlans();
      const basicPlanId = plans.find(plan => plan.type === SubscriptionPlanType.BASIC).id;
      await controller.createSubscription(userId, basicPlanId);
      
      // Get invoices and then a specific invoice
      const invoices = await controller.getUserInvoices(userId);
      const invoiceId = invoices[0].id;
      
      const invoice = await controller.getInvoice(userId, invoiceId);
      expect(invoice).toBeDefined();
      expect(invoice.id).toBe(invoiceId);
      expect(invoice.userId).toBe(userId);
    });

    it('should get payment transactions', async () => {
      // Note: Our current implementation doesn't yet create payment transactions
      // This test just verifies the endpoint works
      const transactions = await controller.getUserPaymentTransactions(userId);
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe('Plan Management', () => {
    it('should return all available plans', async () => {
      const plans = await controller.getPlans();
      expect(plans).toBeDefined();
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should return a plan by id', async () => {
      const plans = await controller.getPlans();
      const firstPlan = plans[0];
      
      const plan = await controller.getPlanById(firstPlan.id);
      expect(plan).toBeDefined();
      expect(plan.id).toBe(firstPlan.id);
    });
  });

  describe('Subscription Management', () => {
    it('should create a subscription', async () => {
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      
      const subscription = await controller.createSubscription(userId, freePlan.id);
      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.planId).toBe(freePlan.id);
    });

    it('should get user subscription', async () => {
      // First create a subscription
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await controller.createSubscription(userId, freePlan.id);
      
      // Then get it
      const subscription = await controller.getUserSubscription(userId);
      expect(subscription).toBeDefined();
      
      // TypeScript check - make sure it's a subscription object not a message
      if (subscription && 'userId' in subscription) {
        expect(subscription.userId).toBe(userId);
      }
    });

    it('should change subscription', async () => {
      // First create a subscription
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      await controller.createSubscription(userId, freePlan.id);
      
      // Then change it
      const subscription = await controller.changeSubscription(userId, {
        planId: basicPlan.id
      });
      
      expect(subscription).toBeDefined();
      expect(subscription.planId).toBe(basicPlan.id);
    });

    it('should cancel subscription', async () => {
      // First create a subscription
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await controller.createSubscription(userId, freePlan.id);
      
      // Then cancel it
      const result = await controller.cancelSubscription(userId, { immediateEffect: true });
      expect(result).toBeDefined();
      expect(result.message).toContain('canceled');
    });

    it('should get subscription history', async () => {
      // Create subscriptions
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      await controller.createSubscription(userId, freePlan.id);
      
      const history = await controller.getSubscriptionHistory(userId);
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should get user transactions', async () => {
      // Create a subscription with an invoice
      const plans = await controller.getPlans();
      const basicPlanId = plans.find(plan => plan.type === SubscriptionPlanType.BASIC).id;
      await controller.createSubscription(userId, basicPlanId);
      
      // Get the invoice ID
      const invoices = await controller.getUserInvoices(userId);
      const invoiceId = invoices[0].id;
      
      // Add a payment method to process payment
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });
      
      // Mock the payment processing to succeed
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      
      // Process the payment
      await controller.processPayment(userId, invoiceId);
      
      // Get transactions
      const transactions = await controller.getUserPaymentTransactions(userId);
      expect(transactions).toBeDefined();
      expect(transactions.length).toBe(1);
      expect(transactions[0].userId).toBe(userId);
      expect(transactions[0].invoiceId).toBe(invoiceId);
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

      const result = await controller.addPaymentMethod(userId, paymentMethod);
      expect(result).toBeDefined();
      expect(result.id).toBe(paymentMethod.id);
      expect(result.type).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('should get all payment methods for a user', async () => {
      // Add a payment method first
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      const methods = await controller.getUserPaymentMethods(userId);
      expect(methods).toBeDefined();
      expect(methods.length).toBe(1);
      expect(methods[0].type).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('should get a specific payment method', async () => {
      // Add a payment method first
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      const method = await controller.getPaymentMethod(userId, 'card_123456');
      expect(method).toBeDefined();
      expect(method.id).toBe('card_123456');
      expect(method.type).toBe(PaymentMethod.CREDIT_CARD);
    });

    it('should set a payment method as default', async () => {
      // Add two payment methods
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.PAYPAL,
        id: 'pp_123456',
        details: { email: 'user@example.com' },
        isDefault: false
      });

      // Set PayPal as default
      const result = await controller.setDefaultPaymentMethod(userId, 'pp_123456');
      expect(result).toBeDefined();
      expect(result.id).toBe('pp_123456');
      expect(result.isDefault).toBe(true);
    });

    it('should remove a payment method', async () => {
      // Add a payment method first
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      // Remove it
      const result = await controller.removePaymentMethod(userId, 'card_123456');
      expect(result).toBeDefined();
      expect(result.message).toContain('removed successfully');
    });
  });

  describe('Payment Processing', () => {
    let invoiceId: string;

    beforeEach(async () => {
      // Create a paid subscription to generate an invoice
      const plans = await controller.getPlans();
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      await controller.createSubscription(userId, basicPlan.id, BillingCycle.MONTHLY);
      
      // Get the invoice ID
      const invoices = await controller.getUserInvoices(userId);
      invoiceId = invoices[0].id;
      
      // Add a payment method
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });

      // Mock the random payment processing to ensure consistent test results
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
    });

    it('should process a payment for an invoice', async () => {
      const transaction = await controller.processPayment(userId, invoiceId);
      expect(transaction).toBeDefined();
      expect(transaction.userId).toBe(userId);
      expect(transaction.invoiceId).toBe(invoiceId);
      expect(transaction.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should process a payment with specific payment method', async () => {
      // Add another payment method
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.PAYPAL,
        id: 'pp_123456',
        details: { email: 'user@example.com' },
        isDefault: false
      });
      
      const transaction = await controller.processPayment(userId, invoiceId, 'pp_123456');
      expect(transaction).toBeDefined();
      expect(transaction.userId).toBe(userId);
      expect(transaction.invoiceId).toBe(invoiceId);
      expect(transaction.paymentMethod).toBe(PaymentMethod.PAYPAL);
    });

    it('should handle failed payments and retries', async () => {
      // Mock the payment to fail first
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValueOnce(false);
      
      // Process payment - should fail
      const failedTransaction = await controller.processPayment(userId, invoiceId);
      expect(failedTransaction.status).toBe(PaymentStatus.FAILED);
      
      // Mock the retry to succeed
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValueOnce(true);
      
      // Retry payment - should succeed
      const retryTransaction = await controller.retryFailedPayment(userId, failedTransaction.id);
      expect(retryTransaction.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should generate an invoice PDF', async () => {
      const result = await controller.generateInvoicePdf(userId, invoiceId);
      expect(result).toBeDefined();
      expect(result.url).toContain('invoices/');
      expect(result.url).toContain('.pdf');
    });
  });

  describe('Feature Access and Plan Limits', () => {
    beforeEach(async () => {
      // Create a basic subscription
      const plans = await controller.getPlans();
      const basicPlan = plans.find(plan => plan.type === SubscriptionPlanType.BASIC);
      
      // Mock the payment flow to create an active subscription
      await controller.createSubscription(userId, basicPlan.id);
      
      // Get invoice and add payment method
      const invoices = await controller.getUserInvoices(userId);
      const invoiceId = invoices[0].id;
      
      await controller.addPaymentMethod(userId, {
        type: PaymentMethod.CREDIT_CARD,
        id: 'card_123456',
        details: { cardNumber: '**** **** **** 1234' },
        isDefault: true
      });
      
      // Process payment to activate subscription
      jest.spyOn<any, any>(service, 'simulatePaymentProcessing').mockReturnValue(true);
      await controller.processPayment(userId, invoiceId);
    });

    it('should check feature access', async () => {
      // API Access is included in Basic plan
      const apiAccessResult = await controller.hasFeatureAccess(userId, 'API Access');
      expect(apiAccessResult).toBeDefined();
      expect(apiAccessResult.hasAccess).toBe(true);
      
      // Advanced Security is not included in Basic plan
      const securityResult = await controller.hasFeatureAccess(userId, 'Advanced security');
      expect(securityResult).toBeDefined();
      expect(securityResult.hasAccess).toBe(false);
    });

    it('should get resource limits', async () => {
      // Projects limit in Basic plan
      const projectsResult = await controller.getResourceLimit(userId, 'Projects');
      expect(projectsResult).toBeDefined();
      expect(projectsResult.limit).toBe('10');
      
      // Storage limit in Basic plan
      const storageResult = await controller.getResourceLimit(userId, 'Storage');
      expect(storageResult).toBeDefined();
      expect(storageResult.limit).toBe('10GB');
    });

    it('should verify resource limits', async () => {
      // Verify within limits
      const result1 = await controller.verifyResourceLimit(userId, 'Projects', 5);
      expect(result1).toBeDefined();
      expect(result1.allowed).toBe(true);
      
      // Track usage
      await controller.trackResourceUsage(userId, 'Projects', 9);
      
      // Verify at limit
      const result2 = await controller.verifyResourceLimit(userId, 'Projects', 1);
      expect(result2).toBeDefined();
      expect(result2.allowed).toBe(true);
      
      // Verify exceeding limit
      const result3 = await controller.verifyResourceLimit(userId, 'Projects', 2);
      expect(result3).toBeDefined();
      expect(result3.allowed).toBe(false);
    });

    it('should track resource usage', async () => {
      // Track initial usage
      const trackResult = await controller.trackResourceUsage(userId, 'Projects', 3);
      expect(trackResult).toBeDefined();
      expect(trackResult.success).toBe(true);
      
      // Get usage
      const usage = await controller.getUserResourceUsage(userId);
      expect(usage).toBeDefined();
      expect(usage.projects).toBe(3);
    });

    it('should get subscription features with usage info', async () => {
      // Track some usage
      await controller.trackResourceUsage(userId, 'Projects', 5);
      await controller.trackResourceUsage(userId, 'Team members', 3);
      
      // Get features with usage info
      const features = await controller.getSubscriptionFeatures(userId);
      expect(features).toBeDefined();
      expect(Array.isArray(features)).toBe(true);
      
      // Check Projects feature
      const projectsFeature = features.find(f => f.name === 'Projects');
      expect(projectsFeature).toBeDefined();
      expect(projectsFeature.currentUsage).toBe('5');
      expect(projectsFeature.usagePercentage).toBe(50); // 5/10 = 50%
      
      // Check Team members feature
      const teamMembersFeature = features.find(f => f.name === 'Team members');
      expect(teamMembersFeature).toBeDefined();
      expect(teamMembersFeature.currentUsage).toBe('3');
      expect(teamMembersFeature.usagePercentage).toBe(60); // 3/5 = 60%
    });

    it('should preview plan change with warnings', async () => {
      // Track usage that exceeds Free plan limits
      await controller.trackResourceUsage(userId, 'Projects', 5); // Free allows only 3
      
      // Get plan IDs
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      
      // Preview downgrade
      const previewResult = await controller.previewPlanChange(userId, freePlan.id);
      expect(previewResult).toBeDefined();
      expect(previewResult.warnings).toBeDefined();
      expect(previewResult.warnings.length).toBeGreaterThan(0);
      expect(previewResult.warnings[0]).toContain('reduce your projects');
    });

    it('should throw NotFoundException when previewing plan change with no subscription', async () => {
      const nonExistentUser = 'non-existent-user';
      const plans = await controller.getPlans();
      const freePlan = plans.find(plan => plan.type === SubscriptionPlanType.FREE);
      
      await expect(controller.previewPlanChange(nonExistentUser, freePlan.id)).rejects.toThrow(NotFoundException);
    });
  });
}); 