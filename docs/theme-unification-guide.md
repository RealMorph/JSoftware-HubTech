# Theme Unification Guide

This guide explains our new unified theme approach, which eliminates the adapter layer and implements direct theme access throughout the application.

## Table of Contents

1. [Overview](#overview)
2. [Key Benefits](#key-benefits)
3. [The DirectThemeProvider](#the-directthemeprovider)
4. [Migration Process](#migration-process)
5. [Using Direct Theme Access](#using-direct-theme-access)
6. [Best Practices](#best-practices)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## Overview

We've redesigned our theme system to eliminate the adapter layer and implement a direct theme consumption approach across all components. This means components now access theme properties directly from the ThemeConfig interface, rather than going through transformation or adaptation layers.

The new approach:

- Eliminates the `adaptThemeForEmotion` function and other adapters
- Provides a unified `DirectThemeProvider` with helper methods
- Simplifies theme access with direct property paths
- Improves type safety and performance

## Key Benefits

- **Simplicity**: No more adapter or transformation layers
- **Type Safety**: Full TypeScript support through ThemeConfig interface
- **Performance**: Eliminates unnecessary transformations
- **Maintainability**: Single pattern for all component theming
- **Consistency**: Unified theme access method across the application

## The DirectThemeProvider

The new `DirectThemeProvider` is the cornerstone of our unified theme approach:

```tsx
// Previous approach with adapters
import { ThemeProvider } from '../core/theme/ThemeProvider';
import { adaptThemeForEmotion } from '../core/theme/theme-adapter';

// New direct approach
import { DirectThemeProvider } from '../core/theme/DirectThemeProvider';
```

The DirectThemeProvider exposes:

1. The entire theme object for direct access
2. Helper functions for common theme property access patterns
3. Theme management functions (setTheme, toggleDarkMode)

Here's how to use it:

```tsx
import React from 'react';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { defaultTheme } from './core/theme/themes';

const App: React.FC = () => {
  return (
    <DirectThemeProvider initialTheme={defaultTheme}>
      <YourApp />
    </DirectThemeProvider>
  );
};
```

## Migration Process

We've created a migration script at `scripts/theme-unification.ts` to help transition existing components to the new approach. Run it with:

```bash
# Dry run - shows what would change without modifying files
npm run theme-unify -- --dry-run

# Apply changes
npm run theme-unify

# For verbose output
npm run theme-unify -- --verbose

# Target specific files or directories
npm run theme-unify -- --target "components/buttons/*.tsx"
```

The script:

1. Updates imports from old theme providers to `DirectThemeProvider`
2. Replaces `useTheme()` and `useUnifiedTheme()` with `useDirectTheme()`
3. Removes adapter imports
4. Identifies theme access patterns that need manual updates

After running the script, you'll need to manually update theme access patterns in your components.

## Using Direct Theme Access

The `useDirectTheme` hook provides two ways to access theme properties:

### 1. Direct theme object access

```tsx
const { theme } = useDirectTheme();

// Color access
const primaryColor = theme.colors.primary;
const textColor = typeof theme.colors.text === 'string' 
  ? theme.colors.text 
  : theme.colors.text.primary;

// Typography access
const fontSize = theme.typography.fontSize.md;
const fontWeight = theme.typography.fontWeight.bold;

// Other properties
const spacing = theme.spacing.md;
const borderRadius = theme.borderRadius.md;
const shadow = theme.shadows.md;
```

### 2. Using helper functions

```tsx
const { 
  getColor, 
  getTypography, 
  getSpacing, 
  getBorderRadius, 
  getShadow, 
  getTransition 
} = useDirectTheme();

// Color access with fallbacks
const primary = getColor('primary');
const secondary = getColor('secondary', '#9c27b0');
const textPrimary = getColor('text.primary', '#000000');

// Typography with fallbacks
const headerSize = getTypography('fontSize.xl', '1.5rem');
const boldWeight = getTypography('fontWeight.bold', 700);

// Other properties with fallbacks
const standardSpacing = getSpacing('md', '1rem');
const cardRadius = getBorderRadius('md', '0.5rem');
const cardShadow = getShadow('md', '0 2px 4px rgba(0, 0, 0, 0.1)');
const animationDuration = getTransition('duration.normal', '300ms');
```

## Best Practices

1. **Prefer helper functions** for theme access when you need fallbacks
   ```tsx
   // Good
   const color = getColor('primary', '#default');
   
   // Less resilient
   const color = theme.colors.primary || '#default';
   ```

2. **Use direct theme access** for complex structures
   ```tsx
   // Good
   const { typography } = theme;
   const allFontSizes = typography.fontSize;
   ```

3. **Type assertions** for better TypeScript support
   ```tsx
   // When you know the exact type
   const fontSize = getTypography('fontSize.md') as string;
   const fontWeight = getTypography('fontWeight.bold') as number;
   ```

4. **Handle text color object** properly
   ```tsx
   // Handle both string and object text colors
   const textColor = typeof theme.colors.text === 'string'
     ? theme.colors.text
     : theme.colors.text.primary;
   ```

5. **Use CSS variables** when appropriate
   ```css
   .element {
     color: var(--color-primary);
     font-size: var(--font-size-md);
     margin: var(--spacing-md);
   }
   ```

## Common Issues and Solutions

### Issue: TypeScript errors with theme property access

```tsx
// Error: Property 'nonExistent' does not exist on type 'ThemeColors'
const color = theme.colors.nonExistent;
```

**Solution**: Use helper functions with fallbacks
```tsx
const color = getColor('nonExistent', '#default');
```

### Issue: Handling optional theme properties

**Solution**: Use optional chaining and nullish coalescing
```tsx
const tertiaryColor = theme.colors?.tertiary ?? theme.colors.primary;
```

### Issue: Text color can be string or object

**Solution**: Check type before accessing
```tsx
const textColor = typeof theme.colors.text === 'string'
  ? theme.colors.text
  : theme.colors.text.primary;
```

### Issue: Nested properties access

**Solution**: Use the helper functions for safe deep access
```tsx
// Safe access even if parts of the path don't exist
const lineHeight = getTypography('lineHeight.tight', 1.2);
```

---

## Complete Example

Here's a complete example of a component using our direct theme implementation:

```tsx
import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../core/theme/DirectThemeProvider';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick 
}) => {
  const { getColor, getSpacing, getBorderRadius, getTransition } = useDirectTheme();
  
  // Map size to spacing
  const sizeMap = {
    sm: getSpacing('sm'),
    md: getSpacing('md'),
    lg: getSpacing('lg')
  };
  
  // Map variant to colors
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: getColor('primary'),
          color: '#ffffff',
          border: 'none'
        };
      case 'secondary':
        return {
          background: getColor('secondary'),
          color: '#ffffff',
          border: 'none'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: getColor('primary'),
          border: `1px solid ${getColor('primary')}`
        };
      default:
        return {
          background: getColor('primary'),
          color: '#ffffff',
          border: 'none'
        };
    }
  };
  
  const styles = getVariantStyles();
  const padding = sizeMap[size];
  const borderRadius = getBorderRadius('md');
  const transition = getTransition('duration.fast');
  
  return (
    <StyledButton 
      style={{
        background: styles.background,
        color: styles.color,
        border: styles.border,
        padding: size === 'sm' ? `0.5rem ${padding}` : `0.75rem ${padding}`,
        borderRadius,
        transition: `all ${transition} ease-in-out`
      }}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

export default Button;
``` 