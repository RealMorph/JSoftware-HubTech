import { ThemeConfig } from './consolidated-types';
import { validateTheme } from './theme-validator';

/**
 * Type guard to check if an object matches the ThemeConfig interface
 */
export function isThemeConfig(obj: any): obj is ThemeConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    'colors' in obj &&
    'typography' in obj &&
    'spacing' in obj &&
    'breakpoints' in obj &&
    'borderRadius' in obj &&
    'shadows' in obj &&
    'transitions' in obj
  );
}

/**
 * Validates a theme specifically for test environments
 * Provides detailed error messages for debugging
 *
 * @param theme The theme object to validate
 * @returns The validated theme object
 * @throws Error with detailed validation messages if invalid
 */
export function validateTestTheme(theme: unknown): ThemeConfig {
  const validationErrors = validateTheme(theme);

  if (validationErrors.length > 0) {
    throw new Error(`Invalid test theme: ${validationErrors.join(', ')}`);
  }

  return theme as ThemeConfig;
}

/**
 * Creates a minimal mock theme suitable for testing
 * @returns A valid ThemeConfig object with minimal properties
 */
export function createMockTheme(): ThemeConfig {
  return {
    id: 'mock-theme',
    name: 'Mock Theme',
    description: 'A mock theme for testing',
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        disabled: '#9ca3af',
      },
      background: '#ffffff',
      border: '#e5e7eb',
      white: '#ffffff',
      surface: '#f9fafb',
    },
    typography: {
      fontFamily: {
        base: 'ui-sans-serif, system-ui, sans-serif',
        heading: 'ui-sans-serif, system-ui, sans-serif',
        monospace: 'ui-monospace, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    breakpoints: {
      xs: '0px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    transitions: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      timing: {
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
      },
    },
  };
}

/**
 * Prepares a ThemeConfig object for use with EmotionThemeProvider in tests
 * Uses the DirectTheme pattern instead of adapters
 * 
 * @param theme The theme config to prepare
 * @returns The validated theme ready for direct use
 */
export function prepareTestTheme(theme: ThemeConfig): ThemeConfig {
  // Validate first
  return validateTestTheme(theme);
}

/**
 * Creates a valid theme suitable for testing with the DirectTheme pattern
 *
 * @returns A theme ready for use with DirectThemeProvider
 */
export function createTestTheme(): ThemeConfig {
  return createMockTheme();
}
