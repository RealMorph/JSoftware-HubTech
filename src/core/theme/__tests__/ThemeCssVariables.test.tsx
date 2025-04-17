import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DirectThemeProvider } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';
import { createMockTheme } from '../test-theme-validator';

describe('Theme CSS Variables', () => {
  // Helper to get CSS variable value
  const getCssVariable = (name: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  };

  beforeEach(() => {
    // Clean up any CSS variables from previous tests
    const style = document.documentElement.style;
    for (let i = style.length - 1; i >= 0; i--) {
      const name = style[i];
      if (name.startsWith('--')) {
        style.removeProperty(name);
      }
    }
  });

  it('applies color CSS variables from theme', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Test primary colors
    expect(getCssVariable('--color-primary')).toBe(mockTheme.colors.primary);
    expect(getCssVariable('--color-secondary')).toBe(mockTheme.colors.secondary);
    expect(getCssVariable('--color-background')).toBe(mockTheme.colors.background);

    // Test text colors
    if (typeof mockTheme.colors.text === 'object') {
      expect(getCssVariable('--color-text-primary')).toBe(mockTheme.colors.text.primary);
      expect(getCssVariable('--color-text-secondary')).toBe(mockTheme.colors.text.secondary);
      expect(getCssVariable('--color-text-disabled')).toBe(mockTheme.colors.text.disabled);
    }
  });

  it('applies typography CSS variables from theme', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Test font families
    expect(getCssVariable('--font-family-base')).toBe(mockTheme.typography.fontFamily.base);
    expect(getCssVariable('--font-family-heading')).toBe(mockTheme.typography.fontFamily.heading);
    expect(getCssVariable('--font-family-monospace')).toBe(mockTheme.typography.fontFamily.monospace);

    // Test font sizes
    expect(getCssVariable('--font-size-xs')).toBe(mockTheme.typography.fontSize.xs);
    expect(getCssVariable('--font-size-sm')).toBe(mockTheme.typography.fontSize.sm);
    expect(getCssVariable('--font-size-md')).toBe(mockTheme.typography.fontSize.md);
    expect(getCssVariable('--font-size-lg')).toBe(mockTheme.typography.fontSize.lg);
    expect(getCssVariable('--font-size-xl')).toBe(mockTheme.typography.fontSize.xl);

    // Test font weights
    expect(getCssVariable('--font-weight-light')).toBe(mockTheme.typography.fontWeight.light.toString());
    expect(getCssVariable('--font-weight-normal')).toBe(mockTheme.typography.fontWeight.normal.toString());
    expect(getCssVariable('--font-weight-medium')).toBe(mockTheme.typography.fontWeight.medium.toString());
    expect(getCssVariable('--font-weight-bold')).toBe(mockTheme.typography.fontWeight.bold.toString());
  });

  it('applies spacing CSS variables from theme', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Test spacing values
    expect(getCssVariable('--spacing-xs')).toBe(mockTheme.spacing.xs);
    expect(getCssVariable('--spacing-sm')).toBe(mockTheme.spacing.sm);
    expect(getCssVariable('--spacing-md')).toBe(mockTheme.spacing.md);
    expect(getCssVariable('--spacing-lg')).toBe(mockTheme.spacing.lg);
    expect(getCssVariable('--spacing-xl')).toBe(mockTheme.spacing.xl);
  });

  it('updates CSS variables when theme changes', () => {
    const initialTheme = createMockTheme();
    const { rerender } = render(
      <DirectThemeProvider initialTheme={initialTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Initial check
    expect(getCssVariable('--color-primary')).toBe(initialTheme.colors.primary);

    // Create updated theme
    const updatedTheme: ThemeConfig = {
      ...initialTheme,
      colors: {
        ...initialTheme.colors,
        primary: '#updated-primary',
      },
    };

    // Rerender with updated theme
    rerender(
      <DirectThemeProvider initialTheme={updatedTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Check if CSS variable was updated
    expect(getCssVariable('--color-primary')).toBe('#updated-primary');
  });

  it('handles nested color objects in CSS variables', () => {
    const mockTheme = createMockTheme();
    const themeWithNestedColors: ThemeConfig = {
      ...mockTheme,
      colors: {
        ...mockTheme.colors,
        primary: {
          light: '#light',
          main: '#main',
          dark: '#dark',
        } as any, // Cast to any since we're testing edge case handling
      },
    };

    render(
      <DirectThemeProvider initialTheme={themeWithNestedColors}>
        <div />
      </DirectThemeProvider>
    );

    // Test nested color variables
    expect(getCssVariable('--color-primary-light')).toBe('#light');
    expect(getCssVariable('--color-primary-main')).toBe('#main');
    expect(getCssVariable('--color-primary-dark')).toBe('#dark');
  });

  it('cleans up CSS variables on unmount', () => {
    const mockTheme = createMockTheme();
    const { unmount } = render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Verify variables are set
    expect(getCssVariable('--color-primary')).toBe(mockTheme.colors.primary);

    // Unmount component
    unmount();

    // Variables should be removed
    expect(getCssVariable('--color-primary')).toBe('');
  });

  it('handles theme updates without losing unrelated CSS variables', () => {
    // Set a custom CSS variable that shouldn't be affected by theme
    document.documentElement.style.setProperty('--custom-var', 'custom-value');

    const mockTheme = createMockTheme();
    const { rerender } = render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Update theme
    const updatedTheme = {
      ...mockTheme,
      colors: {
        ...mockTheme.colors,
        primary: '#new-primary',
      },
    };

    rerender(
      <DirectThemeProvider initialTheme={updatedTheme}>
        <div />
      </DirectThemeProvider>
    );

    // Custom variable should still exist
    expect(getCssVariable('--custom-var')).toBe('custom-value');
  });
}); 