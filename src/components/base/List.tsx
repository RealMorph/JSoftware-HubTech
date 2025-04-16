import React, { forwardRef } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Variant of the list */
  variant?: 'default' | 'bordered' | 'divided';
  /** Size of the list items */
  size?: 'small' | 'medium' | 'large';
  /** Whether list items are interactable */
  interactive?: boolean;
  /** List children (typically ListItem components) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Whether the item is selected */
  selected?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Lead-in element (icon, avatar, etc.) */
  startContent?: React.ReactNode;
  /** Trailing element (action buttons, etc.) */
  endContent?: React.ReactNode;
  /** Main content of the list item */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

// Styled components for List parts
const StyledListStart = styled.div`
  display: flex;
  align-items: center;
`;

const StyledListEnd = styled.div`
  display: flex;
  align-items: center;
`;

const StyledListContent = styled.div`
  flex: 1;
`;

/**
 * List component - Displays a collection of items in a vertical list
 */
export const List = forwardRef<HTMLUListElement, ListProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      interactive = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Use DirectThemeProvider hook
    const { getColor, getSpacing, getBorderRadius } = useDirectTheme();

    const getPaddingY = (): string => {
      if (size === 'small') return '0';
      if (size === 'large') return getSpacing('3', '0.75rem');
      return getSpacing('2', '0.5rem'); // medium (default)
    };

    const getPaddingX = (): string => {
      if (size === 'small') return '0';
      if (size === 'large') return getSpacing('4', '1rem');
      return getSpacing('3', '0.75rem'); // medium (default)
    };

    const getBorderStyle = (): string => {
      if (variant === 'bordered') return `1px solid ${getColor('gray.200', '#e5e7eb')}`;
      return 'none';
    };

    const styles: React.CSSProperties = {
      listStyleType: 'none',
      margin: 0,
      padding: 0,
      border: getBorderStyle(),
      borderRadius: variant === 'bordered' ? getBorderRadius('md', '0.375rem') : undefined,
      overflow: 'hidden',
    };

    // Clone children to add context properties
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          _size: size,
          _variant: variant,
          _interactive: interactive,
        } as any);
      }
      return child;
    });

    return (
      <ul ref={ref} style={styles} className={className} {...props}>
        {enhancedChildren}
      </ul>
    );
  }
);

List.displayName = 'List';

/**
 * ListItem component - Individual item within a List component
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps & { 
  _size?: 'small' | 'medium' | 'large';
  _variant?: 'default' | 'bordered' | 'divided';
  _interactive?: boolean;
}>(
  (
    {
      selected = false,
      disabled = false,
      startContent,
      endContent,
      children,
      className,
      _size = 'medium',
      _variant = 'default',
      _interactive = false,
      ...props
    },
    ref
  ) => {
    // Use DirectThemeProvider hook
    const { getColor, getSpacing } = useDirectTheme();

    const getPaddingY = (): string => {
      if (_size === 'small') return getSpacing('1', '0.25rem');
      if (_size === 'large') return getSpacing('3', '0.75rem');
      return getSpacing('2', '0.5rem'); // medium (default)
    };

    const getPaddingX = (): string => {
      if (_size === 'small') return getSpacing('2', '0.5rem');
      if (_size === 'large') return getSpacing('4', '1rem');
      return getSpacing('3', '0.75rem'); // medium (default)
    };

    const getBorderBottom = (): string => {
      if (_variant === 'divided') return `1px solid ${getColor('gray.200', '#e5e7eb')}`;
      return 'none';
    };

    const getBackgroundColor = (): string => {
      if (disabled) return getColor('gray.50', '#f9fafb');
      if (selected) return getColor('primary.50', '#eff6ff');
      return 'transparent';
    };

    const getTextColor = (): string => {
      if (disabled) return getColor('gray.400', '#9ca3af');
      if (selected) return getColor('primary.700', '#1d4ed8');
      return getColor('gray.900', '#111827');
    };

    const styles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: getSpacing('2', '0.5rem'),
      padding: `${getPaddingY()} ${getPaddingX()}`,
      borderBottom: getBorderBottom(),
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      cursor: disabled ? 'not-allowed' : _interactive ? 'pointer' : 'default',
      opacity: disabled ? 0.7 : 1,
      transition: 'background-color 0.2s ease',
    };

    // Add hover styles for interactive items
    const handleMouseOver = (e: React.MouseEvent<HTMLLIElement>) => {
      if (_interactive && !disabled && e.currentTarget) {
        e.currentTarget.style.backgroundColor = selected 
          ? getColor('primary.100', '#dbeafe')
          : getColor('gray.50', '#f9fafb');
      }
      props.onMouseOver?.(e);
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLLIElement>) => {
      if (_interactive && !disabled && e.currentTarget) {
        e.currentTarget.style.backgroundColor = getBackgroundColor();
      }
      props.onMouseOut?.(e);
    };

    return (
      <li
        ref={ref}
        style={styles}
        className={className}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        aria-disabled={disabled}
        aria-selected={selected}
        {...props}
      >
        {startContent && <StyledListStart>{startContent}</StyledListStart>}
        <StyledListContent>{children}</StyledListContent>
        {endContent && <StyledListEnd>{endContent}</StyledListEnd>}
      </li>
    );
  }
);

ListItem.displayName = 'ListItem'; 