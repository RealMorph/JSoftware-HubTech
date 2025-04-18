import { ThemeConfig } from './consolidated-types';
import { useContext, createContext } from 'react';

/**
 * Theme Service Interface
 * Defines the contract for theme management services
 */
export interface ThemeService {
  getDefaultTheme: () => ThemeConfig;
  getLightTheme: () => ThemeConfig;
  getDarkTheme: () => ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  getTheme: () => ThemeConfig;
}

/**
 * In-memory Theme Service Implementation
 * Simple implementation that stores theme in memory
 */
class InMemoryThemeService implements ThemeService {
  private currentTheme: ThemeConfig;
  private lightTheme: ThemeConfig;
  private darkTheme: ThemeConfig;

  constructor(defaultTheme: ThemeConfig) {
    this.currentTheme = defaultTheme;
    this.lightTheme = defaultTheme;
    this.darkTheme = {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        background: '#1a1a1a',
        text: {
          primary: '#ffffff',
          secondary: '#cccccc',
          disabled: '#666666'
        }
      }
    };
  }

  getDefaultTheme(): ThemeConfig {
    return this.currentTheme;
  }

  getLightTheme(): ThemeConfig {
    return this.lightTheme;
  }

  getDarkTheme(): ThemeConfig {
    return this.darkTheme;
  }

  setTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
  }

  getTheme(): ThemeConfig {
    return this.currentTheme;
  }
}

// Create a default in-memory theme service
export const inMemoryThemeService = new InMemoryThemeService({
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    tertiary: '#4240B0',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      disabled: '#999999'
    },
    background: '#FFFFFF',
    border: '#C7C7CC',
    white: '#FFFFFF',
    surface: '#F2F2F7'
  },
  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      heading: 'Georgia, Cambria, Times New Roman, Times, serif',
      monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem'
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear'
    }
  }
});

// Theme Service Context
export const ThemeServiceContext = createContext<ThemeService | undefined>(undefined);

export function useThemeService(): ThemeService {
  const context = useContext(ThemeServiceContext);
  if (!context) {
    throw new Error('useThemeService must be used within a ThemeServiceProvider');
  }
  return context;
} 