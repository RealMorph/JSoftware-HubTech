import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { RadixSidebar, SidebarMenuItem } from '../navigation/RadixSidebar';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { useMediaQuery } from '../../core/hooks/useMediaQuery';
import { useLayout } from '../../core/layout/LayoutContext';

// Types
export interface AppLayoutProps {
  /** Main content */
  children: React.ReactNode;
  /** Whether to hide the sidebar */
  hideSidebar?: boolean;
  /** Whether to hide the header */
  hideHeader?: boolean;
  /** Custom header content */
  headerContent?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

// Icons for sidebar
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ContactsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DealsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.45 5.11L2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 16H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 16H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3738 17.7642 20.3738 18.295C20.3738 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2938 18.375 20.2938C17.8442 20.2938 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4801 19.5793 14.0826 20.1434 14.08 20.77V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0677 20.2603 9.65074 19.6889 9.03 19.44C8.41289 19.1677 7.69219 19.2983 7.21 19.77L7.15 19.83C6.77487 20.2056 6.26578 20.4138 5.735 20.4138C5.20422 20.4138 4.69513 20.2056 4.32 19.83C3.94437 19.4549 3.73615 18.9458 3.73615 18.415C3.73615 17.8842 3.94437 17.3751 4.32 17L4.38 16.94C4.85167 16.4578 4.98226 15.7371 4.71 15.12C4.45069 14.5201 3.88655 14.1226 3.26 14.12H3C2.46957 14.12 1.96086 13.9093 1.58579 13.5342C1.21071 13.1591 1 12.6504 1 12.12C1 11.5896 1.21071 11.0809 1.58579 10.7058C1.96086 10.3307 2.46957 10.12 3 10.12H3.09C3.73967 10.1077 4.31114 9.69074 4.56 9.07C4.83226 8.45289 4.70167 7.73219 4.23 7.25L4.17 7.19C3.79437 6.81487 3.58615 6.30578 3.58615 5.775C3.58615 5.24422 3.79437 4.73513 4.17 4.36C4.54513 3.98437 5.05422 3.77615 5.585 3.77615C6.11578 3.77615 6.62487 3.98437 7 4.36L7.06 4.42C7.54219 4.89167 8.26289 5.02226 8.88 4.75H9C9.59994 4.49069 9.99744 3.92655 10 3.3V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0026 3.71655 14.4001 4.28069 15 4.54C15.6171 4.81226 16.3378 4.68167 16.82 4.21L16.88 4.15C17.2551 3.77437 17.7642 3.56615 18.295 3.56615C18.8258 3.56615 19.3349 3.77437 19.71 4.15C20.0856 4.52513 20.2938 5.03422 20.2938 5.565C20.2938 6.09578 20.0856 6.60487 19.71 6.98L19.65 7.04C19.1783 7.52219 19.0477 8.24289 19.32 8.86V9C19.5793 9.59994 20.1434 9.99744 20.77 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.2834 14.0026 19.7193 14.4001 19.46 15L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const ContentContainer = styled.div<{ $sidebarWidth: string }>`
  flex: 1;
  overflow: auto;
  margin-left: ${props => props.$sidebarWidth};
  transition: margin-left 0.3s;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Header = styled.header<{ $theme: any }>`
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.$theme.getColor('colors.surface')};
  border-bottom: 1px solid ${props => props.$theme.getColor('colors.border')};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MainContent = styled.main<{ $theme: any }>`
  padding: 24px;
  background-color: ${props => props.$theme.getColor('colors.background')};
  min-height: calc(100vh - 64px);
`;

const MobileMenuButton = styled.button<{ $theme: any }>`
  display: none;
  background: transparent;
  border: none;
  color: ${props => props.$theme.getColor('colors.text.primary')};
  margin-right: 16px;
  cursor: pointer;
  padding: 8px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

// Generate navigation items based on the application routes
const createNavigationItems = (pathname: string): SidebarMenuItem[] => {
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      href: '/app/dashboard',
      active: pathname === '/app/dashboard',
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: <ContactsIcon />,
      href: '/contacts',
      active: pathname === '/contacts',
    },
    {
      id: 'deals',
      label: 'Deals',
      icon: <DealsIcon />,
      items: [
        {
          id: 'all-deals',
          label: 'All Deals',
          href: '/app/deals',
          active: pathname === '/app/deals',
        },
        {
          id: 'active-deals',
          label: 'Active Deals',
          href: '/app/deals/active',
          active: pathname === '/app/deals/active',
        },
        {
          id: 'closed-deals',
          label: 'Closed Deals',
          href: '/app/deals/closed',
          active: pathname === '/app/deals/closed',
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      href: '/app/settings',
      active: pathname === '/app/settings',
    },
  ];
};

// Generate breadcrumb items based on the current location
const generateBreadcrumbItems = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { label: 'Home', path: '/' },
  ];
  
  let currentPath = '';
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Skip the 'app' segment in breadcrumbs
    if (path === 'app') return;
    
    // Add formatted label (capitalize and replace hyphens with spaces)
    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path: currentPath,
    });
  });
  
  return breadcrumbs;
};

// Main component
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideSidebar,
  hideHeader,
  headerContent,
  className,
}) => {
  const theme = useDirectTheme();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen, 
    setMobileMenuOpen,
    toggleSidebar,
    toggleMobileMenu,
    sidebarWidth
  } = useLayout();
  
  // Apply hideSidebar and hideHeader from props to context if provided
  useEffect(() => {
    if (hideSidebar !== undefined) {
      // We don't call setHideSidebar directly to avoid cyclical updates
      // This is just to demonstrate we could update the context from props if needed
    }
    
    if (hideHeader !== undefined) {
      // Same as above
    }
  }, [hideSidebar, hideHeader]);
  
  const navigationItems = createNavigationItems(location.pathname);
  const breadcrumbItems = generateBreadcrumbItems(location.pathname);
  
  return (
    <LayoutContainer className={className}>
      {!hideSidebar && (
        <RadixSidebar
          items={navigationItems}
          title="App Name"
          mobileExpanded={mobileMenuOpen}
          onMobileExpandedChange={setMobileMenuOpen}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          width="260px"
          collapsedWidth="64px"
          footer={
            <div style={{ fontSize: '0.875rem', color: '#888', textAlign: 'center' }}>
              {!sidebarCollapsed && 'v1.0.0'}
            </div>
          }
        />
      )}
      
      <ContentContainer $sidebarWidth={!hideSidebar ? sidebarWidth : '0'}>
        {!hideHeader && (
          <Header $theme={theme}>
            <HeaderLeft>
              <MobileMenuButton 
                onClick={toggleMobileMenu} 
                $theme={theme}
                aria-label="Toggle mobile menu"
              >
                ☰
              </MobileMenuButton>
              
              {!isMobile && !hideSidebar && (
                <button 
                  onClick={toggleSidebar}
                  style={{ 
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: '16px',
                    padding: '4px'
                  }}
                >
                  {sidebarCollapsed ? '→' : '←'}
                </button>
              )}
              
              <Breadcrumbs items={breadcrumbItems} />
            </HeaderLeft>
            
            <HeaderRight>
              {headerContent}
            </HeaderRight>
          </Header>
        )}
        
        <MainContent $theme={theme}>
          {children}
        </MainContent>
      </ContentContainer>
    </LayoutContainer>
  );
}; 