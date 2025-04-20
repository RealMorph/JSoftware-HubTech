import posthog from 'posthog-js';
import {
  TelemetryService,
  TelemetryConfig,
  EventProperties,
  UserProperties,
  ConsentSettings
} from './types';
import {
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_SETTINGS,
  SENSITIVE_PROPERTIES
} from './constants';

/**
 * PostHog Telemetry Service
 * 
 * Implementation of the TelemetryService interface using PostHog.
 * This service handles all telemetry operations including initialization,
 * event tracking, user identification, and privacy controls.
 */
export class PostHogService implements TelemetryService {
  private initialized = false;
  private enabled = false;
  private consentSettings: ConsentSettings;
  private config: TelemetryConfig | null = null;

  constructor() {
    this.consentSettings = this.loadConsentSettings();
  }

  /**
   * Initialize the PostHog service with configuration
   */
  public init(config: TelemetryConfig): void {
    if (this.initialized) {
      console.warn('PostHog service already initialized');
      return;
    }

    this.config = config;
    this.enabled = config.enabled;

    if (!this.enabled) {
      console.log('Telemetry disabled by configuration');
      return;
    }

    try {
      posthog.init(config.apiKey, {
        api_host: config.host || 'https://app.posthog.com',
        autocapture: false, // We'll manually track events for more control
        capture_pageview: false, // We'll manually track page views
        loaded: (posthogInstance) => {
          // Configure session recording if enabled
          if (config.sessionRecording?.enabled && this.consentSettings.sessionRecording) {
            // Start session recording with PostHog's native API
            posthogInstance.startSessionRecording();
            
            // Set sampling rate via config if available
            if (config.sessionRecording.sampleRate) {
              // We can't directly set the sampling rate, but we'll log it
              console.log(`Session recording sample rate set to ${config.sessionRecording.sampleRate}`);
            }
          }
          
          // Configure privacy settings
          if (config.privacy?.anonymizeIPs) {
            posthogInstance.opt_out_capturing();
            // Then opt in again with updated settings
            posthogInstance.opt_in_capturing();
          }
          
          // Mask sensitive properties
          const propertiesToMask = [
            ...(config.privacy?.maskProperties || []),
            ...SENSITIVE_PROPERTIES
          ];
          
          posthogInstance.config.property_blacklist = propertiesToMask;
        },
        disable_session_recording: !this.consentSettings.sessionRecording,
        debug: config.debug || false,
        persistence: 'localStorage',
        capture_performance: true,
        sanitize_properties: this.sanitizeProperties.bind(this),
        respect_dnt: true // Respect Do Not Track browser setting
      });
      
      // Apply consent settings
      this.applyConsentSettings();
      
      this.initialized = true;
      console.log('PostHog telemetry service initialized');
    } catch (error) {
      console.error('Failed to initialize PostHog telemetry:', error);
    }
  }

  /**
   * Track an event with optional properties
   */
  public trackEvent(eventName: string, properties?: EventProperties): void {
    if (!this.isEnabled() || !this.consentSettings.analytics) {
      return;
    }

    try {
      posthog.capture(eventName, properties || {});
    } catch (error) {
      console.error(`Failed to track event ${eventName}:`, error);
    }
  }

  /**
   * Identify a user with optional properties
   */
  public identify(userId: string, properties?: UserProperties): void {
    if (!this.isEnabled()) {
      return;
    }

    try {
      posthog.identify(userId, properties);
    } catch (error) {
      console.error(`Failed to identify user ${userId}:`, error);
    }
  }

  /**
   * Reset the current user's identity (useful for sign-out)
   */
  public reset(): void {
    if (!this.isEnabled()) {
      return;
    }

    try {
      posthog.reset();
    } catch (error) {
      console.error('Failed to reset user identity:', error);
    }
  }

  /**
   * Set a persistent user property
   */
  public setUserProperty(property: string, value: string | number | boolean | null): void {
    if (!this.isEnabled()) {
      return;
    }

    try {
      posthog.people.set({ [property]: value });
    } catch (error) {
      console.error(`Failed to set user property ${property}:`, error);
    }
  }

  /**
   * Check if telemetry is enabled
   */
  public isEnabled(): boolean {
    return this.initialized && this.enabled && posthog.has_opted_in_capturing();
  }

  /**
   * Update consent settings
   */
  public updateConsent(settings: ConsentSettings): void {
    this.consentSettings = settings;
    this.saveConsentSettings();
    this.applyConsentSettings();
  }

  /**
   * Disable telemetry completely
   */
  public disable(): void {
    this.enabled = false;
    try {
      posthog.opt_out_capturing();
    } catch (error) {
      console.error('Failed to disable telemetry:', error);
    }
  }

  /**
   * Enable telemetry if previously disabled
   */
  public enable(): void {
    if (!this.config?.enabled) {
      return; // Don't enable if disabled in configuration
    }
    
    this.enabled = true;
    try {
      posthog.opt_in_capturing();
      this.applyConsentSettings();
    } catch (error) {
      console.error('Failed to enable telemetry:', error);
    }
  }

  /**
   * Load consent settings from local storage
   */
  private loadConsentSettings(): ConsentSettings {
    try {
      const savedSettings = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Failed to load consent settings:', error);
    }
    
    return { ...DEFAULT_CONSENT_SETTINGS };
  }

  /**
   * Save consent settings to local storage
   */
  private saveConsentSettings(): void {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(this.consentSettings));
    } catch (error) {
      console.error('Failed to save consent settings:', error);
    }
  }

  /**
   * Apply consent settings to PostHog
   */
  private applyConsentSettings(): void {
    if (!this.initialized) {
      return;
    }

    try {
      // Apply analytics consent
      if (this.consentSettings.analytics) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }

      // Apply session recording consent
      if (this.consentSettings.sessionRecording && this.config?.sessionRecording?.enabled) {
        posthog.startSessionRecording();
      } else {
        posthog.stopSessionRecording();
      }
    } catch (error) {
      console.error('Failed to apply consent settings:', error);
    }
  }

  /**
   * Sanitize event properties to remove sensitive information
   */
  private sanitizeProperties(properties: Record<string, any>, eventName: string): Record<string, any> {
    // Make a copy to avoid modifying the original
    const sanitized = { ...properties };
    
    // Check for deeply nested properties
    for (const key in sanitized) {
      // Skip if the property is not an object
      if (typeof sanitized[key] !== 'object' || sanitized[key] === null) {
        continue;
      }
      
      // Recursively sanitize nested objects
      sanitized[key] = this.sanitizeProperties(sanitized[key], eventName);
    }
    
    return sanitized;
  }
}

// Create a singleton instance
export const posthogService = new PostHogService();

export default posthogService; 