import React, { useState, useCallback } from 'react';
import { 
  ErrorCategory, 
  CategorizedError, 
  categorizeError, 
  logError, 
  ErrorWithContext,
  createCategorizedError
} from './errorService';
import { logErrorToConsole, sendErrorToAnalytics, ErrorSeverity } from './error-logger';

// Define export for ErrorContext type
export type ErrorContext = Record<string, any>;

/**
 * Options for the error handler
 */
export interface ErrorHandlerOptions<TError = Error> {
  /**
   * Additional context information to include with errors
   */
  context?: ErrorContext;

  /**
   * Custom component to render when an error occurs
   */
  FallbackComponent?: React.ComponentType<{ error: TError; resetError: () => void }>;

  /**
   * Function to call when an error is handled
   */
  onError?: (error: TError) => void;

  /**
   * Whether to automatically capture errors for monitoring
   * @default true
   */
  captureForMonitoring?: boolean;
}

/**
 * Hook for handling asynchronous errors in a component
 * 
 * @param options Configuration options for the error handler
 * @returns An object with methods for handling errors
 */
function useErrorHandler<TError = Error>(options: ErrorHandlerOptions<TError> = {}) {
  const {
    context = {},
    onError,
    captureForMonitoring = true,
  } = options;

  // State to track the current error
  const [error, setError] = useState<TError | null>(null);
  
  // State to track loading status
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles an error by setting the error state and performing additional actions
   * 
   * @param error The error to handle
   * @param additionalContext Additional context to include with the error
   */
  const handleError = useCallback((error: TError, additionalContext: Record<string, any> = {}) => {
    // Set the error state
    setError(error);

    // Only process for monitoring if enabled
    if (captureForMonitoring) {
      // Convert to appropriate error format for monitoring
      let errorForLogging: Error;
      
      if (error instanceof Error) {
        // For actual Error objects, categorize them
        errorForLogging = categorizeError(error);
      } else {
        // For non-Error types, create a new Error
        errorForLogging = new Error(String(error));
      }
      
      // Log the error with context
      logError(errorForLogging as CategorizedError, {
        ...context,
        ...additionalContext,
      });
    }

    // Call the custom error handler if provided
    if (onError) {
      onError(error);
    }
  }, [context, onError, captureForMonitoring]);

  /**
   * Wraps an async function with error handling
   * 
   * @param fn The async function to wrap
   * @param additionalContext Additional context to include with any errors
   * @returns A new function that includes error handling
   */
  const wrapAsync = useCallback(function<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    additionalContext: Record<string, any> = {}
  ) {
    return async function(...args: TArgs): Promise<TReturn | undefined> {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        handleError(err as TError, additionalContext);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    };
  }, [handleError]);

  /**
   * Handles a promise with error handling
   * 
   * @param promise The promise to handle
   * @param additionalContext Additional context to include with any errors
   * @returns The promise with error handling
   */
  const handlePromise = useCallback(function<T>(
    promise: Promise<T>,
    additionalContext: Record<string, any> = {}
  ): Promise<T> {
    setIsLoading(true);
    setError(null);

    return promise
      .catch((err: unknown) => {
        handleError(err as TError, additionalContext);
        throw err; // Rethrow to maintain promise rejection
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [handleError]);

  /**
   * Resets the error state
   */
  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    error,
    isLoading,
    handleError,
    wrapAsync,
    handlePromise,
    reset,
    isNetworkError: error instanceof Error && 
      'category' in error && 
      (error as unknown as CategorizedError).category === ErrorCategory.NETWORK,
    isAuthError: error instanceof Error && 
      'category' in error && 
      ((error as unknown as CategorizedError).category === ErrorCategory.AUTHENTICATION || 
       (error as unknown as CategorizedError).category === ErrorCategory.AUTHORIZATION),
    isValidationError: error instanceof Error && 
      'category' in error && 
      (error as unknown as CategorizedError).category === ErrorCategory.VALIDATION,
  };
}

export default useErrorHandler; 