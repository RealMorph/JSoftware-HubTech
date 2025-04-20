import React, { useState, ReactNode } from 'react';
import useErrorHandler from './useErrorHandler';
import { withAsyncErrorHandling } from './withAsyncErrorHandling';
import { ErrorCategory } from './errorService';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AsyncErrorHandlingExampleProps {
  // The errorHandler is injected by the withAsyncErrorHandling HOC
  errorHandler?: ReturnType<typeof useErrorHandler>;
}

/**
 * Example component demonstrating how to use the useErrorHandler hook
 * with async operations
 */
const AsyncErrorHandlingExample: React.FC<AsyncErrorHandlingExampleProps> = ({ errorHandler }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create local error handler if not provided via props
  const localErrorHandler = useErrorHandler({
    context: {
      component: 'AsyncErrorHandlingExample',
      feature: 'user-management',
    },
  });
  
  // Use the provided errorHandler or fall back to the local one
  const { handlePromise, wrapAsync, error } = errorHandler || localErrorHandler;

  /**
   * Simulates fetching a user with potential errors
   */
  const fetchUser = async (shouldFail = false): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (shouldFail) {
      // Simulate different types of errors
      const errorTypes = [
        new Error('Network error: Failed to fetch user data'),
        new Error('Authorization error: Insufficient permissions'),
        new Error('Not found: User does not exist'),
        new Error('Validation error: Invalid user ID'),
      ];
      
      // Randomly select an error
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      throw randomError;
    }
    
    // Return mock user data
    return {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
  };

  /**
   * Method 1: Using handlePromise
   * Good for one-off async operations
   */
  const handleFetchUserClick = () => {
    setIsLoading(true);
    
    // Using handlePromise directly
    handlePromise(
      fetchUser(false),
      { action: 'fetch-user-success' } // Additional context
    )
      .then(userData => {
        setUser(userData);
        setIsLoading(false);
      })
      .catch(() => {
        // Error is already handled by handlePromise
        setIsLoading(false);
      });
  };

  /**
   * Method 2: Using wrapAsync
   * Good for reusable async functions
   */
  const handleFetchUserWithErrorClick = wrapAsync(async () => {
    setIsLoading(true);
    
    try {
      const userData = await fetchUser(true);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  });

  /**
   * Method 3: Traditional try/catch with handleError
   * Good for complex flows where you need more control
   */
  const handleCustomErrorHandling = async () => {
    setIsLoading(true);
    
    try {
      // Custom logic before the async operation
      console.log('Fetching user with custom error handling...');
      
      // Simulate API call
      const userData = await fetchUser(Math.random() > 0.5);
      
      // Custom logic with the result
      console.log('User fetched successfully:', userData);
      setUser(userData);
    } catch (err) {
      // Handle the error with additional context
      localErrorHandler.handleError(err as Error, {
        action: 'custom-fetch-user',
        timestamp: new Date().toISOString(),
        severity: 'high',
      });
      
      // Perform custom recovery logic
      console.log('Performing custom recovery logic...');
    } finally {
      setIsLoading(false);
    }
  };

  // Type guard to check if error is an Error object
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message;
    }
    return String(err);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
    }}>
      <h2>Async Error Handling Example</h2>
      
      {/* Display any errors - only render if error exists */}
      {error !== null && error !== undefined ? (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px',
          backgroundColor: '#fff3cd',
          color: '#856404',
          borderRadius: '4px',
          border: '1px solid #ffeeba'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Error Occurred</h4>
          <p style={{ margin: '0' }}>{getErrorMessage(error)}</p>
          {/* Display error category if available */}
          {error instanceof Error && 'category' in error && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9em' }}>
              Category: {(error as any).category || ErrorCategory.UNEXPECTED}
            </p>
          )}
        </div>
      ) : null}
      
      {/* User info display */}
      {user && (
        <div style={{ 
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 8px 0' }}>User Details</h3>
          <p style={{ margin: '4px 0' }}><strong>ID:</strong> {user.id}</p>
          <p style={{ margin: '4px 0' }}><strong>Name:</strong> {user.name}</p>
          <p style={{ margin: '4px 0' }}><strong>Email:</strong> {user.email}</p>
        </div>
      )}
      
      {/* Action buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <button
          onClick={handleFetchUserClick}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Loading...' : 'Fetch User (Success)'}
        </button>
        
        <button
          onClick={handleFetchUserWithErrorClick}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Loading...' : 'Fetch User (Error)'}
        </button>
        
        <button
          onClick={handleCustomErrorHandling}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Loading...' : 'Custom Error Handling'}
        </button>
      </div>
      
      {/* Instructions */}
      <div style={{ 
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>How It Works</h3>
        <p>This example demonstrates three ways to handle async errors:</p>
        <ol>
          <li><strong>handlePromise</strong>: Wrap a promise directly for one-off operations</li>
          <li><strong>wrapAsync</strong>: Create a wrapped async function for reusable error handling</li>
          <li><strong>handleError</strong>: Traditional try/catch with explicit error handling for more control</li>
        </ol>
        <p>Each approach integrates with the global error monitoring system and can trigger UI fallbacks.</p>
      </div>
    </div>
  );
};

// Export the raw component for flexible usage
export { AsyncErrorHandlingExample };

// Export a wrapped version with HOC for convenient use
export default withAsyncErrorHandling(AsyncErrorHandlingExample, {
  errorContext: {
    feature: 'error-handling-example',
    importance: 'demonstration',
  },
}); 