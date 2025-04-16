# Theme Adapter Usage Guide

This guide explains how to use the new Theme Adapter system to ensure proper theme property access and type compatibility throughout the codebase.

## Table of Contents

1. [Introduction](#introduction)
2. [Theme Access Helpers](#theme-access-helpers)
3. [Migration Guide](#migration-guide)
4. [Theme Compatibility](#theme-compatibility)
5. [Examples](#examples)

## Introduction

The Theme Adapter system provides a robust solution for accessing theme properties in a type-safe way while ensuring compatibility between different theme interfaces (ThemeConfig, Emotion Theme, etc.). It includes bidirectional conversion between theme formats, property path normalization, and access utilities.

## Theme Access Helpers

### Core Helper Functions

```tsx
// Import the helpers
import { 
  getThemeValue, 
  getThemeColor, 
  getThemeTypography, 
  getThemeSpacing 
} from '../core/theme/theme-adapter';
```

#### getThemeValue

The general-purpose theme value accessor that supports path normalization:

```tsx
// Get a value using a dot-notation path
const value = getThemeValue(theme, 'colors.primary', '#default');

// Works with nested paths
const nestedValue = getThemeValue(theme, 'typography.fontSize.lg', '1.125rem');
```

#### getThemeColor

Specialized helper for accessing theme colors:

```tsx
// Access primary color
const primaryColor = getThemeColor(theme, 'primary', '#1976d2');

// Access text colors
const textColor = getThemeColor(theme, 'text.primary', '#000000');
```

#### getThemeTypography

Specialized helper for accessing typography values:

```tsx
// Access font size
const fontSize = getThemeTypography(theme, 'fontSize.md', '1rem');

// Access font weight
const fontWeight = getThemeTypography(theme, 'fontWeight.bold', 700);
```

#### getThemeSpacing

Specialized helper for accessing spacing values:

```tsx
// Access spacing with named keys
const spacing = getThemeSpacing(theme, 'md', '1rem');

// Also works with numeric keys (for backward compatibility)
const spacingNumeric = getThemeSpacing(theme, '4', '1rem');
```

### Higher-Order Component

For components that require a different theme format:

```tsx
import { withThemeAdapter } from '../core/theme/theme-adapter';

// Wrap a component to automatically adapt its theme prop
const AdaptedComponent = withThemeAdapter(MyComponent);
```

## Migration Guide

### Direct Access Pattern Replacement

| Old Pattern | Recommended Replacement |
|-------------|-------------------------|
| `theme.typography.scale.md` | `getThemeTypography(theme, 'fontSize.md', '1rem')` |
| `theme.typography.weights.bold` | `getThemeTypography(theme, 'fontWeight.bold', 700)` |
| `theme.typography.lineHeights.normal` | `getThemeTypography(theme, 'lineHeight.normal', 1.5)` |
| `theme.typography.family.primary` | `getThemeTypography(theme, 'fontFamily.base', 'system-ui')` |
| `theme.spacing['4']` | `getThemeSpacing(theme, '4', '1rem')` or `getThemeSpacing(theme, 'md', '1rem')` |
| `theme.colors.primary[500]` | `getThemeColor(theme, 'primary', '#1976d2')` |
| `theme.colors.secondary[500]` | `getThemeColor(theme, 'secondary', '#9c27b0')` |
| `theme.colors.textColors.primary` | `getThemeColor(theme, 'text.primary', '#000000')` |
| `theme.transitions.normal` | `theme.transitions?.duration?.normal || '300ms'` |

### Step-by-Step Migration

1. Identify direct theme access patterns using the analyzer script:

   ```
   node scripts/theme-access-analyzer.js src/your-component-directory
   ```

2. Replace direct property access with theme helper functions.

3. Add fallback values for robust error handling.

4. Test the component with both theme formats.

## Theme Compatibility

The adapter system supports both ThemeConfig and Emotion Theme formats:

```tsx
// Convert ThemeConfig to Emotion Theme
import { adaptThemeForEmotion } from '../core/theme/theme-adapter';
const emotionTheme = adaptThemeForEmotion(themeConfig);

// Convert Emotion Theme to ThemeConfig 
import { adaptEmotionTheme } from '../core/theme/theme-adapter';
const themeConfig = adaptEmotionTheme(emotionTheme);
```

For testing, use the enhanced `renderWithTheme` utility:

```tsx
import { renderWithTheme } from '../test-utils';

// Render with both ThemeConfig and Emotion Theme support
const { getByText, theme } = await renderWithTheme(<MyComponent />);

// For components that only need Emotion's theme
const result = await renderWithTheme(<MyComponent />, { useEmotionOnly: true });
```

## Examples

### Example 1: Updating a Styled Component

Before:
```tsx
const StyledComponent = styled.div(({ theme }) => ({
  color: theme.colors.primary[500],
  fontSize: theme.typography.scale.md,
  fontWeight: theme.typography.weights.medium,
  padding: theme.spacing['4'],
}));
```

After:
```tsx
import { getThemeColor, getThemeTypography, getThemeSpacing } from '../core/theme/theme-adapter';

const StyledComponent = styled.div(({ theme }) => ({
  color: getThemeColor(theme, 'primary', '#1976d2'),
  fontSize: getThemeTypography(theme, 'fontSize.md', '1rem'),
  fontWeight: getThemeTypography(theme, 'fontWeight.medium', 500),
  padding: getThemeSpacing(theme, 'md', '1rem'),
}));
```

### Example 2: Using in a Functional Component

```tsx
import React from 'react';
import styled from '@emotion/styled';
import { getThemeColor } from '../core/theme/theme-adapter';

interface CardProps {
  variant?: 'default' | 'primary' | 'secondary';
}

const StyledCard = styled.div<CardProps>(({ theme, variant = 'default' }) => {
  // Get appropriate colors with fallbacks
  const backgroundColor = variant === 'default'
    ? getThemeColor(theme, 'background', '#ffffff')
    : variant === 'primary'
      ? getThemeColor(theme, 'primary', '#1976d2')
      : getThemeColor(theme, 'secondary', '#9c27b0');
  
  const textColor = variant === 'default'
    ? getThemeColor(theme, 'text.primary', '#000000')
    : '#ffffff';
  
  return {
    backgroundColor,
    color: textColor,
    borderRadius: theme.borderRadius?.md || '4px',
    boxShadow: theme.shadows?.md || '0 2px 4px rgba(0,0,0,0.1)',
    padding: '1rem',
  };
});

export const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return <StyledCard {...props}>{children}</StyledCard>;
};
```

### Example 3: Using withThemeAdapter HOC

```tsx
import React from 'react';
import { withThemeAdapter } from '../core/theme/theme-adapter';

interface ExternalComponentProps {
  theme?: any;
  // other props
}

// External component that expects a specific theme format
const ExternalComponent: React.FC<ExternalComponentProps> = ({ theme, ...props }) => {
  // Component implementation
};

// Create an adapted version that works with our theme system
export const AdaptedExternalComponent = withThemeAdapter(ExternalComponent);

// Use it like a regular component
const MyComponent = () => {
  return <AdaptedExternalComponent />;
};
```

By following these guidelines, you'll ensure consistent theme access patterns throughout the codebase, improved type safety, and better compatibility between different theme interfaces. 