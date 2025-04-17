import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Types
export interface Column<T = any> {
  id: string;
  header: string;
  accessor: keyof T | ((data: T) => any);
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (value: any, row: T) => React.ReactNode;
  filterComponent?: React.ComponentType<FilterProps>;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  id: string;
  value: any;
}

export interface FilterProps {
  column: Column;
  value: any;
  onChange: (value: any) => void;
}

export interface DataGridProps<T = any> {
  /** Data to be displayed in the grid */
  data: T[];
  /** Column definitions for the grid */
  columns: Column<T>[];
  /** Initial sort configuration */
  initialSort?: SortConfig;
  /** Whether to enable sorting */
  enableSorting?: boolean;
  /** Whether to enable filtering */
  enableFiltering?: boolean;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Default page size when pagination is enabled */
  defaultPageSize?: number;
  /** CSS class name */
  className?: string;
  /** Text to display when there is no data */
  noDataMessage?: string;
  /** Callback for row click */
  onRowClick?: (row: T) => void;
  /** Whether rows highlight on hover */
  highlightOnHover?: boolean;
  /** Whether rows should be striped */
  striped?: boolean;
  /** Whether to use a dense layout */
  dense?: boolean;
  /** Whether the header should stick to the top during scroll */
  stickyHeader?: boolean;
  /** Height of the grid (CSS value) */
  height?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Test ID for component testing */
  testId?: string;
}

// DataGrid component
function DataGrid<T extends Record<string, any> = any>({
  data,
  columns,
  initialSort,
  enableSorting = true,
  enableFiltering = true,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  className,
  noDataMessage = 'No data available',
  onRowClick,
  highlightOnHover = true,
  striped = true,
  dense = false,
  stickyHeader = true,
  height,
  loading = false,
  loadingComponent,
  testId,
}: DataGridProps<T>): React.ReactElement {
  // Access the theme
  const theme = useDirectTheme();

  // Add gridRef for container reference
  const gridRef = useRef<HTMLDivElement>(null);

  // State for sorting
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(initialSort);

  // State for filtering
  const [filters, setFilters] = useState<Record<string, any>>({});

  // State for pagination
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [currentPage, setCurrentPage] = useState(0);

  // Handle sort click
  const handleSort = useCallback(
    (columnId: string) => {
      if (!enableSorting) return;

      setSortConfig(prevSortConfig => {
        if (!prevSortConfig || prevSortConfig.key !== columnId) {
          return { key: columnId, direction: 'asc' };
        }

        if (prevSortConfig.direction === 'asc') {
          return { key: columnId, direction: 'desc' };
        }

        return { key: columnId, direction: 'asc' };
      });

      // Reset to first page when sorting changes
      setCurrentPage(0);
    },
    [enableSorting]
  );

  // Handle filter change
  const handleFilterChange = useCallback((columnId: string, value: any) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };

      if (value === '' || value === null || value === undefined) {
        delete newFilters[columnId];
      } else {
        newFilters[columnId] = value;
      }

      return newFilters;
    });

    // Reset to first page when filters change
    setCurrentPage(0);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    setPageSize(newPageSize);
    setCurrentPage(0);
  }, []);

  // Handle pagination
  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  }, []);

  const handleNextPage = useCallback((totalPages: number) => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  }, []);

  // Get value from row using accessor
  const getRowValue = useCallback((row: T, accessor: keyof T | ((data: T) => any)) => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    return row[accessor];
  }, []);

  // Sort and filter data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(row => {
        return Object.entries(filters).every(([columnId, filterValue]) => {
          const column = columns.find(col => col.id === columnId);
          if (!column) return true;

          const value = getRowValue(row, column.accessor);

          if (typeof value === 'string' && typeof filterValue === 'string') {
            return value.toLowerCase().includes(filterValue.toLowerCase());
          }

          return value === filterValue;
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      const column = columns.find(col => col.id === key);

      if (column) {
        result.sort((a, b) => {
          const aValue = getRowValue(a, column.accessor);
          const bValue = getRowValue(b, column.accessor);

          if (aValue === bValue) return 0;

          // For string values, use localeCompare for better sorting
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const compareResult = aValue.localeCompare(bValue);
            return direction === 'asc' ? compareResult : -compareResult;
          }

          // For other types, use standard comparison
          const compareResult = aValue < bValue ? -1 : 1;
          return direction === 'asc' ? compareResult : -compareResult;
        });
      }
    }

    return result;
  }, [data, columns, filters, sortConfig, getRowValue]);

  // Calculate pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedData = useMemo(() => {
    return processedData.slice(startIndex, endIndex);
  }, [processedData, startIndex, endIndex]);

  // Styled components with inline theme access
  const GridContainer = styled.div<{ height?: string }>`
    width: 100%;
    border: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: ${props => props.height || 'auto'};
  `;

  const GridHeader = styled.div<{ stickyHeader?: boolean }>`
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: ${() => theme.getColor('background', '#ffffff')};
    border-bottom: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
    ${props =>
      props.stickyHeader &&
      `
      position: sticky;
      top: 0;
      z-index: 10;
    `}
  `;

  const FilterSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  `;

  const FilterItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  const FilterLabel = styled.span`
    font-size: 14px;
    font-weight: 500;
  `;

  const FilterInput = styled.input`
    padding: 8px;
    border: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
    border-radius: 4px;
    min-width: 150px;

    &:focus {
      outline: none;
      border-color: ${() => theme.getColor('primary', '#1976d2')};
    }
  `;

  const TableContainer = styled.div`
    overflow: auto;
    flex: 1;
  `;

  const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
  `;

  const TableHead = styled.thead`
    background-color: ${() => theme.getColor('surface', '#f5f5f5')};
  `;

  interface TableHeadCellProps {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    sortable?: boolean;
    isSorted?: boolean;
    sortDirection?: 'asc' | 'desc';
  }

  const TableHeadCell = styled.th<TableHeadCellProps>`
    padding: 12px 16px;
    font-weight: 600;
    text-align: left;
    position: relative;
    width: ${props => props.width || 'auto'};
    min-width: ${props => props.minWidth || '100px'};
    max-width: ${props => props.maxWidth || 'none'};
    cursor: ${props => (props.sortable ? 'pointer' : 'default')};
    user-select: none;
    white-space: nowrap;

    &:hover {
      ${props =>
        props.sortable &&
        `
        background-color: ${theme.getColor('background.hover', '#f0f0f0')};
      `}
    }

    &::after {
      ${props =>
        props.isSorted &&
        `
        content: '${props.sortDirection === 'asc' ? '▲' : '▼'}';
        margin-left: 8px;
        font-size: 12px;
      `}
    }
  `;

  const TableBody = styled.tbody``;

  interface TableRowProps {
    highlightOnHover?: boolean;
    striped?: boolean;
    isEven: boolean;
    clickable?: boolean;
  }

  const TableRow = styled.tr<TableRowProps>`
    background-color: ${props => {
      if (props.striped && props.isEven) {
        return theme.getColor('surface', '#f5f5f5');
      }
      return theme.getColor('background', '#ffffff');
    }};

    ${props =>
      props.highlightOnHover &&
      `
      &:hover {
        background-color: ${theme.getColor('background.hover', '#f0f0f0')};
      }
    `}

    ${props =>
      props.clickable &&
      `
      cursor: pointer;
    `}
  `;

  interface TableCellProps {
    dense?: boolean;
  }

  const TableCell = styled.td<TableCellProps>`
    padding: ${props => (props.dense ? '8px 16px' : '12px 16px')};
    border-bottom: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
  `;

  const Pagination = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-top: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
    background-color: ${() => theme.getColor('background', '#ffffff')};
  `;

  const PageSizeSelector = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  const PageSizeLabel = styled.span`
    font-size: 14px;
  `;

  const SelectWrapper = styled.div`
    position: relative;
  `;

  const PageSizeSelect = styled.select`
    padding: 6px 8px;
    border: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
    border-radius: 4px;
    background-color: ${() => theme.getColor('background', '#ffffff')};
    min-width: 80px;

    &:focus {
      outline: none;
      border-color: ${() => theme.getColor('primary', '#1976d2')};
    }
  `;

  const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  const PaginationInfo = styled.span`
    font-size: 14px;
  `;

  const PaginationButton = styled.button<{ disabled?: boolean }>`
    padding: 6px 10px;
    border: 1px solid ${() => theme.getColor('border', '#e0e0e0')};
    border-radius: 4px;
    background-color: ${() => theme.getColor('background', '#ffffff')};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${props => (props.disabled ? 0.5 : 1)};

    &:hover:not(:disabled) {
      background-color: ${() => theme.getColor('background.hover', '#f0f0f0')};
    }

    &:focus {
      outline: none;
      border-color: ${() => theme.getColor('primary', '#1976d2')};
    }
  `;

  const NoDataMessage = styled.div`
    padding: 32px;
    text-align: center;
    color: ${() => theme.getColor('text.secondary', '#666')};
    font-size: 16px;
  `;

  const LoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
  `;

  const LoadingSpinner = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid ${() => theme.getColor('primary', '#1976d2')};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  // Default filter component
  const DefaultFilter: React.FC<FilterProps> = ({ value, onChange }) => {
    return (
      <FilterInput
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Filter..."
      />
    );
  };

  // Filter components
  const renderFilters = () => {
    if (!enableFiltering) return null;

    const filterableColumns = columns.filter(col => col.filterable !== false);
    if (filterableColumns.length === 0) return null;

    return (
      <FilterSection>
        {filterableColumns.map(column => {
          const FilterComponent = column.filterComponent || DefaultFilter;

          return (
            <FilterItem key={column.id}>
              <FilterLabel>{column.header}:</FilterLabel>
              <FilterComponent
                column={column}
                value={filters[column.id] || ''}
                onChange={value => handleFilterChange(column.id, value)}
              />
            </FilterItem>
          );
        })}
      </FilterSection>
    );
  };

  return (
    <GridContainer ref={gridRef} className={className} data-testid={testId} style={{ height }}>
      {renderFilters()}

      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              {columns.map(column => (
                <TableHeadCell
                  key={column.id}
                  width={column.width}
                  minWidth={column.minWidth}
                  maxWidth={column.maxWidth}
                  sortable={enableSorting && column.sortable !== false}
                  isSorted={sortConfig?.key === column.id}
                  sortDirection={sortConfig?.key === column.id ? sortConfig.direction : undefined}
                  onClick={() => {
                    if (enableSorting && column.sortable !== false) {
                      handleSort(column.id);
                    }
                  }}
                >
                  {column.header}
                </TableHeadCell>
              ))}
            </tr>
          </TableHead>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  isEven={rowIndex % 2 === 0}
                  highlightOnHover={highlightOnHover}
                  striped={striped}
                  clickable={!!onRowClick}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map(column => (
                    <TableCell key={column.id} dense={dense}>
                      {column.renderCell
                        ? column.renderCell(getRowValue(row, column.accessor), row)
                        : getRowValue(row, column.accessor)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <NoDataMessage>{noDataMessage}</NoDataMessage>
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 0 && (
        <Pagination>
          <PageSizeSelector>
            <PageSizeLabel>Rows per page:</PageSizeLabel>
            <SelectWrapper>
              <PageSizeSelect value={pageSize} onChange={handlePageSizeChange}>
                {pageSizeOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </PageSizeSelect>
            </SelectWrapper>
          </PageSizeSelector>

          <PaginationControls>
            <PaginationInfo>
              {startIndex + 1}-{endIndex} of {totalItems}
            </PaginationInfo>
            <PaginationButton onClick={handlePreviousPage} disabled={currentPage === 0}>
              Previous
            </PaginationButton>
            <PaginationButton
              onClick={() => handleNextPage(totalPages)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </PaginationButton>
          </PaginationControls>
        </Pagination>
      )}

      {loading && (
        <LoadingOverlay data-testid="loading-overlay">
          {loadingComponent || <LoadingSpinner />}
        </LoadingOverlay>
      )}
    </GridContainer>
  );
}

export default DataGrid;
