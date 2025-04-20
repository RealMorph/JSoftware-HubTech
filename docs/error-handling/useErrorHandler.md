# useErrorHandler Hook

The `useErrorHandler` hook provides a standardized approach to handling asynchronous errors in your components. It follows the modular architecture principles of our application by creating a consistent API for error handling while maintaining loose coupling between components.

## Features

- Error state tracking and management
- Loading state handling
- Utility methods for handling errors
- Promise wrapping for easier error management
- Integration with the error monitoring system
- Method to reset error state

## Installation

The hook is available as part of the core error handling system:

```tsx
import useErrorHandler from 'src/core/error/useErrorHandler';
```

## Basic Usage

```tsx
import React from 'react';
import useErrorHandler from 'src/core/error/useErrorHandler';

const MyComponent = () => {
  // Initialize the hook with optional context
  const { error, isLoading, handleError, wrapAsync, handlePromise, reset } = useErrorHandler({
    context: { component: 'MyComponent' },
    onError: (err) => {
      console.log('Custom error handling:', err.message);
    },
    captureForMonitoring: true  // Default is true
  });

  // Rest of component...
  
  // To access error state:
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  // To show loading state:
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // ... rest of component
};
```

## API Reference

### Hook Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `context` | `Record<string, any>` | `{}` | Additional context to include with errors |
| `FallbackComponent` | `React.ComponentType<{ error: TError; resetError: () => void }>` | - | Component to render when error occurs |
| `onError` | `(error: TError) => void` | - | Function to call when an error is handled |
| `captureForMonitoring` | `boolean` | `true` | Whether to automatically capture errors for monitoring |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `error` | `Error \| null` | The current error state |
| `isLoading` | `boolean` | Loading state indicator |
| `handleError` | `(error: Error, context?: {}) => void` | Function to handle an error manually |
| `wrapAsync` | `<TArgs, TReturn>(fn: (...args: TArgs[]) => Promise<TReturn>, context?: {}) => (...args: TArgs[]) => Promise<TReturn \| undefined>` | Function to wrap async functions with error handling |
| `handlePromise` | `<T>(promise: Promise<T>, context?: {}) => Promise<T>` | Function to handle a promise with error handling |
| `reset` | `() => void` | Function to reset the error state |

## Error Handling Patterns

### Pattern 1: Wrapping Async Functions

Use `wrapAsync` to wrap an async function with error handling:

```tsx
// Define your async function that might throw errors
const fetchData = wrapAsync(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return response.json();
  },
  { operation: 'fetchUserData' } // Additional context
);

// Use the wrapped function
const handleClick = async () => {
  const data = await fetchData('123');
  if (data) {
    // Handle successful result
  }
};
```

### Pattern 2: Handling Promises Directly

Use `handlePromise` to handle promises with error handling:

```tsx
const handleSubmit = () => {
  handlePromise(
    api.submitForm(formData),
    { operation: 'submitForm' }
  )
    .then(result => {
      // Handle success
    })
    .catch(() => {
      // Error is already handled by handlePromise
      // This block is optional for additional cleanup
    });
};
```

### Pattern 3: Manual Error Handling

Use `handleError` for manual error handling:

```tsx
const processData = async () => {
  try {
    // Custom async logic
    const result = await complexOperation();
    return result;
  } catch (err) {
    handleError(err, { operation: 'processData' });
    return null;
  }
};
```

## Integration with Error Boundary

The `useErrorHandler` hook works well with React Error Boundaries. You can use the `withAsyncErrorHandling` HOC to wrap your components:

```tsx
import { withAsyncErrorHandling } from 'src/core/error/withAsyncErrorHandling';

const MyAsyncComponent = ({ errorHandler }) => {
  // Use the injected errorHandler
  const { handlePromise } = errorHandler;
  
  // Component implementation
};

export default withAsyncErrorHandling(MyAsyncComponent, {
  errorContext: { feature: 'my-feature' }
});
```

## Best Practices

1. **Provide Context**: Always provide meaningful context when handling errors
2. **Categorize Errors**: Use appropriate error categories to help with monitoring
3. **Reset Errors**: Implement UI to allow users to retry or reset error states
4. **Handle Loading States**: Show loading indicators when async operations are in progress
5. **Centralize Error UI**: Create consistent error display patterns across your application

## Example Components

For complete working examples, see:
- `src/core/error/useErrorHandler.example.tsx` - Basic example
- `src/core/error/AsyncErrorHandlingExample.tsx` - Advanced example with multiple patterns 