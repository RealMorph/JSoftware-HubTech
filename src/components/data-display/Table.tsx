import React from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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

const StyledTable = styled.table<Omit<TableProps<any>, 'data' | 'columns'>>`
  border-collapse: collapse;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
  font-size: ${props => {
    const theme = props.theme as ThemeConfig;
    switch (props.size) {
      case 'small':
        return getThemeValue(theme, 'typography.scale.sm');
      case 'large':
        return getThemeValue(theme, 'typography.scale.lg');
      default:
        return getThemeValue(theme, 'typography.scale.base');
    }
  }};
  border: ${props =>
    props.bordered
      ? `1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')}`
      : 'none'};

  th,
  td {
    padding: ${props => {
      const theme = props.theme as ThemeConfig;
      switch (props.size) {
        case 'small':
          return `${getThemeValue(theme, 'spacing.2')} ${getThemeValue(theme, 'spacing.3')}`;
        case 'large':
          return `${getThemeValue(theme, 'spacing.4')} ${getThemeValue(theme, 'spacing.5')}`;
        default:
          return `${getThemeValue(theme, 'spacing.3')} ${getThemeValue(theme, 'spacing.4')}`;
      }
    }};
    text-align: left;
    border-bottom: 1px solid
      ${props => getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')};
    ${props =>
      props.bordered &&
      `border: 1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')};`}
  }

  th {
    background-color: ${props =>
      getThemeValue(props.theme as ThemeConfig, 'colors.background.secondary')};
    font-weight: ${props =>
      getThemeValue(props.theme as ThemeConfig, 'typography.weights.semibold')};
    color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.primary')};
  }

  tr:nth-of-type(even) {
    background-color: ${props =>
      props.striped
        ? getThemeValue(props.theme as ThemeConfig, 'colors.background.tertiary')
        : 'transparent'};
  }

  tr {
    transition: background-color 0.2s ease;

    ${props =>
      props.hover &&
      `
      &:hover {
        background-color: ${getThemeValue(props.theme as ThemeConfig, 'colors.background.tertiary')};
        cursor: ${props.onRowClick ? 'pointer' : 'default'};
      }
    `}
  }

  caption {
    caption-side: top;
    margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.3')};
    color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.secondary')};
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
  return (
    <StyledTable
      striped={striped}
      bordered={bordered}
      fullWidth={fullWidth}
      size={size}
      hover={hover}
      onRowClick={onRowClick}
      className={className}
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
