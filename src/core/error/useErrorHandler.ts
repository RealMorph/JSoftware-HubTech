import { useCallback, useState } from 'react';
import { logError } from './error-logger';
import { categorizeError, ErrorWithContext } from './errorService';

export type ErrorContext = Record<string, any>;

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
 * A hook that provides error handling for asynchronous operations
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

    // Categorize the error if it's an Error instance
    if (error instanceof Error) {
      categorizeError(error);
    }

    // Log the error with context
    if (captureForMonitoring) {
      logError(error instanceof Error ? error : String(error), {
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
  const wrapAsync = useCallback(<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    additionalContext: Record<string, any> = {}
  ) => {
    return async (...args: TArgs): Promise<TReturn | undefined> => {
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
  const handlePromise = useCallback(<T>(
    promise: Promise<T>,
    additionalContext: Record<string, any> = {}
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    return promise
      .catch((err: TError) => {
        handleError(err, additionalContext);
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
  };
}

export default useErrorHandler; 