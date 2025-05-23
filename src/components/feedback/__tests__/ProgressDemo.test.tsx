import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressDemo } from '../ProgressDemo';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    background: '#ffffff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    primary: '#3366CC',
    secondary: '#6B7280',
    tertiary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#e0e0e0',
    white: '#FFFFFF',
    surface: '#F9FAFB',
  },
  typography: {
    fontFamily: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      monospace: 'Courier New, monospace',
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
      relaxed: 1.625,
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
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1536px',
  },
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
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
    },
  },
};

// Get text primary color safely
const getTextPrimaryColor = () => {
  return typeof mockTheme.colors.text === 'string'
    ? mockTheme.colors.text
    : mockTheme.colors.text.primary;
};

// Custom render function that wraps components in DirectThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

describe('ProgressDemo', () => {
  it('renders without crashing', () => {
    renderWithTheme(<ProgressDemo />);

    // Check if the component title is rendered
    expect(screen.getByText('Progress Demo')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    renderWithTheme(<ProgressDemo title="Custom Progress" />);

    // Check if the custom title is rendered
    expect(screen.getByText('Custom Progress')).toBeInTheDocument();
  });

  it('renders all progress bars', () => {
    renderWithTheme(<ProgressDemo />);

    // Check if all progress labels are rendered
    expect(screen.getByText('Determinate Progress (25%)')).toBeInTheDocument();
    expect(screen.getByText('Determinate Progress (50%)')).toBeInTheDocument();
    expect(screen.getByText('Determinate Progress (75%)')).toBeInTheDocument();
    expect(screen.getByText('Determinate Progress (100%)')).toBeInTheDocument();
  });

  it('applies theme styles correctly', () => {
    const { container } = renderWithTheme(<ProgressDemo />);

    // Get the main container div
    const demoContainer = container.firstChild as HTMLElement;

    // Check if background color is applied from theme
    expect(demoContainer).toHaveStyle(`background-color: ${mockTheme.colors.background}`);

    // Check if text color is applied from theme
    expect(demoContainer).toHaveStyle(`color: ${getTextPrimaryColor()}`);

    // Check if border color is applied from theme
    expect(demoContainer).toHaveStyle(`border: 1px solid ${mockTheme.colors.border}`);
  });
});

import { render, screen } from '@testing-library/react';
import { ProgressDemo } from '../ProgressDemo';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    background: '#ffffff',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    primary: '#3366CC',
    secondary: '#6B7280',
    tertiary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#e0e0e0',
    white: '#FFFFFF',
    surface: '#F9FAFB',
  },
  typography: {
    fontFamily: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      monospace: 'Courier New, monospace',
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
      relaxed: 1.625,
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
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1536px',
  },
  borderRadius: {
    none: '0',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
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
    },
  },
};

// Get text primary color safely
const getTextPrimaryColor = () => {
  return typeof mockTheme.colors.text === 'string'
    ? mockTheme.colors.text
    : mockTheme.colors.text.primary;
};

// Custom render function that wraps components in DirectThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

describe('ProgressDemo', () => {
  it('renders without crashing', () => {
    renderWithTheme(<ProgressDemo />);

    // Check if the component title is rendered
    expect(screen.getByText('Progress Demo')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    renderWithTheme(<ProgressDemo title="Custom Progress" />);

    // Check if the custom title is rendered
    expect(screen.getByText('Custom Progress')).toBeInTheDocument();
  });

  it('renders all progress bars', () => {
    renderWithTheme(<ProgressDemo />);

    // Check if all progress labels are rendered
    expect(screen.getByText('Determinate Progress (25%)')).toBeInTheDocument();
    expect(screen.getByText('Determinate Progress (50%)')).toBeInTheDocument();
    expect(screen.getByText('Determinate Progress (75%)')).toBeInTheDocument();
    expect(screen.getByText('Determinate Progress (100%)')).toBeInTheDocument();
  });

  it('applies theme styles correctly', () => {
    const { container } = renderWithTheme(<ProgressDemo />);

    // Get the main container div
    const demoContainer = container.firstChild as HTMLElement;

    // Check if background color is applied from theme
    expect(demoContainer).toHaveStyle(`background-color: ${mockTheme.colors.background}`);

    // Check if text color is applied from theme
    expect(demoContainer).toHaveStyle(`color: ${getTextPrimaryColor()}`);

    // Check if border color is applied from theme
    expect(demoContainer).toHaveStyle(`border: 1px solid ${mockTheme.colors.border}`);
  });
});
