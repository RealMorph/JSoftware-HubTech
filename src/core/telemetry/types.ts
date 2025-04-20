/**
 * Telemetry System Types
 * 
 * This file contains TypeScript interfaces and types for the telemetry system.
 */

/**
 * Telemetry configuration options
 */
export interface TelemetryConfig {
  /**
   * PostHog API key
   */
  apiKey: string;
  
  /**
   * PostHog host URL
   */
  host?: string;
  
  /**
   * Whether telemetry is enabled
   */
  enabled: boolean;
  
  /**
   * Whether debugging is enabled
   */
  debug?: boolean;

  /**
   * Whether to capture user IP (false for better privacy)
   */
  captureIP?: boolean;
  
  /**
   * Session recording configuration
   */
  sessionRecording?: {
    enabled: boolean;
    /**
     * Sample rate for session recording (0-1)
     */
    sampleRate?: number;
  };
  
  /**
   * Privacy configuration
   */
  privacy?: {
    /**
     * Properties to automatically mask in events
     */
    maskProperties?: string[];
    /**
     * Whether to anonymize IP addresses
     */
    anonymizeIPs?: boolean;
  };
}

/**
 * Consent settings for telemetry data collection
 */
export interface ConsentSettings {
  /**
   * Whether analytics tracking is allowed
   */
  analytics: boolean;
  
  /**
   * Whether session recording is allowed
   */
  sessionRecording: boolean;
  
  /**
   * Whether to collect error reports
   */
  errorReporting: boolean;
  
  /**
   * Whether to collect feature usage data
   */
  featureUsage: boolean;
}

/**
 * Event property type that ensures properties have proper types
 */
export type EventProperties = Record<string, string | number | boolean | null>;

/**
 * User properties type
 */
export type UserProperties = Record<string, string | number | boolean | null | string[]>;

/**
 * Telemetry service interface
 */
export interface TelemetryService {
  /**
   * Initialize the telemetry service
   */
  init(config: TelemetryConfig): void;
  
  /**
   * Track an event
   */
  trackEvent(eventName: string, properties?: EventProperties): void;
  
  /**
   * Identify a user
   */
  identify(userId: string, properties?: UserProperties): void;
  
  /**
   * Reset the current user's identity
   */
  reset(): void;
  
  /**
   * Set user property that persists across events
   */
  setUserProperty(property: string, value: string | number | boolean | null): void;
  
  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean;
  
  /**
   * Update consent settings
   */
  updateConsent(settings: ConsentSettings): void;
  
  /**
   * Disable telemetry completely
   */
  disable(): void;
  
  /**
   * Enable telemetry
   */
  enable(): void;
}

/**
 * Context type for Telemetry Provider
 */
export interface TelemetryContextType {
  /**
   * Access to the telemetry service
   */
  service: TelemetryService;
  
  /**
   * Whether telemetry is currently enabled
   */
  isEnabled: boolean;
  
  /**
   * Current consent settings
   */
  consentSettings: ConsentSettings;
  
  /**
   * Update consent settings
   */
  updateConsent: (settings: ConsentSettings) => void;
  
  /**
   * Track an event
   */
  trackEvent: (eventName: string, properties?: EventProperties) => void;
}

/**
 * Props for the TelemetryProvider component
 */
export interface TelemetryProviderProps {
  /**
   * Configuration for telemetry
   */
  config: TelemetryConfig;
  
  /**
   * Default consent settings
   */
  defaultConsent?: Partial<ConsentSettings>;
  
  /**
   * Children components
   */
  children: React.ReactNode;
} 