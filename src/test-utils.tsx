import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { Theme } from '@emotion/react';
import { ThemeProvider } from './core/theme/ThemeProvider';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { inMemoryThemeService, defaultTheme } from './core/theme/theme-persistence';
import { createMockTheme, validateTestTheme } from './core/theme/test-theme-validator';
import { ThemeConfig } from './core/theme/consolidated-types';
import merge from 'lodash/merge';

// Mock the document.documentElement
const mockDocumentElement = {
  style: {
    setProperty: jest.fn(),
  },
};

// Mock document object
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true,
});

/**
 * Enhanced renderWithTheme utility that uses the DirectTheme pattern
 *
 * @param ui The React component to render
 * @param options Additional options for customizing theme or render behavior
 * @returns The rendered component result along with the theme
 */
export const renderWithTheme = async (
  ui: React.ReactElement,
  options?: { 
    useEmotionOnly?: boolean,
    theme?: Partial<ThemeConfig>
  }
): Promise<RenderResult & { theme: ThemeConfig }> => {
  // Create a base mock theme
  const mockTheme = createMockTheme();

  // Merge with any custom theme props or use defaultTheme
  const mergedTheme = options?.theme
    ? validateTestTheme(merge({}, mockTheme, options.theme))
    : defaultTheme;
    
  // Directly use the ThemeConfig for Emotion - no adaptation needed
  const emotionTheme = mergedTheme as unknown as Theme;

  // Create a wrapper component that provides both theme contexts
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (options?.useEmotionOnly) {
      // Only use Emotion's ThemeProvider (for components that only need that)
      return <EmotionThemeProvider theme={emotionTheme}>{children}</EmotionThemeProvider>;
    }

    // Use both providers for full compatibility
    return (
      <EmotionThemeProvider theme={emotionTheme}>
        <ThemeProvider initialTheme={mergedTheme}>
          <DirectThemeProvider initialTheme={mergedTheme}>
            {children}
          </DirectThemeProvider>
        </ThemeProvider>
      </EmotionThemeProvider>
    );
  };

  const result = render(ui, { wrapper: Wrapper });

  // Return the result with the theme for easier testing
  return {
    ...result,
    theme: mergedTheme,
  };
};
