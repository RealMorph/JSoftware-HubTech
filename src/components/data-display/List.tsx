import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define the ThemeStyles interface to structure theme-related properties
interface ThemeStyles {
  primaryFontFamily: string;
  baseFontSize: string;
  borderColor: string;
  borderRadius: string;
  spacing: {
    '1': string;
    '2': string;
    '3': string;
  };
  backgroundColor: {
    tertiary: string;
  };
  textColor: {
    secondary: string;
  };
  smallFontSize: string;
}

// Create a function to extract theme styles from the theme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
  primaryFontFamily: themeContext.getTypography('family.primary') as string,
  baseFontSize: themeContext.getTypography('scale.base') as string,
  borderColor: themeContext.getColor('border.primary') as string,
  borderRadius: themeContext.getBorderRadius('base') as string,
  spacing: {
    '1': themeContext.getSpacing('1'),
    '2': themeContext.getSpacing('2'),
    '3': themeContext.getSpacing('3'),
  },
  backgroundColor: {
    tertiary: themeContext.getColor('background.tertiary') as string,
  },
  textColor: {
    secondary: themeContext.getColor('text.secondary') as string,
  },
  smallFontSize: themeContext.getTypography('scale.sm') as string,
});

export interface ListItemProps {
  /** The content of the list item */
  children: React.ReactNode;
  /** Optional icon to display beside the list item */
  icon?: React.ReactNode;
  /** Makes the item take full width of the container */
  fullWidth?: boolean;
  /** Optional secondary text to display below the main content */
  secondaryText?: React.ReactNode;
  /** Whether the list item is clickable */
  clickable?: boolean;
  /** Callback when list item is clicked */
  onClick?: (e: React.MouseEvent<HTMLLIElement>) => void;
  /** Additional class name */
  className?: string;
  /** Spacing between list items */
  spacing?: 'none' | 'small' | 'medium' | 'large';
  /** Whether the list item has a border */
  bordered?: boolean;
}

export interface ListProps {
  /** Children of the list (usually ListItem components) */
  children: React.ReactNode;
  /** Whether the list is bordered */
  bordered?: boolean;
  /** Style of the list markers (for ordered lists) */
  markerType?:
    | 'none'
    | 'disc'
    | 'circle'
    | 'square'
    | 'decimal'
    | 'lower-alpha'
    | 'upper-alpha'
    | 'lower-roman'
    | 'upper-roman';
  /** Spacing between list items */
  spacing?: 'none' | 'small' | 'medium' | 'large';
  /** Whether the list should be rendered as an ordered list */
  ordered?: boolean;
  /** Makes the list take full width of the container */
  fullWidth?: boolean;
  /** Additional class name */
  className?: string;
}

const ListContainer = styled.ul<Omit<ListProps, 'children'> & { $themeStyles: ThemeStyles }>`
  list-style-type: ${props => props.markerType};
  padding-left: ${props => (props.markerType === 'none' ? '0' : '1.5em')};
  margin: 0;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  font-family: ${props => props.$themeStyles.primaryFontFamily};
  font-size: ${props => props.$themeStyles.baseFontSize};

  ${props =>
    props.bordered &&
    `
    border: 1px solid ${props.$themeStyles.borderColor};
    border-radius: ${props.$themeStyles.borderRadius};
    padding: ${props.$themeStyles.spacing['2']};
  `}
`;

const OrderedListContainer = styled.ol<Omit<ListProps, 'children'> & { $themeStyles: ThemeStyles }>`
  list-style-type: ${props => props.markerType};
  padding-left: ${props => (props.markerType === 'none' ? '0' : '1.5em')};
  margin: 0;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  font-family: ${props => props.$themeStyles.primaryFontFamily};
  font-size: ${props => props.$themeStyles.baseFontSize};

  ${props =>
    props.bordered &&
    `
    border: 1px solid ${props.$themeStyles.borderColor};
    border-radius: ${props.$themeStyles.borderRadius};
    padding: ${props.$themeStyles.spacing['2']};
  `}
`;

const StyledListItem = styled.li<Omit<ListItemProps, 'children'> & { $themeStyles: ThemeStyles }>`
  padding: ${props => {
    switch (props.spacing) {
      case 'none':
        return '0';
      case 'small':
        return `${props.$themeStyles.spacing['1']} 0`;
      case 'large':
        return `${props.$themeStyles.spacing['3']} 0`;
      default:
        return `${props.$themeStyles.spacing['2']} 0`;
    }
  }};
  display: flex;
  align-items: ${props => (props.secondaryText ? 'flex-start' : 'center')};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};

  ${props =>
    props.clickable &&
    `
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: ${props.$themeStyles.backgroundColor.tertiary};
    }
  `}

  & + & {
    border-top: ${props =>
      props.bordered ? `1px solid ${props.$themeStyles.borderColor}` : 'none'};
  }
`;

const ListItemContent = styled.div`
  flex: 1;
`;

const IconWrapper = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-right: ${props => props.$themeStyles.spacing['2']};
  display: flex;
  align-items: center;
`;

const SecondaryText = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.smallFontSize};
  color: ${props => props.$themeStyles.textColor.secondary};
  margin-top: ${props => props.$themeStyles.spacing['1']};
`;

/**
 * List component for displaying items in a list format
 */
export const List: React.FC<ListProps> & { Item: React.FC<ListItemProps> } = ({
  children,
  bordered = false,
  markerType = 'none',
  spacing = 'medium',
  ordered = false,
  fullWidth = false,
  className,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  const listProps = {
    bordered,
    markerType,
    spacing,
    fullWidth,
    className,
    $themeStyles: themeStyles,
  };

  return ordered ? (
    <OrderedListContainer {...listProps}>{children}</OrderedListContainer>
  ) : (
    <ListContainer {...listProps}>{children}</ListContainer>
  );
};

/**
 * ListItem component for displaying individual items within a List
 */
export const ListItem: React.FC<ListItemProps> = ({
  children,
  icon,
  fullWidth = false,
  secondaryText,
  clickable = false,
  onClick,
  className,
  spacing,
  bordered,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  return (
    <StyledListItem
      fullWidth={fullWidth}
      clickable={clickable || !!onClick}
      onClick={onClick}
      className={className}
      spacing={spacing}
      bordered={bordered}
      $themeStyles={themeStyles}
    >
      {icon && <IconWrapper $themeStyles={themeStyles}>{icon}</IconWrapper>}
      <ListItemContent>
        {children}
        {secondaryText && <SecondaryText $themeStyles={themeStyles}>{secondaryText}</SecondaryText>}
      </ListItemContent>
    </StyledListItem>
  );
};

// Attach ListItem as a static property of List
List.Item = ListItem;
