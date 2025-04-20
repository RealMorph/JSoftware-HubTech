/**
 * Telemetry System Constants
 * 
 * This file contains constants for event names, categories, and other telemetry-related values.
 */

/**
 * Event categories to organize telemetry events
 */
export enum EventCategory {
  // Application lifecycle events
  APP = 'app',
  
  // User authentication events
  AUTH = 'auth',
  
  // User actions/interactions
  ACTION = 'action',
  
  // Navigation/routing events
  NAVIGATION = 'navigation',
  
  // Feature usage events
  FEATURE = 'feature',
  
  // Error events
  ERROR = 'error',
  
  // Performance events
  PERFORMANCE = 'performance',
  
  // Form interaction events
  FORM = 'form',
  
  // UI interaction events
  UI = 'ui',
  
  // API interaction events
  API = 'api'
}

/**
 * Application lifecycle events
 */
export const AppEvents = {
  LAUNCHED: 'app_launched',
  PAGE_VIEW: 'page_view',
  BACKGROUND: 'app_background',
  FOREGROUND: 'app_foreground',
  VERSION_UPDATED: 'app_version_updated',
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  SETTINGS_UPDATED: 'settings_updated'
};

/**
 * Authentication events
 */
export const AuthEvents = {
  SIGN_IN: 'auth_sign_in',
  SIGN_OUT: 'auth_sign_out',
  SIGN_UP: 'auth_sign_up',
  PASSWORD_RESET: 'auth_password_reset',
  VERIFICATION_SENT: 'auth_verification_sent',
  ACCOUNT_UPDATED: 'auth_account_updated',
  VERIFICATION_COMPLETE: 'auth_verification_complete',
  SOCIAL_SIGN_IN: 'auth_social_sign_in'
};

/**
 * Navigation events
 */
export const NavigationEvents = {
  ROUTE_CHANGED: 'route_changed',
  LINK_CLICKED: 'link_clicked',
  TAB_CHANGED: 'tab_changed',
  MENU_OPENED: 'menu_opened',
  BACK_NAVIGATION: 'back_navigation',
  EXTERNAL_LINK: 'external_link_opened'
};

/**
 * Form events
 */
export const FormEvents = {
  FORM_STARTED: 'form_started',
  FORM_SUBMITTED: 'form_submitted',
  FORM_ERROR: 'form_error',
  FIELD_CHANGED: 'form_field_changed',
  FIELD_FOCUSED: 'form_field_focused',
  FORM_ABANDONED: 'form_abandoned',
  VALIDATION_ERROR: 'form_validation_error'
};

/**
 * Feature usage events
 */
export const FeatureEvents = {
  FEATURE_USED: 'feature_used',
  FEATURE_CONFIGURED: 'feature_configured',
  FEATURE_ENABLED: 'feature_enabled',
  FEATURE_DISABLED: 'feature_disabled',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed'
};

/**
 * Error events
 */
export const ErrorEvents = {
  APP_ERROR: 'app_error',
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error',
  PERMISSION_ERROR: 'permission_error',
  AUTHENTICATION_ERROR: 'authentication_error'
};

/**
 * UI interaction events
 */
export const UIEvents = {
  BUTTON_CLICKED: 'button_clicked',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  DROPDOWN_OPENED: 'dropdown_opened',
  TOOLTIP_SHOWN: 'tooltip_shown',
  MENU_ITEM_SELECTED: 'menu_item_selected',
  CAROUSEL_CHANGED: 'carousel_changed',
  ANIMATION_COMPLETED: 'animation_completed',
  FILTER_APPLIED: 'filter_applied',
  SORT_APPLIED: 'sort_applied',
  SEARCH_PERFORMED: 'search_performed',
  ITEM_SELECTED: 'item_selected',
  NOTIFICATION_CLICKED: 'notification_clicked'
};

/**
 * Performance events
 */
export const PerformanceEvents = {
  PAGE_LOAD_TIME: 'page_load_time',
  TIME_TO_INTERACTIVE: 'time_to_interactive',
  API_RESPONSE_TIME: 'api_response_time',
  RENDER_TIME: 'render_time',
  ANIMATION_FRAME_RATE: 'animation_frame_rate',
  MEMORY_USAGE: 'memory_usage',
  RESOURCE_LOAD_TIME: 'resource_load_time'
};

/**
 * Consent storage key for local storage
 */
export const CONSENT_STORAGE_KEY = 'telemetry_consent_settings';

/**
 * Default consent settings
 */
export const DEFAULT_CONSENT_SETTINGS = {
  analytics: false,
  sessionRecording: false,
  errorReporting: false,
  featureUsage: false
};

/**
 * Properties to automatically redact for privacy
 */
export const SENSITIVE_PROPERTIES = [
  'password',
  'token',
  'secret',
  'credential',
  'creditCard',
  'ssn',
  'socialSecurity',
  'email',
  'phone',
  'address',
  'dob',
  'dateOfBirth',
  'birthdate'
]; 