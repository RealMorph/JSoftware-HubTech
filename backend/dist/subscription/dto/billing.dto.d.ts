export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    PAYPAL = "paypal",
    BANK_TRANSFER = "bank_transfer",
    CRYPTO = "crypto"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare enum InvoiceStatus {
    DRAFT = "draft",
    OPEN = "open",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELED = "canceled",
    VOID = "void"
}
export declare class PaymentMethodDto {
    type: PaymentMethod;
    id: string;
    details?: Record<string, any>;
    isDefault: boolean;
}
export declare class InvoiceItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    planId?: string;
}
export declare class InvoiceDto {
    id: string;
    userId: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    date: Date;
    dueDate: Date;
    subtotal: number;
    tax: number;
    total: number;
    items: InvoiceItemDto[];
    notes?: string;
}
export declare class PaymentTransactionDto {
    id: string;
    userId: string;
    invoiceId?: string;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    date: Date;
    transactionId?: string;
    metadata?: Record<string, any>;
}
