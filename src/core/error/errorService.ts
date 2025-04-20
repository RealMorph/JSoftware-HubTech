/**
 * ErrorService - Central error handling and monitoring service
 * 
 * This service provides:
 * 1. Error capture and logging
 * 2. Error context enrichment
 * 3. Integration with monitoring services
 * 4. Standardized error categorization
 */

import { ErrorContext, ErrorSeverity, logErrorToConsole, sendErrorToAnalytics } from './error-logger';

// Environment configuration
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * Extended Error class that includes additional context
 */
export class ErrorWithContext extends Error {
  context: Record<string, any>;
  
  constructor(message: string, context: Record<string, any> = {}) {
    super(message);
    this.name = 'ErrorWithContext';
    this.context = context;
    
    // Maintains proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorWithContext);
    }
  }
}

/**
 * Possible error categories for better error handling and reporting
 */
export enum ErrorCategory {
  // Network-related errors
  NETWORK = 'network',
  API = 'api',
  TIMEOUT = 'timeout',
  OFFLINE = 'offline',
  
  // Auth-related errors
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  
  // Data-related errors
  VALIDATION = 'validation',
  PARSING = 'parsing',
  
  // Component-related errors
  RENDERING = 'rendering',
  STATE = 'state',
  PROPS = 'props',
  
  // Application errors
  BUSINESS_LOGIC = 'business_logic',
  UNEXPECTED = 'unexpected',
  
  // External service errors
  THIRD_PARTY = 'third_party'
}

/**
 * Extended error with metadata for better error tracking and handling
 */
export interface CategorizedError extends Error {
  category: ErrorCategory;
  statusCode?: number;
  isFatal?: boolean;
  metadata?: Record<string, unknown>;
  originalError?: unknown;
}

/**
 * Options for creating a categorized error
 */
export interface CategorizeErrorOptions {
  message?: string;
  statusCode?: number;
  isFatal?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Factory function to create a categorized error
 */
export function createCategorizedError(
  category: ErrorCategory,
  options: CategorizeErrorOptions = {},
  originalError?: unknown,
): CategorizedError {
  const { message, statusCode, isFatal = false, metadata = {} } = options;
  
  // Create a new Error object
  const error = new Error(message || 'An error occurred') as CategorizedError;
  
  // Add category and metadata
  error.category = category;
  error.statusCode = statusCode;
  error.isFatal = isFatal;
  error.metadata = metadata;
  error.originalError = originalError;
  
  // Preserve the original stack trace if available
  if (originalError instanceof Error && originalError.stack) {
    error.stack = originalError.stack;
  }
  
  return error;
}

/**
 * Categorize an unknown error into a CategorizedError
 */
export function categorizeError(error: unknown): CategorizedError {
  // If it's already a categorized error, return it
  if (error && typeof error === 'object' && 'category' in error && error instanceof Error) {
    return error as CategorizedError;
  }
  
  // For Error instances, categorize based on message and type
  if (error instanceof Error) {
    // Check for network errors
    if (error.name === 'NetworkError' || error.message.includes('network') || error.message.includes('fetch')) {
      return createCategorizedError(ErrorCategory.NETWORK, { message: error.message }, error);
    }
    
    // Check for timeout errors
    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return createCategorizedError(ErrorCategory.TIMEOUT, { message: error.message }, error);
    }
    
    // Check for auth errors
    if (error.message.includes('authentication') || error.message.includes('unauthorized') || 
        error.message.includes('403') || error.message.includes('401')) {
      return createCategorizedError(ErrorCategory.AUTHENTICATION, { message: error.message }, error);
    }
    
    // Default to unexpected error with the original error message
    return createCategorizedError(ErrorCategory.UNEXPECTED, { message: error.message }, error);
  }
  
  // For string errors, create an unexpected error with the string as message
  if (typeof error === 'string') {
    return createCategorizedError(ErrorCategory.UNEXPECTED, { message: error });
  }
  
  // For API errors with status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as { status: number; statusText?: string; message?: string };
    const errorMessage = apiError.message || apiError.statusText || `API Error: ${apiError.status}`;
    
    if (apiError.status === 401 || apiError.status === 403) {
      return createCategorizedError(ErrorCategory.AUTHENTICATION, { 
        message: errorMessage, 
        statusCode: apiError.status 
      }, error);
    }
    
    if (apiError.status === 400 || apiError.status === 422) {
      return createCategorizedError(ErrorCategory.VALIDATION, { 
        message: errorMessage, 
        statusCode: apiError.status 
      }, error);
    }
    
    if (apiError.status >= 500) {
      return createCategorizedError(ErrorCategory.API, { 
        message: errorMessage, 
        statusCode: apiError.status,
        isFatal: true
      }, error);
    }
    
    return createCategorizedError(ErrorCategory.API, { 
      message: errorMessage, 
      statusCode: apiError.status 
    }, error);
  }
  
  // Default case for unknown errors
  return createCategorizedError(ErrorCategory.UNEXPECTED, { 
    message: 'An unknown error occurred',
    metadata: { rawError: JSON.stringify(error) }
  }, error);
}

/**
 * Log a categorized error with optional context
 */
export function logError(error: CategorizedError, context: Partial<ErrorContext> = {}): void {
  // Determine severity based on error category
  let severity = ErrorSeverity.ERROR;
  
  if (error.isFatal) {
    severity = ErrorSeverity.CRITICAL;
  } else if (error.category === ErrorCategory.NETWORK || 
             error.category === ErrorCategory.TIMEOUT ||
             error.category === ErrorCategory.OFFLINE) {
    severity = ErrorSeverity.WARNING;
  } else if (error.category === ErrorCategory.VALIDATION) {
    severity = ErrorSeverity.INFO;
  }
  
  // Create error context with metadata
  const errorContext: ErrorContext = {
    ...context,
    severity,
    errorCategory: error.category,
    statusCode: error.statusCode,
    metadata: error.metadata
  };
  
  // Log to console
  logErrorToConsole(error, errorContext);
  
  // Send to analytics if it's not just a validation or minor UI error
  if (severity >= ErrorSeverity.ERROR) {
    sendErrorToAnalytics(error, errorContext);
  }
}

/**
 * Utility to check if an error belongs to a specific category
 */
export function isErrorCategory(error: unknown, category: ErrorCategory): boolean {
  if (!error) return false;
  
  // If already categorized, check directly
  if (typeof error === 'object' && 'category' in error) {
    return (error as { category: ErrorCategory }).category === category;
  }
  
  // Otherwise, categorize and check
  const categorized = categorizeError(error);
  return categorized.category === category;
}

/**
 * Wrap an async function with error handling that categorizes errors
 */
export function withAsyncErrorHandling<T>(
  fn: () => Promise<T>,
  onError?: (error: CategorizedError) => void
): Promise<T> {
  return fn().catch((error: unknown) => {
    const categorized = categorizeError(error);
    
    // Log the error
    logError(categorized);
    
    // Call the error handler if provided
    if (onError) {
      onError(categorized);
    }
    
    // Re-throw the categorized error
    throw categorized;
  });
}

/**
 * Create an error context for use with the ErrorContext
 */
export function createErrorContext(error: CategorizedError): {
  message: string;
  category: ErrorCategory;
  isFatal: boolean;
} {
  return {
    message: error.message,
    category: error.category,
    isFatal: error.isFatal || false,
  };
}

/**
 * Captures error information and sends it to appropriate monitoring services
 */
export function captureError(
  error: Error | ErrorWithContext | any,
  additionalContext: Record<string, any> = {}
): void {
  // Combine contexts if available
  const context = {
    ...additionalContext,
    ...(error instanceof ErrorWithContext ? error.context : {}),
    timestamp: new Date().toISOString(),
    category: categorizeError(error),
  };
  
  // Always log to console in development
  if (IS_DEVELOPMENT) {
    console.error('[ErrorService]', error, context);
  }
  
  // Store in local error history (for development overlay)
  storeErrorInHistory(error, context);
  
  // Send to monitoring service
  sendToMonitoringService(error, context);
}

/**
 * Stores errors in local history for the dev tools and error dashboard
 */
function storeErrorInHistory(
  error: Error | any,
  context: Record<string, any>
): void {
  // Get the existing error history from localStorage or initialize empty array
  const errorHistory = getErrorHistory();
  
  // Add new error (limit to 50 most recent)
  errorHistory.unshift({
    message: error.message || String(error),
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Keep only the 50 most recent errors
  const trimmedHistory = errorHistory.slice(0, 50);
  
  // Save back to localStorage
  try {
    localStorage.setItem('error_history', JSON.stringify(trimmedHistory));
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Gets the error history from localStorage
 */
export function getErrorHistory(): Array<{
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
}> {
  try {
    const storedHistory = localStorage.getItem('error_history');
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Clears the error history
 */
export function clearErrorHistory(): void {
  try {
    localStorage.removeItem('error_history');
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Sends error information to configured monitoring services
 * This is a stub that would normally send to services like Sentry, LogRocket, etc.
 */
function sendToMonitoringService(
  error: Error | any,
  context: Record<string, any>
): void {
  // This would normally integrate with external monitoring services
  // For example, if using Sentry:
  // 
  // if (Sentry && Sentry.captureException) {
  //   Sentry.setContext('error_context', context);
  //   Sentry.captureException(error);
  // }
  
  // Mock implementation for now
  if (window.__MONITORING_SERVICE__) {
    try {
      window.__MONITORING_SERVICE__.captureError(error, context);
    } catch (e) {
      // Ensure monitoring errors don't cause additional issues
      console.error('[ErrorService] Failed to send to monitoring', e);
    }
  }
}

// Type declaration for window with monitoring service
declare global {
  interface Window {
    __MONITORING_SERVICE__?: {
      captureError: (error: Error | any, context: Record<string, any>) => void;
    };
  }
} 