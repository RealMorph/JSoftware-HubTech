import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  SendgridEmailService, 
  EmailTemplateType, 
  EmailLog,
  TelnyxSmsService,
  SmsTemplateType,
  SmsLog
} from '../services';

interface UseCommunicationReturn {
  sendEmail: {
    welcome: (userId: string) => Promise<EmailLog>;
    passwordReset: (email: string, resetLink: string) => Promise<EmailLog>;
    emailVerification: (userId: string, verificationLink: string) => Promise<EmailLog>;
    subscriptionUpdate: (
      userId: string, 
      details: {
        status: string;
        planName: string;
        effectiveDate: string;
        nextBillingDate?: string;
      }
    ) => Promise<EmailLog>;
    invoicePaid: (
      userId: string,
      details: {
        invoiceId: string;
        amount: number;
        currency: string;
        date: string;
        downloadUrl?: string;
      }
    ) => Promise<EmailLog>;
    contactForm: (name: string, email: string, message: string) => Promise<EmailLog>;
  };
  sendSms: {
    welcome: (userId: string, phoneNumber: string) => Promise<SmsLog>;
    verification: (phoneNumber: string, code: string, userId?: string) => Promise<SmsLog>;
    passwordReset: (phoneNumber: string, code: string, userId?: string) => Promise<SmsLog>;
    notification: (phoneNumber: string, message: string, userId?: string) => Promise<SmsLog>;
    orderConfirmation: (
      phoneNumber: string,
      details: {
        orderId: string;
        amount: number;
        currency: string;
        items: number;
      },
      userId?: string
    ) => Promise<SmsLog>;
  };
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for communication services (email and SMS)
 */
export const useCommunication = (): UseCommunicationReturn => {
  const { getUserById } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const emailService = SendgridEmailService.getInstance();
  const smsService = TelnyxSmsService.getInstance();
  
  // Email sending methods
  const sendWelcomeEmail = useCallback(async (userId: string): Promise<EmailLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await emailService.sendWelcomeEmail(user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending welcome email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);
  
  const sendPasswordResetEmail = useCallback(async (email: string, resetLink: string): Promise<EmailLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await emailService.sendPasswordResetEmail(email, resetLink);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending password reset email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const sendEmailVerification = useCallback(async (userId: string, verificationLink: string): Promise<EmailLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await emailService.sendEmailVerification(user, verificationLink);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending email verification';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);
  
  const sendSubscriptionUpdateEmail = useCallback(async (
    userId: string, 
    details: {
      status: string;
      planName: string;
      effectiveDate: string;
      nextBillingDate?: string;
    }
  ): Promise<EmailLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await emailService.sendSubscriptionUpdateEmail(user, details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending subscription update email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);
  
  const sendInvoicePaidEmail = useCallback(async (
    userId: string,
    details: {
      invoiceId: string;
      amount: number;
      currency: string;
      date: string;
      downloadUrl?: string;
    }
  ): Promise<EmailLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await emailService.sendInvoicePaidEmail(user, details);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending invoice paid email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);
  
  const sendContactFormEmail = useCallback(async (
    name: string, 
    email: string, 
    message: string
  ): Promise<EmailLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await emailService.sendContactFormConfirmation(name, email, message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending contact form email';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // SMS sending methods
  const sendWelcomeSms = useCallback(async (
    userId: string, 
    phoneNumber: string
  ): Promise<SmsLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      return await smsService.sendWelcomeSms(user, phoneNumber);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending welcome SMS';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getUserById]);
  
  const sendVerificationSms = useCallback(async (
    phoneNumber: string, 
    code: string, 
    userId?: string
  ): Promise<SmsLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await smsService.sendVerificationCode(phoneNumber, code, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending verification SMS';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const sendPasswordResetSms = useCallback(async (
    phoneNumber: string, 
    code: string, 
    userId?: string
  ): Promise<SmsLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await smsService.sendPasswordResetSms(phoneNumber, code, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending password reset SMS';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const sendNotificationSms = useCallback(async (
    phoneNumber: string, 
    message: string, 
    userId?: string
  ): Promise<SmsLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await smsService.sendNotificationSms(phoneNumber, message, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending notification SMS';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const sendOrderConfirmationSms = useCallback(async (
    phoneNumber: string,
    details: {
      orderId: string;
      amount: number;
      currency: string;
      items: number;
    },
    userId?: string
  ): Promise<SmsLog> => {
    try {
      setIsLoading(true);
      setError(null);
      
      return await smsService.sendOrderConfirmationSms(phoneNumber, details, userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error sending order confirmation SMS';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    sendEmail: {
      welcome: sendWelcomeEmail,
      passwordReset: sendPasswordResetEmail,
      emailVerification: sendEmailVerification,
      subscriptionUpdate: sendSubscriptionUpdateEmail,
      invoicePaid: sendInvoicePaidEmail,
      contactForm: sendContactFormEmail
    },
    sendSms: {
      welcome: sendWelcomeSms,
      verification: sendVerificationSms,
      passwordReset: sendPasswordResetSms,
      notification: sendNotificationSms,
      orderConfirmation: sendOrderConfirmationSms
    },
    isLoading,
    error
  };
}; 