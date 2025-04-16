# Debugging Tools

This document outlines the debugging tools and features available in the project.

## Overview

The project includes a comprehensive set of debugging tools to help developers identify and fix issues during development. These tools are only enabled in development mode and are automatically disabled in production builds.

## Features

### 1. Debug Panel

A floating debug panel that provides real-time information and controls:

- **Log Level Control**: Adjust the verbosity of debug output
- **Feature Toggles**: Enable/disable specific debugging features
- **Performance Metrics**: Monitor memory usage and FPS
- **Component Profiling**: Track component render times
- **State Tracking**: Monitor state changes
- **Network Logging**: Track API calls and responses

To show the debug panel, add it to your app:

```tsx
import { DebugPanel } from '@core/debug/DebugPanel';

// Add to your app's root component
<DebugPanel position="bottom-right" />
```

### 2. Error Boundary

A React error boundary that catches and handles runtime errors:

```tsx
import { ErrorBoundary } from '@core/error/ErrorBoundary';

// Wrap components that need error handling
<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

### 3. Error Logging

Comprehensive error logging system with different severity levels:

```typescript
import { logError } from '@core/error/error-logger';

// Log an error with context
logError('Something went wrong', {
  error: new Error('Failed to fetch data'),
  context: { userId: '123' },
  severity: 'error'
});
```

### 4. Debug Configuration

Control debug features programmatically:

```typescript
import {
  enableDebugFeature,
  disableDebugFeature,
  setDebugLogLevel
} from '@core/debug/debug-config';

// Enable specific features
enableDebugFeature('componentProfiling');
enableDebugFeature('stateTracking');

// Set log level
setDebugLogLevel('debug');
```

## Source Maps

Source maps are enabled in development for better debugging:

- Full source maps in development
- Hidden source maps in production
- Preserved function and class names in development
- Stack trace preservation

## Browser DevTools Integration

The project is configured to work with browser developer tools:

1. **React Developer Tools**
   - Component inspection
   - Props and state monitoring
   - Performance profiling

2. **Chrome DevTools**
   - Source maps support
   - Network request monitoring
   - Performance profiling
   - Memory usage analysis

## Best Practices

1. **Error Boundaries**
   - Place error boundaries strategically around critical components
   - Provide meaningful fallback UIs
   - Log caught errors for debugging

2. **Logging**
   - Use appropriate log levels
   - Include relevant context
   - Avoid logging sensitive information

3. **Performance Monitoring**
   - Monitor component render times
   - Track memory usage
   - Profile expensive operations

4. **Development Mode**
   - Keep debug features enabled only in development
   - Use source maps for better stack traces
   - Leverage browser developer tools

## Troubleshooting

Common issues and solutions:

1. **Source Maps Not Working**
   - Ensure source maps are enabled in your browser
   - Check that the development server is running
   - Clear browser cache

2. **Debug Panel Not Showing**
   - Verify you're in development mode
   - Check that debug features are enabled
   - Clear local storage if settings are corrupted

3. **Performance Issues**
   - Use the performance tab in browser DevTools
   - Enable component profiling
   - Monitor memory usage and leaks

## Additional Resources

- [React Developer Tools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Performance Profiling](https://reactjs.org/docs/profiler.html)
- [Error Boundary Documentation](https://reactjs.org/docs/error-boundaries.html) 