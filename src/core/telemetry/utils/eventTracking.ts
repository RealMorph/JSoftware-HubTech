import { EventProperties } from '../types';
import posthogService from '../PostHogService';
import {
  AppEvents,
  AuthEvents,
  NavigationEvents,
  FormEvents,
  FeatureEvents,
  ErrorEvents,
  UIEvents,
  PerformanceEvents
} from '../constants';

/**
 * Utility functions for event tracking
 * 
 * This file provides typed wrappers around the telemetry service
 * to make event tracking more consistent and type-safe.
 */

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string, properties?: EventProperties) => {
  posthogService.trackEvent(AppEvents.PAGE_VIEW, {
    path,
    title: title || document.title,
    ...properties
  });
};

/**
 * Track an authentication event
 */
export const trackAuthEvent = (
  event: keyof typeof AuthEvents,
  properties?: EventProperties
) => {
  const eventName = AuthEvents[event];
  posthogService.trackEvent(eventName, properties);
};

/**
 * Track a navigation event
 */
export const trackNavigationEvent = (
  event: keyof typeof NavigationEvents,
  properties?: EventProperties
) => {
  const eventName = NavigationEvents[event];
  posthogService.trackEvent(eventName, properties);
};

/**
 * Track a form event
 */
export const trackFormEvent = (
  event: keyof typeof FormEvents,
  formId: string,
  properties?: EventProperties
) => {
  const eventName = FormEvents[event];
  posthogService.trackEvent(eventName, {
    form_id: formId,
    ...properties
  });
};

/**
 * Track a feature usage event
 */
export const trackFeatureEvent = (
  event: keyof typeof FeatureEvents,
  featureId: string,
  properties?: EventProperties
) => {
  const eventName = FeatureEvents[event];
  posthogService.trackEvent(eventName, {
    feature_id: featureId,
    ...properties
  });
};

/**
 * Track an error event
 */
export const trackErrorEvent = (
  event: keyof typeof ErrorEvents,
  errorMessage: string,
  errorCode?: string,
  properties?: EventProperties
) => {
  const eventName = ErrorEvents[event];
  posthogService.trackEvent(eventName, {
    error_message: errorMessage,
    error_code: errorCode || null,
    ...properties
  });
};

/**
 * Track a UI interaction event
 */
export const trackUIEvent = (
  event: keyof typeof UIEvents,
  elementId: string,
  properties?: EventProperties
) => {
  const eventName = UIEvents[event];
  posthogService.trackEvent(eventName, {
    element_id: elementId,
    ...properties
  });
};

/**
 * Track a button click
 */
export const trackButtonClick = (
  buttonId: string,
  buttonText?: string,
  properties?: EventProperties
) => {
  posthogService.trackEvent(UIEvents.BUTTON_CLICKED, {
    button_id: buttonId,
    button_text: buttonText || null,
    ...properties
  });
};

/**
 * Track a performance metric
 */
export const trackPerformance = (
  event: keyof typeof PerformanceEvents,
  duration: number,
  properties?: EventProperties
) => {
  const eventName = PerformanceEvents[event];
  posthogService.trackEvent(eventName, {
    duration_ms: duration,
    ...properties
  });
};

/**
 * Track API response time
 */
export const trackAPIPerformance = (
  endpoint: string,
  duration: number,
  status: number,
  properties?: EventProperties
) => {
  posthogService.trackEvent(PerformanceEvents.API_RESPONSE_TIME, {
    endpoint,
    duration_ms: duration,
    status_code: status,
    ...properties
  });
};

/**
 * Create a performance timing tracker
 * Returns a function that, when called, will track the time elapsed
 */
export const createPerformanceTracker = (
  eventName: keyof typeof PerformanceEvents,
  properties?: EventProperties
) => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    trackPerformance(eventName, duration, properties);
    return duration;
  };
};

/**
 * Record user identification
 */
export const identifyUser = (
  userId: string,
  email?: string,
  displayName?: string,
  properties?: Record<string, string | number | boolean | null | string[]>
) => {
  posthogService.identify(userId, {
    email: email || null,
    name: displayName || null,
    ...properties
  });
};

export default {
  trackPageView,
  trackAuthEvent,
  trackNavigationEvent,
  trackFormEvent,
  trackFeatureEvent,
  trackErrorEvent,
  trackUIEvent,
  trackButtonClick,
  trackPerformance,
  trackAPIPerformance,
  createPerformanceTracker,
  identifyUser
}; 