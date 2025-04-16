import { SubscriptionService, ResourceUsage } from './subscription.service';
import { SubscriptionPlanDto, SubscriptionDto, ChangeSubscriptionDto, CancelSubscriptionDto, BillingCycle, InvoiceDto, PaymentTransactionDto, PaymentMethodDto, SubscriptionFeatureDto } from './dto';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getPlans(): Promise<SubscriptionPlanDto[]>;
    getPlanById(planId: string): Promise<SubscriptionPlanDto>;
    getUserSubscription(userId: string): Promise<SubscriptionDto | {
        message: string;
    }>;
    createSubscription(userId: string, planId: string, billingCycle?: BillingCycle): Promise<SubscriptionDto>;
    changeSubscription(userId: string, changeDto: ChangeSubscriptionDto): Promise<SubscriptionDto>;
    cancelSubscription(userId: string, cancelDto?: CancelSubscriptionDto): Promise<{
        message: string;
    }>;
    getSubscriptionHistory(userId: string): Promise<SubscriptionDto[]>;
    getUserInvoices(userId: string): Promise<InvoiceDto[]>;
    getInvoice(userId: string, invoiceId: string): Promise<InvoiceDto>;
    getUserPaymentTransactions(userId: string): Promise<PaymentTransactionDto[]>;
    addPaymentMethod(userId: string, paymentMethodDto: PaymentMethodDto): Promise<PaymentMethodDto>;
    getUserPaymentMethods(userId: string): Promise<PaymentMethodDto[]>;
    getPaymentMethod(userId: string, methodId: string): Promise<PaymentMethodDto>;
    setDefaultPaymentMethod(userId: string, methodId: string): Promise<PaymentMethodDto>;
    removePaymentMethod(userId: string, methodId: string): Promise<{
        message: string;
    }>;
    processPayment(userId: string, invoiceId: string, paymentMethodId?: string): Promise<PaymentTransactionDto>;
    retryFailedPayment(userId: string, transactionId: string): Promise<PaymentTransactionDto>;
    generateInvoicePdf(userId: string, invoiceId: string): Promise<{
        url: string;
    }>;
    getSubscriptionFeatures(userId: string): Promise<SubscriptionFeatureDto[]>;
    hasFeatureAccess(userId: string, featureName: string): Promise<{
        hasAccess: boolean;
    }>;
    getResourceLimit(userId: string, resourceName: string): Promise<{
        limit: string | null;
    }>;
    verifyResourceLimit(userId: string, resourceName: string, requestedAmount?: number): Promise<{
        allowed: boolean;
    }>;
    getUserResourceUsage(userId: string): Promise<ResourceUsage>;
    trackResourceUsage(userId: string, resource: string, amount: number): Promise<{
        success: boolean;
    }>;
    previewPlanChange(userId: string, newPlanId: string): Promise<{
        warnings: string[];
    }>;
}
