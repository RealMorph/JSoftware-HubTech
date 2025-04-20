import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { getMenuItems } from './routeRegistry';
import { useAuth } from '../auth/AuthProvider';
import MobileDrawer from '../../components/navigation/MobileDrawer';
import { filterTransientProps } from '../styled-components/transient-props';

// Create filtered base components
const FilteredNav = filterTransientProps(styled.nav``);
const FilteredUl = filterTransientProps(styled.ul``);
const FilteredLink = filterTransientProps(Link);

// Styled components for navigation
const NavContainer = styled(FilteredNav)<{ $variant?: string }>`
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: 0.5rem 1rem;
  position: ${({ $variant }) => ($variant === 'fixed' ? 'fixed' : 'relative')};
  top: ${({ $variant }) => ($variant === 'fixed' ? '0' : 'auto')};
  width: ${({ $variant }) => ($variant === 'fixed' ? '100%' : 'auto')};
  z-index: 100;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const NavList = styled(FilteredUl)<{ $isVisible?: boolean }>`
  list-style-type: none;
  display: flex;
  padding: 0;
  margin: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavItem = styled.li`
  margin-right: 1rem;
  
  &:last-child {
    margin-right: 0;
  }
`;

const NavLinkStyled = styled(FilteredLink)<{ $active: boolean }>`
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.text.secondary};
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover, &:focus {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
    outline: none;
    text-decoration: none;
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  .icon {
    margin-right: 0.5rem;
  }
`;

const NavIcon = styled.span`
  margin-right: 0.5rem;
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover, &:focus {
    color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
  
  &:focus {
    top: 0;
  }
`;

interface NavigationProps {
  variant?: 'horizontal' | 'vertical' | 'sidebar' | 'fixed';
  showIcons?: boolean;
  logo?: React.ReactNode;
  onToggleSidebar?: () => void;
  mainContentId?: string;
}

/**
 * Navigation component that renders menu items based on route registry
 * Supports different variants and automatically handles permissions
 */
export const Navigation: React.FC<NavigationProps> = ({ 
  variant = 'horizontal',
  showIcons = true,
  logo,
  onToggleSidebar,
  mainContentId = 'main-content'
}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navRef = useRef<HTMLUListElement>(null);
  
  // Get all available menu items from the route registry
  const menuItems = useMemo(() => getMenuItems(), []);
  
  // Filter menu items based on user permissions and roles
  const filteredMenuItems = useMemo(() => {
    if (!isAuthenticated) {
      // For unauthenticated users, only show public routes
      return menuItems.filter(item => item.protectionLevel === 'public');
    }
    
    return menuItems.filter(item => {
      // Always include public routes
      if (item.protectionLevel === 'public') {
        return true;
      }
      
      // For role-based routes, check if user has the required role
      if (item.protectionLevel === 'role-based' && item.requiredRoles && item.requiredRoles.length > 0) {
        return item.requiredRoles.some(role => user?.role?.includes(role));
      }
      
      // For permission-based routes, check if user has the required permissions
      if (item.protectionLevel === 'permission-based' && item.requiredPermissions && item.requiredPermissions.length > 0) {
        if (item.permissionCheckOperator === 'and') {
          return item.requiredPermissions.every(permission => (user as any)?.permissions?.includes(permission));
        } else {
          return item.requiredPermissions.some(permission => (user as any)?.permissions?.includes(permission));
        }
      }
      
      // For basic authenticated routes, just check if user is authenticated
      return isAuthenticated;
    });
  }, [menuItems, isAuthenticated, user]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!navRef.current) return;
      
      const items = Array.from(navRef.current.querySelectorAll('a'));
      
      if (items.length === 0) return;
      
      if (e.key === 'ArrowRight') {
        if (activeIndex < items.length - 1) {
          setActiveIndex(activeIndex + 1);
          (items[activeIndex + 1] as HTMLElement)?.focus();
        } else {
          setActiveIndex(0);
          (items[0] as HTMLElement)?.focus();
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeIndex > 0) {
          setActiveIndex(activeIndex - 1);
          (items[activeIndex - 1] as HTMLElement)?.focus();
        } else {
          setActiveIndex(items.length - 1);
          (items[items.length - 1] as HTMLElement)?.focus();
        }
      } else if (e.key === 'Home') {
        setActiveIndex(0);
        (items[0] as HTMLElement)?.focus();
      } else if (e.key === 'End') {
        setActiveIndex(items.length - 1);
        (items[items.length - 1] as HTMLElement)?.focus();
      }
    };
    
    const navElement = navRef.current;
    
    if (navElement) {
      navElement.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (navElement) {
        navElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [activeIndex, filteredMenuItems.length]);
  
  // Reset active index when location changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [location.pathname]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Create navigation items
  const renderNavItems = () => {
    return filteredMenuItems.map((item, index) => (
      <NavItem key={item.path}>
        <NavLinkStyled 
          to={item.path} 
          $active={location.pathname === item.path ? true : false}
          aria-current={location.pathname === item.path ? 'page' : undefined}
          tabIndex={activeIndex === index ? 0 : -1}
          onFocus={() => setActiveIndex(index)}
        >
          {showIcons && item.menuIcon && (
            <NavIcon className="icon" aria-hidden="true">{item.menuIcon}</NavIcon>
          )}
          {item.title}
        </NavLinkStyled>
      </NavItem>
    ));
  };
  
  // Render navigation items
  return (
    <>
      <SkipLink href={`#${mainContentId}`}>Skip to main content</SkipLink>
      <NavContainer $variant={variant}>
        <NavContent>
          <LogoContainer>
            {variant === 'sidebar' && (
              <MobileMenuButton 
                onClick={onToggleSidebar} 
                aria-label="Toggle sidebar menu"
                aria-expanded={false} // This should be controlled by the parent component
              >
                ☰
              </MobileMenuButton>
            )}
            {logo && logo}
          </LogoContainer>
          
          <NavList ref={navRef} role="menubar" aria-label="Main Navigation">
            {renderNavItems()}
          </NavList>
          
          <MobileMenuButton 
            onClick={toggleMobileMenu} 
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </NavContent>
      </NavContainer>
      
      <MobileDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <nav aria-label="Mobile Navigation">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filteredMenuItems.map(item => (
              <li key={item.path} style={{ margin: '0.5rem 0' }}>
                <NavLinkStyled 
                  to={item.path} 
                  $active={location.pathname === item.path ? true : false}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {showIcons && item.menuIcon && (
                    <NavIcon className="icon" aria-hidden="true">{item.menuIcon}</NavIcon>
                  )}
                  {item.title}
                </NavLinkStyled>
              </li>
            ))}
          </ul>
        </nav>
      </MobileDrawer>
    </>
  );
};

export default Navigation; 