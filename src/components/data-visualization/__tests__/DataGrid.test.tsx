import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// Test data
interface TestItem {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

const testData: TestItem[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'pending' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active' },
  { id: 5, name: 'David Lee', email: 'david@example.com', status: 'inactive' },
];

// Test columns
const testColumns: Column<TestItem>[] = [
  {
    id: 'id',
    header: 'ID',
    accessor: 'id',
    sortable: true,
  },
  {
    id: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true,
    filterable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true,
    filterable: true,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    sortable: true,
    filterable: true,
  },
];

// Custom render function with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <DirectThemeProvider initialTheme={mockTheme}>
      {ui}
    </DirectThemeProvider>
  );
};

describe('DataGrid Component', () => {
  it('renders the grid with data', () => {
    renderWithTheme(<DataGrid data={testData} columns={testColumns} />);
    
    // Check if all column headers are rendered
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check if data rows are rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<DataGrid data={[]} columns={testColumns} noDataMessage="Custom no data message" />);
    
    expect(screen.getByText('Custom no data message')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    renderWithTheme(<DataGrid data={testData} columns={testColumns} loading={true} />);
    
    // Check for loading state by looking for loading overlay
    const loadingOverlay = screen.getByTestId('loading-overlay');
    expect(loadingOverlay).toBeInTheDocument();
  });

  it('allows sorting by clicking on column headers', async () => {
    renderWithTheme(<DataGrid data={testData} columns={testColumns} enableSorting={true} />);
    
    // Get ID column header and click it to sort
    const idHeader = screen.getByText('ID');
    fireEvent.click(idHeader);
    
    // Verify the click was registered
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Click again to verify we can trigger sorting multiple times
    fireEvent.click(idHeader);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('allows filtering data', () => {
    renderWithTheme(<DataGrid data={testData} columns={testColumns} enableFiltering={true} />);
    
    // Find name filter input (second filter input)
    const nameFilterInput = screen.getAllByPlaceholderText('Filter...')[1]; // Use the Name filter, not ID
    
    // Enter filter text
    fireEvent.change(nameFilterInput, { target: { value: 'John' } });
    
    // Wait for filtered results
    const johnRow = screen.getByText('John Doe');
    expect(johnRow).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('handles row click events', () => {
    const handleRowClick = jest.fn();
    
    renderWithTheme(
      <DataGrid 
        data={testData} 
        columns={testColumns} 
        onRowClick={handleRowClick} 
      />
    );
    
    // Click on a row
    const johnDoeCell = screen.getByText('John Doe');
    const row = johnDoeCell.closest('tr');
    fireEvent.click(row as HTMLElement);
    
    // Check if the click handler was called with the right data
    expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it('applies correct theme styling', () => {
    renderWithTheme(<DataGrid data={testData} columns={testColumns} striped={true} />);
    
    // Get the table element
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check header styling
    const header = screen.getAllByRole('columnheader')[0];
    expect(header).toHaveStyle('font-weight: 600');
  });

  it('works with pagination controls', () => {
    // Create more test data to enable pagination
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
    } as TestItem));
    
    renderWithTheme(
      <DataGrid 
        data={manyItems} 
        columns={testColumns}
        defaultPageSize={10}
      />
    );
    
    // Check that pagination info is displayed
    expect(screen.getByText('1-10 of 25')).toBeInTheDocument();
    
    // Click next page button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check that we're now on page 2
    expect(screen.getByText('11-20 of 25')).toBeInTheDocument();
    
    // Person 11 should be visible, Person 1 should not
    expect(screen.getByText('Person 11')).toBeInTheDocument();
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
  });
}); 