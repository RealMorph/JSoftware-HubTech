import { SubscriptionPlanDto, SubscriptionDto, BillingCycle, ChangeSubscriptionDto, CancelSubscriptionDto, InvoiceDto, PaymentTransactionDto, PaymentMethodDto, SubscriptionFeatureDto } from './dto';
export interface ResourceUsage {
    projects?: number;
    storage?: number;
    teamMembers?: number;
    apiRequests?: number;
}
export declare class SubscriptionService {
    private plans;
    private subscriptions;
    private invoices;
    private paymentTransactions;
    private paymentMethods;
    private resourceUsage;
    private initializeDefaultPlans;
    getPlans(): Promise<SubscriptionPlanDto[]>;
    getPlanById(planId: string): Promise<SubscriptionPlanDto>;
    getUserSubscription(userId: string): Promise<SubscriptionDto | null>;
    createSubscription(userId: string, planId: string, billingCycle?: BillingCycle): Promise<SubscriptionDto>;
    changeSubscription(userId: string, changeDto: ChangeSubscriptionDto): Promise<SubscriptionDto>;
    cancelSubscription(userId: string, cancelDto?: CancelSubscriptionDto): Promise<{
        message: string;
    }>;
    getSubscriptionHistory(userId: string): Promise<SubscriptionDto[]>;
    getUserInvoices(userId: string): Promise<InvoiceDto[]>;
    getInvoice(invoiceId: string, userId: string): Promise<InvoiceDto>;
    getUserPaymentTransactions(userId: string): Promise<PaymentTransactionDto[]>;
    private createInvoiceForSubscription;
    private calculateEndDate;
    private isPlanFree;
    private getPlanPriority;
    addPaymentMethod(userId: string, paymentMethodDto: PaymentMethodDto): Promise<PaymentMethodDto>;
    getUserPaymentMethods(userId: string): Promise<PaymentMethodDto[]>;
    getPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethodDto>;
    setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethodDto>;
    removePaymentMethod(userId: string, paymentMethodId: string): Promise<{
        message: string;
    }>;
    processPayment(userId: string, invoiceId: string, paymentMethodId?: string): Promise<PaymentTransactionDto>;
    private simulatePaymentProcessing;
    retryFailedPayment(userId: string, transactionId: string): Promise<PaymentTransactionDto>;
    generateInvoicePdf(invoiceId: string, userId: string): Promise<{
        url: string;
    }>;
    hasFeatureAccess(userId: string, featureName: string): Promise<boolean>;
    getResourceLimit(userId: string, resourceName: string): Promise<string | null>;
    verifyResourceLimit(userId: string, resourceName: string, requestedAmount?: number): Promise<boolean>;
    trackResourceUsage(userId: string, resource: string, amount: number): Promise<void>;
    getUserResourceUsage(userId: string): Promise<ResourceUsage>;
    getSubscriptionFeatures(userId: string): Promise<SubscriptionFeatureDto[]>;
    handlePlanChangeAccess(userId: string, oldPlanId: string, newPlanId: string): Promise<void>;
    handleDowngradeResourceCleanup(userId: string, oldPlanId: string, newPlanId: string): Promise<string[]>;
    private parseResourceLimit;
}
