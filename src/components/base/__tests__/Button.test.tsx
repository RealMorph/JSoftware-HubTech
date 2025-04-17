import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../Button';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Create a mock theme for testing that matches ThemeConfig interface
const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  colors: {
    primary: '#0062CC',
    secondary: '#6B7280',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    background: '#FFFFFF',
    text: {
      primary: '#374151',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    border: '#E5E7EB',
    white: '#FFFFFF',
    surface: '#F9FAFB',
    // We add these as custom properties for our Button component,
    // they're not part of ThemeConfig but used in the component
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    } as any,
    accent: '#8B5CF6' as any,
    accentDark: '#7C3AED' as any,
    primaryDark: '#004C9E' as any,
  },
  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
      base: '1rem' as any,
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
      relaxed: 1.625,
      loose: 2,
      snug: 1.375 as any,
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
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    // Extended numeric spacing used by the Button component
    '0': '0' as any,
    '1': '0.25rem' as any,
    '2': '0.5rem' as any,
    '3': '0.75rem' as any,
    '4': '1rem' as any,
    '5': '1.25rem' as any,
    '6': '1.5rem' as any,
    '8': '2rem' as any,
    '10': '2.5rem' as any,
    '12': '3rem' as any,
    '16': '4rem' as any,
    '20': '5rem' as any,
    '24': '6rem' as any,
    '32': '8rem' as any,
    '40': '10rem' as any,
    '48': '12rem' as any,
    '56': '14rem' as any,
    '64': '16rem' as any,
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
    // Extended radii
    '3xl': '1.5rem' as any,
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear',
      // Extended timing functions
      ease: 'ease' as any,
    },
  },
};

// Wrapper component for providing theme
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <DirectThemeProvider initialTheme={mockTheme}>{children}</DirectThemeProvider>
);

describe('Button Component (Direct Theme)', () => {
  test('renders primary button by default', () => {
    render(<Button>Click Me</Button>, { wrapper: ThemeWrapper });

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>, {
      wrapper: ThemeWrapper,
    });

    let button = screen.getByRole('button', { name: /primary/i });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="accent">Accent</Button>);
    button = screen.getByRole('button', { name: /accent/i });
    expect(button).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toBeInTheDocument();
  });

  test('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>, { wrapper: ThemeWrapper });

    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByRole('button', { name: /medium/i });
    expect(button).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toBeInTheDocument();
  });

  test('handles disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>, { wrapper: ThemeWrapper });

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  test('handles loading state correctly', () => {
    render(<Button loading>Click Me</Button>, { wrapper: ThemeWrapper });

    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
    expect(screen.queryByText(/click me/i)).not.toBeInTheDocument();
  });

  test('applies fullWidth style when specified', () => {
    render(<Button fullWidth>Full Width</Button>, { wrapper: ThemeWrapper });

    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveStyle({ width: '100%' });
  });

  test('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>, { wrapper: ThemeWrapper });

    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('does not trigger click when disabled', async () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click Me
      </Button>,
      { wrapper: ThemeWrapper }
    );

    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
