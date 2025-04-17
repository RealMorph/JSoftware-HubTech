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

// Theme styles interfaces
interface ListThemeStyles {
  borderStyle: string;
  borderRadius?: string;
}

interface ListItemThemeStyles {
  paddingY: string;
  paddingX: string;
  borderBottom: string;
  backgroundColor: string;
  textColor: string;
  hoverBackgroundColor: string;
  selectedHoverBackgroundColor: string;
  spacing: string;
}

// Styled components
const StyledList = styled.ul<{ $themeStyles: ListThemeStyles }>`
  list-style-type: none;
  margin: 0;
  padding: 0;
  border: ${props => props.$themeStyles.borderStyle};
  border-radius: ${props => props.$themeStyles.borderRadius};
  overflow: hidden;
`;

const StyledListItem = styled.li<{
  $themeStyles: ListItemThemeStyles;
  $interactive?: boolean;
  $selected?: boolean;
  $disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: ${props => props.$themeStyles.spacing};
  padding: ${props => `${props.$themeStyles.paddingY} ${props.$themeStyles.paddingX}`};
  border-bottom: ${props => props.$themeStyles.borderBottom};
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.textColor};
  cursor: ${props =>
    props.$disabled ? 'not-allowed' : props.$interactive ? 'pointer' : 'default'};
  opacity: ${props => (props.$disabled ? 0.7 : 1)};
  transition: background-color 0.2s ease;

  &:hover {
    ${props =>
      props.$interactive &&
      !props.$disabled &&
      `
      background-color: ${
        props.$selected
          ? props.$themeStyles.selectedHoverBackgroundColor
          : props.$themeStyles.hoverBackgroundColor
      };
    `}
  }
`;

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

// Create theme styles functions
const createListThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  variant: ListProps['variant']
): ListThemeStyles => {
  const { getColor, getBorderRadius } = themeContext;

  return {
    borderStyle:
      variant === 'bordered' ? `1px solid ${getColor('gray.200', '#e5e7eb')}` : 'none',
    borderRadius: variant === 'bordered' ? getBorderRadius('md', '0.375rem') : undefined,
  };
};

const createListItemThemeStyles = (
  themeContext: ReturnType<typeof useDirectTheme>,
  size: 'small' | 'medium' | 'large',
  variant: 'default' | 'bordered' | 'divided',
  selected: boolean,
  disabled: boolean
): ListItemThemeStyles => {
  const { getColor, getSpacing } = themeContext;

  const getPaddingY = (): string => {
    if (size === 'small') return getSpacing('1', '0.25rem');
    if (size === 'large') return getSpacing('3', '0.75rem');
    return getSpacing('2', '0.5rem'); // medium (default)
  };

  const getPaddingX = (): string => {
    if (size === 'small') return getSpacing('2', '0.5rem');
    if (size === 'large') return getSpacing('4', '1rem');
    return getSpacing('3', '0.75rem'); // medium (default)
  };

  return {
    paddingY: getPaddingY(),
    paddingX: getPaddingX(),
    borderBottom:
      variant === 'divided' ? `1px solid ${getColor('gray.200', '#e5e7eb')}` : 'none',
    backgroundColor: disabled
      ? getColor('gray.50', '#f9fafb')
      : selected
      ? getColor('primary.50', '#eff6ff')
      : 'transparent',
    textColor: disabled
      ? getColor('gray.400', '#9ca3af')
      : selected
      ? getColor('primary.700', '#1d4ed8')
      : getColor('gray.900', '#111827'),
    hoverBackgroundColor: getColor('gray.50', '#f9fafb'),
    selectedHoverBackgroundColor: getColor('primary.100', '#dbeafe'),
    spacing: getSpacing('2', '0.5rem'),
  };
};

/**
 * List component - Displays a collection of items in a vertical list
 */
export const List = forwardRef<HTMLUListElement, ListProps>(
  (
    { variant = 'default', size = 'medium', interactive = false, children, className, ...props },
    ref
  ) => {
    const themeContext = useDirectTheme();
    const themeStyles = createListThemeStyles(themeContext, variant);

    // Clone children to add context properties
    const enhancedChildren = React.Children.map(children, child => {
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
      <StyledList ref={ref} className={className} $themeStyles={themeStyles} {...props}>
        {enhancedChildren}
      </StyledList>
    );
  }
);

List.displayName = 'List';

/**
 * ListItem component - Individual item within a List component
 */
export const ListItem = forwardRef<
  HTMLLIElement,
  ListItemProps & {
    _size?: 'small' | 'medium' | 'large';
    _variant?: 'default' | 'bordered' | 'divided';
    _interactive?: boolean;
  }
>(
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
    const themeContext = useDirectTheme();
    const themeStyles = createListItemThemeStyles(
      themeContext,
      _size,
      _variant,
      selected,
      disabled
    );

    return (
      <StyledListItem
        ref={ref}
        className={className}
        $themeStyles={themeStyles}
        $interactive={_interactive}
        $selected={selected}
        $disabled={disabled}
        {...props}
      >
        {startContent && <StyledListStart>{startContent}</StyledListStart>}
        <StyledListContent>{children}</StyledListContent>
        {endContent && <StyledListEnd>{endContent}</StyledListEnd>}
      </StyledListItem>
    );
  }
);

ListItem.displayName = 'ListItem';

export default List;
