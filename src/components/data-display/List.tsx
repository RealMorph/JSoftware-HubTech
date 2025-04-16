import React from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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
  markerType?: 'none' | 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
  /** Spacing between list items */
  spacing?: 'none' | 'small' | 'medium' | 'large';
  /** Whether the list should be rendered as an ordered list */
  ordered?: boolean;
  /** Makes the list take full width of the container */
  fullWidth?: boolean;
  /** Additional class name */
  className?: string;
}

const ListContainer = styled.ul<Omit<ListProps, 'children'>>`
  list-style-type: ${props => props.markerType};
  padding-left: ${props => (props.markerType === 'none' ? '0' : '1.5em')};
  margin: 0;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.base')};
  
  ${props => props.bordered && `
    border: 1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')};
    border-radius: ${getThemeValue(props.theme as ThemeConfig, 'borderRadius.base')};
    padding: ${getThemeValue(props.theme as ThemeConfig, 'spacing.2')};
  `}
`;

const OrderedListContainer = styled.ol<Omit<ListProps, 'children'>>`
  list-style-type: ${props => props.markerType};
  padding-left: ${props => (props.markerType === 'none' ? '0' : '1.5em')};
  margin: 0;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.base')};
  
  ${props => props.bordered && `
    border: 1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')};
    border-radius: ${getThemeValue(props.theme as ThemeConfig, 'borderRadius.base')};
    padding: ${getThemeValue(props.theme as ThemeConfig, 'spacing.2')};
  `}
`;

const StyledListItem = styled.li<Omit<ListItemProps, 'children'>>`
  padding: ${props => {
    const theme = props.theme as ThemeConfig;
    switch (props.spacing) {
      case 'none':
        return '0';
      case 'small':
        return `${getThemeValue(theme, 'spacing.1')} 0`;
      case 'large':
        return `${getThemeValue(theme, 'spacing.3')} 0`;
      default:
        return `${getThemeValue(theme, 'spacing.2')} 0`;
    }
  }};
  display: flex;
  align-items: ${props => (props.secondaryText ? 'flex-start' : 'center')};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  
  ${props => props.clickable && `
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: ${getThemeValue(props.theme as ThemeConfig, 'colors.background.tertiary')};
    }
  `}
  
  & + & {
    border-top: ${props => {
      const theme = props.theme as ThemeConfig;
      return props.bordered 
        ? `1px solid ${getThemeValue(theme, 'colors.border.primary')}` 
        : 'none';
    }};
  }
`;

const ListItemContent = styled.div`
  flex: 1;
`;

const IconWrapper = styled.div`
  margin-right: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.2')};
  display: flex;
  align-items: center;
`;

const SecondaryText = styled.div`
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.sm')};
  color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.secondary')};
  margin-top: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.1')};
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
  className
}) => {
  const listProps = {
    bordered,
    markerType,
    spacing,
    fullWidth,
    className
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
  className
}) => {
  return (
    <StyledListItem 
      fullWidth={fullWidth} 
      clickable={clickable || !!onClick} 
      onClick={onClick} 
      className={className}
    >
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <ListItemContent>
        {children}
        {secondaryText && <SecondaryText>{secondaryText}</SecondaryText>}
      </ListItemContent>
    </StyledListItem>
  );
};

// Attach ListItem as a static property of List
List.Item = ListItem; 