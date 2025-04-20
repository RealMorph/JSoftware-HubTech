import posthog from 'posthog-js';

/**
 * Analytics tracking module
 * 
 * This module provides utilities for tracking user behavior while
 * respecting our modular architecture principles.
 */

export interface AnalyticsConfig {
  apiKey: string;
  host?: string;
  enabled?: boolean;
  capturePageView?: boolean;
  debug?: boolean;
}

/**
 * Initialize analytics tracking with PostHog
 * 
 * @example
 * initAnalytics({
 *   apiKey: process.env.VITE_POSTHOG_API_KEY,
 *   host: process.env.VITE_POSTHOG_HOST,
 *   enabled: process.env.VITE_ENABLE_ANALYTICS === 'true'
 * });
 */
export const initAnalytics = (config: AnalyticsConfig): void => {
  const { 
    apiKey, 
    host = 'https://app.posthog.com',
    enabled = true,
    capturePageView = true,
    debug = false 
  } = config;

  if (!apiKey || !enabled) {
    console.info('Analytics tracking is disabled');
    return;
  }

  posthog.init(apiKey, {
    api_host: host,
    capture_pageview: capturePageView,
    loaded: (posthog) => {
      if (debug) {
        posthog.debug();
      }
    },
    autocapture: true,
    disable_session_recording: !enabled,
    persistence: 'localStorage',
    opt_out_capturing_by_default: !enabled,
    respect_dnt: true,
    cross_subdomain_cookie: false,
  });
};

/**
 * Identify a user for analytics tracking
 */
export const identifyUser = (userId: string, traits?: Record<string, any>): void => {
  posthog.identify(userId, traits);
};

/**
 * Reset the current user's identity (for logout)
 */
export const resetUser = (): void => {
  posthog.reset();
};

/**
 * Track a custom event
 */
export const trackEvent = (
  event: string, 
  properties?: Record<string, any>
): void => {
  posthog.capture(event, properties);
};

/**
 * Register persistent properties to include with all events
 */
export const registerProperties = (properties: Record<string, any>): void => {
  posthog.register(properties);
};

/**
 * Register properties that will be sent with the next event only
 */
export const registerOneTimeProperties = (properties: Record<string, any>): void => {
  posthog.register_once(properties);
};

/**
 * Unregister a specific property
 */
export const unregisterProperty = (property: string): void => {
  posthog.unregister(property);
};

/**
 * Opt out of tracking for privacy/compliance
 */
export const optOutTracking = (): void => {
  posthog.opt_out_capturing();
};

/**
 * Opt in to tracking (after previously opting out)
 */
export const optInTracking = (): void => {
  posthog.opt_in_capturing();
};

/**
 * Track page view manually (if automatic page views are disabled)
 */
export const trackPageView = (url?: string): void => {
  posthog.capture('$pageview', {
    $current_url: url || window.location.href,
  });
};

/**
 * Set feature flags for different user experiences
 */
export const setFeatureFlags = (flags: Record<string, boolean>): void => {
  Object.entries(flags).forEach(([key, value]) => {
    // Cast as any to bypass type checking for third-party library incompatibility
    (posthog.featureFlags as any).override(key, value);
  });
};

/**
 * Get active feature flag with PostHog
 */
export const getFeatureFlag = (key: string): boolean => {
  return Boolean(posthog.isFeatureEnabled(key));
}; 