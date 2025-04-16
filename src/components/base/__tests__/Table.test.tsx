import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHeaderCell 
} from '../Table';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { extendedMockTheme } from '../../../core/theme/__mocks__/mockTheme';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <DirectThemeProvider initialTheme={extendedMockTheme}>
      {ui}
    </DirectThemeProvider>
  );
};

describe('Table component', () => {
  test('renders with default props', () => {
    renderWithTheme(
      <Table data-testid="test-table">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Header 1</TableHeaderCell>
            <TableHeaderCell>Header 2</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByTestId('test-table')).toBeInTheDocument();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
  });

  test('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <Table data-testid="test-table" variant="default">
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    // Default variant
    let table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    
    // Bordered variant
    rerender(
      <DirectThemeProvider initialTheme={extendedMockTheme}>
        <Table data-testid="test-table" variant="bordered">
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DirectThemeProvider>
    );
    
    table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    
    // Striped variant
    rerender(
      <DirectThemeProvider initialTheme={extendedMockTheme}>
        <Table data-testid="test-table" variant="striped">
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DirectThemeProvider>
    );
    
    table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
  });

  test('renders with different sizes', () => {
    const { rerender } = renderWithTheme(
      <Table data-testid="test-table" size="small">
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    // Small size
    let table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    
    // Medium size
    rerender(
      <DirectThemeProvider initialTheme={extendedMockTheme}>
        <Table data-testid="test-table" size="medium">
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DirectThemeProvider>
    );
    
    table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    
    // Large size
    rerender(
      <DirectThemeProvider initialTheme={extendedMockTheme}>
        <Table data-testid="test-table" size="large">
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DirectThemeProvider>
    );
    
    table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
  });

  test('renders with fullWidth prop', () => {
    renderWithTheme(
      <Table data-testid="test-table" fullWidth={true}>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
  });

  test('renders with hoverable rows', () => {
    renderWithTheme(
      <Table data-testid="test-table" hoverable={true}>
        <TableBody>
          <TableRow data-testid="hoverable-row">
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    
    const row = screen.getByTestId('hoverable-row');
    fireEvent.mouseOver(row);
    fireEvent.mouseOut(row);
  });

  test('renders with sticky header', () => {
    renderWithTheme(
      <Table data-testid="test-table" stickyHeader={true}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Header 1</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const table = screen.getByTestId('test-table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
  });

  test('TableRow renders selected state', () => {
    renderWithTheme(
      <Table data-testid="test-table">
        <TableBody>
          <TableRow selected={true} data-testid="selected-row">
            <TableCell>Selected Row</TableCell>
          </TableRow>
          <TableRow data-testid="normal-row">
            <TableCell>Normal Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const selectedRow = screen.getByTestId('selected-row');
    const normalRow = screen.getByTestId('normal-row');
    expect(selectedRow).toBeInTheDocument();
    expect(normalRow).toBeInTheDocument();
  });

  test('TableRow renders disabled state', () => {
    renderWithTheme(
      <Table data-testid="test-table">
        <TableBody>
          <TableRow disabled={true} data-testid="disabled-row">
            <TableCell>Disabled Row</TableCell>
          </TableRow>
          <TableRow data-testid="normal-row">
            <TableCell>Normal Row</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const disabledRow = screen.getByTestId('disabled-row');
    const normalRow = screen.getByTestId('normal-row');
    expect(disabledRow).toBeInTheDocument();
    expect(normalRow).toBeInTheDocument();
  });

  test('TableCell renders with different alignment', () => {
    renderWithTheme(
      <Table data-testid="test-table">
        <TableBody>
          <TableRow>
            <TableCell align="left" data-testid="left-cell">Left</TableCell>
            <TableCell align="center" data-testid="center-cell">Center</TableCell>
            <TableCell align="right" data-testid="right-cell">Right</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    expect(screen.getByTestId('left-cell')).toBeInTheDocument();
    expect(screen.getByTestId('center-cell')).toBeInTheDocument();
    expect(screen.getByTestId('right-cell')).toBeInTheDocument();
  });

  test('TableHeaderCell renders with sortable prop', () => {
    const handleSort = jest.fn();
    renderWithTheme(
      <Table data-testid="test-table">
        <TableHeader>
          <TableRow>
            <TableHeaderCell 
              sortable={true} 
              sortDirection="asc" 
              onSort={handleSort}
              data-testid="sortable-header"
            >
              Sortable Header
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    
    const sortableHeader = screen.getByTestId('sortable-header');
    expect(sortableHeader).toBeInTheDocument();
    
    fireEvent.click(sortableHeader);
    expect(handleSort).toHaveBeenCalledTimes(1);
  });
}); 