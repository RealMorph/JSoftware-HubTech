import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataGrid, { Column } from '../DataGrid';
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
    background: '#ffffff',
    border: '#e0e0e0',
    white: '#ffffff',
    surface: '#f5f5f5',
  },
  typography: {
    fontFamily: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      monospace: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      '4xl': '4rem',
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

// Custom theme with different color values
const customTheme: ThemeConfig = {
  ...mockTheme,
  colors: {
    ...mockTheme.colors,
    primary: '#ff5722', // Orange primary color
    secondary: '#9c27b0', // Purple secondary color
    background: '#fafafa',
    border: '#bbbbbb',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#bdbdbd',
    },
  },
};

// Test data
interface TestItem {
  id: number;
  name: string;
  email: string;
}

const testData: TestItem[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

const testColumns: Column<TestItem>[] = [
  { id: 'id', header: 'ID', accessor: 'id' },
  { id: 'name', header: 'Name', accessor: 'name' },
  { id: 'email', header: 'Email', accessor: 'email' },
];

// Custom render function with theme
const renderWithTheme = (ui: React.ReactElement, theme = mockTheme) => {
  return render(
    <DirectThemeProvider initialTheme={theme}>
      {ui}
    </DirectThemeProvider>
  );
};

describe('DataGrid Theming', () => {
  it('applies loading overlay when loading prop is true', () => {
    renderWithTheme(
      <DataGrid 
        data={testData} 
        columns={testColumns} 
        loading={true}
      />
    );
    
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('displays data correctly', () => {
    renderWithTheme(
      <DataGrid 
        data={testData} 
        columns={testColumns}
      />
    );
    
    // Check if header and data are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows custom no data message when data is empty', () => {
    const customMessage = "Custom no data message";
    renderWithTheme(
      <DataGrid 
        data={[]} 
        columns={testColumns}
        noDataMessage={customMessage}
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders pagination correctly', () => {
    renderWithTheme(
      <DataGrid 
        data={testData} 
        columns={testColumns}
        defaultPageSize={1}
      />
    );
    
    // Check pagination elements
    expect(screen.getByText('Rows per page:')).toBeInTheDocument();
    expect(screen.getByText('1-1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
}); 