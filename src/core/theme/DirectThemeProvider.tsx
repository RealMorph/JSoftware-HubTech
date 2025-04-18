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
import { themeDefaults } from './theme-defaults';

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
  getSpacing: (key: keyof SpacingConfig, fallback?: string) => string;
  getBorderRadius: (key: keyof BorderRadiusConfig, fallback?: string) => string;
  getShadow: (key: keyof ShadowConfig, fallback?: string) => string;
  getTransition: (key: string, fallback?: string) => string;
}

// Create the context
export const DirectThemeContext = createContext<DirectThemeContextType | undefined>(undefined);

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
    font-family: var(--font-family-base);
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    color: var(--color-text-primary);
    background-color: var(--color-background);
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
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme || themeDefaults);

  useEffect(() => {
    if (theme) {
      // Apply theme changes
      applyTheme(theme);
      // Generate and inject CSS variables
      generateCssVariables(theme);
    }
  }, [theme]);

  const toggleDarkMode = () => {
    setTheme(currentTheme => ({
      ...currentTheme,
      colors: {
        ...currentTheme.colors,
        background: currentTheme.colors.background === '#FFFFFF' ? '#000000' : '#FFFFFF',
        text: typeof currentTheme.colors.text === 'object'
          ? {
              ...currentTheme.colors.text,
              primary: currentTheme.colors.text.primary === '#000000' ? '#FFFFFF' : '#000000',
            }
          : currentTheme.colors.text === '#000000' ? '#FFFFFF' : '#000000',
      },
    }));
  };

  const contextValue: DirectThemeContextType = {
    theme,
    setTheme,
    toggleDarkMode,
    getColor: (path, fallback) => {
      const parts = path.split('.');
      let value: any = theme.colors;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || fallback || '';
    },
    getTypography: (path, fallback) => {
      const parts = path.split('.');
      let value: any = theme.typography;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || fallback || '';
    },
    getSpacing: (key, fallback) => theme.spacing[key] || fallback || '',
    getBorderRadius: (key, fallback) => theme.borderRadius[key] || fallback || '',
    getShadow: (key, fallback) => theme.shadows[key] || fallback || '',
    getTransition: (key, fallback) => {
      const parts = key.split('.');
      let value: any = theme.transitions;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || fallback || '';
    },
  };

  return (
    <ThemeServiceProvider themeService={themeService}>
      <DirectThemeContext.Provider value={contextValue}>
        <EmotionThemeProvider theme={theme}>
          <Global styles={globalStyles} />
          {children}
        </EmotionThemeProvider>
      </DirectThemeContext.Provider>
    </ThemeServiceProvider>
  );
};

/**
 * Legacy compatibility layer for existing components
 * that expect the old ThemeProvider interface
 */
export const ThemeProvider = DirectThemeProvider;
