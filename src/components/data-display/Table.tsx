import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export interface TableColumn<T> {
  /** The key in the data object that this column represents */
  key: keyof T;
  /** The header text for this column */
  header: string;
  /** Optional width for the column (e.g., '200px', '20%') */
  width?: string;
  /** Optional renderer for custom cell formatting */
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  /** The array of data to display in the table */
  data: T[];
  /** The columns configuration for the table */
  columns: TableColumn<T>[];
  /** Whether to show a striped pattern on alternate rows */
  striped?: boolean;
  /** Whether the table should have a border */
  bordered?: boolean;
  /** Whether the table should take up the full width of its container */
  fullWidth?: boolean;
  /** The size of the table cells */
  size?: 'small' | 'medium' | 'large';
  /** Optional caption for the table */
  caption?: string;
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Whether the table has a hover effect on rows */
  hover?: boolean;
  /** Additional class name for the table */
  className?: string;
}

interface ThemeStyles {
  colors: {
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      secondary: string;
      tertiary: string;
    };
    border: {
      primary: string;
    };
  };
  typography: {
    family: {
      primary: string;
    };
    size: {
      sm: string;
      base: string;
      lg: string;
    };
    weight: {
      semibold: number;
    };
  };
  spacing: {
    '2': string;
    '3': string;
    '4': string;
    '5': string;
  };
}

const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
  colors: {
    text: {
      primary: theme.getColor('text.primary', '#000000'),
      secondary: theme.getColor('text.secondary', '#666666'),
    },
    background: {
      secondary: theme.getColor('background.secondary', '#f5f5f5'),
      tertiary: theme.getColor('background.tertiary', '#eeeeee'),
    },
    border: {
      primary: theme.getColor('border.primary', '#e0e0e0'),
    },
  },
  typography: {
    family: {
      primary: String(theme.getTypography('family.primary', 'system-ui')),
    },
    size: {
      sm: String(theme.getTypography('scale.sm', '0.875rem')),
      base: String(theme.getTypography('scale.base', '1rem')),
      lg: String(theme.getTypography('scale.lg', '1.125rem')),
    },
    weight: {
      semibold: Number(theme.getTypography('weights.semibold', 600)),
    },
  },
  spacing: {
    '2': theme.getSpacing('2', '0.5rem'),
    '3': theme.getSpacing('3', '0.75rem'),
    '4': theme.getSpacing('4', '1rem'),
    '5': theme.getSpacing('5', '1.25rem'),
  },
});

const StyledTable = styled.table<Omit<TableProps<any>, 'data' | 'columns'> & { $themeStyles: ThemeStyles }>`
  border-collapse: collapse;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  font-family: ${props => props.$themeStyles.typography.family.primary};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return props.$themeStyles.typography.size.sm;
      case 'large':
        return props.$themeStyles.typography.size.lg;
      default:
        return props.$themeStyles.typography.size.base;
    }
  }};
  border: ${props =>
    props.bordered
      ? `1px solid ${props.$themeStyles.colors.border.primary}`
      : 'none'};

  th,
  td {
    padding: ${props => {
      switch (props.size) {
        case 'small':
          return `${props.$themeStyles.spacing['2']} ${props.$themeStyles.spacing['3']}`;
        case 'large':
          return `${props.$themeStyles.spacing['4']} ${props.$themeStyles.spacing['5']}`;
        default:
          return `${props.$themeStyles.spacing['3']} ${props.$themeStyles.spacing['4']}`;
      }
    }};
    text-align: left;
    border-bottom: 1px solid ${props => props.$themeStyles.colors.border.primary};
    ${props =>
      props.bordered &&
      `border: 1px solid ${props.$themeStyles.colors.border.primary};`}
  }

  th {
    background-color: ${props => props.$themeStyles.colors.background.secondary};
    font-weight: ${props => props.$themeStyles.typography.weight.semibold};
    color: ${props => props.$themeStyles.colors.text.primary};
  }

  tr:nth-of-type(even) {
    background-color: ${props =>
      props.striped
        ? props.$themeStyles.colors.background.tertiary
        : 'transparent'};
  }

  tr {
    transition: background-color 0.2s ease;

    ${props =>
      props.hover &&
      `
      &:hover {
        background-color: ${props.$themeStyles.colors.background.tertiary};
        cursor: ${props.onRowClick ? 'pointer' : 'default'};
      }
    `}
  }

  caption {
    caption-side: top;
    margin-bottom: ${props => props.$themeStyles.spacing['3']};
    color: ${props => props.$themeStyles.colors.text.secondary};
    font-style: italic;
    text-align: left;
  }
`;

/**
 * Table component for displaying tabular data
 */
export function Table<T>({
  data,
  columns,
  striped = false,
  bordered = false,
  fullWidth = true,
  size = 'medium',
  caption,
  onRowClick,
  hover = false,
  className,
}: TableProps<T>) {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);

  return (
    <StyledTable
      striped={striped}
      bordered={bordered}
      fullWidth={fullWidth}
      size={size}
      hover={hover}
      onRowClick={onRowClick}
      className={className}
      $themeStyles={themeStyles}
    >
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map(column => (
            <th
              key={column.key.toString()}
              style={column.width ? { width: column.width } : undefined}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}>
            {columns.map(column => (
              <td key={`${rowIndex}-${column.key.toString()}`}>
                {column.render
                  ? column.render(row[column.key], row, rowIndex)
                  : row[column.key] !== undefined
                    ? String(row[column.key])
                    : ''}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}
