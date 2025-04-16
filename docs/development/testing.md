# Testing Strategy

This document outlines the testing approach, environment setup, and best practices for the modular frontend project.

## Table of Contents

1. [Testing Approach](#testing-approach)
2. [Test Environment Setup](#test-environment-setup)
3. [Component Testing](#component-testing)
4. [Theme System Testing](#theme-system-testing)
5. [Tab System Testing](#tab-system-testing)
6. [Best Practices](#best-practices)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## Testing Approach

Our project uses a comprehensive testing strategy including:

- **Unit tests** - Testing individual functions and components in isolation
- **Integration tests** - Testing how components interact with each other
- **Visual regression tests** - Ensuring UI components maintain consistent appearance

We use Jest as our primary testing framework along with React Testing Library for component testing.

## Test Environment Setup

### Jest Configuration

The project uses Jest for running tests, with a custom configuration to support React components and TypeScript.

Key Jest configuration settings:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['<rootDir>/node_modules/']
};
```

### TypeScript Configuration for Tests

We use a separate TypeScript configuration for tests to ensure proper module resolution:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "types": ["jest", "node", "@testing-library/jest-dom"]
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "jest.setup.js"
  ],
  "exclude": ["node_modules"]
}
```

### Important Environment Notes

1. **JSDOM Environment**: We use the jsdom environment for testing components that interact with the DOM.
2. **Act Warnings**: When testing components with state updates, always use React's `act()` function to wrap asynchronous operations.
3. **Polyfills**: For browser APIs not available in the test environment, we provide polyfills.
4. **Date Handling**: When testing components that use dates, ensure proper date object handling to avoid serialization issues.

## Component Testing

### Testing Approach for Components

1. Use the `render` function from `@testing-library/react` to render components
2. Wrap components with necessary context providers (e.g., ThemeProvider)
3. Use `act()` for state updates and async operations
4. Query elements using accessible queries (getByRole, getByText, etc.)
5. Use `fireEvent` or `userEvent` to simulate user interactions
6. Use `data-testid` attributes for elements that are difficult to query otherwise

### Example: Testing a Themed Component

```tsx
import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../theme-context';
import { inMemoryThemeService } from '../theme-persistence';
import { MyComponent } from './MyComponent';

const renderWithTheme = async (ui: React.ReactElement) => {
  let result;
  await act(async () => {
    result = render(
      <ThemeProvider themeService={inMemoryThemeService}>
        {ui}
      </ThemeProvider>
    );
  });
  return result;
};

describe('MyComponent', () => {
  test('renders correctly', async () => {
    await renderWithTheme(<MyComponent />);
    expect(screen.getByText('Component Text')).toBeInTheDocument();
  });
});
```

## Theme System Testing

### Theme Component Testing

When testing theme-aware components:

1. Use `renderWithTheme` helper function to wrap components in the ThemeProvider
2. Ensure themes are properly loaded before assertions
3. Wait for theme loading states to resolve
4. Use React's `act()` function when making theme changes
5. Use `data-testid` attributes for theme-specific elements

### Theme Context Testing

For testing theme context and hooks:

1. Mock the theme service when necessary
2. Test theme switching functionality
3. Verify theme persistence
4. Test error handling for theme loading failures
5. Handle date objects properly in theme data

### Recent Improvements

- **React.act Migration**: Updated tests to use `act` from React instead of react-dom/test-utils
- **Theme Initialization**: Improved handling of theme loading in tests
- **Snapshot Handling**: Updated approach to snapshot testing for themed components
- **Jest Configuration**: Optimized Jest configuration for TypeScript and React
- **Date Handling**: Fixed issues with date serialization in tests
- **Browser API Mocking**: Implemented proper mocking for browser APIs like crypto.randomUUID

## Tab System Testing

### Tab Manager Testing

The tab management system has comprehensive tests covering:

1. Tab creation and deletion
2. Tab activation and deactivation
3. Tab state management
4. Tab ordering and grouping

### Testing Environment Compatibility

For environment-specific features, we've implemented polyfills:

```javascript
// UUID Generation Polyfill for Jest
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Simple UUID v4 fallback implementation for test environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
```

## Best Practices

### Do's

- ✅ Use React's `act()` for state updates and async operations
- ✅ Test component rendering, user interactions, and error states
- ✅ Mock external dependencies and services
- ✅ Create helper functions for common testing patterns
- ✅ Test accessibility features
- ✅ Use data-testid attributes for elements that are difficult to query otherwise
- ✅ Handle date objects properly in tests
- ✅ Implement proper polyfills for browser APIs

### Don'ts

- ❌ Test implementation details
- ❌ Create complex test setups without helper functions
- ❌ Skip testing error states and edge cases
- ❌ Use setTimeout in tests without proper cleanup
- ❌ Test the same thing in multiple tests (DRY)
- ❌ Rely on string-based date comparisons

## Common Issues and Solutions

### Act Warnings

**Problem**: Warnings about state updates not wrapped in act()

**Solution**: Ensure all asynchronous operations and state updates are wrapped in `act()`:

```tsx
await act(async () => {
  fireEvent.click(button);
});
```

### Theme Loading in Tests

**Problem**: Tests failing because theme isn't loaded

**Solution**: Wait for theme loading to complete before assertions:

```tsx
await waitFor(() => {
  expect(screen.queryByText('Loading theme...')).not.toBeInTheDocument();
});
```

### Missing Browser APIs in Test Environment

**Problem**: Tests failing due to missing browser APIs (e.g., crypto.randomUUID)

**Solution**: Implement polyfills or fallbacks for browser APIs:

```tsx
// In the module using the browser API
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return generateFallbackUUID();
};
```

### Date Handling in Tests

**Problem**: Tests failing due to date serialization issues

**Solution**: Use proper date objects and helper functions:

```tsx
// Helper function to parse dates in theme
const parseDates = (theme: ThemeConfig): ThemeConfig => ({
  ...theme,
  createdAt: new Date(theme.createdAt),
  updatedAt: new Date(theme.updatedAt),
});

// In tests
expect(mockSetTheme).toHaveBeenCalledWith(parseDates(mockThemes[1]));
```

### Testing Styled Components

**Problem**: Difficulty testing styled components with dynamic styles

**Solution**: Test the underlying component behavior and use snapshot testing for style changes:

```tsx
test('applies correct styles when variant changes', async () => {
  const { rerender } = await renderWithTheme(<Button variant="primary" />);
  expect(screen.getByRole('button')).toHaveStyle({
    backgroundColor: primaryColor
  });
  
  await act(async () => {
    rerender(
      <ThemeProvider themeService={inMemoryThemeService}>
        <Button variant="secondary" />
      </ThemeProvider>
    );
  });
  
  expect(screen.getByRole('button')).toHaveStyle({
    backgroundColor: secondaryColor
  });
});
``` 