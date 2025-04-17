import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { ThemeServiceContext } from '../theme-context';
import { ThemeConfig } from '../consolidated-types';

// Mock the css-variables and theme-system modules
jest.mock('../css-variables', () => ({
  generateCssVariables: jest.fn(),
}));

jest.mock('../theme-system', () => ({
  applyTheme: jest.fn(),
}));

// Create mock theme
const mockTheme: ThemeConfig = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e74c3c',
    info: '#00cec9',
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
      disabled: '#a0aec0',
    },
    background: '#ffffff',
    border: '#e2e8f0',
    white: '#ffffff',
    surface: '#f7fafc',
  },
  typography: {
    fontFamily: {
      base: 'Inter, sans-serif',
      heading: 'Inter, sans-serif',
      monospace: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  transitions: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
  name: 'Test Theme',
};

// Mock theme service
const mockThemeService = {
  getDefaultTheme: jest.fn().mockReturnValue(mockTheme),
  getDarkTheme: jest.fn().mockReturnValue({ ...mockTheme, name: 'Dark Theme' }),
  getLightTheme: jest.fn().mockReturnValue({ ...mockTheme, name: 'Light Theme' }),
};

// Mock Button implementation for testing
const TestButton = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
}: {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const { currentTheme } = useTheme();

  if (!currentTheme) return <div>No theme available</div>;

  // Simplified styles based on the new theme structure
  const styles: React.CSSProperties = {
    backgroundColor:
      variant === 'primary'
        ? currentTheme.colors.primary
        : variant === 'secondary'
          ? currentTheme.colors.secondary
          : 'transparent',
    color: variant === 'outline' ? currentTheme.colors.primary : '#ffffff',
    border: variant === 'outline' ? `1px solid ${currentTheme.colors.primary}` : 'none',
    borderRadius: currentTheme.borderRadius.md,
    fontSize:
      size === 'sm'
        ? currentTheme.typography.fontSize.sm
        : size === 'lg'
          ? currentTheme.typography.fontSize.lg
          : currentTheme.typography.fontSize.md,
    padding:
      size === 'sm'
        ? currentTheme.spacing.sm
        : size === 'lg'
          ? currentTheme.spacing.lg
          : currentTheme.spacing.md,
    fontWeight: currentTheme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button style={styles} disabled={disabled} data-testid="test-button">
      {children}
    </button>
  );
};

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderButton = async (props = {}) => {
    return render(
      <ThemeServiceContext.Provider value={mockThemeService}>
        <ThemeProvider>
          <TestButton {...props}>Click me</TestButton>
        </ThemeProvider>
      </ThemeServiceContext.Provider>
    );
  };

  it('renders with default props', async () => {
    await renderButton();
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.colors.primary,
    });
  });

  it('renders with secondary variant', async () => {
    await renderButton({ variant: 'secondary' });
    const button = screen.getByText('Click me');
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.colors.secondary,
    });
  });

  it('renders with outline variant', async () => {
    await renderButton({ variant: 'outline' });
    const button = screen.getByText('Click me');
    expect(button).toHaveStyle({
      backgroundColor: 'transparent',
      color: mockTheme.colors.primary,
      border: `1px solid ${mockTheme.colors.primary}`,
    });
  });

  it('renders with different sizes', async () => {
    const { rerender } = await renderButton({ size: 'sm' });
    let button = screen.getByText('Click me');
    expect(button).toHaveStyle({
      fontSize: mockTheme.typography.fontSize.sm,
      padding: mockTheme.spacing.sm,
    });

    rerender(
      <ThemeServiceContext.Provider value={mockThemeService}>
        <ThemeProvider>
          <TestButton size="lg">Click me</TestButton>
        </ThemeProvider>
      </ThemeServiceContext.Provider>
    );

    button = screen.getByText('Click me');
    expect(button).toHaveStyle({
      fontSize: mockTheme.typography.fontSize.lg,
      padding: mockTheme.spacing.lg,
    });
  });

  it('renders with full width', async () => {
    await renderButton({ fullWidth: true });
    const button = screen.getByText('Click me');
    expect(button).toHaveStyle({
      width: '100%',
    });
  });

  it('handles disabled state', async () => {
    await renderButton({ disabled: true });
    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
    expect(button).toHaveStyle({
      opacity: 0.5,
      cursor: 'not-allowed',
    });
  });
});
