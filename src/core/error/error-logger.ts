/**
 * Error Logging Service
 * 
 * A service that logs errors to localStorage and provides utilities for 
 * storing, retrieving, and managing error logs.
 */

// Storage key for error logs
const ERROR_LOGS_KEY = 'app_error_logs';

// Maximum number of error logs to store
const MAX_ERROR_LOGS = 100;

/**
 * Error severity levels for logging
 */
export enum ErrorSeverity {
  DEBUG = 0,
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
  CRITICAL = 4,
}

/**
 * Context for error logging with additional metadata
 */
export interface ErrorContext {
  severity: ErrorSeverity;
  errorCategory?: string;
  statusCode?: number;
  userId?: string;
  sessionId?: string;
  url?: string;
  component?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Error log entry interface
export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  componentStack?: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  url?: string;
  userAgent?: string;
}

/**
 * Generate a unique ID for an error log
 */
const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Load error logs from localStorage
 */
export const loadErrorLogs = (): ErrorLog[] => {
  try {
    const storedLogs = localStorage.getItem(ERROR_LOGS_KEY);
    return storedLogs ? JSON.parse(storedLogs) : [];
  } catch (e) {
    console.error('Failed to load error logs:', e);
    return [];
  }
};

/**
 * Save error logs to localStorage
 */
export const saveErrorLogs = (logs: ErrorLog[]): void => {
  try {
    // Keep only the most recent logs up to MAX_ERROR_LOGS
    const trimmedLogs = logs.slice(-MAX_ERROR_LOGS);
    localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(trimmedLogs));
  } catch (e) {
    console.error('Failed to save error logs:', e);
  }
};

/**
 * Add a new error log
 */
export const logError = (
  error: Error | string,
  options: {
    severity?: ErrorSeverity;
    componentStack?: string;
    context?: Record<string, any>;
  } = {}
): ErrorLog => {
  const {
    severity = ErrorSeverity.ERROR,
    componentStack,
    context = {},
  } = options;

  // Create error log entry
  const errorLog: ErrorLog = {
    id: generateErrorId(),
    timestamp: Date.now(),
    message: typeof error === 'string' ? error : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    componentStack,
    severity,
    context: {
      ...context,
      // Add additional context information
      path: window.location.pathname,
    },
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Load existing logs, add new log, and save
  const logs = loadErrorLogs();
  logs.push(errorLog);
  saveErrorLogs(logs);

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    // Convert numeric enum to string for display
    const severityLabel = ErrorSeverity[severity] || 'ERROR';
    console.group(`[${severityLabel}] ${errorLog.message}`);
    console.error(error);
    if (componentStack) {
      console.error('Component Stack:', componentStack);
    }
    console.log('Error Context:', context);
    console.log('Error ID:', errorLog.id);
    console.groupEnd();
  }

  return errorLog;
};

/**
 * Clear all error logs
 */
export const clearErrorLogs = (): void => {
  try {
    localStorage.removeItem(ERROR_LOGS_KEY);
  } catch (e) {
    console.error('Failed to clear error logs:', e);
  }
};

/**
 * Get error logs filtered by criteria
 */
export const getErrorLogs = (
  options: {
    severity?: ErrorSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): ErrorLog[] => {
  const {
    severity,
    startDate,
    endDate,
    limit = MAX_ERROR_LOGS,
  } = options;

  let logs = loadErrorLogs();

  // Apply filters
  if (severity) {
    logs = logs.filter(log => log.severity === severity);
  }

  if (startDate) {
    const startTime = startDate.getTime();
    logs = logs.filter(log => log.timestamp >= startTime);
  }

  if (endDate) {
    const endTime = endDate.getTime();
    logs = logs.filter(log => log.timestamp <= endTime);
  }

  // Apply limit and return most recent logs
  return logs.slice(-limit);
};

/**
 * Log an error to the console with context-based formatting
 */
export function logErrorToConsole(error: Error, context: ErrorContext): void {
  const { severity, errorCategory, component, statusCode } = context;
  
  // Create a label based on severity
  let label = 'ERROR';
  let consoleMethod = console.error;
  
  switch (severity) {
    case ErrorSeverity.DEBUG:
      label = 'DEBUG';
      consoleMethod = console.debug;
      break;
    case ErrorSeverity.INFO:
      label = 'INFO';
      consoleMethod = console.info;
      break;
    case ErrorSeverity.WARNING:
      label = 'WARNING';
      consoleMethod = console.warn;
      break;
    case ErrorSeverity.CRITICAL:
      label = 'CRITICAL';
      consoleMethod = console.error;
      break;
  }
  
  // Build formatted message
  const formattedContext = [
    errorCategory ? `Category: ${errorCategory}` : '',
    component ? `Component: ${component}` : '',
    statusCode ? `Status: ${statusCode}` : '',
  ].filter(Boolean).join(' | ');
  
  // Log with appropriate styling based on severity
  if (process.env.NODE_ENV !== 'production') {
    consoleMethod(
      `[${label}] ${formattedContext ? `(${formattedContext}) ` : ''}${error.message}`,
      {
        error,
        stack: error.stack,
        context,
      }
    );
  }
}

/**
 * Send error to analytics service
 */
export function sendErrorToAnalytics(error: Error, context: ErrorContext): void {
  // In a real implementation, this would send the error to your analytics service
  // Examples: Sentry, Google Analytics, custom API, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Mock implementation for now
    // This would typically be a call to your analytics service
    
    // For example with Sentry:
    // Sentry.captureException(error, {
    //   level: getSentryLevel(context.severity),
    //   tags: {
    //     errorCategory: context.errorCategory,
    //     component: context.component,
    //   },
    //   contexts: {
    //     error: {
    //       ...context.metadata,
    //     },
    //   },
    //   user: context.userId ? { id: context.userId } : undefined,
    // });
    
    // Or with Google Analytics:
    // gtag('event', 'exception', {
    //   description: error.message,
    //   fatal: context.severity >= ErrorSeverity.CRITICAL,
    //   errorCategory: context.errorCategory,
    // });
    
    console.log('Error would be sent to analytics in production:', {
      message: error.message,
      severity: context.severity,
      errorCategory: context.errorCategory,
      statusCode: context.statusCode,
      metadata: context.metadata,
    });
  }
}

// Default export for the entire logging module
export default {
  logError,
  getErrorLogs,
  clearErrorLogs,
  loadErrorLogs,
  saveErrorLogs,
};
