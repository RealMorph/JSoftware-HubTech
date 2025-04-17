import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Theme styles interface
interface ThemeStyles {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      default: string;
      paper: string;
      hover: string;
      selected: string;
      disabled: string;
    };
    border: {
      main: string;
      light: string;
      dark: string;
    };
    surface: {
      main: string;
      hover: string;
    };
  };
  typography: {
    family: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    weight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      none: number;
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    unit: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borders: {
    width: {
      thin: string;
      normal: string;
      thick: string;
    };
    radius: {
      none: string;
      small: string;
      medium: string;
      large: string;
      full: string;
    };
    style: {
      solid: string;
      dashed: string;
    };
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animation: {
    duration: {
      fastest: string;
      fast: string;
      normal: string;
      slow: string;
      slowest: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  zIndex: {
    sticky: number;
  };
}

// Function to create theme styles
const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      primary: {
        main: theme.getColor('primary.main', '#1976d2'),
        light: theme.getColor('primary.light', '#42a5f5'),
        dark: theme.getColor('primary.dark', '#1565c0'),
      },
      secondary: {
        main: theme.getColor('secondary.main', '#9c27b0'),
        light: theme.getColor('secondary.light', '#ba68c8'),
        dark: theme.getColor('secondary.dark', '#7b1fa2'),
      },
      text: {
        primary: theme.getColor('text.primary', '#1f2937'),
        secondary: theme.getColor('text.secondary', '#4b5563'),
        disabled: theme.getColor('text.disabled', '#9ca3af'),
      },
      background: {
        default: theme.getColor('background.default', '#ffffff'),
        paper: theme.getColor('background.paper', '#ffffff'),
        hover: theme.getColor('background.hover', '#f3f4f6'),
        selected: theme.getColor('background.selected', '#e5e7eb'),
        disabled: theme.getColor('background.disabled', '#f9fafb'),
      },
      border: {
        main: theme.getColor('border.main', '#e5e7eb'),
        light: theme.getColor('border.light', '#f3f4f6'),
        dark: theme.getColor('border.dark', '#d1d5db'),
      },
      surface: {
        main: theme.getColor('surface.main', '#f9fafb'),
        hover: theme.getColor('surface.hover', '#f3f4f6'),
      },
    },
    typography: {
      family: String(theme.getTypography('family.base', 'system-ui')),
      size: {
        xs: String(theme.getTypography('scale.xs', '0.75rem')),
        sm: String(theme.getTypography('scale.sm', '0.875rem')),
        base: String(theme.getTypography('scale.base', '1rem')),
        lg: String(theme.getTypography('scale.lg', '1.125rem')),
        xl: String(theme.getTypography('scale.xl', '1.25rem')),
      },
      weight: {
        normal: Number(theme.getTypography('weights.normal', 400)),
        medium: Number(theme.getTypography('weights.medium', 500)),
        semibold: Number(theme.getTypography('weights.semibold', 600)),
        bold: Number(theme.getTypography('weights.bold', 700)),
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      unit: theme.getSpacing('1', '0.25rem'),
      xs: theme.getSpacing('2', '0.5rem'),
      sm: theme.getSpacing('3', '0.75rem'),
      md: theme.getSpacing('4', '1rem'),
      lg: theme.getSpacing('6', '1.5rem'),
      xl: theme.getSpacing('8', '2rem'),
    },
    borders: {
      width: {
        thin: '1px',
        normal: '2px',
        thick: '3px',
      },
      radius: {
        none: '0',
        small: theme.getBorderRadius('sm', '0.25rem'),
        medium: theme.getBorderRadius('md', '0.375rem'),
        large: theme.getBorderRadius('lg', '0.5rem'),
        full: '9999px',
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
      },
    },
    shadows: {
      none: 'none',
      sm: theme.getShadow('sm', '0 1px 2px rgba(0, 0, 0, 0.05)'),
      md: theme.getShadow('md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
      lg: theme.getShadow('lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)'),
      xl: theme.getShadow('xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1)'),
    },
    animation: {
      duration: {
        fastest: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slowest: '400ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    zIndex: {
      sticky: 10,
    },
  };
};

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

// Styled component interfaces
interface StyledComponentProps {
  $themeStyles: ThemeStyles;
}

interface PageSizeSelectorProps extends StyledComponentProps {
  children: React.ReactNode;
}

interface PageSizeLabelProps extends StyledComponentProps {
  children: React.ReactNode;
}

interface SelectWrapperProps extends StyledComponentProps {
  children: React.ReactNode;
}

interface PageSizeSelectProps extends StyledComponentProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

interface PaginationControlsProps extends StyledComponentProps {
  children: React.ReactNode;
}

interface PaginationInfoProps extends StyledComponentProps {
  children: React.ReactNode;
}

interface PaginationButtonProps extends StyledComponentProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

interface FilterInputProps {
  $themeStyles: ThemeStyles;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
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
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);

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

  // Styled components
  const GridContainer = styled.div<{ height?: string; $themeStyles: ThemeStyles }>`
    width: 100%;
    border: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    border-radius: ${props => props.$themeStyles.borders.radius.medium};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: ${props => props.height || 'auto'};
    font-family: ${props => props.$themeStyles.typography.family};
  `;

  const GridHeader = styled.div<{ stickyHeader?: boolean; $themeStyles: ThemeStyles }>`
    display: flex;
    align-items: center;
    padding: ${props => props.$themeStyles.spacing.sm} ${props => props.$themeStyles.spacing.md};
    background-color: ${props => props.$themeStyles.colors.surface.main};
    border-bottom: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    ${props =>
      props.stickyHeader &&
      `
      position: sticky;
      top: 0;
      z-index: ${props.$themeStyles.zIndex.sticky};
    `}
  `;

  const FilterSection = styled.div<{ $themeStyles: ThemeStyles }>`
    display: flex;
    flex-wrap: wrap;
    gap: ${props => props.$themeStyles.spacing.sm};
    margin-bottom: ${props => props.$themeStyles.spacing.sm};
    padding: ${props => props.$themeStyles.spacing.sm};
    border-bottom: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
  `;

  const FilterItem = styled.div<{ $themeStyles: ThemeStyles }>`
    display: flex;
    align-items: center;
    gap: ${props => props.$themeStyles.spacing.sm};
  `;

  const FilterLabel = styled.span<{ $themeStyles: ThemeStyles }>`
    font-size: ${props => props.$themeStyles.typography.size.sm};
    font-weight: ${props => props.$themeStyles.typography.weight.medium};
    color: ${props => props.$themeStyles.colors.text.secondary};
  `;

  const FilterInput = styled.input<FilterInputProps>`
    padding: ${props => props.$themeStyles.spacing.sm};
    border: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    border-radius: ${props => props.$themeStyles.borders.radius.small};
    min-width: 150px;
    font-family: ${props => props.$themeStyles.typography.family};
    font-size: ${props => props.$themeStyles.typography.size.sm};
    color: ${props => props.$themeStyles.colors.text.primary};
    transition: all ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

    &:focus {
      outline: none;
      border-color: ${props => props.$themeStyles.colors.primary.main};
      box-shadow: 0 0 0 2px ${props => props.$themeStyles.colors.primary.light}33;
    }

    &:hover {
      border-color: ${props => props.$themeStyles.colors.border.dark};
    }

    &:disabled {
      background-color: ${props => props.$themeStyles.colors.background.disabled};
      color: ${props => props.$themeStyles.colors.text.disabled};
      cursor: not-allowed;
    }
  `;

  const TableContainer = styled.div<{ $themeStyles: ThemeStyles }>`
    overflow: auto;
    flex: 1;
  `;

  const Table = styled.table<{ $themeStyles: ThemeStyles }>`
    width: 100%;
    border-collapse: collapse;
  `;

  const TableHead = styled.thead<{ $themeStyles: ThemeStyles; stickyHeader?: boolean }>`
    background-color: ${props => props.$themeStyles.colors.surface.main};
    ${props =>
      props.stickyHeader &&
      `
      position: sticky;
      top: 0;
      z-index: ${props.$themeStyles.zIndex.sticky};
    `}
  `;

  interface TableHeadCellProps {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    sortable?: boolean;
    isSorted?: boolean;
    sortDirection?: 'asc' | 'desc';
  }

  const TableHeadCell = styled.th<TableHeadCellProps & { $themeStyles: ThemeStyles }>`
    padding: ${props => props.$themeStyles.spacing.sm} ${props => props.$themeStyles.spacing.md};
    font-weight: ${props => props.$themeStyles.typography.weight.semibold};
    text-align: left;
    position: relative;
    width: ${props => props.width || 'auto'};
    min-width: ${props => props.minWidth || '100px'};
    max-width: ${props => props.maxWidth || 'none'};
    cursor: ${props => (props.sortable ? 'pointer' : 'default')};
    user-select: none;
    white-space: nowrap;
    color: ${props => props.$themeStyles.colors.text.primary};
    border-bottom: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    transition: background-color ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

    &:hover {
      ${props =>
        props.sortable &&
        `
        background-color: ${props.$themeStyles.colors.surface.hover};
      `}
    }

    &::after {
      ${props =>
        props.isSorted &&
        `
        content: '${props.sortDirection === 'asc' ? '▲' : '▼'}';
        margin-left: ${props.$themeStyles.spacing.xs};
        font-size: ${props.$themeStyles.typography.size.xs};
        color: ${props.$themeStyles.colors.primary.main};
      `}
    }
  `;

  const TableBody = styled.tbody<{ $themeStyles: ThemeStyles }>``;

  interface TableRowProps {
    highlightOnHover?: boolean;
    striped?: boolean;
    isEven: boolean;
    clickable?: boolean;
  }

  const TableRow = styled.tr<TableRowProps & { $themeStyles: ThemeStyles }>`
    background-color: ${props => {
      if (props.striped && props.isEven) {
        return props.$themeStyles.colors.surface.main;
      }
      return props.$themeStyles.colors.background.default;
    }};
    transition: background-color ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

    ${props =>
      props.highlightOnHover &&
      `
      &:hover {
        background-color: ${props.$themeStyles.colors.background.hover};
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

  const TableCell = styled.td<TableCellProps & { $themeStyles: ThemeStyles }>`
    padding: ${props => (props.dense ? props.$themeStyles.spacing.sm : props.$themeStyles.spacing.md)} ${props => props.$themeStyles.spacing.md};
    border-bottom: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    color: ${props => props.$themeStyles.colors.text.primary};
    font-size: ${props => props.$themeStyles.typography.size.sm};
  `;

  const Pagination = styled.div<{ $themeStyles: ThemeStyles }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.$themeStyles.spacing.sm} ${props => props.$themeStyles.spacing.md};
    border-top: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    background-color: ${props => props.$themeStyles.colors.background.default};
  `;

  const PageSizeSelector = styled.div<PageSizeSelectorProps>`
    display: flex;
    align-items: center;
    gap: ${props => props.$themeStyles.spacing.sm};
  `;

  const PageSizeLabel = styled.span<PageSizeLabelProps>`
    font-size: ${props => props.$themeStyles.typography.size.sm};
    color: ${props => props.$themeStyles.colors.text.secondary};
  `;

  const SelectWrapper = styled.div<SelectWrapperProps>`
    position: relative;
  `;

  const PageSizeSelect = styled.select<PageSizeSelectProps>`
    padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
    border: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    border-radius: ${props => props.$themeStyles.borders.radius.small};
    background-color: ${props => props.$themeStyles.colors.background.default};
    color: ${props => props.$themeStyles.colors.text.primary};
    font-family: ${props => props.$themeStyles.typography.family};
    font-size: ${props => props.$themeStyles.typography.size.sm};
    min-width: 80px;
    cursor: pointer;
    transition: all ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

    &:focus {
      outline: none;
      border-color: ${props => props.$themeStyles.colors.primary.main};
      box-shadow: 0 0 0 2px ${props => props.$themeStyles.colors.primary.light}33;
    }

    &:hover:not(:disabled) {
      border-color: ${props => props.$themeStyles.colors.border.dark};
    }

    &:disabled {
      background-color: ${props => props.$themeStyles.colors.background.disabled};
      color: ${props => props.$themeStyles.colors.text.disabled};
      cursor: not-allowed;
    }
  `;

  const PaginationControls = styled.div<PaginationControlsProps>`
    display: flex;
    align-items: center;
    gap: ${props => props.$themeStyles.spacing.sm};
  `;

  const PaginationInfo = styled.span<PaginationInfoProps>`
    font-size: ${props => props.$themeStyles.typography.size.sm};
    color: ${props => props.$themeStyles.colors.text.secondary};
  `;

  const PaginationButton = styled.button<PaginationButtonProps>`
    padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
    border: ${props => props.$themeStyles.borders.width.thin} ${props => props.$themeStyles.borders.style.solid} ${props => props.$themeStyles.colors.border.main};
    border-radius: ${props => props.$themeStyles.borders.radius.small};
    background-color: ${props => props.$themeStyles.colors.background.default};
    color: ${props => props.$themeStyles.colors.text.primary};
    font-family: ${props => props.$themeStyles.typography.family};
    font-size: ${props => props.$themeStyles.typography.size.sm};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${props => (props.disabled ? 0.5 : 1)};
    transition: all ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

    &:hover:not(:disabled) {
      background-color: ${props => props.$themeStyles.colors.background.hover};
      border-color: ${props => props.$themeStyles.colors.border.dark};
    }

    &:focus {
      outline: none;
      border-color: ${props => props.$themeStyles.colors.primary.main};
      box-shadow: 0 0 0 2px ${props => props.$themeStyles.colors.primary.light}33;
    }

    &:disabled {
      background-color: ${props => props.$themeStyles.colors.background.disabled};
      color: ${props => props.$themeStyles.colors.text.disabled};
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
    if (!enableFiltering || columns.length === 0) return null;

    return (
      <FilterSection $themeStyles={themeStyles}>
        {columns
          .filter(column => column.filterable !== false)
          .map(column => (
            <FilterItem key={column.id} $themeStyles={themeStyles}>
              <FilterLabel $themeStyles={themeStyles}>{column.header}</FilterLabel>
              {column.filterComponent ? (
                <column.filterComponent
                  column={column}
                  value={filters[column.id] || ''}
                  onChange={value => handleFilterChange(column.id, value)}
                />
              ) : (
                <FilterInput
                  $themeStyles={themeStyles}
                  type="text"
                  value={filters[column.id] || ''}
                  onChange={e => handleFilterChange(column.id, e.target.value)}
                  placeholder={`Filter by ${column.header.toLowerCase()}`}
                />
              )}
            </FilterItem>
          ))}
      </FilterSection>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, processedData.length);

    return (
      <Pagination $themeStyles={themeStyles}>
        <PageSizeSelector $themeStyles={themeStyles}>
          <PageSizeLabel $themeStyles={themeStyles}>Rows per page:</PageSizeLabel>
          <SelectWrapper $themeStyles={themeStyles}>
            <PageSizeSelect
              $themeStyles={themeStyles}
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </PageSizeSelect>
          </SelectWrapper>
        </PageSizeSelector>

        <PaginationControls $themeStyles={themeStyles}>
          <PaginationInfo $themeStyles={themeStyles}>
            {startIndex + 1}-{endIndex} of {processedData.length}
          </PaginationInfo>
          <PaginationButton
            $themeStyles={themeStyles}
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            Previous
          </PaginationButton>
          <PaginationButton
            $themeStyles={themeStyles}
            onClick={() => handleNextPage(totalPages)}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    );
  };

  return (
    <GridContainer height={height} $themeStyles={themeStyles} className={className} data-testid={testId}>
      {renderFilters()}
      <TableContainer $themeStyles={themeStyles}>
        <Table $themeStyles={themeStyles}>
          <TableHead $themeStyles={themeStyles} stickyHeader={stickyHeader}>
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
                  onClick={() => handleSort(column.id)}
                  $themeStyles={themeStyles}
                >
                  {column.header}
                </TableHeadCell>
              ))}
            </tr>
          </TableHead>
          <TableBody $themeStyles={themeStyles}>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                isEven={index % 2 === 0}
                highlightOnHover={highlightOnHover}
                striped={striped}
                clickable={!!onRowClick}
                onClick={() => onRowClick?.(row)}
                $themeStyles={themeStyles}
              >
                {columns.map(column => (
                  <TableCell key={column.id} dense={dense} $themeStyles={themeStyles}>
                    {column.renderCell
                      ? column.renderCell(getRowValue(row, column.accessor), row)
                      : getRowValue(row, column.accessor)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {renderPagination()}
    </GridContainer>
  );
}

export default DataGrid;
