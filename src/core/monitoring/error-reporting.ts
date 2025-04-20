// Using require instead of import to avoid TypeScript issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sentry = require('@sentry/react');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { BrowserTracing } = require('@sentry/tracing');

/**
 * Error reporting and monitoring module
 * 
 * This module handles application-wide error reporting, following
 * our modular architecture principles.
 */

export interface ErrorReportingConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  enabled?: boolean;
  beforeSend?: (event: any) => any | null;
}

/**
 * Initialize error reporting with Sentry
 * 
 * @example
 * initErrorReporting({
 *   dsn: process.env.VITE_SENTRY_DSN,
 *   environment: process.env.VITE_APP_ENV,
 *   enabled: process.env.VITE_ENABLE_ERROR_REPORTING === 'true'
 * });
 */
export const initErrorReporting = (config: ErrorReportingConfig): void => {
  const { dsn, environment, release, tracesSampleRate = 0.1, enabled = true, beforeSend } = config;

  if (!dsn || !enabled) {
    console.info('Error reporting is disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [new BrowserTracing()],
    tracesSampleRate,
    beforeSend: (event: any) => {
      // Don't report errors from local development
      if (environment === 'development' && !process.env.VITE_FORCE_ERROR_REPORTING) {
        return null;
      }
      
      // Apply custom filtering if provided
      if (beforeSend) {
        return beforeSend(event);
      }
      
      return event;
    },
  });
};

/**
 * Set user context for error reporting
 */
export const setErrorReportingUser = (user: { id: string; email?: string; username?: string }): void => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Set extra context data for error reporting
 */
export const setErrorReportingContext = (key: string, data: Record<string, any>): void => {
  Sentry.setContext(key, data);
};

/**
 * Set tags for error filtering and organization
 */
export const setErrorReportingTags = (tags: Record<string, string>): void => {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
};

/**
 * Report an error manually
 */
export const reportError = (error: Error, context?: Record<string, any>): void => {
  if (context) {
    Sentry.withScope((scope: any) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Report a message manually
 */
export const reportMessage = (message: string, level: string = 'info'): void => {
  Sentry.captureMessage(message, level);
};

/**
 * Create a transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string): any => {
  return Sentry.startTransaction({ name, op });
};

/**
 * Higher-order component for monitoring component errors
 */
export const withErrorBoundary = Sentry.withErrorBoundary;

/**
 * Hook for reporting errors in component boundaries
 */
export const useErrorHandler = Sentry.useErrorBoundary; 