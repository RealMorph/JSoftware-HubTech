import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { Global, css } from '@emotion/react';
import {
  ThemeConfig,
  SpacingConfig,
  BorderRadiusConfig,
  ShadowConfig,
  TransitionConfig,
} from './consolidated-types';
import { generateCssVariables } from './css-variables';
import { applyTheme } from './theme-system';
import { ThemeService, useThemeService, inMemoryThemeService } from './theme-context';
import { ThemeServiceProvider } from './ThemeServiceProvider';
import { spacingScale } from './spacing';

// Context types
export interface DirectThemeContextType {
  // Theme access
  theme: ThemeConfig;

  // Theme management
  setTheme: (theme: ThemeConfig) => void;
  toggleDarkMode: () => void;

  // Direct theme utility functions
  getColor: (path: string, fallback?: string) => string;
  getTypography: (path: string, fallback?: string | number) => string | number;
  getSpacing: (key: keyof typeof spacingScale, fallback?: string) => string;
  getBorderRadius: (key: string, fallback?: string) => string;
  getShadow: (key: string, fallback?: string) => string;
  getTransition: (key: string, fallback?: string) => string;
}

// Create the context
const DirectThemeContext = createContext<DirectThemeContextType | undefined>(undefined);

// Hook for components to access the theme
export const useDirectTheme = (): DirectThemeContextType => {
  const context = useContext(DirectThemeContext);
  if (!context) {
    throw new Error('useDirectTheme must be used within a DirectThemeProvider');
  }
  return context;
};

// For backward compatibility
export const useTheme = useDirectTheme;

// Global CSS styles
const globalStyles = css`
  :root {
    /* CSS variables will be injected here by theme system */
  }

  html,
  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family-base, system-ui, -apple-system, sans-serif);
    font-size: var(--font-size-base, 16px);
    line-height: var(--line-height-base, 1.5);
    color: var(--color-text-primary, #000);
    background-color: var(--color-background, #fff);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  a {
    color: var(--color-primary, #0070f3);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Typography baseline */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: var(--font-family-heading, system-ui, -apple-system, sans-serif);
    margin-top: 0;
    margin-bottom: var(--spacing-md, 1rem);
    font-weight: var(--font-weight-bold, 700);
    line-height: var(--line-height-heading, 1.2);
  }

  h1 {
    font-size: var(--font-size-2xl, 2.25rem);
  }

  h2 {
    font-size: var(--font-size-xl, 1.875rem);
  }

  h3 {
    font-size: var(--font-size-lg, 1.5rem);
  }

  h4 {
    font-size: var(--font-size-md, 1.25rem);
  }

  h5 {
    font-size: var(--font-size-base, 1rem);
  }

  h6 {
    font-size: var(--font-size-sm, 0.875rem);
  }

  p {
    margin-top: 0;
    margin-bottom: var(--spacing-md, 1rem);
  }

  /* Forms */
  button,
  input,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button,
  input {
    overflow: visible;
  }

  button,
  select {
    text-transform: none;
  }
`;

// Helper functions for direct theme property access
function getNestedProperty(obj: any, path: string, fallback: any = undefined): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return fallback;
    }
    current = current[part];
  }

  return current === undefined ? fallback : current;
}

// Check if a key exists in an object with type safety
function hasKey<T extends object>(obj: T, key: string | number | symbol): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// DirectThemeProvider component props
export interface DirectThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeConfig;
  themeService?: ThemeService;
}

/**
 * DirectThemeProvider - A unified theme provider that:
 * - Works directly with the ThemeConfig format
 * - Eliminates adapter layers and type transformations
 * - Provides direct access to theme properties
 * - Simplifies theme usage in components
 */
export const DirectThemeProvider: React.FC<DirectThemeProviderProps> = ({
  children,
  initialTheme,
  themeService = inMemoryThemeService,
}) => {
  // Inner provider component that assumes themeService is available
  const DirectThemeProviderInner: React.FC<DirectThemeProviderProps> = ({
    children,
    initialTheme,
  }) => {
    const themeService = useThemeService();

    // Initialize theme state
    const [theme, setTheme] = useState<ThemeConfig>(() => {
      if (initialTheme) {
        return initialTheme;
      }
      return themeService.getDefaultTheme();
    });

    const [isDarkMode, setIsDarkMode] = useState(false);

    // Apply theme to the document
    useEffect(() => {
      if (theme) {
        applyTheme(theme);
        generateCssVariables(theme);
      }
    }, [theme]);

    // Theme toggling function
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);

      // Get dark/light theme based on current mode
      const newTheme = !isDarkMode
        ? themeService.getDarkTheme() || theme
        : themeService.getLightTheme() || theme;

      setTheme(newTheme);
    };

    // Direct theme property access functions
    const getColor = (path: string, fallback?: string): string => {
      // Handle special case for text color object
      if (path.startsWith('text.')) {
        const textKey = path.split('.')[1];
        const textColors =
          typeof theme.colors.text === 'string'
            ? {
                primary: theme.colors.text,
                secondary: theme.colors.text,
                disabled: theme.colors.text,
              }
            : theme.colors.text;

        return (textColors as any)[textKey] || fallback || '#000000';
      }

      // Standard color property access
      return getNestedProperty(theme.colors, path, fallback || '#000000');
    };

    const getTypography = (path: string, fallback?: string | number): string | number => {
      return getNestedProperty(theme.typography, path, fallback || '1rem');
    };

    const getSpacing = (key: keyof typeof spacingScale, fallback?: string): string => {
      return spacingScale[key] || fallback || '0px';
    };

    const getBorderRadius = (key: string, fallback?: string): string => {
      // Type-safe check if the key exists in border radius config
      if (hasKey(theme.borderRadius, key)) {
        return theme.borderRadius[key];
      }
      return fallback || '0';
    };

    const getShadow = (key: string, fallback?: string): string => {
      // Type-safe check if the key exists in shadows config
      if (hasKey(theme.shadows, key)) {
        return theme.shadows[key];
      }
      return fallback || 'none';
    };

    const getTransition = (key: string, fallback?: string): string => {
      const transitionKeys = key.split('.');
      if (transitionKeys.length === 1) {
        // Assume it's a duration shorthand
        const durationKey = transitionKeys[0];
        if (hasKey(theme.transitions.duration, durationKey)) {
          return theme.transitions.duration[durationKey];
        }
        return fallback || '0ms';
      }
      return getNestedProperty(theme.transitions, key, fallback || '0ms');
    };

    // Create context value
    const contextValue: DirectThemeContextType = {
      theme,
      setTheme,
      toggleDarkMode,
      getColor,
      getTypography,
      getSpacing,
      getBorderRadius,
      getShadow,
      getTransition,
    };

    return (
      <DirectThemeContext.Provider value={contextValue}>
        <Global styles={globalStyles} />
        {/* Cast theme as any to satisfy Emotion's theme provider */}
        <EmotionThemeProvider theme={theme as any}>{children}</EmotionThemeProvider>
      </DirectThemeContext.Provider>
    );
  };

  // If themeService is provided, wrap with ThemeServiceProvider
  return (
    <ThemeServiceProvider themeService={themeService}>
      <DirectThemeProviderInner initialTheme={initialTheme}>{children}</DirectThemeProviderInner>
    </ThemeServiceProvider>
  );
};

/**
 * Legacy compatibility layer for existing components
 * that expect the old ThemeProvider interface
 */
export const ThemeProvider = DirectThemeProvider;
