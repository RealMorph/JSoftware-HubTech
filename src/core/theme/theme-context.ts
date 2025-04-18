import { ThemeConfig } from './consolidated-types';
import { useContext, createContext } from 'react';
import { themeDefaults } from './theme-defaults';
import { blueTheme } from './blue-theme';

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
  toggleDarkMode: () => void;
}

/**
 * In-memory Theme Service Implementation
 * Simple implementation that stores theme in memory
 */
class InMemoryThemeService implements ThemeService {
  private currentTheme: ThemeConfig;
  private isDarkMode: boolean;

  constructor(defaultTheme: ThemeConfig) {
    this.currentTheme = defaultTheme;
    this.isDarkMode = false;
  }

  private createDarkVariant(theme: ThemeConfig): ThemeConfig {
    return {
      ...theme,
      colors: {
        ...theme.colors,
        background: '#1e1e1e',
        surface: '#2d2d2d',
        border: '#404040',
        text: {
          ...theme.colors.text,
          primary: '#ffffff',
          secondary: '#cccccc'
        }
      }
    };
  }

  getDefaultTheme(): ThemeConfig {
    return this.isDarkMode ? this.createDarkVariant(themeDefaults) : themeDefaults;
  }

  getLightTheme(): ThemeConfig {
    return this.currentTheme;
  }

  getDarkTheme(): ThemeConfig {
    return this.createDarkVariant(this.currentTheme);
  }

  setTheme(theme: ThemeConfig): void {
    this.currentTheme = this.isDarkMode ? this.createDarkVariant(theme) : theme;
  }

  getTheme(): ThemeConfig {
    return this.currentTheme;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.currentTheme = this.isDarkMode ? this.createDarkVariant(this.currentTheme) : this.getLightTheme();
  }
}

// Create a default in-memory theme service
export const inMemoryThemeService = new InMemoryThemeService(themeDefaults);

// Theme Service Context
export const ThemeServiceContext = createContext<ThemeService | undefined>(undefined);

export function useThemeService(): ThemeService {
  const context = useContext(ThemeServiceContext);
  if (!context) {
    throw new Error('useThemeService must be used within a ThemeServiceProvider');
  }
  return context;
} 