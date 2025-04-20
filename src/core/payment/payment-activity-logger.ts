import { WebSocketService, ActivityType } from '../firebase/websocket-service';

/**
 * Utility class for logging payment-related activities
 * This demonstrates how to integrate the activity logging system with the payment workflow
 */
export class PaymentActivityLogger {
  private static instance: PaymentActivityLogger;
  private webSocketService: WebSocketService;
  
  private constructor() {
    this.webSocketService = WebSocketService.getInstance();
  }
  
  public static getInstance(): PaymentActivityLogger {
    if (!PaymentActivityLogger.instance) {
      PaymentActivityLogger.instance = new PaymentActivityLogger();
    }
    return PaymentActivityLogger.instance;
  }
  
  /**
   * Log a payment received activity
   * @param paymentData The payment data to log
   */
  public logPaymentReceived(paymentData: {
    paymentId: string;
    amount: number;
    currency: string;
    customerId?: string;
    invoiceId?: string;
    method?: string;
  }): void {
    this.webSocketService.publishActivity({
      type: 'payment_received',
      entityType: 'payment',
      entityId: paymentData.paymentId,
      data: {
        ...paymentData,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Log a subscription updated activity
   * @param subscriptionData The subscription data to log
   */
  public logSubscriptionUpdated(subscriptionData: {
    subscriptionId: string;
    customerId: string;
    plan: string;
    status: string;
    nextBillingDate?: number;
  }): void {
    this.webSocketService.publishActivity({
      type: 'subscription_updated',
      entityType: 'subscription',
      entityId: subscriptionData.subscriptionId,
      data: {
        ...subscriptionData,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * Log a payment failed activity
   * @param paymentData The payment data to log
   */
  public logPaymentFailed(paymentData: {
    paymentId: string;
    amount: number;
    currency: string;
    customerId?: string;
    invoiceId?: string;
    method?: string;
    errorCode?: string;
    errorMessage?: string;
  }): void {
    this.webSocketService.publishActivity({
      type: 'payment_received', // Using same type but with failure info
      entityType: 'payment',
      entityId: paymentData.paymentId,
      data: {
        ...paymentData,
        status: 'failed',
        timestamp: Date.now()
      }
    });
  }
}

/**
 * Example usage:
 * 
 * // In a payment processing function
 * async function processPayment(paymentDetails) {
 *   try {
 *     // ... payment processing logic
 *     
 *     // If payment successful
 *     const paymentActivityLogger = PaymentActivityLogger.getInstance();
 *     paymentActivityLogger.logPaymentReceived({
 *       paymentId: payment.id,
 *       amount: payment.amount,
 *       currency: payment.currency,
 *       customerId: payment.customerId,
 *       invoiceId: payment.invoiceId,
 *       method: payment.paymentMethod
 *     });
 *     
 *     return { success: true, payment };
 *   } catch (error) {
 *     // If payment failed
 *     const paymentActivityLogger = PaymentActivityLogger.getInstance();
 *     paymentActivityLogger.logPaymentFailed({
 *       paymentId: temporaryId,
 *       amount: paymentDetails.amount,
 *       currency: paymentDetails.currency,
 *       customerId: paymentDetails.customerId,
 *       errorCode: error.code,
 *       errorMessage: error.message
 *     });
 *     
 *     return { success: false, error };
 *   }
 * }
 */ 