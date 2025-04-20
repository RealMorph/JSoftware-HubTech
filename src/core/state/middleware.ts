import { Middleware, Action, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';

/**
 * Custom middleware module for analytics and logging
 * 
 * This module provides configurable middleware that can be included
 * in the Redux store setup based on application needs.
 */

/**
 * Define a proper action type that includes a type property
 */
export interface ReduxAction extends Action {
  type: string;
  [key: string]: any;  // Allow for additional properties
}

/**
 * Options for configuring the analytics middleware
 */
export interface AnalyticsMiddlewareOptions {
  /**
   * Actions to exclude from tracking
   */
  excludedActions?: string[];
  
  /**
   * Custom handler for tracking analytics events
   */
  trackEvent?: (action: string, payload: any) => void;
  
  /**
   * Custom handler for tracking errors
   */
  trackError?: (error: Error, action: ReduxAction) => void;
}

/**
 * Creates a middleware for tracking analytics events
 * 
 * @example
 * const analyticsMiddleware = createAnalyticsMiddleware({
 *   excludedActions: ['SOME_FREQUENT_ACTION'],
 *   trackEvent: (action, payload) => {
 *     // Send to analytics service
 *   }
 * });
 */
export const createAnalyticsMiddleware = (
  options: AnalyticsMiddlewareOptions = {}
): Middleware => {
  const {
    excludedActions = [],
    trackEvent = () => {},
    trackError = () => {}
  } = options;
  
  return store => next => (action: any) => {
    try {
      // Track action if not excluded
      if (
        action !== null &&
        typeof action === 'object' &&
        'type' in action && 
        !excludedActions.includes(action.type)
      ) {
        // Extract relevant data for analytics
        const actionType = action.type as string;
        const payload = { ...action };
        delete payload.type;
        
        // Avoid sending sensitive data
        if (actionType.toLowerCase().includes('auth') || 
            actionType.toLowerCase().includes('login') || 
            actionType.toLowerCase().includes('user')) {
          // Sanitize potentially sensitive data
          if ('password' in payload) delete payload.password;
          if ('token' in payload) delete payload.token;
        }
        
        // Track the event
        trackEvent(actionType, payload);
      }
      
      // Continue middleware chain
      return next(action);
    } catch (error) {
      // Track error and continue
      trackError(error as Error, action as ReduxAction);
      return next(action);
    }
  };
};

/**
 * Options for configuring the logging middleware
 */
export interface LoggingMiddlewareOptions {
  /**
   * Whether to log actions
   */
  logActions?: boolean;
  
  /**
   * Whether to log state changes
   */
  logState?: boolean;
  
  /**
   * Actions to exclude from logging
   */
  excludedActions?: string[];
  
  /**
   * Custom logger function (defaults to console)
   */
  logger?: typeof console;
}

/**
 * Creates a middleware for logging actions and state changes
 * 
 * @example
 * const loggingMiddleware = createLoggingMiddleware({
 *   logActions: true,
 *   logState: process.env.NODE_ENV !== 'production'
 * });
 */
export const createLoggingMiddleware = (
  options: LoggingMiddlewareOptions = {}
): Middleware => {
  const {
    logActions = true,
    logState = false,
    excludedActions = [],
    logger = console
  } = options;
  
  return store => next => (action: any) => {
    // Skip excluded actions
    if (
      action !== null &&
      typeof action === 'object' &&
      'type' in action && 
      excludedActions.includes(action.type)
    ) {
      return next(action);
    }
    
    // Log action if enabled
    if (logActions && action && typeof action === 'object' && 'type' in action) {
      logger.group(`Action: ${action.type}`);
      logger.info('Action:', action);
      logger.groupEnd();
    }
    
    // Dispatch action
    const result = next(action);
    
    // Log state if enabled
    if (logState && action && typeof action === 'object' && 'type' in action) {
      logger.group(`State after: ${action.type}`);
      logger.info('State:', store.getState());
      logger.groupEnd();
    }
    
    return result;
  };
};

/**
 * Creates a listener middleware for more complex tracking patterns
 */
export const listenerMiddleware = createListenerMiddleware();

// Type for tracking action start times
interface StateWithTimes {
  listenerMiddlewareStartTimes?: Record<string, number>;
}

/**
 * Helper to add performance monitoring for slow state updates
 * 
 * @example
 * monitorStateUpdatePerformance(
 *   isAnyOf(complexAction1, complexAction2),
 *   { maxDuration: 50 }
 * );
 */
export const monitorStateUpdatePerformance = (
  actionMatcher: ((action: Action) => boolean),
  options: { maxDuration?: number; onSlow?: (action: ReduxAction, duration: number) => void } = {}
) => {
  const { maxDuration = 100, onSlow = () => {} } = options;
  
  // Store the start time when the action is dispatched
  listenerMiddleware.startListening({
    predicate: (action: unknown) => {
      if (action && typeof action === 'object' && 'type' in action) {
        return actionMatcher(action as Action);
      }
      return false;
    },
    effect: (action: any, listenerApi) => {
      if (!action || typeof action !== 'object' || !('type' in action)) {
        return;
      }
      
      const typedAction = action as ReduxAction;
      const startTime = performance.now();
      
      // Store the start time in a variable accessible to the effect
      const state = listenerApi.getOriginalState() as StateWithTimes;
      const newTimes = {
        ...state.listenerMiddlewareStartTimes,
        [typedAction.type]: startTime
      };
      
      // Use getOriginalState again to ensure we don't access stale state
      (listenerApi.getOriginalState() as StateWithTimes).listenerMiddlewareStartTimes = newTimes;
      
      // Wait for the action to complete (next tick)
      setTimeout(() => {
        const endTime = performance.now();
        const currentState = listenerApi.getState() as StateWithTimes;
        const actionStartTime = currentState.listenerMiddlewareStartTimes?.[typedAction.type] || startTime;
        const duration = endTime - actionStartTime;
        
        if (duration > maxDuration) {
          onSlow(typedAction, duration);
          
          // Log slow updates
          console.warn(
            `Slow state update detected: ${typedAction.type} took ${duration.toFixed(2)}ms (threshold: ${maxDuration}ms)`
          );
        }
      }, 0);
    }
  });
}; 