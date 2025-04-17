import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DirectThemeProvider, useDirectTheme } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';
import { createMockTheme } from '../test-theme-validator';
import { inMemoryThemeService } from '../theme-persistence';

// Test component that uses theme values
const TestComponent: React.FC = () => {
  const theme = useDirectTheme();
  return (
    <div>
      <div data-testid="primary-color" style={{ color: theme.colors.primary }}>
        Primary Color
      </div>
      <div data-testid="font-size" style={{ fontSize: theme.typography.fontSize.md }}>
        Medium Text
      </div>
      <div data-testid="spacing" style={{ padding: theme.spacing.md }}>
        Medium Spacing
      </div>
    </div>
  );
};

describe('DirectThemeProvider', () => {
  // Basic rendering and theme access
  it('provides theme values to child components', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    const primaryColor = screen.getByTestId('primary-color');
    const fontSize = screen.getByTestId('font-size');
    const spacing = screen.getByTestId('spacing');

    expect(primaryColor).toHaveStyle({ color: mockTheme.colors.primary });
    expect(fontSize).toHaveStyle({ fontSize: mockTheme.typography.fontSize.md });
    expect(spacing).toHaveStyle({ padding: mockTheme.spacing.md });
  });

  // Theme service integration
  it('uses theme service when no initial theme is provided', () => {
    const defaultTheme = inMemoryThemeService.getDefaultTheme();
    render(
      <DirectThemeProvider>
        <TestComponent />
      </DirectThemeProvider>
    );

    const primaryColor = screen.getByTestId('primary-color');
    expect(primaryColor).toHaveStyle({ color: defaultTheme.colors.primary });
  });

  // Theme switching
  it('allows switching between light and dark themes', () => {
    const mockThemeService = {
      ...inMemoryThemeService,
      getLightTheme: () => ({
        ...createMockTheme(),
        colors: { ...createMockTheme().colors, primary: '#lightTheme' },
      }),
      getDarkTheme: () => ({
        ...createMockTheme(),
        colors: { ...createMockTheme().colors, primary: '#darkTheme' },
      }),
    };

    const { container } = render(
      <DirectThemeProvider themeService={mockThemeService}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Initial theme (light)
    expect(screen.getByTestId('primary-color')).toHaveStyle({ color: '#lightTheme' });

    // Toggle to dark theme
    act(() => {
      // Find and click theme toggle if it exists
      const themeToggle = container.querySelector('[data-testid="theme-toggle"]');
      if (themeToggle) {
        themeToggle.click();
      }
    });

    // Verify dark theme is applied
    expect(screen.getByTestId('primary-color')).toHaveStyle({ color: '#darkTheme' });
  });

  // CSS Variables
  it('generates CSS variables from theme', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Check if CSS variables are set on document.documentElement
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(mockTheme.colors.primary);
    expect(document.documentElement.style.getPropertyValue('--font-size-md')).toBe(mockTheme.typography.fontSize.md);
    expect(document.documentElement.style.getPropertyValue('--spacing-md')).toBe(mockTheme.spacing.md);
  });

  // Theme validation
  it('validates theme structure on initialization', () => {
    const invalidTheme = {
      colors: {
        primary: '#000',
      },
    } as unknown as ThemeConfig;

    // Should log error in development
    const consoleSpy = jest.spyOn(console, 'error');
    render(
      <DirectThemeProvider initialTheme={invalidTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // Theme updates
  it('updates components when theme changes', async () => {
    const initialTheme = createMockTheme();
    const updatedTheme = {
      ...initialTheme,
      colors: { ...initialTheme.colors, primary: '#updated' },
    };

    const { rerender } = render(
      <DirectThemeProvider initialTheme={initialTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Initial theme check
    expect(screen.getByTestId('primary-color')).toHaveStyle({ color: initialTheme.colors.primary });

    // Update theme
    rerender(
      <DirectThemeProvider initialTheme={updatedTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Check if theme update is reflected
    expect(screen.getByTestId('primary-color')).toHaveStyle({ color: '#updated' });
  });

  // Performance optimization
  it('memoizes theme object to prevent unnecessary rerenders', () => {
    const renderCount = { current: 0 };
    const TestMemoComponent = React.memo(() => {
      renderCount.current++;
      const theme = useDirectTheme();
      return <div data-testid="memo-test">{theme.colors.primary}</div>;
    });

    const { rerender } = render(
      <DirectThemeProvider initialTheme={createMockTheme()}>
        <TestMemoComponent />
      </DirectThemeProvider>
    );

    const initialRenderCount = renderCount.current;

    // Rerender with same theme
    rerender(
      <DirectThemeProvider initialTheme={createMockTheme()}>
        <TestMemoComponent />
      </DirectThemeProvider>
    );

    // Component should not rerender if theme is the same
    expect(renderCount.current).toBe(initialRenderCount);
  });
}); 