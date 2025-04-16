# Theme Usage Guide

This guide explains how to correctly use the theme system in the application.

## Theme Access

### Recommended: Use Theme Access Utility

Always use the `getThemeValue` utility function to access theme properties. This provides:

1. Consistent access patterns
2. Fallback values for missing properties
3. Path normalization for common mistakes
4. Backwards compatibility with older theme structures

```typescript
import { getThemeValue } from '../consolidated-types';

// In a styled component
const StyledButton = styled.button`
  background-color: ${({ theme }) => getThemeValue(theme, 'colors.primary', '#3b82f6')};
  padding: ${({ theme }) => getThemeValue(theme, 'spacing.md', '0.5rem')};
  border-radius: ${({ theme }) => getThemeValue(theme, 'borderRadius.md', '0.25rem')};
`;

// In a regular component
function ThemedComponent({ theme }) {
  const primaryColor = getThemeValue(theme, 'colors.primary', '#3b82f6');
  return <div style={{ color: primaryColor }}>Themed Content</div>;
}
```

### Alternative: Use the Theme Accessor Creator

For components with many theme values, create an accessor once:

```typescript
import { createThemeAccessor } from '../consolidated-types';

function ComplexThemedComponent({ theme }) {
  const themeVal = createThemeAccessor(theme);
  
  return (
    <div style={{ 
      color: themeVal('colors.text', '#111'),
      backgroundColor: themeVal('colors.background.primary', '#fff'),
      padding: themeVal('spacing.md', '1rem'),
      borderRadius: themeVal('borderRadius.base', '0.25rem')
    }}>
      Complex Themed Content
    </div>
  );
}
```

### Avoid: Direct Property Access

Don't access theme properties directly, as it's prone to errors:

```typescript
// DON'T DO THIS - fragile and error-prone
const BadComponent = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.primary};
`;
```

## Theme Structure

### Colors

Colors in the theme follow this structure:

```typescript
colors: {
  // Color scales (shades from 50 to 900)
  gray: { 50: '#f9fafb', 100: '#f3f4f6', /* ... */ },
  blue: { 50: '#eff6ff', 100: '#dbeafe', /* ... */ },
  // ... other color scales
  
  // Semantic colors
  primary: '#3b82f6', // or can be a full color scale
  secondary: '#8b5cf6',
  
  // UI colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6'
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af'
  },
  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db'
  },
  
  // State colors
  success: '#22c55e',
  warning: '#f97316',
  error: '#ef4444',
  info: '#0ea5e9'
}
```

When accessing colors, use the semantic names rather than direct color scales:

```typescript
// DO: Use semantic color names
color: ${({ theme }) => getThemeValue(theme, 'colors.primary', '#3b82f6')};

// DON'T: Access color scales directly unless you need a specific shade
color: ${({ theme }) => theme.colors.blue[500]};
```

### Typography

Typography follows this structure:

```typescript
typography: {
  scale: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    // ... larger sizes
  },
  weights: {
    thin: '100',
    // ... other weights
    bold: '700',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    // ... other line heights
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    // ... other letter spacings
  },
  family: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Georgia, serif',
    mono: 'Menlo, monospace'
  }
}
```

Access typography with the appropriate path:

```typescript
// Font size
font-size: ${({ theme }) => getThemeValue(theme, 'typography.scale.base', '1rem')};

// Font weight
font-weight: ${({ theme }) => getThemeValue(theme, 'typography.weights.bold', '700')};

// Font family
font-family: ${({ theme }) => getThemeValue(theme, 'typography.family.sans', 'system-ui')};
```

### Spacing

Spacing includes both semantic and numeric values:

```typescript
spacing: {
  xs: '0.25rem',
  sm: '0.5rem',
  base: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  // ... larger sizes
  
  // Numeric values (T-shirt sizing)
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  // ... other numeric values
  
  // Semantic spacing
  semantic: {
    component: {
      padding: '1rem',
      // ...
    },
    // ...
  }
}
```

Access spacing with the appropriate path:

```typescript
// Semantic spacing (preferred)
padding: ${({ theme }) => getThemeValue(theme, 'spacing.md', '1rem')};

// Numeric spacing (for grid systems)
gap: ${({ theme }) => getThemeValue(theme, 'spacing.4', '1rem')};
```

## Testing with Themes

When testing components that use the theme, always provide a complete mock theme:

```typescript
import { ThemeConfig } from '../consolidated-types';
import { ThemeProvider } from '../ThemeProvider';

// Use a complete mock theme
const mockTheme: ThemeConfig = {
  id: 'mock-theme',
  name: 'Mock Theme',
  // Include all required properties...
};

// Test with ThemeProvider
test('Component renders correctly with theme', () => {
  render(
    <ThemeProvider theme={mockTheme}>
      <YourComponent />
    </ThemeProvider>
  );
  // Your assertions...
});
```

## Creating Custom Themes

Custom themes must include all required properties. Extend the default theme for convenience:

```typescript
import { ThemeConfig } from '../consolidated-types';
import { defaultTheme } from '../theme-persistence';

export const customTheme: ThemeConfig = {
  ...defaultTheme,
  id: 'custom-theme',
  name: 'Custom Theme',
  // Override only what you need
  colors: {
    ...defaultTheme.colors,
    primary: '#0073ea',
    // Other color overrides...
  },
  // Other overrides...
};
``` 