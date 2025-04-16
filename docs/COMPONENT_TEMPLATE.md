# Component Name

## Overview
Brief description of what the component does and its purpose.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | The visual style of the component |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | The size of the component |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `className` | `string` | `''` | Additional CSS class names |

### Events

| Event | Description |
|-------|-------------|
| `onClick` | Fired when the component is clicked |
| `onFocus` | Fired when the component receives focus |
| `onBlur` | Fired when the component loses focus |

## Usage Examples

### Basic Usage
```jsx
import { ComponentName } from 'blue-orb-magic';

function Example() {
  return <ComponentName>Content</ComponentName>;
}
```

### With Different Variants
```jsx
import { ComponentName } from 'blue-orb-magic';

function Example() {
  return (
    <>
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
      <ComponentName variant="outline">Outline</ComponentName>
    </>
  );
}
```

### With Different Sizes
```jsx
import { ComponentName } from 'blue-orb-magic';

function Example() {
  return (
    <>
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </>
  );
}
```

## Accessibility

- Keyboard navigation: Tab, Enter, Space
- Screen reader support: Uses appropriate ARIA attributes
- Focus handling: Visible focus indicators
- Color contrast: Meets WCAG 2.1 AA standards

## Design Tokens

| Token | Purpose |
|-------|---------|
| `component.backgroundColor` | Background color of the component |
| `component.textColor` | Text color of the component |
| `component.borderColor` | Border color of the component |
| `component.borderRadius` | Border radius of the component |
| `component.padding` | Padding of the component |

## Implementation Notes

Any important implementation details, edge cases, or known limitations.

## Related Components

- [RelatedComponent1](./RelatedComponent1.md)
- [RelatedComponent2](./RelatedComponent2.md) 