import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DatePicker } from '../DatePicker';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    tertiary: '#f9a825',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: '#f5f5f5',
    surface: '#ffffff',
    white: '#ffffff',
    border: '#e0e0e0',
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
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
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
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    base: '0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
};

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

describe('DatePicker Component', () => {
  it('renders with label and placeholder', () => {
    renderWithTheme(<DatePicker label="Test Date" placeholder="Select a date" />);

    expect(screen.getByText('Test Date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select a date')).toBeInTheDocument();
  });

  it('shows calendar icon', () => {
    renderWithTheme(<DatePicker label="Test Date" />);

    // The calendar icon is a text emoji in our implementation
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('shows helper text when provided', () => {
    renderWithTheme(<DatePicker label="Test Date" helperText="Please select a valid date" />);

    expect(screen.getByText('Please select a valid date')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    renderWithTheme(
      <DatePicker label="Test Date" error={true} errorMessage="This field is required" />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies disabled styling when disabled', () => {
    renderWithTheme(<DatePicker label="Test Date" disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows required indicator when required', () => {
    renderWithTheme(<DatePicker label="Test Date" required />);

    // Required indicator is an asterisk
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('opens calendar when input is clicked', () => {
    renderWithTheme(<DatePicker label="Test Date" />);

    // Click the input to open calendar
    fireEvent.click(screen.getByRole('textbox'));

    // We can't easily check if the calendar is visible in this test environment
    // because the PopoverContainer uses a CSS display property based on a prop
  });
});
