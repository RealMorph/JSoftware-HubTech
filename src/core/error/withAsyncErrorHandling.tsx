import React, { ComponentType, ErrorInfo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import useErrorHandler from './useErrorHandler';

// Default fallback component for error boundaries
const DefaultFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
  <div role="alert" style={{ padding: '16px', color: '#721c24', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
    <h3>Something went wrong</h3>
    <p>{error.message || String(error)}</p>
    <button 
      onClick={resetErrorBoundary}
      style={{ 
        marginTop: '8px', 
        padding: '8px 12px', 
        background: '#dc3545', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer' 
      }}
    >
      Try again
    </button>
  </div>
);

interface WithAsyncErrorHandlingOptions {
  /**
   * Component to use as fallback when an error occurs
   */
  FallbackComponent?: ComponentType<FallbackProps>;
  
  /**
   * Additional context to include with errors
   */
  errorContext?: Record<string, any>;
  
  /**
   * Whether to reset the error boundary when the component unmounts
   */
  resetOnUnmount?: boolean;
  
  /**
   * Function to call before an error is handled
   */
  onError?: (error: Error, info: ErrorInfo) => void;
}

/**
 * Higher-order component that wraps a component with async error handling capabilities
 * 
 * @param Component The component to wrap
 * @param options Configuration options for error handling
 * @returns A wrapped component with error handling
 */
export function withAsyncErrorHandling<P extends object, TError = Error>(
  Component: ComponentType<P & { errorHandler: ReturnType<typeof useErrorHandler<TError>> }>,
  options: WithAsyncErrorHandlingOptions = {}
): ComponentType<P> {
  const {
    FallbackComponent = DefaultFallback,
    errorContext = {},
    resetOnUnmount = false,
    onError,
  } = options;
  
  // The wrapped component
  const WrappedComponent: React.FC<P> = (props) => {
    // Create an error handler for this component
    const errorHandler = useErrorHandler<TError>({
      context: {
        componentName: Component.displayName || Component.name || 'UnnamedComponent',
        ...errorContext,
      },
      onError: (error: TError) => {
        if (onError && error instanceof Error) {
          // Create a compatible ErrorInfo object
          const errorInfo: ErrorInfo = {
            componentStack: error.stack || '',
          };
          onError(error, errorInfo);
        }
      },
    });
    
    // Render the component within an error boundary
    return (
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={(error, info) => {
          if (onError) {
            onError(error, info);
          }
        }}
        onReset={() => {
          // Reset any local state or perform cleanup when the error boundary resets
          errorHandler.reset();
        }}
      >
        <Component {...props} errorHandler={errorHandler} />
      </ErrorBoundary>
    );
  };
  
  // Set display name for easier debugging
  const wrappedName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withAsyncErrorHandling(${wrappedName})`;
  
  return WrappedComponent;
}

export default withAsyncErrorHandling; 