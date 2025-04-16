import { Controller, Get, Post, Patch, Delete, Param, Body, Query, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SubscriptionService, ResourceUsage } from './subscription.service';
import { 
  SubscriptionPlanDto, 
  SubscriptionDto, 
  ChangeSubscriptionDto,
  CancelSubscriptionDto,
  BillingCycle,
  InvoiceDto,
  PaymentTransactionDto,
  PaymentMethodDto,
  SubscriptionFeatureDto
} from './dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Subscription Plans
  @Get('plans')
  async getPlans(): Promise<SubscriptionPlanDto[]> {
    return this.subscriptionService.getPlans();
  }

  @Get('plans/:planId')
  async getPlanById(@Param('planId') planId: string): Promise<SubscriptionPlanDto> {
    return this.subscriptionService.getPlanById(planId);
  }

  // User Subscriptions
  @Get('user/:userId')
  async getUserSubscription(@Param('userId') userId: string): Promise<SubscriptionDto | { message: string }> {
    const subscription = await this.subscriptionService.getUserSubscription(userId);
    if (!subscription) {
      return { message: 'User has no active subscription' };
    }
    return subscription;
  }

  @Post('user/:userId/subscribe')
  async createSubscription(
    @Param('userId') userId: string, 
    @Body('planId') planId: string,
    @Body('billingCycle') billingCycle?: BillingCycle
  ): Promise<SubscriptionDto> {
    return this.subscriptionService.createSubscription(userId, planId, billingCycle);
  }

  @Patch('user/:userId/change')
  async changeSubscription(
    @Param('userId') userId: string,
    @Body() changeDto: ChangeSubscriptionDto
  ): Promise<SubscriptionDto> {
    return this.subscriptionService.changeSubscription(userId, changeDto);
  }

  @Delete('user/:userId/cancel')
  async cancelSubscription(
    @Param('userId') userId: string,
    @Body() cancelDto?: CancelSubscriptionDto
  ): Promise<{ message: string }> {
    return this.subscriptionService.cancelSubscription(userId, cancelDto);
  }

  @Get('user/:userId/history')
  async getSubscriptionHistory(@Param('userId') userId: string): Promise<SubscriptionDto[]> {
    return this.subscriptionService.getSubscriptionHistory(userId);
  }

  // Billing and Invoices
  @Get('user/:userId/invoices')
  async getUserInvoices(@Param('userId') userId: string): Promise<InvoiceDto[]> {
    return this.subscriptionService.getUserInvoices(userId);
  }

  @Get('user/:userId/invoices/:invoiceId')
  async getInvoice(
    @Param('userId') userId: string,
    @Param('invoiceId') invoiceId: string
  ): Promise<InvoiceDto> {
    return this.subscriptionService.getInvoice(invoiceId, userId);
  }

  @Get('user/:userId/transactions')
  async getUserPaymentTransactions(@Param('userId') userId: string): Promise<PaymentTransactionDto[]> {
    return this.subscriptionService.getUserPaymentTransactions(userId);
  }

  // Payment Method Endpoints

  // Add a payment method
  @Post('payment-methods/:userId')
  async addPaymentMethod(
    @Param('userId') userId: string,
    @Body() paymentMethodDto: PaymentMethodDto
  ): Promise<PaymentMethodDto> {
    return this.subscriptionService.addPaymentMethod(userId, paymentMethodDto);
  }

  // Get all payment methods for a user
  @Get('payment-methods/:userId')
  async getUserPaymentMethods(@Param('userId') userId: string): Promise<PaymentMethodDto[]> {
    return this.subscriptionService.getUserPaymentMethods(userId);
  }

  // Get a specific payment method
  @Get('payment-methods/:userId/:methodId')
  async getPaymentMethod(
    @Param('userId') userId: string,
    @Param('methodId') methodId: string
  ): Promise<PaymentMethodDto> {
    return this.subscriptionService.getPaymentMethod(userId, methodId);
  }

  // Set a payment method as default
  @Patch('payment-methods/:userId/:methodId/default')
  async setDefaultPaymentMethod(
    @Param('userId') userId: string,
    @Param('methodId') methodId: string
  ): Promise<PaymentMethodDto> {
    return this.subscriptionService.setDefaultPaymentMethod(userId, methodId);
  }

  // Remove a payment method
  @Delete('payment-methods/:userId/:methodId')
  async removePaymentMethod(
    @Param('userId') userId: string,
    @Param('methodId') methodId: string
  ): Promise<{ message: string }> {
    return this.subscriptionService.removePaymentMethod(userId, methodId);
  }

  // Process payment for an invoice
  @Post('process-payment/:userId/:invoiceId')
  async processPayment(
    @Param('userId') userId: string,
    @Param('invoiceId') invoiceId: string,
    @Body('paymentMethodId') paymentMethodId?: string
  ): Promise<PaymentTransactionDto> {
    return this.subscriptionService.processPayment(userId, invoiceId, paymentMethodId);
  }

  // Retry a failed payment
  @Post('retry-payment/:userId/:transactionId')
  async retryFailedPayment(
    @Param('userId') userId: string,
    @Param('transactionId') transactionId: string
  ): Promise<PaymentTransactionDto> {
    return this.subscriptionService.retryFailedPayment(userId, transactionId);
  }

  // Generate an invoice PDF
  @Get('invoice-pdf/:userId/:invoiceId')
  async generateInvoicePdf(
    @Param('userId') userId: string,
    @Param('invoiceId') invoiceId: string
  ): Promise<{ url: string }> {
    return this.subscriptionService.generateInvoicePdf(invoiceId, userId);
  }

  // Feature access and plan limits endpoints

  @Get('features/:userId')
  async getSubscriptionFeatures(@Param('userId') userId: string): Promise<SubscriptionFeatureDto[]> {
    return this.subscriptionService.getSubscriptionFeatures(userId);
  }

  @Get('user/:userId/feature-access/:featureName')
  async hasFeatureAccess(
    @Param('userId') userId: string,
    @Param('featureName') featureName: string
  ): Promise<{ hasAccess: boolean }> {
    const hasAccess = await this.subscriptionService.hasFeatureAccess(userId, featureName);
    return { hasAccess };
  }

  @Get('user/:userId/resource-limit/:resourceName')
  async getResourceLimit(
    @Param('userId') userId: string,
    @Param('resourceName') resourceName: string
  ): Promise<{ limit: string | null }> {
    const limit = await this.subscriptionService.getResourceLimit(userId, resourceName);
    return { limit };
  }

  @Post('user/:userId/verify-limit')
  async verifyResourceLimit(
    @Param('userId') userId: string,
    @Body('resourceName') resourceName: string,
    @Body('requestedAmount') requestedAmount?: number
  ): Promise<{ allowed: boolean }> {
    const allowed = await this.subscriptionService.verifyResourceLimit(
      userId,
      resourceName,
      requestedAmount
    );
    return { allowed };
  }

  @Get('user/:userId/resource-usage')
  async getUserResourceUsage(@Param('userId') userId: string): Promise<ResourceUsage> {
    return this.subscriptionService.getUserResourceUsage(userId);
  }

  @Post('user/:userId/track-usage')
  async trackResourceUsage(
    @Param('userId') userId: string,
    @Body('resource') resource: string,
    @Body('amount') amount: number
  ): Promise<{ success: boolean }> {
    await this.subscriptionService.trackResourceUsage(userId, resource, amount);
    return { success: true };
  }

  @Post('user/:userId/change-plan-preview')
  async previewPlanChange(
    @Param('userId') userId: string,
    @Body('newPlanId') newPlanId: string
  ): Promise<{ warnings: string[] }> {
    const currentSubscription = await this.subscriptionService.getUserSubscription(userId);
    
    if (!currentSubscription) {
      throw new NotFoundException('No active subscription found');
    }
    
    const warnings = await this.subscriptionService.handleDowngradeResourceCleanup(
      userId,
      currentSubscription.planId,
      newPlanId
    );
    
    return { warnings };
  }
} 