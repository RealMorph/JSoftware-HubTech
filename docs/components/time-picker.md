# TimePicker Component

The TimePicker component allows users to select a time value using an intuitive interface. It supports both 12-hour and 24-hour formats, and can be configured for various use cases.

## Features

- Full time selection with hour, minute, and optional seconds
- Support for both 12-hour and 24-hour formats
- Time range constraints with min/max time validation
- Customizable time step intervals (e.g., 15-minute increments)
- Form integration with validation support
- Accessibility features
- Full theme system integration

## Usage

```tsx
import { TimePicker } from '../components/base/TimePicker';

// Basic usage
<TimePicker 
  label="Select Time"
  onChange={(time) => console.log(time)}
/>

// With 12-hour format
<TimePicker 
  label="Select Time"
  hourFormat="12"
  onChange={(time) => console.log(time)}
/>

// With seconds and custom step intervals
<TimePicker 
  label="Select Time"
  showSeconds={true}
  minuteStep={15}
  secondStep={30}
  onChange={(time) => console.log(time)}
/>

// With time range constraints
<TimePicker 
  label="Business Hours Only"
  minTime={new Date(new Date().setHours(9, 0, 0, 0))}
  maxTime={new Date(new Date().setHours(17, 0, 0, 0))}
  helperText="Select a time between 9 AM and 5 PM"
  onChange={(time) => console.log(time)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label for the time picker |
| `value` | `Date \| null` | `null` | Selected time value |
| `onChange` | `(value: Date \| null) => void` | - | Callback when time selection changes |
| `placeholder` | `string` | `"Select time"` | Placeholder text for the input |
| `helperText` | `string` | - | Helper text to display below the input |
| `errorMessage` | `string` | - | Error message to display |
| `error` | `boolean \| string` | `false` | Whether the field has an error |
| `required` | `boolean` | `false` | Whether the field is required |
| `disabled` | `boolean` | `false` | Whether the field is disabled |
| `hourFormat` | `"12" \| "24"` | `"24"` | Hour format (12 or 24) |
| `minTime` | `Date` | - | Minimum selectable time |
| `maxTime` | `Date` | - | Maximum selectable time |
| `minuteStep` | `number` | `1` | Minute step (e.g., 15 for quarter-hour increments) |
| `showSeconds` | `boolean` | `false` | Whether to show seconds selector |
| `secondStep` | `number` | `1` | Second step |
| `format` | `string` | - | Time format for display (e.g., 'HH:mm', 'hh:mm a') |
| `className` | `string` | - | Custom class name |

## Form Integration

The TimePicker component can be integrated with the `FormContainer` component for form validation:

```tsx
<FormContainer
  fields={[
    {
      name: 'meetingTime',
      label: 'Meeting Time',
      type: 'time', // Use 'time' type for TimePicker
      required: true,
      validationRules: [
        {
          validator: (value) => {
            if (!value) return false;
            const time = new Date(value);
            const hours = time.getHours();
            return hours >= 9 && hours < 17; // 9 AM to 5 PM
          },
          message: 'Meeting time must be during business hours (9 AM - 5 PM)'
        }
      ]
    }
  ]}
  onSubmit={(values) => console.log(values)}
  submitButtonText="Schedule Meeting"
/>
```

## Theme Integration

The TimePicker component uses the theme system to ensure consistent styling. It respects the following theme properties:

- `colors.text.primary`, `colors.text.secondary`, `colors.text.disabled`
- `colors.background.paper`, `colors.background.disabled`
- `colors.primary.main`, `colors.primary.light`, `colors.primary.dark`, `colors.primary.contrastText`
- `colors.error.main`, `colors.error.light`
- `colors.border.main`, `colors.border.light`, `colors.border.disabled`
- `typography.fontFamily`
- `borderRadius.sm`, `borderRadius.md`
- `transitions.duration.shorter`, `transitions.easing.easeInOut`
- `shadows.lg`

## Accessibility

The TimePicker component follows accessibility best practices:

- Proper labeling and ARIA attributes for screen readers
- Keyboard navigation support
- Focus management
- Color contrast that meets WCAG standards

## Demo

Check out the `TimePickerDemo` component for comprehensive examples of all the TimePicker features and configurations. 