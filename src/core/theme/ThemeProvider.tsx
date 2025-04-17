import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { Global, css, Theme } from '@emotion/react';
import { ThemeConfig } from './consolidated-types';
import { generateCssVariables } from './css-variables';
import { applyTheme } from './theme-system';
import { useThemeService } from './theme-context';

// Context types
type ThemeContextType = {
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  toggleDarkMode: () => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook for components to access the theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
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

  /* Accessibility */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

// ThemeProvider component
export interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeConfig;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const themeService = useThemeService();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    initialTheme || themeService.getDefaultTheme()
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Directly use ThemeConfig with Emotion - no adaptation needed
  const emotionTheme = currentTheme as unknown as Theme;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: setCurrentTheme,
        toggleDarkMode,
      }}
    >
      <Global styles={globalStyles} />
      <EmotionThemeProvider theme={emotionTheme}>{children}</EmotionThemeProvider>
    </ThemeContext.Provider>
  );
};
