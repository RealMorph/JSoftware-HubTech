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
  colors: {
    background: string;
    textPrimary: string;
    textDisabled: string;
    primary: string;
    primaryDark: string;
    border: string;
    hover: string;
    active: string;
  };
  typography: {
    fontFamily: string;
    sizes: {
      small: string;
      medium: string;
      large: string;
    };
  };
  spacing: {
    small: {
      x: string;
      y: string;
    };
    medium: {
      x: string;
      y: string;
    };
    large: {
      x: string;
      y: string;
    };
  };
  borderRadius: string;
  shadows: {
    dropdown: string;
  };
}

// Function to create theme styles
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getBorderRadius, getShadow, getSpacing } = themeContext;

  return {
    colors: {
      background: getColor('background.paper', '#ffffff'),
      textPrimary: getColor('text.primary', '#333333'),
      textDisabled: getColor('text.disabled', '#999999'),
      primary: getColor('primary.main', '#1976d2'),
      primaryDark: getColor('primary.dark', '#115293'),
      border: getColor('border.light', '#e0e0e0'),
      hover: getColor('action.hover', '#f5f5f5'),
      active: getColor('action.active', '#eeeeee'),
    },
    typography: {
      fontFamily: getTypography('family.primary', 'system-ui') as string,
      sizes: {
        small: getTypography('size.small', '13px') as string,
        medium: getTypography('size.medium', '14px') as string,
        large: getTypography('size.large', '16px') as string,
      },
    },
    spacing: {
      small: {
        x: getSpacing('2', '10px'),
        y: getSpacing('1.5', '6px'),
      },
      medium: {
        x: getSpacing('4', '16px'),
        y: getSpacing('2', '8px'),
      },
      large: {
        x: getSpacing('5', '20px'),
        y: getSpacing('3', '12px'),
      },
    },
    borderRadius: getBorderRadius('md', '4px'),
    shadows: {
      dropdown: getShadow('md', '0 4px 6px rgba(0, 0, 0, 0.1)'),
    },
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
  background-color: ${props => props.$themeStyles.colors.background};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => (props.variant === 'dropdown' ? props.$themeStyles.shadows.dropdown : 'none')};
  border: ${props =>
    props.variant === 'dropdown' ? `1px solid ${props.$themeStyles.colors.border}` : 'none'};
  font-family: ${props => props.$themeStyles.typography.fontFamily};
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
  padding: ${props => (props.variant === 'dropdown' ? props.$themeStyles.spacing.small.y : '0')};
  display: flex;
  flex-direction: ${props => (props.variant === 'horizontal' ? 'row' : 'column')};
  width: 100%;
  border: ${props =>
    props.bordered ? `1px solid ${props.$themeStyles.colors.border}` : 'none'};
  border-radius: ${props => (props.bordered ? props.$themeStyles.borderRadius : '0')};

  & > li:not(:last-child) {
    ${props =>
      props.dividers &&
      props.variant !== 'horizontal' &&
      `
      border-bottom: 1px solid ${props.$themeStyles.colors.border};
    `}

    ${props =>
      props.dividers &&
      props.variant === 'horizontal' &&
      `
      border-right: 1px solid ${props.$themeStyles.colors.border};
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
  $themeStyles: ThemeStyles;
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
    const spacing = props.$themeStyles.spacing[props.size || 'medium'];
    if (props.compact) {
      return props.variant === 'horizontal'
        ? `${props.$themeStyles.spacing.small.y} ${props.$themeStyles.spacing.small.x}`
        : `${props.$themeStyles.spacing.small.y} ${props.$themeStyles.spacing.medium.x}`;
    }
    return props.variant === 'horizontal'
      ? `${spacing.y} ${spacing.x}`
      : `${spacing.y} ${props.$themeStyles.spacing.medium.x}`;
  }};
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  color: ${props => {
    if (props.disabled) {
      return props.$themeStyles.colors.textDisabled;
    }
    if (props.selected) {
      return props.$themeStyles.colors.primary;
    }
    return props.$themeStyles.colors.textPrimary;
  }};
  background-color: ${props => (props.selected ? props.$themeStyles.colors.hover : 'transparent')};
  font-size: ${props => props.$themeStyles.typography.sizes[props.size || 'medium']};
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    ${props =>
      !props.disabled &&
      `
      background-color: ${props.$themeStyles.colors.hover};
      color: ${
        props.selected ? props.$themeStyles.colors.primaryDark : props.$themeStyles.colors.textPrimary
      };
    `}
  }

  &:active {
    ${props =>
      !props.disabled &&
      `
      background-color: ${props.$themeStyles.colors.active};
    `}
  }
`;

const MenuItemIconWrapper = styled.span<{ isDisabled?: boolean; $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-right: ${props => props.$themeStyles.spacing.medium.x};
  font-size: ${props => props.$themeStyles.typography.sizes.large};
  opacity: ${props => (props.isDisabled ? 0.5 : 1)};
`;

const MenuItemLabel = styled.span`
  flex-grow: 1;
`;

const SubMenuIndicator = styled.span<{ $themeStyles: ThemeStyles }>`
  margin-left: ${props => props.$themeStyles.spacing.medium.x};
  font-size: ${props => props.$themeStyles.typography.sizes.small};
  display: flex;
  align-items: center;
`;

const SubMenuList = styled(MenuList)<MenuListProps & { isOpen?: boolean; position?: string }>`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  position: absolute;
  z-index: 1000;
  background-color: ${props => props.$themeStyles.colors.background};
  min-width: 160px;
  box-shadow: ${props => props.$themeStyles.shadows.dropdown};
  border: 1px solid ${props => props.$themeStyles.colors.border};
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
              <MenuItemIconWrapper isDisabled={item.disabled} $themeStyles={themeStyles}>
                {item.icon}
              </MenuItemIconWrapper>
            )}
            <MenuItemLabel>{item.label}</MenuItemLabel>
            {hasSubmenu && (
              <SubMenuIndicator $themeStyles={themeStyles}>
                {variant === 'vertical' ? '›' : '▾'}
              </SubMenuIndicator>
            )}
          </MenuItemContent>
        );
      }

      return (
        <MenuItemContent as="div" onClick={handleClick} {...commonProps}>
          {showIcons && item.icon && (
            <MenuItemIconWrapper isDisabled={item.disabled} $themeStyles={themeStyles}>
              {item.icon}
            </MenuItemIconWrapper>
          )}
          <MenuItemLabel>{item.label}</MenuItemLabel>
          {hasSubmenu && (
            <SubMenuIndicator $themeStyles={themeStyles}>
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
