import { createContext, useContext } from 'react';
import { ThemeConfig } from './consolidated-types';
import { modernTheme } from './modern-theme';

/**
 * Basic theme service interface
 */
export interface ThemeService {
  /**
   * Gets the default theme
   */
  getDefaultTheme(): ThemeConfig;
  
  /**
   * Gets a dark theme if available
   */
  getDarkTheme(): ThemeConfig | null;
  
  /**
   * Gets a light theme if available
   */
  getLightTheme(): ThemeConfig | null;
}

/**
 * Simple implementation of ThemeService
 * Using in-memory theme storage
 */
export class InMemoryThemeService implements ThemeService {
  private defaultTheme: ThemeConfig;
  private darkTheme: ThemeConfig | null = null;
  private lightTheme: ThemeConfig | null = null;
  
  constructor(defaultTheme: ThemeConfig = modernTheme) {
    this.defaultTheme = defaultTheme;
    this.lightTheme = defaultTheme;
  }
  
  getDefaultTheme(): ThemeConfig {
    return this.defaultTheme;
  }
  
  getDarkTheme(): ThemeConfig | null {
    return this.darkTheme;
  }
  
  getLightTheme(): ThemeConfig | null {
    return this.lightTheme;
  }
  
  /**
   * Set the default theme
   */
  setDefaultTheme(theme: ThemeConfig): void {
    this.defaultTheme = theme;
  }
  
  /**
   * Set the dark theme
   */
  setDarkTheme(theme: ThemeConfig): void {
    this.darkTheme = theme;
  }
  
  /**
   * Set the light theme
   */
  setLightTheme(theme: ThemeConfig): void {
    this.lightTheme = theme;
  }
}

// Create a default theme service
export const inMemoryThemeService = new InMemoryThemeService();

// Create ThemeService context
export const ThemeServiceContext = createContext<ThemeService>(inMemoryThemeService);

/**
 * Hook to access the theme service
 */
export const useThemeService = (): ThemeService => {
  return useContext(ThemeServiceContext);
}; 