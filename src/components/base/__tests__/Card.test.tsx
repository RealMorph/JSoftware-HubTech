import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeConfig } from '../../../core/theme/consolidated-types';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { Card, CardHeader, CardContent, CardFooter } from '../Card';

// Create a mock theme for testing that matches ThemeConfig interface
const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    background: '#ffffff',
    text: {
      primary: '#000000',
      secondary: '#222222',
      disabled: '#666666'
    },
    border: '#e0e0e0',
    white: '#ffffff',
    surface: '#f5f5f5',
    // Add gray as any to avoid type errors since it's used by Card component
    gray: {
      50: '#fafafa',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    } as any
  },
  typography: {
    fontFamily: {
      base: 'Roboto, sans-serif',
      heading: 'Roboto, sans-serif',
      monospace: 'monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
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
    // Add numeric keys as any to avoid type errors since they're used by Card component
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
    '16': '4rem' as any
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      linear: 'linear'
    }
  }
};

// Wrapper component that provides the theme
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DirectThemeProvider initialTheme={mockTheme}>
      {children}
    </DirectThemeProvider>
  );
};

describe('Card Component', () => {
  test('renders card with children', () => {
    render(
      <ThemeWrapper>
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card content');
  });

  test('renders card with different variants', () => {
    const { rerender } = render(
      <ThemeWrapper>
        <Card data-testid="card" variant="elevation">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    let card = screen.getByTestId('card');
    expect(card).toHaveStyle({ boxShadow: mockTheme.shadows.sm });
    expect(card).not.toHaveStyle({ border: `1px solid ${(mockTheme.colors.gray as any)[200]}` });

    rerender(
      <ThemeWrapper>
        <Card data-testid="card" variant="outlined">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    card = screen.getByTestId('card');
    expect(card).toHaveStyle({ boxShadow: 'none' });
    expect(card).toHaveStyle({ border: `1px solid ${(mockTheme.colors.gray as any)[200]}` });

    rerender(
      <ThemeWrapper>
        <Card data-testid="card" variant="flat">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    card = screen.getByTestId('card');
    expect(card).toHaveStyle({ boxShadow: 'none' });
  });

  test('renders card with different padding sizes', () => {
    const { rerender } = render(
      <ThemeWrapper>
        <Card data-testid="card" padding="none">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    let card = screen.getByTestId('card');
    expect(card).toHaveStyle({ padding: '0' });

    rerender(
      <ThemeWrapper>
        <Card data-testid="card" padding="small">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    card = screen.getByTestId('card');
    expect(card).toHaveStyle({ padding: (mockTheme.spacing as any)['4'] });

    rerender(
      <ThemeWrapper>
        <Card data-testid="card" padding="large">
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    card = screen.getByTestId('card');
    expect(card).toHaveStyle({ padding: (mockTheme.spacing as any)['8'] });
  });

  test('renders card with fullWidth', () => {
    render(
      <ThemeWrapper>
        <Card data-testid="card" fullWidth>
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveStyle({ width: '100%' });
  });

  test('handles interactive card hover effects', () => {
    render(
      <ThemeWrapper>
        <Card data-testid="card" interactive>
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    const card = screen.getByTestId('card');
    
    // Initial state
    expect(card).toHaveStyle({ 
      boxShadow: mockTheme.shadows.sm,
      transform: undefined
    });

    // Hover state
    fireEvent.mouseOver(card);
    expect(card).toHaveStyle({ 
      boxShadow: mockTheme.shadows.md,
      transform: 'translateY(-2px)'
    });

    // Return to initial state
    fireEvent.mouseOut(card);
    expect(card).toHaveStyle({ 
      boxShadow: mockTheme.shadows.sm,
      transform: 'translateY(0)'
    });
  });

  test('renders card with custom bg and border colors', () => {
    render(
      <ThemeWrapper>
        <Card 
          data-testid="card" 
          bgColor="primary"
          borderColor="secondary"
          variant="outlined"
        >
          <div>Card content</div>
        </Card>
      </ThemeWrapper>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveStyle({ 
      backgroundColor: mockTheme.colors.primary,
      border: `1px solid ${mockTheme.colors.secondary}`
    });
  });

  test('renders card with header, content and footer', () => {
    render(
      <ThemeWrapper>
        <Card data-testid="card">
          <CardHeader data-testid="header">Header</CardHeader>
          <CardContent data-testid="content">Content</CardContent>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      </ThemeWrapper>
    );

    const header = screen.getByTestId('header');
    const content = screen.getByTestId('content');
    const footer = screen.getByTestId('footer');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    
    expect(header).toHaveTextContent('Header');
    expect(content).toHaveTextContent('Content');
    expect(footer).toHaveTextContent('Footer');

    // Check styling
    expect(header).toHaveStyle({ 
      borderBottom: `1px solid ${(mockTheme.colors.gray as any)[100]}`
    });
    
    expect(footer).toHaveStyle({ 
      borderTop: `1px solid ${(mockTheme.colors.gray as any)[100]}`
    });
  });
}); 