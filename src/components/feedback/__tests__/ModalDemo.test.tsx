import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalDemo } from '../ModalDemo';
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

// Mock window.alert
window.alert = jest.fn();

// Custom render function that wraps components in DirectThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

describe('ModalDemo', () => {
  it('renders without crashing', () => {
    renderWithTheme(<ModalDemo />);

    // Check if the component title is rendered
    expect(screen.getByText('Modal Demo')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    renderWithTheme(<ModalDemo title="Custom Modal Demo" />);

    // Check if the custom title is rendered
    expect(screen.getByText('Custom Modal Demo')).toBeInTheDocument();
  });

  it('renders modal buttons', () => {
    renderWithTheme(<ModalDemo />);

    // Check if buttons are rendered
    expect(screen.getByText('Open Basic Modal')).toBeInTheDocument();
    expect(screen.getByText('Open Confirmation Modal')).toBeInTheDocument();
  });

  it('opens basic modal when button is clicked', () => {
    renderWithTheme(<ModalDemo />);

    // Click the basic modal button
    fireEvent.click(screen.getByText('Open Basic Modal'));

    // Check if modal is opened
    expect(screen.getByText('Basic Modal')).toBeInTheDocument();
    expect(
      screen.getByText('This is a basic modal dialog using DirectThemeProvider for styling.')
    ).toBeInTheDocument();
  });

  it('closes basic modal when close button is clicked', () => {
    renderWithTheme(<ModalDemo />);

    // Open the modal
    fireEvent.click(screen.getByText('Open Basic Modal'));

    // Click the close button
    fireEvent.click(screen.getByText('Close'));

    // Check if modal is closed (text no longer in document)
    expect(screen.queryByText('Basic Modal')).not.toBeInTheDocument();
  });

  it('opens confirmation modal when button is clicked', () => {
    renderWithTheme(<ModalDemo />);

    // Click the confirmation modal button
    fireEvent.click(screen.getByText('Open Confirmation Modal'));

    // Check if modal is opened
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to perform this action?')).toBeInTheDocument();
  });

  it('shows alert when confirm button is clicked', () => {
    renderWithTheme(<ModalDemo />);

    // Open the confirmation modal
    fireEvent.click(screen.getByText('Open Confirmation Modal'));

    // Click the confirm button
    fireEvent.click(screen.getByText('Confirm'));

    // Check if alert was called
    expect(window.alert).toHaveBeenCalledWith('Action confirmed!');

    // Check if modal is closed
    expect(screen.queryByText('Confirmation')).not.toBeInTheDocument();
  });

  it('applies theme styles correctly', () => {
    const { container } = renderWithTheme(<ModalDemo />);

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
