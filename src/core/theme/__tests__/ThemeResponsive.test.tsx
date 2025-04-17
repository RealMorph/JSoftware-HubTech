import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import styled from '@emotion/styled';
import { DirectThemeProvider, useDirectTheme } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';
import { createMockTheme } from '../test-theme-validator';

// Helper to simulate different viewport sizes
const setViewportSize = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

// Create responsive styled components
interface ThemeStyles {
  padding: string;
  fontSize: string;
  display: string;
}

const createThemeStyles = (theme: ThemeConfig): ThemeStyles => ({
  padding: theme.spacing.md,
  fontSize: theme.typography.fontSize.md,
  display: 'block',
});

const ResponsiveContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.padding};
  font-size: ${props => props.$themeStyles.fontSize};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.lg};
    font-size: ${props => props.theme.typography.fontSize.lg};
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.xl};
    font-size: ${props => props.theme.typography.fontSize.xl};
  }

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing['2xl']};
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }
`;

const ResponsiveComponent = styled.div<{ $themeStyles: ThemeStyles }>`
  display: none;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    display: ${props => props.$themeStyles.display};
    background-color: ${props => props.theme.colors.primary};
  }
`;

// Test component using responsive components
const TestComponent: React.FC = () => {
  const themeContext = useDirectTheme();
  // Since we're in a test environment and using mockTheme, we know this cast is safe
  const theme = themeContext as unknown as ThemeConfig;
  const themeStyles = createThemeStyles(theme);

  return (
    <div>
      <ResponsiveContainer data-testid="responsive-container" $themeStyles={themeStyles}>
        Responsive Content
      </ResponsiveContainer>
      <ResponsiveComponent data-testid="responsive-element" $themeStyles={themeStyles}>
        Visible on larger screens
      </ResponsiveComponent>
    </div>
  );
};

describe('Theme Responsive Design', () => {
  // Reset viewport size after each test
  afterEach(() => {
    setViewportSize(1024); // Default size
  });

  it('applies different styles based on viewport size', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    const container = screen.getByTestId('responsive-container');

    // Test mobile size
    setViewportSize(320);
    expect(container).toHaveStyle({
      padding: mockTheme.spacing.md,
      fontSize: mockTheme.typography.fontSize.md,
    });

    // Test tablet size
    setViewportSize(768);
    expect(container).toHaveStyle({
      padding: mockTheme.spacing.lg,
      fontSize: mockTheme.typography.fontSize.lg,
    });

    // Test desktop size
    setViewportSize(1024);
    expect(container).toHaveStyle({
      padding: mockTheme.spacing.xl,
      fontSize: mockTheme.typography.fontSize.xl,
    });

    // Test large desktop size
    setViewportSize(1440);
    expect(container).toHaveStyle({
      padding: mockTheme.spacing['2xl'],
      fontSize: mockTheme.typography.fontSize['2xl'],
    });
  });

  it('handles visibility based on breakpoints', () => {
    const mockTheme = createMockTheme();
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    const element = screen.getByTestId('responsive-element');

    // Mobile - should be hidden
    setViewportSize(320);
    expect(element).toHaveStyle({ display: 'none' });

    // Above small breakpoint - should be visible
    setViewportSize(parseInt(mockTheme.breakpoints.sm) + 1);
    expect(element).toHaveStyle({ display: 'block' });
  });

  it('updates responsive styles when theme changes', () => {
    const initialTheme = createMockTheme();
    const { rerender } = render(
      <DirectThemeProvider initialTheme={initialTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Set viewport to tablet size
    setViewportSize(768);

    const container = screen.getByTestId('responsive-container');
    expect(container).toHaveStyle({
      padding: initialTheme.spacing.lg,
      fontSize: initialTheme.typography.fontSize.lg,
    });

    // Update theme with new spacing and font sizes
    const updatedTheme: ThemeConfig = {
      ...initialTheme,
      spacing: {
        ...initialTheme.spacing,
        lg: '2.5rem', // New value
      },
      typography: {
        ...initialTheme.typography,
        fontSize: {
          ...initialTheme.typography.fontSize,
          lg: '1.5rem', // New value
        },
      },
    };

    rerender(
      <DirectThemeProvider initialTheme={updatedTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Check if new styles are applied
    expect(container).toHaveStyle({
      padding: '2.5rem',
      fontSize: '1.5rem',
    });
  });

  it('handles custom breakpoints', () => {
    const mockTheme = createMockTheme();
    const customTheme: ThemeConfig = {
      ...mockTheme,
      breakpoints: {
        ...mockTheme.breakpoints,
        custom: '1100px',
      } as any,
    };

    const CustomBreakpointComponent = styled.div<{ $themeStyles: ThemeStyles }>`
      display: none;
      @media (min-width: ${props => (props.theme.breakpoints as any).custom}) {
        display: block;
      }
    `;

    const TestCustomComponent: React.FC = () => {
      const themeContext = useDirectTheme();
      const theme = themeContext as unknown as ThemeConfig;
      const themeStyles = createThemeStyles(theme);

      return (
        <CustomBreakpointComponent data-testid="custom-breakpoint" $themeStyles={themeStyles} />
      );
    };

    render(
      <DirectThemeProvider initialTheme={customTheme}>
        <TestCustomComponent />
      </DirectThemeProvider>
    );

    const element = screen.getByTestId('custom-breakpoint');

    // Below custom breakpoint
    setViewportSize(1000);
    expect(element).toHaveStyle({ display: 'none' });

    // Above custom breakpoint
    setViewportSize(1200);
    expect(element).toHaveStyle({ display: 'block' });
  });

  it('maintains responsive styles during theme transitions', () => {
    const initialTheme = createMockTheme();
    const { rerender } = render(
      <DirectThemeProvider initialTheme={initialTheme}>
        <TestComponent />
      </DirectThemeProvider>
    );

    // Set initial viewport size
    setViewportSize(768);
    const container = screen.getByTestId('responsive-container');

    // Verify initial styles
    expect(container).toHaveStyle({
      padding: initialTheme.spacing.lg,
      fontSize: initialTheme.typography.fontSize.lg,
    });

    // Create a series of theme updates
    const themeUpdates = [
      {
        ...initialTheme,
        spacing: { ...initialTheme.spacing, lg: '2rem' },
      },
      {
        ...initialTheme,
        spacing: { ...initialTheme.spacing, lg: '2.5rem' },
      },
      {
        ...initialTheme,
        spacing: { ...initialTheme.spacing, lg: '3rem' },
      },
    ];

    // Apply theme updates in sequence
    themeUpdates.forEach(theme => {
      rerender(
        <DirectThemeProvider initialTheme={theme}>
          <TestComponent />
        </DirectThemeProvider>
      );

      // Verify styles are updated correctly
      expect(container).toHaveStyle({
        padding: theme.spacing.lg,
        fontSize: initialTheme.typography.fontSize.lg, // Should remain unchanged
      });
    });
  });
}); 