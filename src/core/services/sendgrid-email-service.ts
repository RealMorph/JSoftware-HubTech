import { FirebaseAuthService, ExtendedUser } from '../firebase';

// Template IDs for different email types
export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  INVOICE_PAID = 'invoice_paid',
  CONTACT_FORM = 'contact_form'
}

// Log structure for sent emails
export interface EmailLog {
  id?: string;
  to: string;
  templateId: string;
  templateType: EmailTemplateType;
  userId?: string;
  data?: Record<string, any>;
  sentAt: number;
  status: 'queued' | 'sent' | 'failed';
  error?: string;
}

export class SendgridEmailService {
  private static instance: SendgridEmailService;
  private apiKey: string;
  private apiBaseUrl = 'https://api.sendgrid.com/v3';
  private defaultFromEmail: string;
  private defaultFromName: string;
  
  private authService: FirebaseAuthService;
  
  private constructor() {
    this.apiKey = process.env.REACT_APP_SENDGRID_API_KEY || '';
    this.defaultFromEmail = process.env.REACT_APP_SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
    this.defaultFromName = process.env.REACT_APP_SENDGRID_FROM_NAME || 'Your App Name';
    
    this.authService = FirebaseAuthService.getInstance();
    
    if (!this.apiKey) {
      console.warn('Sendgrid API key not found. Email functionality will not work.');
    }
  }
  
  public static getInstance(): SendgridEmailService {
    if (!SendgridEmailService.instance) {
      SendgridEmailService.instance = new SendgridEmailService();
    }
    return SendgridEmailService.instance;
  }
  
  /**
   * Send an email using a Sendgrid template
   * @param to Recipient email address
   * @param templateId Sendgrid template ID
   * @param templateType Email template type for logging
   * @param dynamicData Dynamic template data
   * @param userId Optional user ID for logging
   */
  public async sendTemplateEmail(
    to: string,
    templateId: string,
    templateType: EmailTemplateType,
    dynamicData: Record<string, any> = {},
    userId?: string
  ): Promise<EmailLog> {
    if (!this.apiKey) {
      throw new Error('Sendgrid API key not configured');
    }
    
    const emailLog: EmailLog = {
      to,
      templateId,
      templateType,
      userId,
      data: dynamicData,
      sentAt: Date.now(),
      status: 'queued'
    };
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              dynamic_template_data: dynamicData
            }
          ],
          from: {
            email: this.defaultFromEmail,
            name: this.defaultFromName
          },
          template_id: templateId
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error sending email');
      }
      
      // Update email log with success status
      emailLog.status = 'sent';
      
      // Save email log to storage/analytics if needed
      await this.logEmailSent(emailLog);
      
      return emailLog;
    } catch (error) {
      // Update email log with error information
      emailLog.status = 'failed';
      emailLog.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Save error log
      await this.logEmailSent(emailLog);
      
      throw error;
    }
  }
  
  /**
   * Send welcome email to new user
   * @param user User object
   */
  public async sendWelcomeEmail(user: ExtendedUser): Promise<EmailLog> {
    const templateId = process.env.REACT_APP_SENDGRID_WELCOME_TEMPLATE_ID || '';
    
    if (!templateId) {
      throw new Error('Welcome email template ID not configured');
    }
    
    return await this.sendTemplateEmail(
      user.email,
      templateId,
      EmailTemplateType.WELCOME,
      {
        first_name: user.displayName?.split(' ')[0] || 'there',
        full_name: user.displayName || 'there',
        app_name: this.defaultFromName
      },
      user.uid
    );
  }
  
  /**
   * Send password reset email
   * @param email User's email
   * @param resetLink Password reset link
   */
  public async sendPasswordResetEmail(email: string, resetLink: string): Promise<EmailLog> {
    const templateId = process.env.REACT_APP_SENDGRID_PASSWORD_RESET_TEMPLATE_ID || '';
    
    if (!templateId) {
      throw new Error('Password reset email template ID not configured');
    }
    
    // Try to find user by email to include userId in logs
    let userId: string | undefined;
    try {
      const user = await this.authService.getUserByEmail(email);
      if (user) {
        userId = user.uid;
      }
    } catch (error) {
      // User not found, continue without userId
    }
    
    return await this.sendTemplateEmail(
      email,
      templateId,
      EmailTemplateType.PASSWORD_RESET,
      {
        reset_link: resetLink,
        app_name: this.defaultFromName
      },
      userId
    );
  }
  
  /**
   * Send email verification
   * @param user User object
   * @param verificationLink Email verification link
   */
  public async sendEmailVerification(user: ExtendedUser, verificationLink: string): Promise<EmailLog> {
    const templateId = process.env.REACT_APP_SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID || '';
    
    if (!templateId) {
      throw new Error('Email verification template ID not configured');
    }
    
    return await this.sendTemplateEmail(
      user.email,
      templateId,
      EmailTemplateType.EMAIL_VERIFICATION,
      {
        first_name: user.displayName?.split(' ')[0] || 'there',
        verification_link: verificationLink,
        app_name: this.defaultFromName
      },
      user.uid
    );
  }
  
  /**
   * Send subscription update notification
   * @param user User object
   * @param subscriptionDetails Subscription details
   */
  public async sendSubscriptionUpdateEmail(
    user: ExtendedUser, 
    subscriptionDetails: {
      status: string;
      planName: string;
      effectiveDate: string;
      nextBillingDate?: string;
    }
  ): Promise<EmailLog> {
    const templateId = process.env.REACT_APP_SENDGRID_SUBSCRIPTION_UPDATE_TEMPLATE_ID || '';
    
    if (!templateId) {
      throw new Error('Subscription update email template ID not configured');
    }
    
    return await this.sendTemplateEmail(
      user.email,
      templateId,
      EmailTemplateType.SUBSCRIPTION_UPDATED,
      {
        first_name: user.displayName?.split(' ')[0] || 'there',
        subscription_status: subscriptionDetails.status,
        plan_name: subscriptionDetails.planName,
        effective_date: subscriptionDetails.effectiveDate,
        next_billing_date: subscriptionDetails.nextBillingDate || 'N/A',
        app_name: this.defaultFromName
      },
      user.uid
    );
  }
  
  /**
   * Send invoice paid notification
   * @param user User object
   * @param invoiceDetails Invoice details
   */
  public async sendInvoicePaidEmail(
    user: ExtendedUser,
    invoiceDetails: {
      invoiceId: string;
      amount: number;
      currency: string;
      date: string;
      downloadUrl?: string;
    }
  ): Promise<EmailLog> {
    const templateId = process.env.REACT_APP_SENDGRID_INVOICE_PAID_TEMPLATE_ID || '';
    
    if (!templateId) {
      throw new Error('Invoice paid email template ID not configured');
    }
    
    return await this.sendTemplateEmail(
      user.email,
      templateId,
      EmailTemplateType.INVOICE_PAID,
      {
        first_name: user.displayName?.split(' ')[0] || 'there',
        invoice_id: invoiceDetails.invoiceId,
        amount: invoiceDetails.amount,
        currency: invoiceDetails.currency,
        date: invoiceDetails.date,
        download_url: invoiceDetails.downloadUrl || '#',
        app_name: this.defaultFromName
      },
      user.uid
    );
  }
  
  /**
   * Send contact form submission confirmation
   * @param name Sender's name
   * @param email Sender's email
   * @param message Message content
   */
  public async sendContactFormConfirmation(
    name: string,
    email: string,
    message: string
  ): Promise<EmailLog> {
    const templateId = process.env.REACT_APP_SENDGRID_CONTACT_FORM_TEMPLATE_ID || '';
    
    if (!templateId) {
      throw new Error('Contact form email template ID not configured');
    }
    
    return await this.sendTemplateEmail(
      email,
      templateId,
      EmailTemplateType.CONTACT_FORM,
      {
        name: name,
        message: message,
        app_name: this.defaultFromName
      }
    );
  }
  
  /**
   * Log email sending activity
   * @param emailLog Email log object
   */
  private async logEmailSent(emailLog: EmailLog): Promise<void> {
    // This could log to:
    // 1. Local storage for debugging
    // 2. Firebase/Firestore for production
    // 3. Analytics service
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Email log:', emailLog);
    }
    
    // Add actual implementation here based on your logging requirements
  }
} 