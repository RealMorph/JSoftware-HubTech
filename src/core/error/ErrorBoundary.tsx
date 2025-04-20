/**
 * ErrorBoundary Component
 * 
 * A wrapper component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { CategorizedError, categorizeError, logError, ErrorCategory } from './errorService';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: CategorizedError, reset: () => void) => ReactNode);
  onError?: (error: CategorizedError, errorInfo: ErrorInfo) => void;
  errorTypes?: ErrorCategory[];
}

interface ErrorBoundaryState {
  error: CategorizedError | null;
  hasError: boolean;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null 
    };
  }

  static getDerivedStateFromError(error: Error | unknown): ErrorBoundaryState {
    return { 
      hasError: true, 
      error: categorizeError(error) 
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const categorizedError = categorizeError(error);
    
    // Log the error
    logError(categorizedError, { componentStack: errorInfo.componentStack });
    
    // Call the custom onError handler if provided
    if (this.props.onError) {
      this.props.onError(categorizedError, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  shouldCatchError(error: CategorizedError): boolean {
    // If no specific error types are specified, catch all errors
    if (!this.props.errorTypes || this.props.errorTypes.length === 0) {
      return true;
    }
    
    // Only catch errors of the specified types
    return this.props.errorTypes.includes(error.category);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Check if we should handle this type of error
      if (!this.shouldCatchError(this.state.error)) {
        // Re-throw the error if it's not a type we should catch
        throw this.state.error;
      }
      
      // Render the fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetErrorBoundary);
        }
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <h2>Something went wrong</h2>
          <p>Error: {this.state.error.message}</p>
          <button onClick={this.resetErrorBoundary}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
}
