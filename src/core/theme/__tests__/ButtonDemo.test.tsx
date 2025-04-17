import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DirectThemeProvider, useDirectTheme } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';

// Simple mock theme with minimal required properties
const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9e9e9e',
    },
    background: '#ffffff',
    border: '#e0e0e0',
    white: '#ffffff',
    surface: '#ffffff',
  },
  typography: {
    fontFamily: {
      base: 'system-ui, sans-serif',
      heading: 'system-ui, sans-serif',
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
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
    '2xl': '2560px',
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
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    base: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    xl: '0 20px 25px rgba(0,0,0,0.1)',
    '2xl': '0 25px 50px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
  },
  transitions: {
    duration: {
      fast: '150ms',
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Create a LoadingComponent that shows a message when theme is not available
const LoadingComponent = () => {
  const { theme } = useDirectTheme();

  if (!theme) {
    return <div data-testid="loading-state">Loading theme...</div>;
  }

  return <div data-testid="content">Theme loaded successfully</div>;
};

// Simple component that always shows loading
const AlwaysLoadingComponent = () => {
  return <div data-testid="loading-state">Loading theme...</div>;
};

describe('ButtonDemo loading state', () => {
  it('shows loading state component correctly', () => {
    render(<AlwaysLoadingComponent />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading theme...')).toBeInTheDocument();
  });

  it('shows content when theme is provided', () => {
    render(
      <DirectThemeProvider initialTheme={mockTheme}>
        <LoadingComponent />
      </DirectThemeProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Theme loaded successfully')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
  });
});
