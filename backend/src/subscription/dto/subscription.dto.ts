import { IsString, IsNotEmpty, IsEnum, IsNumber, IsBoolean, IsDate, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SubscriptionPlanType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  PAST_DUE = 'past_due',
  TRIAL = 'trial'
}

export class PlanFeatureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  included: boolean;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class SubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(SubscriptionPlanType)
  @IsNotEmpty()
  type: SubscriptionPlanType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @IsNumber()
  @Min(0)
  annualPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanFeatureDto)
  features: PlanFeatureDto[];

  @IsBoolean()
  isPopular: boolean;

  @IsBoolean()
  isAvailable: boolean;
}

export class SubscriptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  canceledAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  trialEndDate?: Date;

  @IsBoolean()
  autoRenew: boolean;
}

export class ChangeSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;
}

export class CancelSubscriptionDto {
  @IsBoolean()
  @IsOptional()
  immediateEffect?: boolean;
}

export class SubscriptionFeatureDto extends PlanFeatureDto {
  // Additional fields for tracking usage
  currentUsage: string | null;
  usagePercentage: number | null;
} 