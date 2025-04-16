// Export theme configuration and utilities
export * from './breakpoints';
export * from './colors';
export * from './spacing';
export * from './typography';
export * from './theme-persistence';
export * from './theme-context';
export * from './theme-system';
export * from './styled';
export * from './palette-generator';
export * from './theme-export-import';

// Export types
export type { ThemeConfig } from './types';

// Export components
export { PaletteDemo } from './components/PaletteDemo';
export { ThemePreview } from './components/ThemePreview';
export { ThemeManager as ThemeManagerUI } from './components/ThemeManager';

// Import styles
import './components/theme-manager.css';

// Initialize theme service
import { ThemeService, InMemoryThemeDatabase } from './theme-persistence';
export const initializeThemeService = () => new ThemeService(new InMemoryThemeDatabase());

import { ThemeProvider } from './theme-context';
import { ThemeManager } from './theme-manager';
import { defaultTheme } from './default-theme';

export const initializeTheme = async (): Promise<ThemeManager> => {
  const themeManager = new ThemeManager(defaultTheme);
  await themeManager.initialize();
  return themeManager;
};

export { ThemeProvider, defaultTheme, ThemeManager };
