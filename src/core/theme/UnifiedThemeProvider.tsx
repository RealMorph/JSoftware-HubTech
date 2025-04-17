import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { Global, css, Theme } from '@emotion/react';
import { ThemeConfig } from './consolidated-types';
import { generateCssVariables } from './css-variables';
import { applyTheme } from './theme-system';
import { ThemeService, useThemeService, inMemoryThemeService } from './theme-context';
import { ThemeServiceProvider } from './ThemeServiceProvider';

/**
 * Type guard to check if an object matches the ThemeConfig interface
 */
function isThemeConfig(obj: any): obj is ThemeConfig {
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
 * Gets a color from a theme object by path
 */
function getThemeColor(
  theme: ThemeConfig,
  path: string,
  fallback: string = '#000000'
): string {
  const colorPath = path.startsWith('colors.') ? path : `colors.${path}`;
  try {
    const parts = colorPath.split('.');
    let value: any = theme;
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return fallback;
    }
    return typeof value === 'string' ? value : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Gets a typography value from a theme object by path
 */
function getThemeTypography(
  theme: ThemeConfig,
  path: string,
  fallback?: string | number
): string | number {
  const typographyPath = path.startsWith('typography.') ? path : `typography.${path}`;
  try {
    const parts = typographyPath.split('.');
    let value: any = theme;
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return fallback || '';
    }
    return value;
  } catch (e) {
    return fallback || '';
  }
}

/**
 * Gets a spacing value from a theme object by key
 */
function getThemeSpacing(
  theme: ThemeConfig,
  key: string,
  fallback: string = '0'
): string {
  try {
    const spacing = theme.spacing[key as keyof typeof theme.spacing];
    return spacing || fallback;
  } catch (e) {
    return fallback;
  }
}

// Context types
export interface UnifiedThemeContextType {
  // Theme access
  currentTheme: ThemeConfig;
  emotionTheme: any;

  // Theme management
  setTheme: (theme: ThemeConfig) => void;
  toggleDarkMode: () => void;

  // Theme utilities
  getColor: (path: string, fallback?: string) => string;
  getTypography: (path: string, fallback?: string | number) => string | number;
  getSpacing: (key: string, fallback?: string) => string;
}

// Create the context
const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

// Hook for components to access the theme
export const useUnifiedTheme = (): UnifiedThemeContextType => {
  const context = useContext(UnifiedThemeContext);
  if (!context) {
    throw new Error('useUnifiedTheme must be used within a UnifiedThemeProvider');
  }
  return context;
};

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

// UnifiedThemeProvider component props
export interface UnifiedThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeConfig;
  themeService?: ThemeService;
}

/**
 * UnifiedThemeProvider - A consolidated theme provider that handles:
 * - Internal ThemeConfig format
 * - Emotion theme format
 * - Theme service integration
 * - Dark/light mode toggling
 * - CSS variable generation
 * - Theme adapter integration
 */
export const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({
  children,
  initialTheme,
  themeService = inMemoryThemeService,
}) => {
  // Inner provider component that assumes themeService is available
  const UnifiedThemeProviderInner: React.FC<UnifiedThemeProviderProps> = ({
    children,
    initialTheme,
  }) => {
    const themeService = useThemeService();

    // Initialize theme state
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => {
      // Validate initial theme if provided
      if (initialTheme) {
        if (!isThemeConfig(initialTheme)) {
          console.warn(
            'Invalid theme provided to UnifiedThemeProvider. Using default theme instead.'
          );
          return themeService.getDefaultTheme();
        }
        return initialTheme;
      }
      return themeService.getDefaultTheme();
    });

    const [isDarkMode, setIsDarkMode] = useState(false);

    // Create emotion-compatible theme - direct conversion without adapter
    const emotionTheme = currentTheme as unknown as Theme;

    // Apply theme to the document
    useEffect(() => {
      if (currentTheme) {
        applyTheme(currentTheme);
        generateCssVariables(currentTheme);
      }
    }, [currentTheme]);

    // Theme toggling function
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);

      // Get dark/light theme based on current mode
      const newTheme = !isDarkMode
        ? themeService.getDarkTheme() || currentTheme
        : themeService.getLightTheme() || currentTheme;

      setCurrentTheme(newTheme);
    };

    // Simplified theme getters that use the theme adapter
    const getColor = (path: string, fallback?: string) =>
      getThemeColor(currentTheme, path, fallback);

    const getTypography = (path: string, fallback?: string | number) =>
      getThemeTypography(currentTheme, path, fallback);

    const getSpacing = (key: string, fallback?: string) =>
      getThemeSpacing(currentTheme, key, fallback);

    // Create context value
    const contextValue: UnifiedThemeContextType = {
      currentTheme,
      emotionTheme,
      setTheme: setCurrentTheme,
      toggleDarkMode,
      getColor,
      getTypography,
      getSpacing,
    };

    return (
      <UnifiedThemeContext.Provider value={contextValue}>
        <Global styles={globalStyles} />
        <EmotionThemeProvider theme={emotionTheme}>{children}</EmotionThemeProvider>
      </UnifiedThemeContext.Provider>
    );
  };

  // If themeService is provided, wrap with ThemeServiceProvider
  return (
    <ThemeServiceProvider themeService={themeService}>
      <UnifiedThemeProviderInner initialTheme={initialTheme}>{children}</UnifiedThemeProviderInner>
    </ThemeServiceProvider>
  );
};

/**
 * Legacy compatibility layer for existing components
 * that expect the old ThemeProvider interface
 */
export const ThemeProvider = UnifiedThemeProvider;
