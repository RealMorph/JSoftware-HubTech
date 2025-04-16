# Theme System

The theme system provides a robust, type-safe approach to managing design tokens and visual styles throughout the application. This directory contains the core theme implementation, including theme definitions, context providers, and utilities.

## Directory Structure

- `theme-context.tsx` - React context and provider for theme management
- `theme-persistence.ts` - Interface and implementations for theme storage
- `theme-system.ts` - Theme application and management utilities
- `colors.ts` - Color palette definitions and color utilities
- `typography.ts` - Typography scale, weights, and utilities
- `spacing.ts` - Spacing system and spacing utilities
- `breakpoints.ts` - Responsive breakpoints and media query utilities
- `types.ts` - TypeScript definitions for the theme system
- `modern-theme.ts` - SaaS-inspired theme implementation with Monday.com-like styling

## Key Components

### ThemeConfig Interface

The `ThemeConfig` interface defines the structure of all themes and ensures type safety throughout the application:

```typescript
export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  colors: typeof colors & typeof semanticColors & typeof stateColors;
  typography: {
    scale: typeof typographyScale;
    weights: typeof fontWeights;
    lineHeights: typeof lineHeights;
    letterSpacing: typeof letterSpacing;
    family: typeof fontFamilies;
  };
  spacing: typeof spacingScale & {
    semantic: typeof semanticSpacing;
  };
  breakpoints: typeof breakpointValues & {
    containers: typeof containerMaxWidths;
  };
  borderRadius: BorderRadiusConfig;
  transitions: TransitionConfig;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ThemeContext

The `ThemeContext` and `ThemeProvider` manage the current theme state and provide methods to update it:

```typescript
const { currentTheme, setTheme, createTheme, updateTheme } = useTheme();
```

### Theme Persistence

The theme system includes pluggable persistence mechanisms:

- `inMemoryThemeService` - For testing and development
- `localStorageThemeService` - For browser persistence
- Additional services can be implemented for server-side or database persistence

## Modern Theme Implementation

The `modern-theme.ts` file implements a SaaS-inspired theme that follows the Monday.com design aesthetic, while fully conforming to the `ThemeConfig` interface requirements.

### Key Features of Modern Theme

- Properly structured color system with shade values (50-900)
- Comprehensive typography system with all required properties
- Semantic spacing system for consistent component layout
- Responsive breakpoints that follow the type requirements
- Border radius and transition configurations for consistent UI

### Recent Fixes and Improvements

The modern theme implementation has been updated to fix several type compatibility issues:

1. **Color Structure Update**:
   - Changed string color values to proper color scale objects with shade values (50-900)
   - Utilized spreading from base colors, semantic colors, and state colors
   - Maintained custom overrides for brand-specific colors

2. **Typography Structure Fix**:
   - Updated typography object to use scale, weights, lineHeights, letterSpacing, and family properties
   - Fixed font family naming to use 'sans', 'serif', and 'mono' instead of custom names

3. **Spacing and Breakpoint Corrections**:
   - Ensured spacing structure includes proper semantic spacing properties
   - Fixed breakpoint values to use numbers instead of strings where required
   - Added container max widths to the breakpoints object

4. **Other Type Fixes**:
   - Added proper borderRadius and transitions objects
   - Used consistent property naming (camelCase) throughout
   - Ensured all required properties are present

## Using Themes in Components

To use themes in your components:

```typescript
import { useTheme } from '../core/theme/theme-context';
import styled from '@emotion/styled';

// Access theme context
const { currentTheme } = useTheme();

// Use with styled components
const StyledButton = styled.button`
  background-color: ${props => props.theme.colors.primary[500]};
  color: white;
  padding: ${props => props.theme.spacing['2']};
  border-radius: ${props => props.theme.borderRadius.sm};
  transition: all ${props => props.theme.transitions.fast};
`;

// Component implementation
function Button({ children, ...props }) {
  return <StyledButton {...props}>{children}</StyledButton>;
}
```

## Best Practices

1. **Always use theme tokens** - Never hardcode colors, spacing, or other design values
2. **Follow the type structure** - Adhere to the `ThemeConfig` interface when creating new themes
3. **Use theme utilities** - Leverage provided utility functions for consistent theme access
4. **Consider extensibility** - Design components to support all themes, not just the current one
5. **Test with multiple themes** - Verify your components work correctly with different themes 