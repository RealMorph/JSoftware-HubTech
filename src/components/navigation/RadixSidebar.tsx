import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Collapsible from '@radix-ui/react-collapsible';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';
import { filterTransientProps } from '../../core/styled-components/transient-props';

// Create filtered base components
const FilteredDiv = filterTransientProps(styled.div``);
const FilteredSpan = filterTransientProps(styled.span``);
const FilteredUl = filterTransientProps(styled.ul``);
const FilteredNavMenuLink = filterTransientProps(NavigationMenu.Link);
const FilteredNavMenuTrigger = filterTransientProps(NavigationMenu.Trigger);
const FilteredNavMenuContent = filterTransientProps(NavigationMenu.Content);
const FilteredCollapsibleContent = filterTransientProps(Collapsible.Content);

// Types
export interface SidebarMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  items?: SidebarMenuItem[];
}

export interface RadixSidebarProps {
  /** Menu items to display in the sidebar */
  items: SidebarMenuItem[];
  /** Whether the sidebar is expanded on mobile */
  mobileExpanded?: boolean;
  /** Callback when mobile sidebar is toggled */
  onMobileExpandedChange?: (expanded: boolean) => void;
  /** Whether the sidebar is collapsible on desktop */
  collapsible?: boolean;
  /** Whether the sidebar is collapsed on desktop */
  collapsed?: boolean;
  /** Callback when desktop sidebar is toggled */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Width of the expanded sidebar */
  width?: string;
  /** Width of the collapsed sidebar */
  collapsedWidth?: string;
  /** Additional CSS class */
  className?: string;
  /** Title displayed at the top of the sidebar */
  title?: React.ReactNode;
  /** Content displayed at the bottom of the sidebar */
  footer?: React.ReactNode;
}

// Theme styles interface
interface ThemeStyles {
  colors: {
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    primary: string;
    hover: string;
    active: string;
    border: string;
  };
  typography: {
    fontSize: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  transitions: {
    fast: string;
    normal: string;
  };
}

const createThemeStyles = (theme: DirectThemeContextType): ThemeStyles => ({
  colors: {
    background: theme.getColor('colors.background'),
    surface: theme.getColor('colors.surface'),
    text: {
      primary: theme.getColor('colors.text.primary'),
      secondary: theme.getColor('colors.text.secondary'),
      disabled: theme.getColor('colors.text.disabled', '#9e9e9e'),
    },
    primary: theme.getColor('colors.primary'),
    hover: theme.getColor('colors.hover.background', 'rgba(0, 0, 0, 0.04)'),
    active: theme.getColor('colors.active.background', 'rgba(0, 0, 0, 0.08)'),
    border: theme.getColor('colors.border'),
  },
  typography: {
    fontSize: {
      sm: theme.getTypography('fontSize.sm') as string,
      md: theme.getTypography('fontSize.md') as string,
      lg: theme.getTypography('fontSize.lg') as string,
      xl: theme.getTypography('fontSize.xl') as string,
    },
  },
  spacing: {
    xs: theme.getSpacing('xs'),
    sm: theme.getSpacing('sm'),
    md: theme.getSpacing('md'),
    lg: theme.getSpacing('lg'),
    xl: theme.getSpacing('xl'),
  },
  borderRadius: {
    sm: theme.getBorderRadius('sm'),
    md: theme.getBorderRadius('md'),
    lg: theme.getBorderRadius('lg'),
  },
  shadows: {
    sm: theme.getShadow('sm'),
    md: theme.getShadow('md'),
    lg: theme.getShadow('lg'),
  },
  transitions: {
    fast: theme.getTransition('fast', '150ms'),
    normal: theme.getTransition('normal', '300ms'),
  },
});

// Styled components
const SidebarContainer = styled(FilteredDiv)<{
  $themeStyles: ThemeStyles;
  $width: string;
  $collapsedWidth: string;
  $isCollapsed: boolean;
  $isMobile: boolean;
  $isMobileExpanded: boolean;
}>`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.$themeStyles.colors.surface};
  color: ${props => props.$themeStyles.colors.text.primary};
  height: 100%;
  overflow-y: auto;
  position: ${props => (props.$isMobile ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  width: ${props => (props.$isMobile ? (props.$isMobileExpanded ? props.$width : '0') : props.$isCollapsed ? props.$collapsedWidth : props.$width)};
  transition: width ${props => props.$themeStyles.transitions.normal}, box-shadow ${props => props.$themeStyles.transitions.normal};
  box-shadow: ${props => (props.$isMobile && props.$isMobileExpanded ? props.$themeStyles.shadows.md : 'none')};
  border-right: ${props => (props.$isMobile ? 'none' : `1px solid ${props.$themeStyles.colors.border}`)};
  overflow-x: hidden;
`;

const SidebarHeader = styled(FilteredDiv)<{
  $themeStyles: ThemeStyles;
  $isCollapsed: boolean;
}>`
  display: flex;
  align-items: center;
  padding: ${props => (props.$isCollapsed ? props.$themeStyles.spacing.md : `${props.$themeStyles.spacing.md} ${props.$themeStyles.spacing.lg}`)};
  justify-content: ${props => (props.$isCollapsed ? 'center' : 'space-between')};
  height: 64px;
  border-bottom: 1px solid ${props => props.$themeStyles.colors.border};
`;

const SidebarTitle = styled(FilteredDiv)<{
  $themeStyles: ThemeStyles;
  $isCollapsed: boolean;
}>`
  font-size: ${props => props.$themeStyles.typography.fontSize.lg};
  font-weight: 600;
  display: ${props => (props.$isCollapsed ? 'none' : 'block')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SidebarContent = styled(FilteredDiv)<{
  $themeStyles: ThemeStyles;
}>`
  flex: 1;
  padding: ${props => props.$themeStyles.spacing.md} 0;
  overflow-y: auto;
`;

const SidebarFooter = styled(FilteredDiv)<{
  $themeStyles: ThemeStyles;
  $isCollapsed: boolean;
}>`
  padding: ${props => (props.$isCollapsed ? props.$themeStyles.spacing.md : `${props.$themeStyles.spacing.md} ${props.$themeStyles.spacing.lg}`)};
  border-top: 1px solid ${props => props.$themeStyles.colors.border};
  display: ${props => (props.$isCollapsed ? 'flex' : 'block')};
  justify-content: center;
`;

const ToggleButton = styled.button<{
  $themeStyles: ThemeStyles;
}>`
  background: transparent;
  border: none;
  color: ${props => props.$themeStyles.colors.text.secondary};
  cursor: pointer;
  padding: ${props => props.$themeStyles.spacing.xs};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  transition: background-color ${props => props.$themeStyles.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${props => props.$themeStyles.colors.hover};
  }
`;

const NavMenuRoot = styled(NavigationMenu.Root)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const NavMenuList = styled(NavigationMenu.List)`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const NavMenuItem = styled(NavigationMenu.Item)`
  width: 100%;
`;

const NavMenuLink = styled(FilteredNavMenuLink)<{
  $active?: boolean;
  $disabled?: boolean;
  $themeStyles: ThemeStyles;
  $isCollapsed: boolean;
}>`
  display: flex;
  align-items: center;
  padding: ${props => (props.$isCollapsed ? props.$themeStyles.spacing.md : `${props.$themeStyles.spacing.md} ${props.$themeStyles.spacing.lg}`)};
  color: ${props => {
    if (props.$disabled) return props.$themeStyles.colors.text.disabled;
    if (props.$active) return props.$themeStyles.colors.primary;
    return props.$themeStyles.colors.text.primary;
  }};
  text-decoration: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: background-color ${props => props.$themeStyles.transitions.fast};
  background-color: ${props => (props.$active ? props.$themeStyles.colors.active : 'transparent')};
  opacity: ${props => (props.$disabled ? 0.6 : 1)};
  justify-content: ${props => (props.$isCollapsed ? 'center' : 'flex-start')};

  &:hover {
    background-color: ${props => (!props.$disabled ? props.$themeStyles.colors.hover : 'transparent')};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.$themeStyles.colors.primary};
    outline-offset: -2px;
  }
`;

const NavMenuTrigger = styled(FilteredNavMenuTrigger)<{
  $active?: boolean;
  $disabled?: boolean;
  $themeStyles: ThemeStyles;
  $isCollapsed: boolean;
  $isOpen?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: ${props => (props.$isCollapsed ? props.$themeStyles.spacing.md : `${props.$themeStyles.spacing.md} ${props.$themeStyles.spacing.lg}`)};
  color: ${props => {
    if (props.$disabled) return props.$themeStyles.colors.text.disabled;
    if (props.$active) return props.$themeStyles.colors.primary;
    return props.$themeStyles.colors.text.primary;
  }};
  text-decoration: none;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: background-color ${props => props.$themeStyles.transitions.fast};
  background-color: ${props => (props.$active ? props.$themeStyles.colors.active : 'transparent')};
  opacity: ${props => (props.$disabled ? 0.6 : 1)};
  justify-content: ${props => (props.$isCollapsed ? 'center' : 'space-between')};
  width: 100%;
  border: none;
  font-size: inherit;
  text-align: left;

  &:hover {
    background-color: ${props => (!props.$disabled ? props.$themeStyles.colors.hover : 'transparent')};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.$themeStyles.colors.primary};
    outline-offset: -2px;
  }
`;

const NavMenuContent = styled(FilteredNavMenuContent)<{
  $themeStyles: ThemeStyles;
}>`
  animation-duration: ${props => props.$themeStyles.transitions.normal};
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  
  &[data-state="open"] {
    animation-name: slideDown;
  }
  
  &[data-state="closed"] {
    animation-name: slideUp;
  }
  
  @keyframes slideDown {
    from { height: 0; }
    to { height: var(--radix-navigation-menu-content-height); }
  }
  
  @keyframes slideUp {
    from { height: var(--radix-navigation-menu-content-height); }
    to { height: 0; }
  }
`;

const CollapsibleRoot = styled(Collapsible.Root)`
  width: 100%;
`;

const CollapsibleContent = styled(FilteredCollapsibleContent)<{
  $themeStyles: ThemeStyles;
}>`
  overflow: hidden;
  
  &[data-state="open"] {
    animation: slideDown ${props => props.$themeStyles.transitions.normal} cubic-bezier(0.87, 0, 0.13, 1);
  }
  
  &[data-state="closed"] {
    animation: slideUp ${props => props.$themeStyles.transitions.normal} cubic-bezier(0.87, 0, 0.13, 1);
  }
  
  @keyframes slideDown {
    from { height: 0; }
    to { height: var(--radix-collapsible-content-height); }
  }
  
  @keyframes slideUp {
    from { height: var(--radix-collapsible-content-height); }
    to { height: 0; }
  }
`;

const IconWrapper = styled(FilteredSpan)<{
  $themeStyles: ThemeStyles;
  $active?: boolean;
  $disabled?: boolean;
  $isCollapsed: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  margin-right: ${props => (props.$isCollapsed ? '0' : props.$themeStyles.spacing.md)};
  color: ${props => {
    if (props.$disabled) return props.$themeStyles.colors.text.disabled;
    if (props.$active) return props.$themeStyles.colors.primary;
    return props.$themeStyles.colors.text.secondary;
  }};
`;

const ChevronIcon = styled(FilteredSpan)<{
  $isOpen?: boolean;
  $themeStyles: ThemeStyles;
}>`
  transition: transform ${props => props.$themeStyles.transitions.fast};
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  display: flex;
  align-items: center;
`;

const NestedItemsList = styled(FilteredUl)<{
  $themeStyles: ThemeStyles;
  $isCollapsed: boolean;
}>`
  list-style: none;
  margin: 0;
  padding: 0;
  
  ${props => !props.$isCollapsed && `
    padding-left: ${props.$themeStyles.spacing.xl};
  `}
`;

const NestedItem = styled.li`
  width: 100%;
`;

const Overlay = styled(FilteredDiv)<{
  $isVisible: boolean;
  $themeStyles: ThemeStyles;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  visibility: ${props => (props.$isVisible ? 'visible' : 'hidden')};
  transition: 
    opacity ${props => props.$themeStyles.transitions.normal},
    visibility ${props => props.$themeStyles.transitions.normal};
`;

// Main component
export const RadixSidebar: React.FC<RadixSidebarProps> = ({
  items,
  mobileExpanded = false,
  onMobileExpandedChange,
  collapsible = true,
  collapsed = false,
  onCollapsedChange,
  width = '260px',
  collapsedWidth = '64px',
  className,
  title,
  footer,
}) => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  // Handle mobile sidebar toggle
  const handleMobileToggle = () => {
    if (onMobileExpandedChange) {
      onMobileExpandedChange(!mobileExpanded);
    }
  };
  
  // Handle desktop sidebar toggle
  const handleCollapsedToggle = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed);
    }
  };
  
  // Handle collapsible section toggle
  const handleItemToggle = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (isMobile && mobileExpanded) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.sidebar-container') && onMobileExpandedChange) {
          onMobileExpandedChange(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobile, mobileExpanded, onMobileExpandedChange]);
  
  // Close mobile sidebar on ESC key
  useEffect(() => {
    if (isMobile && mobileExpanded) {
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onMobileExpandedChange) {
          onMobileExpandedChange(false);
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isMobile, mobileExpanded, onMobileExpandedChange]);
  
  // Determine if sidebar is currently collapsed
  const isCollapsed = !isMobile && collapsed;
  
  // Render a menu item
  const renderMenuItem = (item: SidebarMenuItem) => {
    const hasNestedItems = item.items && item.items.length > 0;
    const isItemOpen = openItems[item.id];
    
    if (hasNestedItems) {
      return (
        <CollapsibleRoot
          key={item.id}
          open={isItemOpen}
          onOpenChange={(open) => handleItemToggle(item.id)}
          disabled={item.disabled}
        >
          <Collapsible.Trigger asChild>
            <NavMenuTrigger
              $active={item.active}
              $disabled={item.disabled}
              $themeStyles={themeStyles}
              $isCollapsed={isCollapsed}
              $isOpen={isItemOpen}
              aria-label={item.label}
            >
              {item.icon && (
                <IconWrapper 
                  $themeStyles={themeStyles}
                  $active={item.active}
                  $disabled={item.disabled}
                  $isCollapsed={isCollapsed}
                >
                  {item.icon}
                </IconWrapper>
              )}
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && (
                <ChevronIcon $isOpen={isItemOpen} $themeStyles={themeStyles}>
                  ▼
                </ChevronIcon>
              )}
            </NavMenuTrigger>
          </Collapsible.Trigger>
          <CollapsibleContent $themeStyles={themeStyles}>
            <NestedItemsList $themeStyles={themeStyles} $isCollapsed={isCollapsed}>
              {item.items?.map(subItem => (
                <NestedItem key={subItem.id}>
                  {renderNestedItem(subItem)}
                </NestedItem>
              ))}
            </NestedItemsList>
          </CollapsibleContent>
        </CollapsibleRoot>
      );
    } else {
      return renderSingleItem(item);
    }
  };
  
  // Render a nested menu item
  const renderNestedItem = (item: SidebarMenuItem) => {
    if (item.href) {
      return (
        <NavMenuLink
          key={item.id}
          href={item.disabled ? undefined : item.href}
          $active={item.active}
          $disabled={item.disabled}
          $themeStyles={themeStyles}
          $isCollapsed={isCollapsed}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
            if (isMobile && onMobileExpandedChange) {
              onMobileExpandedChange(false);
            }
          }}
        >
          {item.icon && (
            <IconWrapper 
              $themeStyles={themeStyles}
              $active={item.active}
              $disabled={item.disabled}
              $isCollapsed={isCollapsed}
            >
              {item.icon}
            </IconWrapper>
          )}
          {!isCollapsed && <span>{item.label}</span>}
        </NavMenuLink>
      );
    } else {
      return (
        <NavMenuLink
          key={item.id}
          asChild
          $active={item.active}
          $disabled={item.disabled}
          $themeStyles={themeStyles}
          $isCollapsed={isCollapsed}
        >
          <button
            onClick={() => {
              if (!item.disabled && item.onClick) {
                item.onClick();
              }
              if (isMobile && onMobileExpandedChange) {
                onMobileExpandedChange(false);
              }
            }}
            disabled={item.disabled}
            style={{ 
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: 'inherit',
              font: 'inherit'
            }}
          >
            {item.icon && (
              <IconWrapper 
                $themeStyles={themeStyles}
                $active={item.active}
                $disabled={item.disabled}
                $isCollapsed={isCollapsed}
              >
                {item.icon}
              </IconWrapper>
            )}
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        </NavMenuLink>
      );
    }
  };
  
  // Render a single menu item (no nested items)
  const renderSingleItem = (item: SidebarMenuItem) => {
    if (item.href) {
      return (
        <NavMenuItem key={item.id}>
          <NavMenuLink
            href={item.disabled ? undefined : item.href}
            $active={item.active}
            $disabled={item.disabled}
            $themeStyles={themeStyles}
            $isCollapsed={isCollapsed}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
                return;
              }
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
              if (isMobile && onMobileExpandedChange) {
                onMobileExpandedChange(false);
              }
            }}
          >
            {item.icon && (
              <IconWrapper 
                $themeStyles={themeStyles}
                $active={item.active}
                $disabled={item.disabled}
                $isCollapsed={isCollapsed}
              >
                {item.icon}
              </IconWrapper>
            )}
            {!isCollapsed && <span>{item.label}</span>}
          </NavMenuLink>
        </NavMenuItem>
      );
    } else {
      return (
        <NavMenuItem key={item.id}>
          <NavMenuLink
            asChild
            $active={item.active}
            $disabled={item.disabled}
            $themeStyles={themeStyles}
            $isCollapsed={isCollapsed}
          >
            <button
              onClick={() => {
                if (!item.disabled && item.onClick) {
                  item.onClick();
                }
                if (isMobile && onMobileExpandedChange) {
                  onMobileExpandedChange(false);
                }
              }}
              disabled={item.disabled}
              style={{ 
                background: 'none',
                border: 'none',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                color: 'inherit',
                font: 'inherit'
              }}
            >
              {item.icon && (
                <IconWrapper 
                  $themeStyles={themeStyles}
                  $active={item.active}
                  $disabled={item.disabled}
                  $isCollapsed={isCollapsed}
                >
                  {item.icon}
                </IconWrapper>
              )}
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          </NavMenuLink>
        </NavMenuItem>
      );
    }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && (
        <Overlay 
          $isVisible={mobileExpanded} 
          $themeStyles={themeStyles} 
          onClick={handleMobileToggle}
        />
      )}
      
      {/* Sidebar container */}
      <SidebarContainer
        className={`sidebar-container ${className || ''}`}
        $themeStyles={themeStyles}
        $width={width}
        $collapsedWidth={collapsedWidth}
        $isCollapsed={isCollapsed}
        $isMobile={isMobile}
        $isMobileExpanded={mobileExpanded}
      >
        {/* Sidebar header */}
        <SidebarHeader $themeStyles={themeStyles} $isCollapsed={isCollapsed}>
          {!isCollapsed && <SidebarTitle $themeStyles={themeStyles} $isCollapsed={isCollapsed}>{title}</SidebarTitle>}
          {collapsible && !isMobile && (
            <ToggleButton 
              $themeStyles={themeStyles} 
              onClick={handleCollapsedToggle}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? '→' : '←'}
            </ToggleButton>
          )}
          {isMobile && (
            <ToggleButton 
              $themeStyles={themeStyles} 
              onClick={handleMobileToggle}
              aria-label="Close sidebar"
            >
              ×
            </ToggleButton>
          )}
        </SidebarHeader>
        
        {/* Sidebar content */}
        <SidebarContent $themeStyles={themeStyles}>
          <NavMenuRoot orientation="vertical">
            <NavMenuList>
              {items.map(item => renderMenuItem(item))}
            </NavMenuList>
          </NavMenuRoot>
        </SidebarContent>
        
        {/* Sidebar footer */}
        {footer && (
          <SidebarFooter $themeStyles={themeStyles} $isCollapsed={isCollapsed}>
            {footer}
          </SidebarFooter>
        )}
      </SidebarContainer>
    </>
  );
}; 