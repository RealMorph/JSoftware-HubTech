import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

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

// Theme styles interface
interface ThemeStyles {
  backgroundColor: string;
  textPrimaryColor: string;
  textDisabledColor: string;
  primaryMainColor: string;
  primaryDarkColor: string;
  borderLightColor: string;
  fontFamily: string;
  borderRadius: string;
  shadowMd: string;
  gray100: string;
  gray200: string;
}

// Function to create theme styles
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getBorderRadius, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background.paper', '#ffffff'),
    textPrimaryColor: getColor('text.primary', '#333333'),
    textDisabledColor: getColor('text.disabled', '#999999'),
    primaryMainColor: getColor('primary.main', '#1976d2'),
    primaryDarkColor: getColor('primary.dark', '#115293'),
    borderLightColor: getColor('border.light', '#e0e0e0'),
    fontFamily: getTypography('family.primary', 'system-ui') as string,
    borderRadius: getBorderRadius('md', '4px'),
    shadowMd: getShadow('md', '0 4px 6px rgba(0, 0, 0, 0.1)'),
    gray100: getColor('gray.100', '#f5f5f5'),
    gray200: getColor('gray.200', '#eeeeee'),
  };
}

// Styled components
const MenuContainer = styled.div<{
  variant: 'vertical' | 'horizontal' | 'dropdown';
  width?: string;
  $themeStyles: ThemeStyles;
}>`
  display: flex;
  flex-direction: ${props => (props.variant === 'horizontal' ? 'row' : 'column')};
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => (props.variant === 'dropdown' ? props.$themeStyles.shadowMd : 'none')};
  border: ${props =>
    props.variant === 'dropdown' ? `1px solid ${props.$themeStyles.borderLightColor}` : 'none'};
  font-family: ${props => props.$themeStyles.fontFamily};
  overflow: hidden;
  width: ${props =>
    props.width ||
    (props.variant === 'vertical' || props.variant === 'dropdown' ? '220px' : 'auto')};
`;

interface MenuListProps {
  variant: 'vertical' | 'horizontal' | 'dropdown';
  bordered?: boolean;
  dividers?: boolean;
  $themeStyles: ThemeStyles;
}

const MenuList = styled.ul<MenuListProps>`
  list-style: none;
  margin: 0;
  padding: ${props => (props.variant === 'dropdown' ? '4px 0' : '0')};
  display: flex;
  flex-direction: ${props => (props.variant === 'horizontal' ? 'row' : 'column')};
  width: 100%;
  border: ${props =>
    props.bordered ? `1px solid ${props.$themeStyles.borderLightColor}` : 'none'};
  border-radius: ${props => (props.bordered ? props.$themeStyles.borderRadius : '0')};

  & > li:not(:last-child) {
    ${props =>
      props.dividers &&
      props.variant !== 'horizontal' &&
      `
      border-bottom: 1px solid ${props.$themeStyles.borderLightColor};
    `}

    ${props =>
      props.dividers &&
      props.variant === 'horizontal' &&
      `
      border-right: 1px solid ${props.$themeStyles.borderLightColor};
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
  $themeStyles?: ThemeStyles;
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
      case 'small':
        return props.variant === 'horizontal' ? '6px 10px' : '6px 12px';
      case 'large':
        return props.variant === 'horizontal' ? '12px 20px' : '12px 16px';
      default:
        return props.variant === 'horizontal' ? '8px 16px' : '8px 12px';
    }
  }};
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  color: ${props => {
    if (props.disabled) {
      return props.$themeStyles?.textDisabledColor;
    }
    if (props.selected) {
      return props.$themeStyles?.primaryMainColor;
    }
    return props.$themeStyles?.textPrimaryColor;
  }};
  background-color: ${props => (props.selected ? props.$themeStyles?.gray100 : 'transparent')};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '13px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    ${props =>
      !props.disabled &&
      props.$themeStyles &&
      `
      background-color: ${props.$themeStyles.gray100};
      color: ${
        props.selected ? props.$themeStyles.primaryDarkColor : props.$themeStyles.textPrimaryColor
      };
    `}
  }

  &:active {
    ${props =>
      !props.disabled &&
      props.$themeStyles &&
      `
      background-color: ${props.$themeStyles.gray200};
    `}
  }
`;

const MenuItemIconWrapper = styled.span<{ isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  margin-right: 8px;
  font-size: 18px;
  opacity: ${props => (props.isDisabled ? 0.5 : 1)};
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
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  z-index: 1000;
  background-color: ${props => props.$themeStyles.backgroundColor};
  min-width: 160px;
  box-shadow: ${props => props.$themeStyles.shadowMd};
  border: 1px solid ${props => props.$themeStyles.borderLightColor};
  border-radius: ${props => props.$themeStyles.borderRadius};
  padding: 4px 0;

  /* Top/bottom positioning based on position prop */
  ${props =>
    props.position?.startsWith('bottom') &&
    `
    top: 100%;
    margin-top: 4px;
  `}

  ${props =>
    props.position?.startsWith('top') &&
    `
    bottom: 100%;
    margin-bottom: 4px;
  `}
  
  /* Left/right positioning based on position prop */
  ${props =>
    (props.position === 'bottom-start' || props.position === 'top-start') &&
    `
    left: 0;
  `}
  
  ${props =>
    (props.position === 'bottom-end' || props.position === 'top-end') &&
    `
    right: 0;
  `}
  
  /* For submenu of vertical menu items */
  ${props =>
    props.variant === 'vertical' &&
    `
    top: 0;
    left: 100%;
    margin-left: 1px;
  `}
  
  /* For submenu of horizontal menu items */
  ${props =>
    props.variant === 'horizontal' &&
    `
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
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
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
        compact: compact,
        $themeStyles: themeStyles,
      };

      if (item.href && !item.disabled) {
        return (
          <MenuItemContent as="a" href={item.href} {...commonProps}>
            {showIcons && item.icon && (
              <MenuItemIconWrapper isDisabled={item.disabled}>{item.icon}</MenuItemIconWrapper>
            )}
            <MenuItemLabel>{item.label}</MenuItemLabel>
            {hasSubmenu && (
              <SubMenuIndicator>{variant === 'vertical' ? '›' : '▾'}</SubMenuIndicator>
            )}
          </MenuItemContent>
        );
      }

      return (
        <MenuItemContent as="div" onClick={handleClick} {...commonProps}>
          {showIcons && item.icon && (
            <MenuItemIconWrapper isDisabled={item.disabled}>{item.icon}</MenuItemIconWrapper>
          )}
          <MenuItemLabel>{item.label}</MenuItemLabel>
          {hasSubmenu && <SubMenuIndicator>{variant === 'vertical' ? '›' : '▾'}</SubMenuIndicator>}
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
        $themeStyles={themeStyles}
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
            $themeStyles={themeStyles}
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
      $themeStyles={themeStyles}
    >
      <MenuList
        variant={variant}
        bordered={bordered}
        dividers={dividers}
        $themeStyles={themeStyles}
      >
        {items.map(item => renderMenuItem(item))}
      </MenuList>
    </MenuContainer>
  );
};
