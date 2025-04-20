# Alert Component Documentation

The Alert system provides a flexible and customizable way to display notifications to users. It includes a context provider, hooks for usage, and styled components for consistent appearance.

## Features

- Four alert types: success, error, warning, info
- Customizable positions: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- Auto-close with configurable duration
- Optional icons
- Customizable titles and messages
- Animation for displaying and dismissing alerts
- Context-based management system

## Installation

The Alert system is built into the application and requires no additional installation. It uses `styled-components` and React context.

## Basic Usage

### Step 1: Wrap your application with the AlertProvider

```tsx
// App.tsx or a parent component
import { AlertProvider } from './components/feedback/AlertContext';

function App() {
  return (
    <AlertProvider>
      {/* Your application components */}
    </AlertProvider>
  );
}
```

### Step 2: Use the useAlert hook in your components

```tsx
// YourComponent.tsx
import { useAlert } from './components/feedback/AlertContext';

function YourComponent() {
  const alert = useAlert();
  
  const handleSuccess = () => {
    alert.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    alert.error('An error occurred while processing your request.');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Trigger Success Alert</button>
      <button onClick={handleError}>Trigger Error Alert</button>
    </div>
  );
}
```

## Alert Types

The system provides four types of alerts:

```tsx
// Success alert
alert.success('Your message here');

// Error alert
alert.error('Your error message here');

// Warning alert
alert.warning('Your warning message here');

// Info alert
alert.info('Your information message here');
```

## Customization Options

You can customize various aspects of the alerts:

```tsx
// With title
alert.success('Operation completed successfully!', {
  title: 'Success',
});

// Without auto-close
alert.info('This alert will stay until dismissed.', {
  autoClose: false,
});

// Custom duration (in milliseconds)
alert.success('This will disappear in 10 seconds.', {
  duration: 10000,
});

// Without icon
alert.warning('This alert has no icon.', {
  showIcon: false,
});

// Different position
alert.info('This appears in the bottom-center.', {
  position: 'bottom-center',
});
```

## Default Settings

You can configure default settings for all alerts:

```tsx
// Set default position
alert.setDefaultPosition('top-left');

// Set default duration
alert.setDefaultDuration(3000);

// Set default auto-close
alert.setDefaultAutoClose(false);

// Set default icon visibility
alert.setDefaultShowIcon(false);
```

## Managing Alerts

You can programmatically manage alerts:

```tsx
// Add alert (returns alert ID)
const alertId = alert.addAlert({
  type: 'success',
  message: 'Custom alert',
  title: 'Optional title',
});

// Remove specific alert
alert.removeAlert(alertId);

// Clear all alerts
alert.clearAlerts();
```

## Positions

Available positions for alerts:

- `top-right` (default)
- `top-left`
- `bottom-right`
- `bottom-left`
- `top-center`
- `bottom-center`

## API Reference

### AlertProvider

```tsx
<AlertProvider
  defaultPosition="top-right"
  defaultAutoClose={true}
  defaultDuration={5000}
  defaultShowIcon={true}
>
  {children}
</AlertProvider>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultPosition` | `AlertPosition` | `'top-right'` | Default position for alerts |
| `defaultAutoClose` | `boolean` | `true` | Whether alerts should auto-close by default |
| `defaultDuration` | `number` | `5000` | Default duration (in ms) before alerts auto-close |
| `defaultShowIcon` | `boolean` | `true` | Whether alerts should show icons by default |

### useAlert Hook

The `useAlert` hook returns an object with the following methods and properties:

#### Methods

| Method | Parameters | Return | Description |
|--------|------------|--------|-------------|
| `success` | `(message: string, options?: AlertOptions)` | `string` (alert ID) | Show a success alert |
| `error` | `(message: string, options?: AlertOptions)` | `string` (alert ID) | Show an error alert |
| `warning` | `(message: string, options?: AlertOptions)` | `string` (alert ID) | Show a warning alert |
| `info` | `(message: string, options?: AlertOptions)` | `string` (alert ID) | Show an info alert |
| `addAlert` | `(alert: AlertOptions & { type: AlertType })` | `string` (alert ID) | Add a custom alert |
| `removeAlert` | `(id: string)` | `void` | Remove a specific alert |
| `clearAlerts` | `()` | `void` | Remove all alerts |
| `setDefaultPosition` | `(position: AlertPosition)` | `void` | Set default position |
| `setDefaultDuration` | `(duration: number)` | `void` | Set default duration |
| `setDefaultAutoClose` | `(autoClose: boolean)` | `void` | Set default auto-close |
| `setDefaultShowIcon` | `(showIcon: boolean)` | `void` | Set default icon visibility |

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `alerts` | `AlertItem[]` | Array of current alert items |

### Types

```tsx
// Alert types
type AlertType = 'success' | 'error' | 'warning' | 'info';

// Alert positions
type AlertPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';

// Alert item
interface AlertItem {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  showIcon?: boolean;
  position?: AlertPosition;
}

// Alert options (without ID)
type AlertOptions = Omit<AlertItem, 'id' | 'type'>;
```

## Example Components

For a complete demonstration of the Alert system's capabilities, check out the `AlertExample` component in `src/components/feedback/AlertExample.tsx`. 