import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Container } from '../Container';
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
  }
};

describe('Container Component', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <DirectThemeProvider initialTheme={mockTheme}>
        {ui}
      </DirectThemeProvider>
    );
  };

  test('renders container with children', () => {
    renderWithTheme(
      <Container data-testid="container">Container Content</Container>
    );
    
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByText('Container Content')).toBeInTheDocument();
  });

  test('applies default max-width and padding', () => {
    renderWithTheme(
      <Container data-testid="container">Content</Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveStyle({
      width: '100%',
      maxWidth: '1024px', // lg breakpoint
      paddingLeft: '1rem',
      paddingRight: '1rem'
    });
  });

  test('applies custom max-width', () => {
    renderWithTheme(
      <Container data-testid="container" maxWidth="sm">Content</Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveStyle({
      maxWidth: '640px'
    });
  });

  test('applies fluid max-width', () => {
    renderWithTheme(
      <Container data-testid="container" fluid>Content</Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveStyle({
      maxWidth: '100%'
    });
  });

  test('applies custom padding', () => {
    renderWithTheme(
      <Container data-testid="container" padding="lg">Content</Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '1.5rem',
      paddingBottom: '1.5rem'
    });
  });

  test('applies different horizontal and vertical padding', () => {
    renderWithTheme(
      <Container data-testid="container" paddingX="lg" paddingY="sm">Content</Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem'
    });
  });

  test('disables centering when center is false', () => {
    renderWithTheme(
      <Container data-testid="container" center={false}>Content</Container>
    );
    
    const container = screen.getByTestId('container');
    expect(container).not.toHaveStyle({
      marginLeft: 'auto',
      marginRight: 'auto'
    });
  });
}); 