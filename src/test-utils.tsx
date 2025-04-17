import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider } from './core/theme/ThemeProvider';
import { inMemoryThemeService, defaultTheme } from './core/theme/theme-persistence';
import { adaptThemeForEmotion } from './core/theme/theme-adapter';

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
 * Enhanced renderWithTheme utility that handles theme adaptation for different component expectations
 *
 * @param ui The React component to render
 * @param options Additional options for customizing theme or render behavior
 * @returns The rendered component result along with the adapted theme
 */
export const renderWithTheme = async (
  ui: React.ReactElement,
  options?: { useEmotionOnly?: boolean }
): Promise<RenderResult & { theme: any }> => {
  // Adapt our theme for Emotion compatibility
  const adaptedTheme = adaptThemeForEmotion(defaultTheme);

  // Create a wrapper component that provides both theme contexts
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (options?.useEmotionOnly) {
      // Only use Emotion's ThemeProvider (for components that only need that)
      return <EmotionThemeProvider theme={adaptedTheme}>{children}</EmotionThemeProvider>;
    }

    // Use both providers for full compatibility
    return (
      <EmotionThemeProvider theme={adaptedTheme}>
        <ThemeProvider initialTheme={defaultTheme}>{children}</ThemeProvider>
      </EmotionThemeProvider>
    );
  };

  const result = render(ui, { wrapper: Wrapper });

  // Return the result with the theme for easier testing
  return {
    ...result,
    theme: adaptedTheme,
  };
};
