import React, { useState } from 'react';
import useErrorHandler from './useErrorHandler';
import { ErrorCategory, CategorizedError } from './errorService';

/**
 * Test component to demonstrate the useErrorHandler hook
 */
const ErrorHandlingTest: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  
  // Initialize the error handler
  const { 
    error, 
    isLoading, 
    handlePromise, 
    wrapAsync, 
    handleError, 
    reset
  } = useErrorHandler({
    context: { component: 'ErrorHandlingTest' },
    onError: (err) => {
      console.log('Error caught by handler:', err);
    }
  });
  
  // Example of a function that might fail
  const fetchData = async (shouldFail = false) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (shouldFail) {
      throw new Error('Failed to fetch data');
    }
    
    return { message: 'Data loaded successfully' };
  };
  
  // Method 1: Using handlePromise directly
  const handleTestPromise = () => {
    handlePromise(
      fetchData(false),
      { action: 'fetch-success' }
    )
      .then(data => {
        setResult(`Promise succeeded: ${data.message}`);
      })
      .catch(() => {
        // Error already handled by handlePromise
        setResult('Promise failed (caught)');
      });
  };
  
  // Method 2: Using wrapAsync to wrap a function
  const wrappedFetchWithError = wrapAsync(
    () => fetchData(true),
    { action: 'fetch-fail' }
  );
  
  const handleTestWrapped = async () => {
    const data = await wrappedFetchWithError();
    if (data) {
      setResult(`Wrapped function succeeded: ${data.message}`);
    } else {
      setResult('Wrapped function failed (returned undefined)');
    }
  };
  
  // Method 3: Manual try/catch with handleError
  const handleTestManual = async () => {
    try {
      // Flip a coin to decide whether to fail
      const shouldFail = Math.random() > 0.5;
      const data = await fetchData(shouldFail);
      setResult(`Manual try/catch succeeded: ${data.message}`);
    } catch (err) {
      // Use type assertion to handle the error
      handleError(err as Error, { action: 'manual-handling' });
      setResult('Manual try/catch failed (handled)');
    }
  };
  
  // Determine error category if any
  const getErrorCategory = () => {
    if (!error || !(error instanceof Error)) return null;
    
    // Check if it's a categorized error with a category property
    if ('category' in error) {
      const category = (error as unknown as CategorizedError).category;
      
      switch (category) {
        case ErrorCategory.NETWORK:
          return 'Network Error';
        case ErrorCategory.AUTHENTICATION:
        case ErrorCategory.AUTHORIZATION:
          return 'Authentication Error';
        case ErrorCategory.VALIDATION:
          return 'Validation Error';
        default:
          return `Error: ${category}`;
      }
    }
    
    return 'Unknown Error Type';
  };
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      maxWidth: '600px', 
      margin: '0 auto',
      padding: '20px'
    }}>
      <h2>Error Handling Test</h2>
      
      {/* Display any errors */}
      {error && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px',
          backgroundColor: '#ffeaea',
          color: '#d32f2f',
          borderRadius: '4px',
          border: '1px solid #f5c6cb'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Error Occurred</h4>
          <p style={{ margin: '0' }}>
            {error instanceof Error ? error.message : String(error)}
          </p>
          {getErrorCategory() && (
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9em' }}>
              Type: {getErrorCategory()}
            </p>
          )}
          <button 
            onClick={reset}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Display result */}
      {result && !error && (
        <div style={{ 
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#e6f7ea',
          color: '#2e7d32',
          borderRadius: '4px',
          border: '1px solid #c3e6cb'
        }}>
          <p style={{ margin: '0' }}>{result}</p>
        </div>
      )}
      
      {/* Test buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={handleTestPromise}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Test handlePromise'}
        </button>
        
        <button 
          onClick={handleTestWrapped}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Test wrapAsync'}
        </button>
        
        <button 
          onClick={handleTestManual}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Test Manual'}
        </button>
      </div>
      
      <div style={{ 
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        fontSize: '0.9em'
      }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Instructions</h4>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li><strong>Test handlePromise</strong>: Shows successful promise handling</li>
          <li><strong>Test wrapAsync</strong>: Demonstrates a wrapped function that will fail</li>
          <li><strong>Test Manual</strong>: Uses try/catch with 50% chance of error</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorHandlingTest; 