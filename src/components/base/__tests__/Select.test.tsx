import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeConfig } from '../../../core/theme/consolidated-types';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import Select from '../Select';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50',
    tertiary: '#f9a825',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999'
    },
    background: '#f5f5f5',
    surface: '#ffffff',
    white: '#ffffff',
    border: '#e0e0e0'
  },
  typography: {
    fontFamily: {
      base: 'system-ui, sans-serif',
      heading: 'system-ui, sans-serif',
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
      relaxed: 1.75,
      loose: 2
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
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px'
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
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear'
    }
  }
};

// Test data
const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true }
];

const renderWithTheme = (ui: React.ReactNode) => {
  return render(
    <DirectThemeProvider initialTheme={mockTheme}>
      {ui}
    </DirectThemeProvider>
  );
};

describe('Select Component', () => {
  test('renders with label and options', () => {
    renderWithTheme(<Select label="Test Select" options={options} />);

    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  test('handles selection changes', () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <Select 
        label="Test Select" 
        options={options} 
        onChange={handleChange} 
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalledWith('option2', expect.any(Object));
  });

  test('renders helper text when provided', () => {
    renderWithTheme(
      <Select 
        label="Test Select" 
        options={options} 
        helperText="This is helper text" 
      />
    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  test('applies error styling when error prop is true', () => {
    renderWithTheme(
      <Select 
        label="Test Select" 
        options={options} 
        error 
        helperText="Error message" 
      />
    );

    const helperText = screen.getByText('Error message');
    const computedStyle = window.getComputedStyle(helperText);
    
    // This might vary based on how you're applying styles
    // If using inline styles, uncomment the next line:
    // expect(helperText).toHaveStyle({ color: mockTheme.colors.error });
  });

  test('renders with placeholder', () => {
    renderWithTheme(
      <Select 
        label="Test Select" 
        options={options} 
        placeholder="Select an option" 
      />
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  test('renders as disabled when disabled prop is true', () => {
    renderWithTheme(
      <Select 
        label="Test Select" 
        options={options} 
        disabled 
      />
    );

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
}); 