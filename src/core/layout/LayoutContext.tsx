import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface LayoutContextType {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  
  // Mobile menu state
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  
  // Layout visibility
  hideSidebar: boolean;
  setHideSidebar: (hide: boolean) => void;
  hideHeader: boolean;
  setHideHeader: (hide: boolean) => void;
  
  // Layout dimensions
  sidebarWidth: string;
  headerHeight: string;
}

// Create context with default values
const LayoutContext = createContext<LayoutContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  toggleSidebar: () => {},
  
  mobileMenuOpen: false,
  setMobileMenuOpen: () => {},
  toggleMobileMenu: () => {},
  
  hideSidebar: false,
  setHideSidebar: () => {},
  hideHeader: false,
  setHideHeader: () => {},
  
  sidebarWidth: '260px',
  headerHeight: '64px',
});

// Props for the provider
interface LayoutProviderProps {
  children: React.ReactNode;
  initialState?: Partial<LayoutContextType>;
}

// Provider component
export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  initialState = {},
}) => {
  // State for sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    initialState.sidebarCollapsed || false
  );
  
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(
    initialState.mobileMenuOpen || false
  );
  
  // State for visibility
  const [hideSidebar, setHideSidebar] = useState(
    initialState.hideSidebar || false
  );
  const [hideHeader, setHideHeader] = useState(
    initialState.hideHeader || false
  );
  
  // Layout dimensions
  const sidebarWidth = sidebarCollapsed ? '64px' : '260px';
  const headerHeight = '64px';
  
  // Toggle functions
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);
  
  // Close mobile menu on navigation
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [window.location.pathname]);
  
  // Context value
  const value: LayoutContextType = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleMobileMenu,
    
    hideSidebar,
    setHideSidebar,
    hideHeader,
    setHideHeader,
    
    sidebarWidth,
    headerHeight,
  };
  
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Hook for using the layout context
export const useLayout = () => useContext(LayoutContext); 