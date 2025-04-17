import React, { forwardRef, useState, useEffect } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';

// Default theme values to use as fallbacks
const defaultTheme = {
  colors: {
    primary: '#3f51b5',
    primaryDark: '#303f9f',
    secondary: '#f50057',
    secondaryDark: '#c51162',
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    white: '#ffffff',
    surface: '#ffffff',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#fafafa',
    },
    border: {
      primary: '#e0e0e0',
    },
  },
  typography: {
    family: {
      primary: 'system-ui, -apple-system, sans-serif',
      secondary: 'system-ui, -apple-system, sans-serif',
      monospace: 'monospace',
    },
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      loose: '1.75',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '32': '8rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
  },
};

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
    const { theme, getColor, getBorderRadius } = useDirectTheme();

    // Helper function to access theme values with fallbacks
    const getThemeVal = (path: string): string => {
      if (!theme) return getNestedValue(defaultTheme, path);

      // Use direct theme access with fallbacks
      const parts = path.split('.');
      if (parts[0] === 'colors') {
        return getColor(parts.slice(1).join('.'), getNestedValue(defaultTheme, path));
      } else if (parts[0] === 'borderRadius') {
        return getBorderRadius(parts[1], getNestedValue(defaultTheme, path));
      }

      // Use default theme as fallback for other properties
      return getNestedValue(defaultTheme, path);
    };

    // Helper to extract nested values from an object using a path string
    function getNestedValue(obj: any, path: string): string {
      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current === undefined || current === null) return '';
        current = current[key];
      }

      return current?.toString() || '';
    }

    const styles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      borderCollapse: 'separate',
      borderSpacing: 0,
      ...(variant === 'bordered'
        ? {
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: getColor('gray.200', '#E5E7EB'),
            borderRadius: getBorderRadius('md', '0.25rem'),
          }
        : {
            borderWidth: '0',
            borderStyle: 'none',
          }),
      overflow: 'hidden',
      fontFamily: getThemeVal('typography.family.primary'),
      fontSize: getThemeVal('typography.scale.base'),
    };

    // Clone children to add context properties
    const enhancedChildren = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          _variant: variant,
          _size: size,
          _hoverable: hoverable.toString(),
          _stickyheader: stickyHeader.toString(),
        } as any);
      }
      return child;
    });

    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table ref={ref} style={styles} className={className} {...props}>
          {enhancedChildren}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

/**
 * TableHeader component - Header section of a table
 */
export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps & {
    _variant?: 'default' | 'bordered' | 'striped';
    _size?: 'small' | 'medium' | 'large';
    _stickyheader?: string;
  }
>(
  (
    {
      children,
      className,
      _variant = 'default',
      _size = 'medium',
      _stickyheader = 'false',
      ...props
    },
    ref
  ) => {
    const { getColor } = useDirectTheme();

    // Helper function to access theme values with fallbacks
    const getThemeVal = (path: string): string => {
      // Use direct theme access for colors
      if (path.startsWith('colors.')) {
        const colorPath = path.substring(7); // Remove 'colors.' prefix
        return getColor(colorPath, getNestedValue(defaultTheme, path));
      }

      // Use default theme for other properties
      return getNestedValue(defaultTheme, path);
    };

    // Helper to extract nested values from an object using a path string
    function getNestedValue(obj: any, path: string): string {
      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current === undefined || current === null) return '';
        current = current[key];
      }

      return current?.toString() || '';
    }

    const styles: React.CSSProperties = {
      backgroundColor:
        _variant === 'striped'
          ? getThemeVal('colors.gray.100')
          : getThemeVal('colors.background.default'),
      ...(_stickyheader === 'true'
        ? {
            position: 'sticky',
            top: 0,
            zIndex: 1,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }
        : {}),
    };

    return (
      <thead ref={ref} style={styles} className={className} {...props}>
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

/**
 * TableBody component - Body section of a table
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tbody ref={ref} className={className} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

/**
 * TableRow component - Row within a table
 */
export const TableRow = forwardRef<
  HTMLTableRowElement,
  TableRowProps & {
    _variant?: 'default' | 'bordered' | 'striped';
    _size?: 'small' | 'medium' | 'large';
    _hoverable?: string;
  }
>(
  (
    {
      children,
      selected,
      disabled,
      className,
      _variant = 'default',
      _size = 'medium',
      _hoverable = 'false',
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const { getColor } = useDirectTheme();

    // Helper function to access theme values with fallbacks
    const getThemeVal = (path: string): string => {
      // Use direct theme access for colors
      if (path.startsWith('colors.')) {
        const colorPath = path.substring(7); // Remove 'colors.' prefix
        return getColor(colorPath, getNestedValue(defaultTheme, path));
      }

      // Use default theme for other properties
      return getNestedValue(defaultTheme, path);
    };

    // Helper to extract nested values from an object using a path string
    function getNestedValue(obj: any, path: string): string {
      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current === undefined || current === null) return '';
        current = current[key];
      }

      return current?.toString() || '';
    }

    const getBackgroundColor = (): string => {
      if (selected) return getThemeVal('colors.primary.50');
      if (disabled) return getThemeVal('colors.gray.50');
      if (_hoverable === 'true' && isHovered) return getThemeVal('colors.gray.50');
      if (_variant === 'striped') return 'inherit'; // Striping is handled by CSS in the parent
      return 'transparent';
    };

    const getTextColor = (): string => {
      if (disabled) return getThemeVal('colors.gray.400');
      if (selected) return getThemeVal('colors.primary.700');
      return getThemeVal('colors.text.primary');
    };

    const styles: React.CSSProperties = {
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      cursor: props.onClick ? 'pointer' : 'default',
      opacity: disabled ? 0.6 : 1,
      transition: 'background-color 150ms ease, color 150ms ease',
    };

    const handleMouseOver = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (_hoverable === 'true' && !disabled) {
        setIsHovered(true);
      }
      props.onMouseOver?.(e);
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (_hoverable === 'true') {
        setIsHovered(false);
      }
      props.onMouseOut?.(e);
    };

    return (
      <tr
        ref={ref}
        className={className}
        style={styles}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        aria-selected={selected}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

/**
 * TableCell component - Cell within a table row
 */
export const TableCell = forwardRef<
  HTMLTableCellElement,
  TableCellProps & {
    _size?: 'small' | 'medium' | 'large';
  }
>(({ children, align = 'left', className, _size = 'medium', ...props }, ref) => {
  const { getSpacing } = useDirectTheme();

  // Helper function to access theme values with fallbacks
  const getThemeVal = (path: string): string => {
    // Use direct theme access for spacing
    if (path.startsWith('spacing.')) {
      const spacingKey = path.substring(8); // Remove 'spacing.' prefix
      return getSpacing(spacingKey, getNestedValue(defaultTheme, path));
    }

    // Use default theme for other properties
    return getNestedValue(defaultTheme, path);
  };

  // Helper to extract nested values from an object using a path string
  function getNestedValue(obj: any, path: string): string {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === undefined || current === null) return '';
      current = current[key];
    }

    return current?.toString() || '';
  }

  const getPadding = (): string => {
    switch (_size) {
      case 'small':
        return `${getThemeVal('spacing.2')} ${getThemeVal('spacing.3')}`;
      case 'large':
        return `${getThemeVal('spacing.4')} ${getThemeVal('spacing.6')}`;
      default: // medium
        return `${getThemeVal('spacing.3')} ${getThemeVal('spacing.4')}`;
    }
  };

  const styles: React.CSSProperties = {
    padding: getPadding(),
    textAlign: align,
    borderBottom: `1px solid ${getThemeVal('colors.gray.200')}`,
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
  };

  return (
    <td ref={ref} style={styles} className={className} {...props}>
      {children}
    </td>
  );
});

TableCell.displayName = 'TableCell';

/**
 * TableHeaderCell component - Header cell within a table row
 */
export const TableHeaderCell = forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps & {
    _size?: 'small' | 'medium' | 'large';
  }
>(
  (
    {
      children,
      align = 'left',
      sortable = false,
      sortDirection = null,
      onSort,
      className,
      _size = 'medium',
      ...props
    },
    ref
  ) => {
    const { getColor, getSpacing } = useDirectTheme();

    // Helper function to access theme values with fallbacks
    const getThemeVal = (path: string): string => {
      // Use direct theme access
      if (path.startsWith('colors.')) {
        const colorPath = path.substring(7); // Remove 'colors.' prefix
        return getColor(colorPath, getNestedValue(defaultTheme, path));
      } else if (path.startsWith('spacing.')) {
        const spacingKey = path.substring(8); // Remove 'spacing.' prefix
        return getSpacing(spacingKey, getNestedValue(defaultTheme, path));
      }

      // Use default theme for other properties
      return getNestedValue(defaultTheme, path);
    };

    // Helper to extract nested values from an object using a path string
    function getNestedValue(obj: any, path: string): string {
      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current === undefined || current === null) return '';
        current = current[key];
      }

      return current?.toString() || '';
    }

    const getPadding = (): string => {
      switch (_size) {
        case 'small':
          return `${getThemeVal('spacing.2')} ${getThemeVal('spacing.3')}`;
        case 'large':
          return `${getThemeVal('spacing.4')} ${getThemeVal('spacing.6')}`;
        default: // medium
          return `${getThemeVal('spacing.3')} ${getThemeVal('spacing.4')}`;
      }
    };

    const getSortIcon = () => {
      if (!sortable) return null;

      if (sortDirection === 'asc') {
        return <span style={{ marginLeft: '4px' }}>▲</span>;
      } else if (sortDirection === 'desc') {
        return <span style={{ marginLeft: '4px' }}>▼</span>;
      } else {
        return <span style={{ marginLeft: '4px', opacity: 0.3 }}>↕</span>;
      }
    };

    const styles: React.CSSProperties = {
      padding: getPadding(),
      textAlign: align,
      borderBottom: `2px solid ${getThemeVal('colors.gray.300')}`,
      fontWeight: 'bold',
      cursor: sortable ? 'pointer' : 'default',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      color: getThemeVal('colors.gray.700'),
      position: 'relative',
    };

    const handleClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
      if (sortable && onSort) {
        onSort();
      }
      props.onClick?.(e);
    };

    return (
      <th ref={ref} style={styles} className={className} onClick={handleClick} {...props}>
        {children}
        {getSortIcon()}
      </th>
    );
  }
);

TableHeaderCell.displayName = 'TableHeaderCell';
