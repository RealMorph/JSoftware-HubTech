# Theme System Documentation

This document outlines the implementation, usage, and testing of the theme system in the modular frontend project.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Theme Persistence](#theme-persistence)
4. [Usage in Components](#usage-in-components)
5. [Modern Theme Implementation](#modern-theme-implementation)
6. [Testing](#testing)
7. [Best Practices](#best-practices)

## Architecture Overview

The theme system follows a layered architecture with separation of concerns:

1. **Theme Definition** - Type definitions and theme objects
2. **Theme Context** - React context for theme state management
3. **Theme Persistence** - Services for loading/saving theme preferences
4. **Theme Components** - UI components for theme switching

This architecture ensures that:
- Themes are consistently applied across the application
- User theme preferences are persisted
- Theme switching is performant and minimizes re-renders
- The system is extensible for future theme additions

## Core Components

### ThemeContext

The `ThemeContext` provides the current theme and methods to change it throughout the application.

**Key properties and methods:**
- `currentTheme` - The currently active theme
- `availableThemes` - List of all available themes
- `loading` - Loading state when themes are being fetched
- `error` - Error state when theme loading fails
- `setTheme(themeId)` - Method to change the current theme

### ThemeProvider

The `ThemeProvider` component manages theme state and wraps the application to provide theme context.

```tsx
import { ThemeProvider } from './theme-context';
import { localStorageThemeService } from './theme-persistence';

function App() {
  return (
    <ThemeProvider themeService={localStorageThemeService}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Theme Definition

Themes are defined using a consistent structure, with color palettes, typography, spacing, and other design tokens.

```typescript
export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    // Additional color tokens
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      bold: number;
    };
  };
  // Additional theme properties
}
```

## Theme Persistence

The theme system supports different persistence mechanisms through a common interface:

```typescript
export interface ThemeService {
  getThemes(): Promise<Theme[]>;
  getCurrentTheme(): Promise<string | null>;
  setCurrentTheme(themeId: string): Promise<void>;
}
```

### Available Implementations

1. **LocalStorageThemeService** - Persists theme preferences in browser localStorage
2. **InMemoryThemeService** - In-memory implementation for testing
3. **ApiThemeService** - Fetches themes from an API (for server-synced preferences)

## Usage in Components

### Using the Theme Hook

Components can access the current theme using the `useTheme` hook:

```tsx
import { useTheme } from '../theme-context';
import styled from '@emotion/styled';

const StyledButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.medium};
`;

function MyButton({ children }) {
  const { currentTheme } = useTheme();
  
  return (
    <StyledButton theme={currentTheme}>
      {children}
    </StyledButton>
  );
}
```

### Theme Switching Component

A theme switcher component is provided for user theme selection:

```tsx
import { useTheme } from '../theme-context';

function ThemeSwitcher() {
  const { availableThemes, currentTheme, setTheme } = useTheme();
  
  return (
    <div>
      <select 
        value={currentTheme.id} 
        onChange={(e) => setTheme(e.target.value)}
      >
        {availableThemes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Modern Theme Implementation

The Modern Theme implementation (`modernTheme`) follows a SaaS-inspired design approach (similar to Monday.com) and demonstrates the proper implementation of the `ThemeConfig` interface.

### Structure and Key Features

The modern theme fully implements the required `ThemeConfig` interface with these key characteristics:

1. **Color Structure**
   - Uses the proper object structure with shade values (50-900) for each color
   - Builds upon base colors, semantic colors, and state colors
   - Overrides specific colors with custom values (e.g., Monday.com-inspired palette)

2. **Typography System**
   - Implements the required scale, weights, lineHeights, letterSpacing, and family properties
   - Uses proper font family naming conventions (sans, serif, mono)

3. **Spacing and Layout**
   - Follows the spacing scale structure
   - Provides semantic spacing customizations for components and layouts
   - Maintains proper semantic spacing organization

4. **Breakpoints and Responsive Design**
   - Uses number values for breakpoints as required
   - Includes container max widths for responsive layouts

5. **UI Elements**
   - Provides borderRadius values for consistent component styling
   - Includes transitions timing for animations and interactive states

### Implementation Example

```typescript
import { ThemeConfig, defaultTheme } from './theme-persistence';
import { colors as baseColors, semanticColors, stateColors } from './colors';
import { typographyScale, fontWeights, lineHeights, letterSpacing, fontFamilies } from './typography';
import { spacingScale, semanticSpacing } from './spacing';
import { breakpointValues, containerMaxWidths } from './breakpoints';

export const modernTheme: ThemeConfig = {
  id: 'modern-theme',
  name: 'Modern Theme',
  description: 'A modern, SaaS-inspired theme with enhanced visual elements',
  
  // Color system with proper structure
  colors: {
    ...baseColors,
    ...semanticColors,
    ...stateColors,
    
    // Overrides for specific colors
    primary: {
      ...semanticColors.primary,
      500: '#0073ea', // Monday.com blue
    },
    secondary: {
      ...semanticColors.secondary,
      500: '#9c5ffd', // Monday.com purple
    },
    // Additional color overrides...
  },
  
  // Typography system
  typography: {
    scale: { ...typographyScale },
    weights: { ...fontWeights },
    lineHeights: { ...lineHeights },
    letterSpacing: { ...letterSpacing },
    family: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      serif: fontFamilies.serif,
      mono: fontFamilies.mono,
    },
  },
  
  // Other required properties...
  spacing: { /* ... */ },
  breakpoints: { /* ... */ },
  borderRadius: { /* ... */ },
  transitions: { /* ... */ },
  
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Best Practices from Modern Theme

1. **Extending Base Theme**
   - Reuse existing color systems, typography scales, and spacing definitions
   - Explicitly spread properties from the base implementations
   - Only override specific values that need customization

2. **Type Compatibility**
   - Follow the exact structure required by the `ThemeConfig` interface
   - Use correct property names and value types
   - Ensure nested objects follow the expected structure

3. **Consistency**
   - Maintain consistent naming patterns across the theme
   - Provide all required properties without omissions
   - Use standardized formats for values (colors, sizes, etc.)

4. **Modularity**
   - Import only what's needed from base theme components
   - Use composition over inheritance for theme construction
   - Keep the theme definition focused and purpose-specific

## Testing

### Theme Context Testing

Tests for the theme context focus on:
- Theme initialization
- Theme switching
- Error handling
- Loading states

```tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../theme-context';
import { inMemoryThemeService } from '../theme-persistence';

describe('ThemeProvider', () => {
  test('initializes with default theme', async () => {
    const TestComponent = () => {
      const { currentTheme } = useTheme();
      return <div>{currentTheme.name}</div>;
    };

    await act(async () => {
      render(
        <ThemeProvider themeService={inMemoryThemeService}>
          <TestComponent />
        </ThemeProvider>
      );
    });

    expect(screen.getByText('Light')).toBeInTheDocument();
  });
});
```

### Component Testing with Themes

When testing themed components, we use a `renderWithTheme` helper:

```tsx
const renderWithTheme = async (ui: React.ReactElement) => {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <ThemeProvider themeService={inMemoryThemeService}>
        {ui}
      </ThemeProvider>
    );
  });
  return result;
};

test('Button renders with correct theme styles', async () => {
  await renderWithTheme(<Button>Click me</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveStyle(`background-color: ${lightTheme.colors.primary}`);
});
```

## Best Practices

### Design Guidelines

1. **Theme Consistency**
   - Always use theme tokens instead of hardcoded values
   - Derive all visual styles from the theme
   - Ensure component variants are theme-aware

2. **Performance**
   - Minimize re-renders when theme changes
   - Use memoization for complex theme-derived values
   - Avoid unnecessary theme computations

3. **Maintainability**
   - Keep theme definitions DRY
   - Document theme token usage
   - Organize related theme properties together

### Implementation Guidelines

1. **Component Integration**
   - Always use the `useTheme` hook or styled-components theme prop
   - Avoid direct imports of theme objects in components
   - Make all visual properties theme-dependent

2. **Testing**
   - Use `renderWithTheme` for all component tests
   - Test with multiple themes to ensure adaptability
   - Mock theme services for reliable tests
   - Always wrap theme state changes in React's `act()` function 