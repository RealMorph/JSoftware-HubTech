# Theme-Aware Base Components

This document provides an overview of the base components in our theme-aware component library. These components are designed to work seamlessly with our theme system, adapting their styling based on the current theme.

## Overview

All base components:
- Are built with TypeScript for type safety
- Adapt automatically to theme changes
- Support accessibility requirements
- Include comprehensive test coverage
- Include demo components for visualization
- **Are self-contained and independently usable**
- **Can be enabled/disabled without affecting other components**

## Component Modularity

Our components follow strict modularity principles:

1. **Self-contained**: Each component contains all necessary code and doesn't rely on external dependencies beyond the core theme system
2. **Independently usable**: Components can be used in isolation and don't require other components to function
3. **Feature-independent**: Components don't depend on specific features being enabled
4. **Configurable**: All component behavior can be controlled through props
5. **Stateless when possible**: Components prefer stateless design patterns
6. **Theme-aware but theme-agnostic**: Components adapt to any theme that follows our theme structure

### Implementing Modular Components

When creating new components:

1. Ensure the component imports only from the core theme system or other base components
2. Use composition over inheritance
3. Keep internal state isolated and don't rely on global state
4. Document all dependencies clearly
5. Implement fallback styling if theme access fails
6. Expose a consistent public API

## Components

### Button

The Button component provides a clickable element styled based on the current theme.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'text'` | `'primary'` | The visual style of the button |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | The size of the button |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `fullWidth` | `boolean` | `false` | Whether the button should take up the full width of its container |
| `startIcon` | `React.ReactNode` | `undefined` | Icon to display at the start of the button |
| `endIcon` | `React.ReactNode` | `undefined` | Icon to display at the end of the button |
| `onClick` | `(event: React.MouseEvent<HTMLButtonElement>) => void` | `undefined` | Function called when the button is clicked |

#### Usage

```tsx
import { Button } from '../components/base';

function MyComponent() {
  return (
    <>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary" size="small">Secondary Small</Button>
      <Button variant="outline" disabled>Disabled Outline</Button>
      <Button variant="text" fullWidth>Full Width Text Button</Button>
    </>
  );
}
```

#### Theming

The Button component uses the following theme properties:

- Typography: `typography.scale`, `typography.weights`
- Colors: Based on variant (primary uses `colors.primary`, etc.)
- Spacing: Padding, margins
- Border radius: Based on theme spacing system

### TextField

The TextField component provides a themed input field with various configuration options.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label for the text field |
| `helperText` | `string` | `undefined` | Helper text to display below the input |
| `error` | `boolean` | `false` | Whether the field is in an error state |
| `required` | `boolean` | `false` | Whether the field is required |
| `variant` | `'outlined' \| 'filled' \| 'standard'` | `'outlined'` | The visual style of the text field |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | The size of the text field |
| `fullWidth` | `boolean` | `false` | Whether the field should take up the full width of its container |
| `startAdornment` | `React.ReactNode` | `undefined` | Element to display at the start of the input |
| `endAdornment` | `React.ReactNode` | `undefined` | Element to display at the end of the input |
| `onChange` | `(value: string, event: React.ChangeEvent<HTMLInputElement>) => void` | `undefined` | Function called when the input value changes |

#### Usage

```tsx
import { TextField } from '../components/base';

function MyComponent() {
  const [value, setValue] = useState('');
  
  const handleChange = (newValue: string) => {
    setValue(newValue);
  };
  
  return (
    <>
      <TextField 
        label="Username" 
        placeholder="Enter username"
        value={value}
        onChange={handleChange}
      />
      
      <TextField 
        label="Password" 
        type="password"
        required
        helperText="Must be at least 8 characters"
      />
      
      <TextField 
        variant="filled"
        label="Search"
        startAdornment={<SearchIcon />}
      />
      
      <TextField 
        error
        label="Email"
        helperText="Invalid email format"
      />
    </>
  );
}
```

#### Theming

The TextField component uses the following theme properties:

- Colors: Text color, border color, background color, error color
- Typography: Font size, font family
- Spacing: Margins, padding, border radius
- Transitions: Color transitions on focus/hover

## Demo Components

### ButtonDemo

The ButtonDemo component showcases the Button component with various configurations. Use it to explore different combinations of props and see how they affect the appearance and behavior of the Button component.

```tsx
import { ButtonDemo } from '../components/base';

function App() {
  return (
    <div>
      <h1>Button Component Showcase</h1>
      <ButtonDemo />
    </div>
  );
}
```

### TextFieldDemo

The TextFieldDemo component showcases the TextField component with various configurations. It displays different variants, sizes, states, and usage examples.

```tsx
import { TextFieldDemo } from '../components/base';

function App() {
  return (
    <div>
      <h1>TextField Component Showcase</h1>
      <TextFieldDemo />
    </div>
  );
}
```

## Theme Integration

All base components use our CSS-in-JS system to retrieve theme values and apply them appropriately. Components access the current theme through the `useTheme` hook and apply styling based on the theme's configuration.

```tsx
// Example of theme integration in a component
import { useTheme } from '../../core/theme/theme-context';
import { getThemeValue } from '../../core/theme/styled';

function ThemedComponent() {
  const { currentTheme } = useTheme();
  
  // Access theme values
  const primaryColor = currentTheme 
    ? getThemeValue(currentTheme, 'colors.primary.500') 
    : '#3B82F6';
  
  return (
    <div style={{ color: primaryColor }}>
      This text uses the primary color from the theme
    </div>
  );
}
```

## Best Practices

1. **Always use theme values for styling**: Don't hardcode colors, spacing, or typography values.
2. **Support all variants and sizes**: Ensure your component handles all specified variants and sizes.
3. **Provide clear prop documentation**: Document all props with clear descriptions and types.
4. **Include accessibility attributes**: Use appropriate ARIA attributes and focus management.
5. **Test thoroughly**: Create tests for all component features and edge cases.
6. **Create demo components**: Showcase all component capabilities in a demo component.

## Adding New Components

When adding a new base component:

1. Create the component file in `src/components/base/`
2. Define a clear interface for the component's props
3. Implement the component using theme values
4. Add tests in `src/components/base/__tests__/`
5. Create a demo component
6. Export the component in `src/components/base/index.ts`
7. Update this documentation 