import { FirebaseAuthService } from './firebase-auth-service';
import { FirestoreService } from './firebase-db-service';
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  planId: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface InvoiceItem {
  id: string;
  amount: number;
  description: string;
  date: number;
  status: 'paid' | 'open' | 'void' | 'draft';
  pdfUrl?: string;
}

export class StripePaymentService {
  private static instance: StripePaymentService;
  private readonly SUBSCRIPTIONS_COLLECTION = 'subscriptions';
  private readonly CUSTOMERS_COLLECTION = 'customers';
  private readonly PAYMENT_METHODS_COLLECTION = 'payment_methods';
  private readonly PLANS_COLLECTION = 'plans';
  private readonly INVOICES_COLLECTION = 'invoices';
  
  private firestoreService: FirestoreService;
  private authService: FirebaseAuthService;
  private functions = getFunctions();
  
  private constructor() {
    this.firestoreService = FirestoreService.getInstance();
    this.authService = FirebaseAuthService.getInstance();
  }
  
  public static getInstance(): StripePaymentService {
    if (!StripePaymentService.instance) {
      StripePaymentService.instance = new StripePaymentService();
    }
    return StripePaymentService.instance;
  }
  
  /**
   * Get all available subscription plans
   */
  public async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await this.firestoreService.getAllDocuments<SubscriptionPlan>(this.PLANS_COLLECTION);
  }
  
  /**
   * Get the current user's subscription
   */
  public async getCurrentSubscription(): Promise<CustomerSubscription | null> {
    const user = this.authService.getCurrentUser();
    if (!user) return null;
    
    const subscriptions = await this.firestoreService.queryDocuments<CustomerSubscription>(
      this.SUBSCRIPTIONS_COLLECTION,
      [this.firestoreService.whereEqual('userId', user.uid)]
    );
    
    return subscriptions.length > 0 ? subscriptions[0] : null;
  }
  
  /**
   * Get the current user's payment methods
   */
  public async getPaymentMethods(): Promise<PaymentMethod[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return [];
    
    // Call Firebase function to retrieve from Stripe
    const getPaymentMethodsFunction = httpsCallable(this.functions, 'getPaymentMethods');
    const result = await getPaymentMethodsFunction();
    
    return (result.data as any).paymentMethods || [];
  }
  
  /**
   * Get invoices for the current user
   */
  public async getInvoices(): Promise<InvoiceItem[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return [];
    
    // Call Firebase function to retrieve from Stripe
    const getInvoicesFunction = httpsCallable(this.functions, 'getInvoices');
    const result = await getInvoicesFunction();
    
    return (result.data as any).invoices || [];
  }
  
  /**
   * Create a checkout session for subscription
   * @param planId The subscription plan ID
   * @param successUrl URL to redirect on success
   * @param cancelUrl URL to redirect on cancel
   */
  public async createCheckoutSession(
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const createCheckoutSession = httpsCallable(
      this.functions, 
      'createCheckoutSession'
    );
    
    const result = await createCheckoutSession({
      planId,
      successUrl,
      cancelUrl,
      userId: user.uid,
      email: user.email
    });
    
    return (result.data as any).sessionId;
  }
  
  /**
   * Create a customer portal session for managing subscription
   * @param returnUrl URL to return to after closing the portal
   */
  public async createCustomerPortalSession(returnUrl: string): Promise<string> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const createPortalSession = httpsCallable(
      this.functions, 
      'createCustomerPortalSession'
    );
    
    const result = await createPortalSession({
      returnUrl
    });
    
    return (result.data as any).url;
  }
  
  /**
   * Cancel the current subscription at the end of the billing period
   */
  public async cancelSubscription(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const cancelSubscriptionFunction = httpsCallable(
      this.functions, 
      'cancelSubscription'
    );
    
    await cancelSubscriptionFunction();
  }
  
  /**
   * Resume a canceled subscription
   */
  public async resumeSubscription(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const resumeSubscriptionFunction = httpsCallable(
      this.functions, 
      'resumeSubscription'
    );
    
    await resumeSubscriptionFunction();
  }
  
  /**
   * Add a new payment method
   * @returns Stripe setup intent client secret
   */
  public async setupNewPaymentMethod(): Promise<string> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const setupPaymentMethod = httpsCallable(
      this.functions, 
      'setupPaymentMethod'
    );
    
    const result = await setupPaymentMethod();
    
    return (result.data as any).clientSecret;
  }
  
  /**
   * Delete a payment method
   * @param paymentMethodId The payment method ID to delete
   */
  public async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const deletePaymentMethodFunction = httpsCallable(
      this.functions, 
      'deletePaymentMethod'
    );
    
    await deletePaymentMethodFunction({ paymentMethodId });
  }
  
  /**
   * Set a payment method as default
   * @param paymentMethodId The payment method ID to set as default
   */
  public async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const setDefaultPaymentMethodFunction = httpsCallable(
      this.functions, 
      'setDefaultPaymentMethod'
    );
    
    await setDefaultPaymentMethodFunction({ paymentMethodId });
  }
} 