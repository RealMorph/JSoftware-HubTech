import { initErrorReporting, setErrorReportingUser } from './error-reporting';
import { initAnalytics, identifyUser } from './analytics';

/**
 * Monitoring module that initializes all monitoring systems
 * 
 * This module follows our modular architecture principles by providing
 * a unified interface for monitoring initialization.
 */

interface InitMonitoringOptions {
  errorReporting?: {
    dsn: string;
    environment: string;
    release?: string;
    enabled?: boolean;
  };
  analytics?: {
    apiKey: string;
    host?: string;
    enabled?: boolean;
  };
}

/**
 * Initialize all monitoring systems
 * 
 * @example
 * // In your application entry point:
 * initMonitoring({
 *   errorReporting: {
 *     dsn: process.env.VITE_SENTRY_DSN,
 *     environment: process.env.VITE_APP_ENV,
 *     release: process.env.VITE_APP_VERSION,
 *     enabled: process.env.VITE_ENABLE_ERROR_REPORTING === 'true'
 *   },
 *   analytics: {
 *     apiKey: process.env.VITE_POSTHOG_API_KEY,
 *     host: process.env.VITE_POSTHOG_HOST,
 *     enabled: process.env.VITE_ENABLE_ANALYTICS === 'true'
 *   }
 * });
 */
export const initMonitoring = (options: InitMonitoringOptions): void => {
  const { errorReporting, analytics } = options;

  // Initialize error reporting
  if (errorReporting) {
    initErrorReporting({
      dsn: errorReporting.dsn,
      environment: errorReporting.environment,
      release: errorReporting.release,
      enabled: errorReporting.enabled
    });
  }

  // Initialize analytics
  if (analytics) {
    initAnalytics({
      apiKey: analytics.apiKey,
      host: analytics.host,
      enabled: analytics.enabled
    });
  }
};

/**
 * Set user information across all monitoring systems
 */
export const setMonitoringUser = (user: { id: string; email?: string; username?: string }): void => {
  if (!user) {
    return;
  }

  // Set user for error reporting
  setErrorReportingUser(user);

  // Set user for analytics
  identifyUser(user.id, {
    email: user.email,
    username: user.username
  });
};

// Re-export all individual monitoring tools
export * from './error-reporting';
export * from './analytics'; 