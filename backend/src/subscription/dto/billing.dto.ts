import { IsString, IsNotEmpty, IsEnum, IsNumber, IsBoolean, IsDate, IsOptional, IsISO8601, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled',
  VOID = 'void'
}

export class PaymentMethodDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  type: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsBoolean()
  isDefault: boolean;
}

export class InvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  planId?: string;
}

export class InvoiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsISO8601()
  @Type(() => Date)
  date: Date;

  @IsISO8601()
  @Type(() => Date)
  dueDate: Date;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  tax: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsObject()
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class PaymentTransactionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsISO8601()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 