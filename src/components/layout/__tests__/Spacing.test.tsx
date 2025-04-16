import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Box, Spacer, Divider } from '../Spacing';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';

// Mock theme with standard properties
const mockTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    tertiary: '#9c27b0',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#000000',
      secondary: '#757575',
      disabled: '#9e9e9e'
    },
    background: '#ffffff',
    surface: '#f5f5f5',
    border: '#e5e7eb',
    white: '#ffffff'
  },
  typography: {
    fontFamily: {
      base: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      heading: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      monospace: "'Roboto Mono', monospace"
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
      relaxed: 1.75,
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
    '4xl': '4rem'
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
      normal: '200ms',
      slow: '300ms'
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear'
    }
  },
  // Need these for DirectThemeProvider
  getSpacing: (key: string, fallback?: string) => {
    return key in mockTheme.spacing 
      ? mockTheme.spacing[key as keyof typeof mockTheme.spacing] 
      : fallback || '0';
  },
  getColor: (path: string, fallback?: string) => {
    if (path.startsWith('text.') && typeof mockTheme.colors.text === 'object') {
      const [_, key] = path.split('.');
      return mockTheme.colors.text[key as keyof typeof mockTheme.colors.text] || fallback || '#000';
    }
    return path in mockTheme.colors
      ? mockTheme.colors[path as keyof typeof mockTheme.colors]
      : fallback || '#000';
  },
  getBorderRadius: () => '0',
  getShadow: () => 'none',
  getTypography: () => '',
  getTransition: () => ''
};

describe('Spacing Components', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <DirectThemeProvider initialTheme={mockTheme}>
        {ui}
      </DirectThemeProvider>
    );
  };

  // Basic tests for each component that should always pass
  describe('Box Component', () => {
    test('renders with children', () => {
      renderWithTheme(<Box data-testid="box">Box Content</Box>);
      expect(screen.getByTestId('box')).toBeInTheDocument();
      expect(screen.getByText('Box Content')).toBeInTheDocument();
    });

    test('applies styles correctly', () => {
      renderWithTheme(<Box data-testid="box" style={{ color: 'red' }}>Box with style</Box>);
      const box = screen.getByTestId('box');
      expect(box).toHaveStyle('color: red');
    });
  });

  describe('Spacer Component', () => {
    test('renders vertical spacer by default', () => {
      renderWithTheme(<Spacer data-testid="spacer" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toBeInTheDocument();
      expect(spacer).toHaveStyle('display: block');
    });

    test('renders horizontal spacer', () => {
      renderWithTheme(<Spacer data-testid="spacer" axis="horizontal" />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toBeInTheDocument();
    });

    test('renders with inline display', () => {
      renderWithTheme(<Spacer data-testid="spacer" inline />);
      const spacer = screen.getByTestId('spacer');
      expect(spacer).toHaveStyle('display: inline-block');
    });
  });

  describe('Divider Component', () => {
    test('renders horizontal divider by default', () => {
      renderWithTheme(<Divider data-testid="divider" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toBeInTheDocument();
      expect(divider).toHaveStyle('display: block');
    });

    test('renders vertical divider', () => {
      renderWithTheme(<Divider data-testid="divider" orientation="vertical" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toBeInTheDocument();
    });

    test('renders with custom color', () => {
      renderWithTheme(<Divider data-testid="divider" color="primary" />);
      const divider = screen.getByTestId('divider');
      expect(divider).toBeInTheDocument();
    });
  });
}); 