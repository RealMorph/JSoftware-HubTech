import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { 
  SubscriptionPlanDto, 
  SubscriptionDto, 
  SubscriptionPlanType, 
  SubscriptionStatus, 
  BillingCycle,
  ChangeSubscriptionDto,
  CancelSubscriptionDto,
  InvoiceDto,
  InvoiceStatus,
  PaymentTransactionDto,
  PaymentMethod,
  PaymentStatus,
  PaymentMethodDto,
  SubscriptionFeatureDto
} from './dto';

// New interface to describe resource usage
export interface ResourceUsage {
  projects?: number;
  storage?: number; // in bytes
  teamMembers?: number;
  apiRequests?: number; // per day
}

@Injectable()
export class SubscriptionService {
  private plans = this.initializeDefaultPlans();
  private subscriptions: SubscriptionDto[] = [];
  private invoices: InvoiceDto[] = [];
  private paymentTransactions: PaymentTransactionDto[] = [];
  private paymentMethods: Record<string, PaymentMethodDto[]> = {}; // userId -> payment methods

  // Track resource usage by user
  private resourceUsage: Record<string, ResourceUsage> = {};

  // Initialize default subscription plans
  private initializeDefaultPlans(): SubscriptionPlanDto[] {
    return [
      {
        id: 'free-plan',
        type: SubscriptionPlanType.FREE,
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
        type: SubscriptionPlanType.BASIC,
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
        type: SubscriptionPlanType.PREMIUM,
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
        type: SubscriptionPlanType.ENTERPRISE,
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

  // Get all available subscription plans
  async getPlans(): Promise<SubscriptionPlanDto[]> {
    return this.plans.filter(plan => plan.isAvailable);
  }

  // Get a specific plan by ID
  async getPlanById(planId: string): Promise<SubscriptionPlanDto> {
    const plan = this.plans.find(plan => plan.id === planId && plan.isAvailable);
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  // Get a user's current subscription
  async getUserSubscription(userId: string): Promise<SubscriptionDto | null> {
    const subscription = this.subscriptions.find(
      sub => sub.userId === userId && sub.status !== SubscriptionStatus.EXPIRED
    );
    
    return subscription || null;
  }

  // Create a new subscription for a user
  async createSubscription(userId: string, planId: string, billingCycle: BillingCycle = BillingCycle.MONTHLY): Promise<SubscriptionDto> {
    // Check if user already has an active subscription
    const existingSubscription = await this.getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === SubscriptionStatus.ACTIVE) {
      throw new ConflictException('User already has an active subscription');
    }

    // Check if plan exists
    const plan = await this.getPlanById(planId);

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Set end date based on billing cycle
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case BillingCycle.ANNUAL:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create new subscription
    const subscription: SubscriptionDto = {
      id: uuidv4(),
      userId,
      planId,
      status: plan.type === SubscriptionPlanType.FREE ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING,
      billingCycle,
      startDate,
      endDate,
      autoRenew: true
    };

    this.subscriptions.push(subscription);

    // If not a free plan, create an invoice
    if (plan.type !== SubscriptionPlanType.FREE) {
      await this.createInvoiceForSubscription(subscription, plan);
    }

    return subscription;
  }

  // Upgrade or downgrade a subscription
  async changeSubscription(userId: string, changeDto: ChangeSubscriptionDto): Promise<SubscriptionDto> {
    const currentSubscription = await this.getUserSubscription(userId);
    if (!currentSubscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.getPlanById(changeDto.planId);
    const currentPlan = await this.getPlanById(currentSubscription.planId);

    // Determine if this is an upgrade or downgrade
    const isUpgrade = this.getPlanPriority(newPlan.type) > this.getPlanPriority(currentPlan.type);
    
    // For downgrades, check resource limits and provide warnings
    if (!isUpgrade && newPlan.type !== SubscriptionPlanType.FREE) {
      const warnings = await this.handleDowngradeResourceCleanup(
        userId, 
        currentSubscription.planId, 
        changeDto.planId
      );
      
      // Store warnings with the subscription for later retrieval
      if (warnings.length > 0) {
        // In a real app, you might store these warnings in a database
        console.warn(`Resource warnings for user ${userId}:`, warnings);
      }
    }
    
    // Continue with the original change subscription logic
    // For downgrades, we might want to delay until the current period ends
    if (!isUpgrade && currentSubscription.status === SubscriptionStatus.ACTIVE) {
      // Mark the current subscription for downgrade at the end of the period
      currentSubscription.autoRenew = false;
      
      // Create a pending subscription that will activate when the current one expires
      const pendingSubscription: SubscriptionDto = {
        id: uuidv4(),
        userId,
        planId: changeDto.planId,
        status: SubscriptionStatus.PENDING,
        billingCycle: changeDto.billingCycle || currentSubscription.billingCycle,
        startDate: new Date(currentSubscription.endDate),
        endDate: this.calculateEndDate(
          new Date(currentSubscription.endDate), 
          changeDto.billingCycle || currentSubscription.billingCycle
        ),
        autoRenew: true
      };
      
      this.subscriptions.push(pendingSubscription);
      return pendingSubscription;
    }
    
    // For upgrades, apply immediately
    if (isUpgrade) {
      // Handle immediate access to new features
      await this.handlePlanChangeAccess(
        userId, 
        currentSubscription.planId, 
        changeDto.planId
      );
      
      // Update the current subscription
      currentSubscription.planId = changeDto.planId;
      if (changeDto.billingCycle) {
        currentSubscription.billingCycle = changeDto.billingCycle;
        currentSubscription.endDate = this.calculateEndDate(
          new Date(currentSubscription.startDate),
          changeDto.billingCycle
        );
      }
      
      // Create an invoice for the upgrade
      await this.createInvoiceForSubscription(currentSubscription, newPlan);
      
      return currentSubscription;
    }
    
    // If it's a free plan, apply immediately
    if (newPlan.type === SubscriptionPlanType.FREE) {
      currentSubscription.planId = changeDto.planId;
      currentSubscription.status = SubscriptionStatus.ACTIVE;
      return currentSubscription;
    }
    
    // Also allow immediate downgrades for PENDING subscriptions
    if (!isUpgrade && currentSubscription.status === SubscriptionStatus.PENDING) {
      currentSubscription.planId = changeDto.planId;
      if (changeDto.billingCycle) {
        currentSubscription.billingCycle = changeDto.billingCycle;
        currentSubscription.endDate = this.calculateEndDate(
          new Date(currentSubscription.startDate),
          changeDto.billingCycle
        );
      }
      return currentSubscription;
    }
    
    throw new BadRequestException('Could not process subscription change');
  }

  // Cancel a subscription
  async cancelSubscription(userId: string, cancelDto: CancelSubscriptionDto = {}): Promise<{ message: string }> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // If immediate effect requested or it's a free plan
    if (cancelDto.immediateEffect || this.isPlanFree(subscription.planId)) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      return { message: 'Subscription has been canceled immediately' };
    }

    // Otherwise, subscription continues until the end of the period
    subscription.autoRenew = false;
    subscription.canceledAt = new Date();
    
    return { message: 'Subscription will be canceled at the end of the current billing period' };
  }

  // Get subscription history for a user
  async getSubscriptionHistory(userId: string): Promise<SubscriptionDto[]> {
    return this.subscriptions
      .filter(sub => sub.userId === userId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  // Get invoices for a user
  async getUserInvoices(userId: string): Promise<InvoiceDto[]> {
    return this.invoices
      .filter(invoice => invoice.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Get a specific invoice
  async getInvoice(invoiceId: string, userId: string): Promise<InvoiceDto> {
    const invoice = this.invoices.find(inv => inv.id === invoiceId && inv.userId === userId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  // Get payment transactions for a user
  async getUserPaymentTransactions(userId: string): Promise<PaymentTransactionDto[]> {
    return this.paymentTransactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Helper: Create an invoice for a subscription
  private async createInvoiceForSubscription(subscription: SubscriptionDto, plan: SubscriptionPlanDto): Promise<InvoiceDto> {
    const price = subscription.billingCycle === BillingCycle.ANNUAL 
      ? plan.annualPrice 
      : subscription.billingCycle === BillingCycle.QUARTERLY
        ? plan.monthlyPrice * 3 * 0.9 // 10% discount for quarterly
        : plan.monthlyPrice;
    
    const tax = price * 0.1; // Example: 10% tax
    const total = price + tax;

    const invoice: InvoiceDto = {
      id: uuidv4(),
      userId: subscription.userId,
      invoiceNumber: `INV-${Date.now().toString().substring(0, 10)}`,
      status: InvoiceStatus.OPEN,
      date: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Due in 14 days
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

  // Helper: Calculate end date based on billing cycle
  private calculateEndDate(startDate: Date, billingCycle: BillingCycle): Date {
    const endDate = new Date(startDate);
    
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case BillingCycle.QUARTERLY:
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case BillingCycle.ANNUAL:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }
    
    return endDate;
  }

  // Helper: Check if a plan is free
  private isPlanFree(planId: string): boolean {
    const plan = this.plans.find(p => p.id === planId);
    return plan?.type === SubscriptionPlanType.FREE;
  }

  // Helper: Get plan priority for comparison (higher number = higher tier)
  private getPlanPriority(planType: SubscriptionPlanType): number {
    switch (planType) {
      case SubscriptionPlanType.FREE:
        return 0;
      case SubscriptionPlanType.BASIC:
        return 1;
      case SubscriptionPlanType.PREMIUM:
        return 2;
      case SubscriptionPlanType.ENTERPRISE:
        return 3;
      default:
        return -1;
    }
  }

  // Payment methods

  // Add a payment method for a user
  async addPaymentMethod(userId: string, paymentMethodDto: PaymentMethodDto): Promise<PaymentMethodDto> {
    if (!this.paymentMethods[userId]) {
      this.paymentMethods[userId] = [];
    }

    // Check if a payment method with same ID already exists
    const existingMethod = this.paymentMethods[userId].find(method => method.id === paymentMethodDto.id);
    if (existingMethod) {
      throw new ConflictException('Payment method already exists');
    }

    // Generate a new ID if not provided
    if (!paymentMethodDto.id) {
      paymentMethodDto.id = uuidv4();
    }

    // If this is the first payment method or isDefault is true, make it the default
    if (this.paymentMethods[userId].length === 0 || paymentMethodDto.isDefault) {
      // Set all existing methods to non-default
      this.paymentMethods[userId].forEach(method => {
        method.isDefault = false;
      });
      paymentMethodDto.isDefault = true;
    }

    this.paymentMethods[userId].push(paymentMethodDto);
    return paymentMethodDto;
  }

  // Get all payment methods for a user
  async getUserPaymentMethods(userId: string): Promise<PaymentMethodDto[]> {
    return this.paymentMethods[userId] || [];
  }

  // Get a specific payment method by ID
  async getPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethodDto> {
    const methods = this.paymentMethods[userId] || [];
    const method = methods.find(m => m.id === paymentMethodId);
    
    if (!method) {
      throw new NotFoundException('Payment method not found');
    }
    
    return method;
  }

  // Set a payment method as default
  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethodDto> {
    const methods = this.paymentMethods[userId] || [];
    
    // Find the method to set as default
    const defaultMethod = methods.find(m => m.id === paymentMethodId);
    if (!defaultMethod) {
      throw new NotFoundException('Payment method not found');
    }
    
    // Set all methods to non-default
    methods.forEach(method => {
      method.isDefault = false;
    });
    
    // Set the selected method as default
    defaultMethod.isDefault = true;
    
    return defaultMethod;
  }

  // Remove a payment method
  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<{ message: string }> {
    const methods = this.paymentMethods[userId] || [];
    const methodIndex = methods.findIndex(m => m.id === paymentMethodId);
    
    if (methodIndex === -1) {
      throw new NotFoundException('Payment method not found');
    }
    
    const method = methods[methodIndex];
    
    // Check if it's the default method and there are other methods
    if (method.isDefault && methods.length > 1) {
      throw new BadRequestException('Cannot remove default payment method. Set another method as default first.');
    }
    
    // Remove the method
    methods.splice(methodIndex, 1);
    
    // If we removed the only method, return
    if (methods.length === 0) {
      return { message: 'Payment method removed successfully' };
    }
    
    // If we removed the default method, set another one as default
    if (method.isDefault && methods.length > 0) {
      methods[0].isDefault = true;
    }
    
    return { message: 'Payment method removed successfully' };
  }

  // Process payment for an invoice
  async processPayment(userId: string, invoiceId: string, paymentMethodId?: string): Promise<PaymentTransactionDto> {
    // Get the invoice
    const invoice = await this.getInvoice(invoiceId, userId);
    
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice already paid');
    }
    
    // Find payment method to use
    const methods = this.paymentMethods[userId] || [];
    let paymentMethod: PaymentMethodDto;
    
    if (paymentMethodId) {
      // Use the specified payment method
      paymentMethod = methods.find(m => m.id === paymentMethodId);
      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }
    } else {
      // Use the default payment method
      paymentMethod = methods.find(m => m.isDefault);
      if (!paymentMethod) {
        throw new BadRequestException('No default payment method found');
      }
    }
    
    // Simulate payment processing - in a real application, this would call a payment gateway
    const isSuccessful = this.simulatePaymentProcessing();
    
    // Create a transaction record
    const transaction: PaymentTransactionDto = {
      id: uuidv4(),
      userId,
      invoiceId,
      paymentMethod: paymentMethod.type,
      status: isSuccessful ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      amount: invoice.total,
      date: new Date(),
      transactionId: `trx-${Date.now()}`,
      metadata: {
        paymentMethodId: paymentMethod.id
      }
    };
    
    this.paymentTransactions.push(transaction);
    
    // Update invoice status if payment was successful
    if (isSuccessful) {
      invoice.status = InvoiceStatus.PAID;
      
      // Update subscription status if applicable
      const subscriptions = this.subscriptions.filter(sub => 
        sub.userId === userId && 
        sub.status === SubscriptionStatus.PENDING
      );
      
      for (const subscription of subscriptions) {
        const invoiceForSub = this.invoices.find(inv => 
          inv.id === invoice.id && 
          inv.items.some(item => item.planId === subscription.planId)
        );
        
        if (invoiceForSub) {
          subscription.status = SubscriptionStatus.ACTIVE;
        }
      }
    }
    
    return transaction;
  }

  // Simulate payment processing - in a real app, this would call a payment provider API
  private simulatePaymentProcessing(): boolean {
    // Simulate 90% success rate
    return Math.random() > 0.1;
  }

  // Retry a failed payment
  async retryFailedPayment(userId: string, transactionId: string): Promise<PaymentTransactionDto> {
    // Find the failed transaction
    const failedTransaction = this.paymentTransactions.find(
      trx => trx.id === transactionId && 
             trx.userId === userId && 
             trx.status === PaymentStatus.FAILED
    );
    
    if (!failedTransaction) {
      throw new NotFoundException('Failed transaction not found');
    }
    
    // Process payment with same invoice
    const newTransaction = await this.processPayment(
      userId, 
      failedTransaction.invoiceId, 
      failedTransaction.metadata?.paymentMethodId
    );
    
    return newTransaction;
  }

  // Generate an invoice PDF (simulated)
  async generateInvoicePdf(invoiceId: string, userId: string): Promise<{ url: string }> {
    const invoice = await this.getInvoice(invoiceId, userId);
    
    // In a real application, this would generate a PDF and save it to storage
    const pdfUrl = `https://example.com/invoices/${invoice.invoiceNumber}.pdf`;
    
    return { url: pdfUrl };
  }

  // Feature access methods
  
  /**
   * Check if a user has access to a specific feature based on their subscription plan
   */
  async hasFeatureAccess(userId: string, featureName: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      return false;
    }
    
    const plan = await this.getPlanById(subscription.planId);
    const feature = plan.features.find(f => f.name === featureName);
    
    return feature?.included || false;
  }
  
  /**
   * Get the limit for a specific resource based on the user's subscription
   * Returns null if the resource is unlimited
   */
  async getResourceLimit(userId: string, resourceName: string): Promise<string | null> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new ForbiddenException('No active subscription found');
    }
    
    const plan = await this.getPlanById(subscription.planId);
    const feature = plan.features.find(f => f.name === resourceName);
    
    if (!feature?.included) {
      throw new ForbiddenException(`The current plan does not include ${resourceName}`);
    }
    
    return feature.limit || null; // null means unlimited
  }
  
  /**
   * Verify that an operation is within the user's plan limits
   */
  async verifyResourceLimit(userId: string, resourceName: string, requestedAmount: number = 1): Promise<boolean> {
    const limitStr = await this.getResourceLimit(userId, resourceName);
    
    // If limit is null, the resource is unlimited
    if (limitStr === null) {
      return true;
    }
    
    // Parse numeric limit
    const limit = this.parseResourceLimit(limitStr);
    if (limit === null) {
      return true; // Cannot determine limit, assume unlimited
    }
    
    // Initialize resource usage tracking for this user if it doesn't exist
    if (!this.resourceUsage[userId]) {
      this.resourceUsage[userId] = {};
    }
    
    // Get current usage
    let currentUsage = 0;
    switch (resourceName) {
      case 'Projects':
        currentUsage = this.resourceUsage[userId].projects || 0;
        break;
      case 'Storage':
        currentUsage = this.resourceUsage[userId].storage || 0;
        // If limit is in GB, convert current usage from bytes to GB
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
    
    // Check if the operation would exceed the limit
    return (currentUsage + requestedAmount) <= limit;
  }
  
  /**
   * Track resource usage for a user
   */
  async trackResourceUsage(userId: string, resource: string, amount: number): Promise<void> {
    // Initialize if not exists
    if (!this.resourceUsage[userId]) {
      this.resourceUsage[userId] = {};
    }
    
    // Update the appropriate resource
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
  
  /**
   * Get current resource usage for a user
   */
  async getUserResourceUsage(userId: string): Promise<ResourceUsage> {
    return this.resourceUsage[userId] || {};
  }
  
  /**
   * Get subscription features with usage information
   */
  async getSubscriptionFeatures(userId: string): Promise<SubscriptionFeatureDto[]> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }
    
    const plan = await this.getPlanById(subscription.planId);
    const usage = await this.getUserResourceUsage(userId);
    
    return plan.features.map(feature => {
      let currentUsage: number | null = null;
      
      // Get current usage if available
      switch (feature.name) {
        case 'Projects':
          currentUsage = usage.projects || 0;
          break;
        case 'Storage':
          currentUsage = usage.storage || 0;
          // Convert to GB if limit is in GB
          if (feature.limit?.includes('GB')) {
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
      
      // Calculate usage percentage if limit exists
      let usagePercentage: number | null = null;
      if (currentUsage !== null && feature.limit) {
        const limit = this.parseResourceLimit(feature.limit);
        if (limit !== null) {
          usagePercentage = Math.min(100, Math.round((currentUsage / limit) * 100));
        }
      }
      
      return {
        ...feature,
        currentUsage: currentUsage !== null ? currentUsage.toString() : null,
        usagePercentage
      };
    });
  }
  
  /**
   * Handle plan change grace period
   * When upgrading, give immediate access to new features
   * When downgrading, maintain access until end of billing period
   */
  async handlePlanChangeAccess(userId: string, oldPlanId: string, newPlanId: string): Promise<void> {
    const oldPlan = await this.getPlanById(oldPlanId);
    const newPlan = await this.getPlanById(newPlanId);
    
    // Determine if this is an upgrade or downgrade
    const isUpgrade = this.getPlanPriority(newPlan.type) > this.getPlanPriority(oldPlan.type);
    
    if (isUpgrade) {
      // For upgrades, no grace period needed - user gets immediate access
      return;
    } else {
      // For downgrades, we could implement grace period logic here
      // For now, we'll just let the change subscription method handle this
      // by setting autoRenew to false and creating a pending subscription
    }
  }
  
  /**
   * Handle resource cleanup when downgrading
   * This would be called before the downgrade takes effect
   */
  async handleDowngradeResourceCleanup(userId: string, oldPlanId: string, newPlanId: string): Promise<string[]> {
    const oldPlan = await this.getPlanById(oldPlanId);
    const newPlan = await this.getPlanById(newPlanId);
    const usage = await this.getUserResourceUsage(userId);
    
    const warnings: string[] = [];
    
    // Check each resource to see if current usage exceeds new plan limits
    for (const newFeature of newPlan.features) {
      if (!newFeature.included || !newFeature.limit) {
        continue; // Skip features that aren't included or don't have limits
      }
      
      const newLimit = this.parseResourceLimit(newFeature.limit);
      if (newLimit === null) {
        continue; // Skip if we can't parse the limit
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
          // Convert to GB if limit is in GB
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

  // Helper methods

  /**
   * Parse a resource limit string into a numeric value
   */
  private parseResourceLimit(limitStr: string): number | null {
    // Handle numeric limits
    if (/^\d+$/.test(limitStr)) {
      return parseInt(limitStr, 10);
    }
    
    // Handle storage limits like "10GB"
    if (/^(\d+)GB$/.test(limitStr)) {
      const match = limitStr.match(/^(\d+)GB$/);
      return match ? parseInt(match[1], 10) : null;
    }
    
    // Handle API request limits like "1000 requests/day"
    if (/^(\d+) requests\/day$/.test(limitStr)) {
      const match = limitStr.match(/^(\d+) requests\/day$/);
      return match ? parseInt(match[1], 10) : null;
    }
    
    return null; // Cannot parse the limit
  }
} 