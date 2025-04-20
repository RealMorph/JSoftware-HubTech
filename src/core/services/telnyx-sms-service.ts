import { FirebaseAuthService, ExtendedUser } from '../firebase';

// SMS message types
export enum SmsTemplateType {
  WELCOME = 'welcome',
  AUTHENTICATION = 'authentication',
  PASSWORD_RESET = 'password_reset',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  ORDER_CONFIRMATION = 'order_confirmation'
}

// Log structure for sent SMS
export interface SmsLog {
  id?: string;
  to: string;
  templateType: SmsTemplateType;
  message: string;
  userId?: string;
  data?: Record<string, any>;
  sentAt: number;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  messageId?: string;
  error?: string;
}

export class TelnyxSmsService {
  private static instance: TelnyxSmsService;
  private apiKey: string;
  private apiBaseUrl = 'https://api.telnyx.com/v2';
  private defaultFromNumber: string;
  private defaultMessageProfile: string;
  
  private authService: FirebaseAuthService;
  
  private constructor() {
    this.apiKey = process.env.REACT_APP_TELNYX_API_KEY || '';
    this.defaultFromNumber = process.env.REACT_APP_TELNYX_FROM_NUMBER || '';
    this.defaultMessageProfile = process.env.REACT_APP_TELNYX_MESSAGING_PROFILE_ID || '';
    
    this.authService = FirebaseAuthService.getInstance();
    
    if (!this.apiKey) {
      console.warn('Telnyx API key not found. SMS functionality will not work.');
    }
    
    if (!this.defaultFromNumber) {
      console.warn('Telnyx from number not found. SMS functionality will not work.');
    }
  }
  
  public static getInstance(): TelnyxSmsService {
    if (!TelnyxSmsService.instance) {
      TelnyxSmsService.instance = new TelnyxSmsService();
    }
    return TelnyxSmsService.instance;
  }
  
  /**
   * Format phone number to E.164 format
   * @param phoneNumber Phone number to format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Handle US numbers (assume US if no country code)
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already has a country code (starts with +)
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // If it has a country code without + (starts with 1)
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // Return as is if we can't determine the format
    return `+${digits}`;
  }
  
  /**
   * Send an SMS message
   * @param to Recipient phone number
   * @param message SMS message content
   * @param templateType SMS template type for logging
   * @param userId Optional user ID for logging
   * @param data Optional data for logging
   */
  public async sendSms(
    to: string,
    message: string,
    templateType: SmsTemplateType,
    userId?: string,
    data?: Record<string, any>
  ): Promise<SmsLog> {
    if (!this.apiKey || !this.defaultFromNumber) {
      throw new Error('Telnyx API key or from number not configured');
    }
    
    // Format the phone number to E.164 format
    const formattedTo = this.formatPhoneNumber(to);
    
    const smsLog: SmsLog = {
      to: formattedTo,
      templateType,
      message,
      userId,
      data,
      sentAt: Date.now(),
      status: 'queued'
    };
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from: this.defaultFromNumber,
          to: formattedTo,
          text: message,
          messaging_profile_id: this.defaultMessageProfile
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.detail || 'Error sending SMS');
      }
      
      const responseData = await response.json();
      
      // Update SMS log with success status and message ID
      smsLog.status = 'sent';
      smsLog.messageId = responseData.data.id;
      
      // Save SMS log to storage/analytics if needed
      await this.logSmsSent(smsLog);
      
      return smsLog;
    } catch (error) {
      // Update SMS log with error information
      smsLog.status = 'failed';
      smsLog.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Save error log
      await this.logSmsSent(smsLog);
      
      throw error;
    }
  }
  
  /**
   * Send a welcome SMS to a new user
   * @param user User object
   * @param phoneNumber User's phone number
   */
  public async sendWelcomeSms(user: ExtendedUser, phoneNumber: string): Promise<SmsLog> {
    const message = process.env.REACT_APP_TELNYX_WELCOME_MESSAGE || 
      `Welcome to ${process.env.REACT_APP_COMPANY_NAME || 'our app'}! We're glad you joined us.`;
    
    return await this.sendSms(
      phoneNumber,
      message,
      SmsTemplateType.WELCOME,
      user.uid,
      {
        userName: user.displayName || 'User'
      }
    );
  }
  
  /**
   * Send a verification code SMS
   * @param phoneNumber User's phone number
   * @param code Verification code
   * @param userId Optional user ID
   */
  public async sendVerificationCode(
    phoneNumber: string, 
    code: string,
    userId?: string
  ): Promise<SmsLog> {
    const message = process.env.REACT_APP_TELNYX_VERIFICATION_MESSAGE || 
      `Your verification code is: ${code}. This code will expire in 10 minutes.`;
    
    return await this.sendSms(
      phoneNumber,
      message,
      SmsTemplateType.AUTHENTICATION,
      userId,
      {
        code
      }
    );
  }
  
  /**
   * Send a password reset SMS
   * @param phoneNumber User's phone number
   * @param code Reset code or link
   * @param userId Optional user ID
   */
  public async sendPasswordResetSms(
    phoneNumber: string,
    code: string,
    userId?: string
  ): Promise<SmsLog> {
    const message = process.env.REACT_APP_TELNYX_PASSWORD_RESET_MESSAGE || 
      `Your password reset code is: ${code}. This code will expire in 10 minutes.`;
    
    return await this.sendSms(
      phoneNumber,
      message,
      SmsTemplateType.PASSWORD_RESET,
      userId,
      {
        code
      }
    );
  }
  
  /**
   * Send a notification SMS
   * @param phoneNumber User's phone number
   * @param notificationText Notification content
   * @param userId Optional user ID
   */
  public async sendNotificationSms(
    phoneNumber: string,
    notificationText: string,
    userId?: string
  ): Promise<SmsLog> {
    return await this.sendSms(
      phoneNumber,
      notificationText,
      SmsTemplateType.NOTIFICATION,
      userId
    );
  }
  
  /**
   * Send an order confirmation SMS
   * @param phoneNumber User's phone number
   * @param orderDetails Order details
   * @param userId Optional user ID
   */
  public async sendOrderConfirmationSms(
    phoneNumber: string,
    orderDetails: {
      orderId: string;
      amount: number;
      currency: string;
      items: number;
    },
    userId?: string
  ): Promise<SmsLog> {
    const message = `Thank you for your order #${orderDetails.orderId}. Your purchase of ${orderDetails.items} item(s) for ${orderDetails.currency}${orderDetails.amount} has been confirmed.`;
    
    return await this.sendSms(
      phoneNumber,
      message,
      SmsTemplateType.ORDER_CONFIRMATION,
      userId,
      orderDetails
    );
  }
  
  /**
   * Log SMS sending activity
   * @param smsLog SMS log object
   */
  private async logSmsSent(smsLog: SmsLog): Promise<void> {
    // This could log to:
    // 1. Local storage for debugging
    // 2. Firebase/Firestore for production
    // 3. Analytics service
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('SMS log:', smsLog);
    }
    
    // Add actual implementation here based on your logging requirements
  }
} 