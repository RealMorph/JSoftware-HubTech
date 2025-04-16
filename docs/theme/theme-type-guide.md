# Theme Type System Guide

This guide explains the theme type system used in our application, with examples of how to properly use it in your components.

## Core Theme Types

The core of our theme system is the `ThemeConfig` interface, which defines the structure of all theme objects:

```typescript
// From src/core/theme/consolidated-types.ts
export interface ThemeConfig {
  colors: ThemeColors;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  breakpoints: BreakpointConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  transitions: TransitionConfig;
  id?: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

This interface is the single source of truth for theme structure in the application.

## Theme Properties

### Colors

The `ThemeColors` interface defines all color properties:

```typescript
export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string | { 
    primary: string; 
    secondary: string; 
    disabled: string; 
  };
  background: string;
  border: string;
  white: string;
  surface: string;
}
```

### Typography

Typography properties are defined in the `TypographyConfig` interface:

```typescript
export interface TypographyConfig {
  fontFamily: {
    base: string;
    heading: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    none: number;
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}
```

### Spacing

Spacing is defined by the `SpacingConfig` interface:

```typescript
export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}
```

### Borders, Shadows, and Transitions

Similar interfaces define other theme properties:

```typescript
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ShadowConfig {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

export interface TransitionConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    linear: string;
  };
}
```

## Using Theme Properties in Components

### The Recommended Way: getThemeValue Utility

Always use the `getThemeValue` utility to access theme properties:

```typescript
import { getThemeValue } from '../../core/theme/theme-utils';
import styled from '@emotion/styled';

const StyledButton = styled.button`
  background-color: ${props => getThemeValue(props.theme, 'colors.primary', '#3b82f6')};
  padding: ${props => getThemeValue(props.theme, 'spacing.md', '1rem')};
  border-radius: ${props => getThemeValue(props.theme, 'borderRadius.md', '0.375rem')};
  font-size: ${props => getThemeValue(props.theme, 'typography.fontSize.md', '1rem')};
  transition: all ${props => getThemeValue(props.theme, 'transitions.duration.normal', '200ms')};
`;
```

This approach provides:

1. Fallback values if the theme property doesn't exist
2. Path normalization for common mistakes
3. Support for legacy theme structures

### Creating a Theme Accessor

For components with many theme values, create an accessor for cleaner code:

```typescript
import { createThemeAccessor } from '../../core/theme/theme-utils';
import styled from '@emotion/styled';

const Card = styled.div(props => {
  const t = createThemeAccessor(props.theme);
  
  return `
    background-color: ${t('colors.surface', '#ffffff')};
    border: 1px solid ${t('colors.border', '#e2e8f0')};
    border-radius: ${t('borderRadius.md', '0.375rem')};
    padding: ${t('spacing.lg', '1.5rem')};
    box-shadow: ${t('shadows.md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')};
  `;
});
```

### Type Safety with Theme Components

Use TypeScript with styled components for better type safety:

```typescript
import { ThemeConfig } from '../../core/theme/consolidated-types';
import styled from '@emotion/styled';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  theme: ThemeConfig;
}

const getButtonColor = (props: ButtonProps) => {
  if (props.variant === 'secondary') {
    return props.theme.colors.secondary;
  }
  return props.theme.colors.primary;
};

const Button = styled.button<ButtonProps>`
  background-color: ${getButtonColor};
  font-size: ${props => {
    const sizeMap = {
      sm: props.theme.typography.fontSize.sm,
      md: props.theme.typography.fontSize.md,
      lg: props.theme.typography.fontSize.lg,
    };
    return sizeMap[props.size || 'md'];
  }};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
`;
```

## Theme Validation

Use the `validateTheme` utility to ensure your theme follows the required structure:

```typescript
import { validateTheme } from '../../core/theme/theme-utils';
import myCustomTheme from './my-custom-theme';

// Check if the theme is valid
const errors = validateTheme(myCustomTheme);
if (errors.length > 0) {
  console.error('Theme validation errors:', errors);
}
```

## Creating Custom Themes

When creating custom themes, extend the default theme and override only what you need:

```typescript
import { ThemeConfig } from '../../core/theme/consolidated-types';
import { defaultTheme } from '../../core/theme/default-theme';

const myCustomTheme: ThemeConfig = {
  ...defaultTheme,
  id: 'my-custom-theme',
  name: 'My Custom Theme',
  colors: {
    ...defaultTheme.colors,
    primary: '#8b5cf6', // Purple
    secondary: '#ec4899', // Pink
  },
  shadows: {
    ...defaultTheme.shadows,
    md: '0 4px 8px rgba(0, 0, 0, 0.2)', // Custom shadow
  },
};

export default myCustomTheme;
```

## Migrating from Legacy Theme Access

If you're migrating from direct theme access, here's how to update your code:

### Before:

```typescript
const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.scale.base};
  padding: ${props => props.theme.spacing[4]};
`;
```

### After:

```typescript
import { getThemeValue } from '../../core/theme/theme-utils';

const Button = styled.button`
  background-color: ${props => getThemeValue(props.theme, 'colors.primary', '#3b82f6')};
  font-size: ${props => getThemeValue(props.theme, 'typography.fontSize.md', '1rem')};
  padding: ${props => getThemeValue(props.theme, 'spacing.md', '1rem')};
`;
```

## Theme Debugging

If you're having issues with theme access, you can debug the theme structure:

```tsx
import { useTheme } from '../../core/theme/ThemeProvider';
import { validateTheme } from '../../core/theme/theme-utils';

function ThemeDebugComponent() {
  const { currentTheme } = useTheme();
  
  console.log('Current theme:', currentTheme);
  const errors = validateTheme(currentTheme);
  
  return (
    <div>
      <h2>Theme Debug</h2>
      {errors.length > 0 ? (
        <div>
          <h3>Theme Errors:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Theme is valid</p>
      )}
      <pre>{JSON.stringify(currentTheme, null, 2)}</pre>
    </div>
  );
}
```

## Common Issues and Solutions

### Problem: Theme property not found

```
Warning: Theme value not found: typography.fontSize.base
```

**Solution**: Use the new property path with `getThemeValue` for consistent access:

```typescript
// Instead of:
const fontSize = theme.typography.scale.base;

// Use:
const fontSize = getThemeValue(theme, 'typography.fontSize.md', '1rem');
```

### Problem: Nested object cannot be used as a string

```
Error: Type '{ primary: string; secondary: string; }' is not assignable to type 'string'
```

**Solution**: Access the nested property directly with the correct path:

```typescript
// Instead of:
const textColor = theme.colors.text;

// Use:
const textColor = getThemeValue(theme, 'colors.text.primary', '#000000');
```

### Problem: Array index not found

```
Error: Element implicitly has an 'any' type because expression of type '2' can't be used to index type 'SpacingConfig'
```

**Solution**: Use the correct named property instead of numeric index:

```typescript
// Instead of:
const spacing = theme.spacing[2];

// Use:
const spacing = getThemeValue(theme, 'spacing.sm', '0.5rem');
``` 