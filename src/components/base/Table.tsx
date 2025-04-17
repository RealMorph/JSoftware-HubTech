import React, { forwardRef, useState } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Variant of the table */
  variant?: 'default' | 'bordered' | 'striped';
  /** Size of the table */
  size?: 'small' | 'medium' | 'large';
  /** Whether the table should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether the table has hoverable rows */
  hoverable?: boolean;
  /** Whether the table has sticky header */
  stickyHeader?: boolean;
  /** Children elements */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  className?: string;
}

export interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  children: React.ReactNode;
  className?: string;
}

// Theme styles interfaces
interface TableThemeStyles {
  borderRadius: string;
  border: string;
  backgroundColor: string;
  width: string;
  borderCollapse: string;
  fontSize: string;
  fontFamily: string;
}

interface TableHeaderThemeStyles {
  backgroundColor: string;
  borderBottom: string;
  position: string;
  top: string;
  zIndex: number;
}

interface TableRowThemeStyles {
  backgroundColor: string;
  color: string;
  borderBottom: string;
  cursor: string;
  opacity: number;
  hoverBackgroundColor?: string;
}

interface TableCellThemeStyles {
  padding: string;
  borderRight?: string;
  textAlign: string;
  fontWeight?: string;
  color: string;
}

// Styled components
const StyledTable = styled.table<{
  $themeStyles: TableThemeStyles;
  $variant: TableProps['variant'];
}>`
  border-radius: ${props => props.$themeStyles.borderRadius};
  border: ${props => props.$themeStyles.border};
  background-color: ${props => props.$themeStyles.backgroundColor};
  width: ${props => props.$themeStyles.width};
  border-collapse: ${props => props.$themeStyles.borderCollapse};
  font-size: ${props => props.$themeStyles.fontSize};
  font-family: ${props => props.$themeStyles.fontFamily};
`;

const StyledTableHeader = styled.thead<{
  $themeStyles: TableHeaderThemeStyles;
  $stickyHeader?: boolean;
}>`
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-bottom: ${props => props.$themeStyles.borderBottom};
  position: ${props => props.$stickyHeader ? 'sticky' : 'static'};
  top: ${props => props.$stickyHeader ? '0' : 'auto'};
  z-index: ${props => props.$stickyHeader ? 1 : 'auto'};
`;

const StyledTableBody = styled.tbody``;

const StyledTableRow = styled.tr<{
  $themeStyles: TableRowThemeStyles;
  $hoverable?: boolean;
  $selected?: boolean;
  $disabled?: boolean;
  $isEven?: boolean;
  $variant?: TableProps['variant'];
}>`
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.color};
  border-bottom: ${props => props.$themeStyles.borderBottom};
  cursor: ${props => props.$themeStyles.cursor};
  opacity: ${props => props.$themeStyles.opacity};

  ${props =>
    props.$hoverable &&
    !props.$disabled &&
    `
    &:hover {
      background-color: ${props.$themeStyles.hoverBackgroundColor};
    }
  `}
`;

const StyledTableCell = styled.td<{
  $themeStyles: TableCellThemeStyles;
  $variant?: TableProps['variant'];
}>`
  padding: ${props => props.$themeStyles.padding};
  border-right: ${props => props.$themeStyles.borderRight};
  text-align: ${props => props.$themeStyles.textAlign};
  color: ${props => props.$themeStyles.color};
`;

const StyledTableHeaderCell = styled.th<{
  $themeStyles: TableCellThemeStyles;
  $sortable?: boolean;
  $variant?: TableProps['variant'];
}>`
  padding: ${props => props.$themeStyles.padding};
  border-right: ${props => props.$themeStyles.borderRight};
  text-align: ${props => props.$themeStyles.textAlign};
  font-weight: ${props => props.$themeStyles.fontWeight};
  color: ${props => props.$themeStyles.color};
  cursor: ${props => (props.$sortable ? 'pointer' : 'default')};
`;

// Create theme styles functions
const createTableThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  variant: TableProps['variant'],
  fullWidth: boolean
): TableThemeStyles => {
  const { getColor, getTypography, getBorderRadius } = themeContext;

  return {
    borderRadius: getBorderRadius('md', '0.375rem'),
    border: variant === 'bordered' ? `1px solid ${getColor('border.primary', '#e0e0e0')}` : 'none',
    backgroundColor: getColor('background.default', '#ffffff'),
    width: fullWidth ? '100%' : 'auto',
    borderCollapse: 'separate',
    fontSize: getTypography('fontSize.sm', '0.875rem') as string,
    fontFamily: getTypography('fontFamily.base', 'system-ui, sans-serif') as string,
  };
};

const createTableHeaderThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>
): TableHeaderThemeStyles => {
  const { getColor } = themeContext;

  return {
    backgroundColor: getColor('background.secondary', '#f5f5f5'),
    borderBottom: `1px solid ${getColor('border.primary', '#e0e0e0')}`,
    position: 'relative',
    top: '0',
    zIndex: 1,
  };
};

const createTableRowThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  {
    selected,
    disabled,
    isEven,
    variant,
  }: {
    selected?: boolean;
    disabled?: boolean;
    isEven?: boolean;
    variant?: TableProps['variant'];
  }
): TableRowThemeStyles => {
  const { getColor } = themeContext;

  let backgroundColor = getColor('background.default', '#ffffff');
  if (selected) {
    backgroundColor = getColor('primary.50', '#e3f2fd');
  } else if (variant === 'striped' && isEven) {
    backgroundColor = getColor('background.secondary', '#f5f5f5');
  }

  return {
    backgroundColor,
    color: disabled
      ? getColor('text.disabled', '#9e9e9e')
      : getColor('text.primary', '#212121'),
    borderBottom: `1px solid ${getColor('border.primary', '#e0e0e0')}`,
    cursor: disabled ? 'not-allowed' : 'default',
    opacity: disabled ? 0.5 : 1,
    hoverBackgroundColor: getColor('background.tertiary', '#fafafa'),
  };
};

const createTableCellThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  {
    variant,
    size,
    isHeader,
    align,
  }: {
    variant?: TableProps['variant'];
    size?: TableProps['size'];
    isHeader?: boolean;
    align?: TableCellProps['align'];
  }
): TableCellThemeStyles => {
  const { getColor, getSpacing, getTypography } = themeContext;

  const getPadding = () => {
    switch (size) {
      case 'small':
        return getSpacing('2', '0.5rem');
      case 'large':
        return getSpacing('4', '1rem');
      default:
        return getSpacing('3', '0.75rem');
    }
  };

  return {
    padding: getPadding() as string,
    borderRight:
      variant === 'bordered' ? `1px solid ${getColor('border.primary', '#e0e0e0')}` : undefined,
    textAlign: align || 'left',
    fontWeight: isHeader ? getTypography('fontWeight.semibold', '600') as string : undefined,
    color: isHeader
      ? getColor('text.primary', '#212121')
      : getColor('text.secondary', '#616161'),
  };
};

/**
 * Table component - Displays tabular data
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      fullWidth = true,
      hoverable = false,
      stickyHeader = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const themeContext = useDirectTheme();
    const themeStyles = createTableThemeStyles(themeContext, variant, fullWidth);

    return (
      <StyledTable
        ref={ref}
        className={className}
        $themeStyles={themeStyles}
        $variant={variant}
        {...props}
      >
        {children}
      </StyledTable>
    );
  }
);

/**
 * TableHeader component
 */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps & { stickyHeader?: boolean }>(
  ({ children, className, stickyHeader, ...props }, ref) => {
    const themeContext = useDirectTheme();
    const themeStyles = createTableHeaderThemeStyles(themeContext);

    return (
      <StyledTableHeader
        ref={ref}
        className={className}
        $themeStyles={themeStyles}
        $stickyHeader={stickyHeader}
        {...props}
      >
        {children}
      </StyledTableHeader>
    );
  }
);

/**
 * TableBody component
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className, ...props }, ref) => (
    <StyledTableBody ref={ref} className={className} {...props}>
      {children}
    </StyledTableBody>
  )
);

/**
 * TableRow component
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps & { variant?: TableProps['variant']; hoverable?: boolean; isEven?: boolean }>(
  (
    {
      selected,
      disabled,
      children,
      className,
      variant,
      hoverable,
      isEven,
      ...props
    },
    ref
  ) => {
    const themeContext = useDirectTheme();
    const themeStyles = createTableRowThemeStyles(themeContext, {
      selected,
      disabled,
      isEven,
      variant,
    });

    return (
      <StyledTableRow
        ref={ref}
        className={className}
        $themeStyles={themeStyles}
        $hoverable={hoverable}
        $selected={selected}
        $disabled={disabled}
        $isEven={isEven}
        $variant={variant}
        {...props}
      >
        {children}
      </StyledTableRow>
    );
  }
);

/**
 * TableCell component
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps & { variant?: TableProps['variant']; size?: TableProps['size'] }>(
  ({ align, children, className, variant, size, ...props }, ref) => {
    const themeContext = useDirectTheme();
    const themeStyles = createTableCellThemeStyles(themeContext, {
      variant,
      size,
      align,
    });

    return (
      <StyledTableCell
        ref={ref}
        className={className}
        $themeStyles={themeStyles}
        $variant={variant}
        {...props}
      >
        {children}
      </StyledTableCell>
    );
  }
);

/**
 * TableHeaderCell component
 */
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps & { variant?: TableProps['variant']; size?: TableProps['size'] }>(
  (
    {
      align,
      sortable,
      sortDirection,
      onSort,
      children,
      className,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    const themeContext = useDirectTheme();
    const themeStyles = createTableCellThemeStyles(themeContext, {
      variant,
      size,
      isHeader: true,
      align,
    });

    const renderSortIcon = () => {
      if (!sortable) return null;

      return (
        <span style={{ marginLeft: '0.5rem', display: 'inline-flex', alignItems: 'center' }}>
          {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
        </span>
      );
    };

    return (
      <StyledTableHeaderCell
        ref={ref}
        className={className}
        onClick={sortable ? onSort : undefined}
        $themeStyles={themeStyles}
        $sortable={sortable}
        $variant={variant}
        {...props}
      >
        {children}
        {renderSortIcon()}
      </StyledTableHeaderCell>
    );
  }
);

// Add display names
Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableCell.displayName = 'TableCell';
TableHeaderCell.displayName = 'TableHeaderCell';

export default Table;
