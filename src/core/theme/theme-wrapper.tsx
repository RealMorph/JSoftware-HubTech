import React, { ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider } from './ThemeProvider';
import { ThemeProvider as OldThemeProvider } from './theme-context';
import { ThemeService, InMemoryThemeDatabase, defaultTheme } from './theme-persistence';

// Create a single theme service for the entire app
const themeService = new ThemeService(new InMemoryThemeDatabase());

interface UnifiedThemeProviderProps {
  children: ReactNode;
}

/**
 * A wrapper component that unifies different theme providers
 * This ensures that components using either theme provider will work
 */
export const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider themeService={themeService}>
      {/* Connect old theme provider to new one */}
      <EmotionThemeProvider theme={defaultTheme as any}>
        <OldThemeProvider themeService={themeService}>
          {children}
        </OldThemeProvider>
      </EmotionThemeProvider>
    </ThemeProvider>
  );
}; 