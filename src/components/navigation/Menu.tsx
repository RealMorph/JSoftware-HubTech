import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { useTheme } from '../../core/theme/ThemeProvider';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Types
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Text label to display */
  label: string;
  /** Action to perform when clicked */
  onClick?: () => void;
  /** URL to navigate to (if provided, renders as an anchor) */
  href?: string;
  /** Icon to display before the label */
  icon?: React.ReactNode;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is currently selected */
  selected?: boolean;
  /** Submenu items (if provided, renders as a dropdown) */
  subItems?: MenuItem[];
  /** Additional props to pass to the menu item */
  [key: string]: any;
}

export interface MenuProps {
  /** Array of menu items to display */
  items: MenuItem[];
  /** Variant of the menu */
  variant?: 'vertical' | 'horizontal' | 'dropdown';
  /** Whether to display icons (if provided in items) */
  showIcons?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show borders between items */
  bordered?: boolean;
  /** Whether to show a divider between items */
  dividers?: boolean;
  /** Whether the menu has a compact layout */
  compact?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Function to render custom menu item content */
  renderItem?: (item: MenuItem) => React.ReactNode;
  /** Whether menu is open (for dropdown variant) */
  isOpen?: boolean;
  /** Callback when menu opens/closes (for dropdown variant) */
  onOpenChange?: (isOpen: boolean) => void;
  /** Position of dropdown menu relative to trigger */
  dropdownPosition?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Custom width for the menu */
  width?: string;
  /** Whether the menu should automatically close when an item is clicked */
  closeOnClick?: boolean;
}

// Styled components
const MenuContainer = styled.div<{
  variant: 'vertical' | 'horizontal' | 'dropdown';
  width?: string;
}>`
  display: flex;
  flex-direction: ${props => props.variant === 'horizontal' ? 'row' : 'column'};
  background-color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.background.paper')};
  border-radius: ${props => getThemeValue(props.theme as ThemeConfig, 'borderRadius.md')};
  box-shadow: ${props => props.variant === 'dropdown' ? getThemeValue(props.theme as ThemeConfig, 'shadows.md') : 'none'};
  border: ${props => props.variant === 'dropdown' ? `1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.light')}` : 'none'};
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
  overflow: hidden;
  width: ${props => props.width || (props.variant === 'vertical' || props.variant === 'dropdown' ? '220px' : 'auto')};
`;

interface MenuListProps {
  variant: 'vertical' | 'horizontal' | 'dropdown';
  bordered?: boolean;
  dividers?: boolean;
}

const MenuList = styled.ul<MenuListProps>`
  list-style: none;
  margin: 0;
  padding: ${props => props.variant === 'dropdown' ? '4px 0' : '0'};
  display: flex;
  flex-direction: ${props => props.variant === 'horizontal' ? 'row' : 'column'};
  width: 100%;
  border: ${props => props.bordered ? `1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.light')}` : 'none'};
  border-radius: ${props => props.bordered ? getThemeValue(props.theme as ThemeConfig, 'borderRadius.md') : '0'};
  
  & > li:not(:last-child) {
    ${props => props.dividers && props.variant !== 'horizontal' && `
      border-bottom: 1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.light')};
    `}
    
    ${props => props.dividers && props.variant === 'horizontal' && `
      border-right: 1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.light')};
    `}
  }
`;

interface MenuItemProps {
  selected?: boolean;
  disabled?: boolean;
  hasIcon?: boolean;
  hasSubmenu?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant: 'vertical' | 'horizontal' | 'dropdown';
  compact?: boolean;
  href?: string;
}

const StyledMenuItem = styled.li<MenuItemProps>`
  position: relative;
  
  &:hover > ul {
    display: block;
  }
`;

const MenuItemContent = styled.div<MenuItemProps>`
  display: flex;
  align-items: center;
  padding: ${props => {
    if (props.compact) {
      return props.variant === 'horizontal' ? '6px 10px' : '6px 12px';
    }
    switch (props.size) {
      case 'small': return props.variant === 'horizontal' ? '6px 10px' : '6px 12px';
      case 'large': return props.variant === 'horizontal' ? '12px 20px' : '12px 16px';
      default: return props.variant === 'horizontal' ? '8px 16px' : '8px 12px';
    }
  }};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  color: ${props => {
    if (props.disabled) {
      return getThemeValue(props.theme as ThemeConfig, 'colors.text.disabled');
    }
    if (props.selected) {
      return getThemeValue(props.theme as ThemeConfig, 'colors.primary.main');
    }
    return getThemeValue(props.theme as ThemeConfig, 'colors.text.primary');
  }};
  background-color: ${props => props.selected ? getThemeValue(props.theme as ThemeConfig, 'colors.gray.100') : 'transparent'};
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '13px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    ${props => !props.disabled && `
      background-color: ${getThemeValue(props.theme as ThemeConfig, 'colors.gray.100')};
      color: ${props.selected 
        ? getThemeValue(props.theme as ThemeConfig, 'colors.primary.dark')
        : getThemeValue(props.theme as ThemeConfig, 'colors.text.primary')};
    `}
  }
  
  &:active {
    ${props => !props.disabled && `
      background-color: ${getThemeValue(props.theme as ThemeConfig, 'colors.gray.200')};
    `}
  }
`;

const MenuItemIconWrapper = styled.span<{ isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  margin-right: 8px;
  font-size: 18px;
  opacity: ${props => props.isDisabled ? 0.5 : 1};
`;

const MenuItemLabel = styled.span`
  flex-grow: 1;
`;

const SubMenuIndicator = styled.span`
  margin-left: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
`;

const SubMenuList = styled(MenuList)<MenuListProps & { isOpen?: boolean; position?: string }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  z-index: 1000;
  background-color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.background.paper')};
  min-width: 160px;
  box-shadow: ${props => getThemeValue(props.theme as ThemeConfig, 'shadows.md')};
  border: 1px solid ${props => getThemeValue(props.theme as ThemeConfig, 'colors.border.light')};
  border-radius: ${props => getThemeValue(props.theme as ThemeConfig, 'borderRadius.md')};
  padding: 4px 0;
  
  /* Top/bottom positioning based on position prop */
  ${props => props.position?.startsWith('bottom') && `
    top: 100%;
    margin-top: 4px;
  `}
  
  ${props => props.position?.startsWith('top') && `
    bottom: 100%;
    margin-bottom: 4px;
  `}
  
  /* Left/right positioning based on position prop */
  ${props => (props.position === 'bottom-start' || props.position === 'top-start') && `
    left: 0;
  `}
  
  ${props => (props.position === 'bottom-end' || props.position === 'top-end') && `
    right: 0;
  `}
  
  /* For submenu of vertical menu items */
  ${props => props.variant === 'vertical' && `
    top: 0;
    left: 100%;
    margin-left: 1px;
  `}
  
  /* For submenu of horizontal menu items */
  ${props => props.variant === 'horizontal' && `
    top: 100%;
    left: 0;
    margin-top: 0;
  `}
`;

// Main Menu component
export const Menu: React.FC<MenuProps> = ({
  items,
  variant = 'vertical',
  showIcons = true,
  size = 'medium',
  bordered = false,
  dividers = false,
  compact = false,
  className,
  renderItem,
  isOpen,
  onOpenChange,
  dropdownPosition = 'bottom-start',
  width,
  closeOnClick = true,
}) => {
  const { currentTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown menu when clicking outside (for dropdown variant)
  useEffect(() => {
    if (variant !== 'dropdown' || isOpen === undefined) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onOpenChange?.(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange, variant]);
  
  // Recursive function to render menu items
  const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
    const hasSubmenu = !!(item.subItems && item.subItems.length > 0);
    
    const handleClick = () => {
      if (item.disabled) return;
      
      if (hasSubmenu) {
        setIsSubMenuOpen(!isSubMenuOpen);
      } else {
        item.onClick?.();
        if (closeOnClick && variant === 'dropdown') {
          onOpenChange?.(false);
        }
      }
    };
    
    // If a custom renderer is provided, use it
    if (renderItem) {
      return renderItem(item);
    }
    
    // Determine what type of element to render
    const renderMenuItemContent = () => {
      const commonProps = {
        selected: item.selected,
        disabled: item.disabled,
        hasIcon: showIcons && !!item.icon,
        hasSubmenu: hasSubmenu,
        size: size,
        variant: variant,
        compact: compact
      };

      if (item.href && !item.disabled) {
        return (
          <MenuItemContent as="a" href={item.href} {...commonProps}>
            {showIcons && item.icon && (
              <MenuItemIconWrapper isDisabled={item.disabled}>
                {item.icon}
              </MenuItemIconWrapper>
            )}
            <MenuItemLabel>{item.label}</MenuItemLabel>
            {hasSubmenu && (
              <SubMenuIndicator>
                {variant === 'vertical' ? '›' : '▾'}
              </SubMenuIndicator>
            )}
          </MenuItemContent>
        );
      }
      
      return (
        <MenuItemContent 
          as="div" 
          onClick={handleClick} 
          {...commonProps}
        >
          {showIcons && item.icon && (
            <MenuItemIconWrapper isDisabled={item.disabled}>
              {item.icon}
            </MenuItemIconWrapper>
          )}
          <MenuItemLabel>{item.label}</MenuItemLabel>
          {hasSubmenu && (
            <SubMenuIndicator>
              {variant === 'vertical' ? '›' : '▾'}
            </SubMenuIndicator>
          )}
        </MenuItemContent>
      );
    };
    
    return (
      <StyledMenuItem 
        key={item.id}
        selected={item.selected}
        disabled={item.disabled}
        hasIcon={showIcons && !!item.icon}
        hasSubmenu={hasSubmenu}
        size={size}
        variant={variant}
        compact={compact}
        onMouseEnter={() => variant !== 'dropdown' && hasSubmenu && setIsSubMenuOpen(true)}
        onMouseLeave={() => variant !== 'dropdown' && hasSubmenu && setIsSubMenuOpen(false)}
      >
        {renderMenuItemContent()}
        
        {hasSubmenu && (
          <SubMenuList
            variant={variant}
            bordered={false}
            dividers={dividers}
            isOpen={isSubMenuOpen}
            position={isSubmenu ? undefined : dropdownPosition}
          >
            {item.subItems!.map(subItem => renderMenuItem(subItem, true))}
          </SubMenuList>
        )}
      </StyledMenuItem>
    );
  };
  
  return (
    <MenuContainer 
      variant={variant} 
      className={className} 
      ref={menuRef}
      width={width}
    >
      <MenuList 
        variant={variant} 
        bordered={bordered} 
        dividers={dividers}
      >
        {items.map(item => renderMenuItem(item))}
      </MenuList>
    </MenuContainer>
  );
}; 