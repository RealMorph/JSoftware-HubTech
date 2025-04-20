# Telemetry System

This module provides a comprehensive telemetry system for tracking user interactions, application performance, and usage patterns while respecting user privacy and compliance requirements.

## Overview

The telemetry system uses [PostHog](https://posthog.com/) as the backend service for data collection and analysis. It provides a modular, privacy-first approach to gathering user analytics to help improve the application.

## Key Features

- **Privacy-first**: Includes GDPR-compliant consent management and respects browser DNT (Do Not Track) settings
- **Modular Integration**: Can be enabled/disabled without affecting other parts of the application
- **Typed Events**: Type-safe event tracking with predefined event categories
- **Performance Tracking**: Utilities for measuring and reporting performance metrics
- **Automatic Page View Tracking**: Built-in integration with React Router
- **Cookie Consent Banner**: Complete GDPR-compliant cookie consent UI
- **Data Sanitization**: Automatic filtering of sensitive information

## System Components

The telemetry system consists of the following key components:

1. **PostHogService**: Core service that interfaces with the PostHog SDK
2. **TelemetryProvider**: React context provider for application-wide telemetry access
3. **useTelemetry**: React hook for accessing telemetry functions in components
4. **CookieConsent**: UI component for managing user consent
5. **Event Tracking Utilities**: Helper functions for consistent event tracking

## Getting Started

### 1. Initialize the Telemetry Provider

In your application's entry point, wrap your component tree with the `TelemetryProvider`:

```tsx
import { TelemetryProvider } from '@/core/telemetry/TelemetryProvider';
import { CookieConsent } from '@/core/telemetry/CookieConsent';

const App = () => {
  const telemetryConfig = {
    apiKey: process.env.REACT_APP_POSTHOG_API_KEY,
    enabled: process.env.NODE_ENV === 'production',
    debug: process.env.NODE_ENV === 'development',
    captureIP: false,
    sessionRecording: {
      enabled: true,
      sampleRate: 0.5
    },
    privacy: {
      anonymizeIPs: true,
      maskProperties: ['email', 'phone']
    }
  };

  return (
    <TelemetryProvider config={telemetryConfig}>
      <YourAppRoot />
      <CookieConsent />
    </TelemetryProvider>
  );
};
```

### 2. Use Telemetry Hooks

```tsx
import { useTelemetry } from '@/core/telemetry/TelemetryProvider';
import { UIEvents } from '@/core/telemetry/constants';

const YourComponent = () => {
  const { trackEvent, isEnabled } = useTelemetry();

  const handleButtonClick = () => {
    // Track the button click event
    trackEvent(UIEvents.BUTTON_CLICKED, {
      button_id: 'submit-form',
      form_type: 'contact'
    });
    
    // Proceed with the actual action
    submitForm();
  };

  return (
    <button onClick={handleButtonClick}>
      Submit
    </button>
  );
};
```

### 3. Use Event Tracking Utilities

```tsx
import { trackButtonClick, trackFormEvent } from '@/core/telemetry/utils/eventTracking';
import { FormEvents } from '@/core/telemetry/constants';

const ContactForm = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Track form submission
    trackFormEvent(FormEvents.FORM_SUBMITTED, 'contact-form', {
      form_length: 5,
      time_spent: 45
    });
    
    // Submit the form
    submitToServer();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" onClick={() => trackButtonClick('submit-contact', 'Submit')}>
        Submit
      </button>
    </form>
  );
};
```

## Privacy Compliance

The telemetry system is built with privacy compliance in mind:

1. **User Consent**: All tracking requires explicit user consent
2. **Data Minimization**: Only collects what's necessary
3. **Data Sanitization**: Automatically redacts sensitive information
4. **Respect DNT**: Honors browser "Do Not Track" settings
5. **Cookie Controls**: Provides granular cookie consent options
6. **Local Storage**: Uses localStorage instead of cookies when possible
7. **Anonymization**: Option to anonymize IP addresses

## Event Categories

The system organizes events into logical categories to maintain consistency:

- **App Events**: Application lifecycle events (launch, page views, settings changes)
- **Auth Events**: Authentication-related events (sign in, sign up, password reset)
- **Navigation Events**: User navigation patterns (route changes, link clicks)
- **Form Events**: Form interactions (submissions, validations, abandonment)
- **Feature Events**: Feature usage (feature enabled, configured, used)
- **Error Events**: Application errors (API errors, validation errors)
- **UI Events**: UI interactions (button clicks, modals, dropdowns)
- **Performance Events**: Performance metrics (load times, API response times)

## Performance Tracking Utilities

The system includes utilities for tracking performance metrics:

```tsx
import { 
  createPerformanceTracker, 
  trackAPIPerformance 
} from '@/core/telemetry/utils/eventTracking';
import { PerformanceEvents } from '@/core/telemetry/constants';

// Create a performance tracker for a component render
const YourComponent = () => {
  useEffect(() => {
    const endTracking = createPerformanceTracker(PerformanceEvents.RENDER_TIME, {
      component: 'YourComponent'
    });
    
    // When component is fully rendered and interactive
    return () => {
      // Automatically tracks the duration
      endTracking();
    };
  }, []);
  
  return <div>Your Component</div>;
};

// Track API performance
const fetchData = async () => {
  const startTime = performance.now();
  
  try {
    const response = await api.get('/endpoint');
    const duration = performance.now() - startTime;
    
    trackAPIPerformance('/endpoint', duration, response.status, {
      data_size: JSON.stringify(response.data).length
    });
    
    return response.data;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackAPIPerformance('/endpoint', duration, error.status || 500, {
      error: true,
      error_type: error.name
    });
    throw error;
  }
};
```

## Configuration Options

The telemetry system supports the following configuration options:

| Option | Description | Default |
|--------|-------------|---------|
| `apiKey` | PostHog API key | Required |
| `host` | PostHog host URL | https://app.posthog.com |
| `enabled` | Whether telemetry is enabled | false |
| `debug` | Enable debug mode | false |
| `captureIP` | Whether to capture IP addresses | false |
| `sessionRecording.enabled` | Enable session recording | false |
| `sessionRecording.sampleRate` | Percentage of sessions to record (0-1) | 1.0 |
| `privacy.anonymizeIPs` | Anonymize IP addresses | true |
| `privacy.maskProperties` | Additional properties to mask | [] |

## Customizing the Cookie Consent Banner

The CookieConsent component can be customized with the following props:

| Prop | Description | Default |
|------|-------------|---------|
| `cookieExpiration` | Days until consent expires | 365 |
| `privacyPolicyUrl` | Link to privacy policy | /privacy-policy |
| `showAdvancedOptions` | Show granular consent options | true |
| `autoHide` | Hide banner after consent given | true | 