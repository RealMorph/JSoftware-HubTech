import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { ThemeConfig } from './consolidated-types';
import merge from 'lodash/merge';
import { createMockTheme, validateTestTheme } from './test-theme-validator';

/**
 * Options for rendering a component with a theme in tests
 */
export interface RenderWithThemeOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Custom theme to be used in the test
   * Will be merged with the default mock theme
   */
  theme?: Partial<ThemeConfig>;
}

/**
 * Renders a component with ThemeProvider for testing
 * @param ui The component to render
 * @param options Options including custom theme
 * @returns The render result and the merged theme used
 */
export function renderWithTheme(
  ui: ReactElement,
  options: RenderWithThemeOptions = {}
): RenderResult & { theme: ThemeConfig } {
  const { theme: customTheme, ...renderOptions } = options;
  
  // Create a base mock theme
  const mockTheme = createMockTheme();
  
  // Merge with any custom theme props
  const mergedTheme = customTheme
    ? validateTestTheme(merge({}, mockTheme, customTheme))
    : mockTheme;
  
  // Create a wrapper with the theme provider
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider initialTheme={mergedTheme}>
      {children}
    </ThemeProvider>
  );
  
  // Render with the wrapper
  const result = render(ui, { wrapper: Wrapper, ...renderOptions });
  
  // Return the result with the theme
  return {
    ...result,
    theme: mergedTheme,
  };
}

/**
 * Creates a test ThemeProvider component with a specific theme
 * Useful for testing theme-dependent components
 * 
 * @param customTheme Optional partial theme to override defaults
 * @returns A themed provider component to wrap test components
 */
export function createTestThemeProvider(customTheme?: Partial<ThemeConfig>): React.FC<{
  children: React.ReactNode;
}> {
  // Create a base mock theme
  const mockTheme = createMockTheme();
  
  // Merge with any custom theme props
  const mergedTheme = customTheme
    ? validateTestTheme(merge({}, mockTheme, customTheme))
    : mockTheme;
  
  // Return a themed provider component
  return ({ children }) => (
    <ThemeProvider initialTheme={mergedTheme}>
      {children}
    </ThemeProvider>
  );
} 