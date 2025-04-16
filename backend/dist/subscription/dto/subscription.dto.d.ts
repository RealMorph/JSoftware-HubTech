export declare enum SubscriptionPlanType {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    ENTERPRISE = "enterprise"
}
export declare enum BillingCycle {
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    ANNUAL = "annual"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELED = "canceled",
    EXPIRED = "expired",
    PENDING = "pending",
    PAST_DUE = "past_due",
    TRIAL = "trial"
}
export declare class PlanFeatureDto {
    name: string;
    description: string;
    included: boolean;
    limit?: string;
}
export declare class SubscriptionPlanDto {
    id: string;
    type: SubscriptionPlanType;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    setupFee?: number;
    features: PlanFeatureDto[];
    isPopular: boolean;
    isAvailable: boolean;
}
export declare class SubscriptionDto {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    billingCycle: BillingCycle;
    startDate: Date;
    endDate: Date;
    canceledAt?: Date;
    trialEndDate?: Date;
    autoRenew: boolean;
}
export declare class ChangeSubscriptionDto {
    planId: string;
    billingCycle?: BillingCycle;
}
export declare class CancelSubscriptionDto {
    immediateEffect?: boolean;
}
export declare class SubscriptionFeatureDto extends PlanFeatureDto {
    currentUsage: string | null;
    usagePercentage: number | null;
}
