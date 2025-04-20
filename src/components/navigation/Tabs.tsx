import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { filterTransientProps } from '../../core/styled-components/transient-props';

// Types
export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
  responsive?: boolean;
}

// Define theme style interface
interface ThemeStyles {
  colors: {
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      paper: string;
      secondary: string;
      hover: string;
      active: string;
    };
    primary: {
      main: string;
      hover: string;
      active: string;
    };
    border: {
      main: string;
    };
  };
  typography: {
    sizes: {
      small: string;
      medium: string;
      large: string;
    };
    weights: {
      normal: string;
      semibold: string;
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
    content: string;
  };
  borderRadius: {
    none: string;
    md: string;
    full: string;
  };
  transitions: {
    default: string;
  };
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing, getBorderRadius, getTypography, getTransition } = themeContext;

  return {
    colors: {
      text: {
        primary: getColor('text.primary', '#333333'),
        secondary: getColor('text.secondary', '#666666'),
        disabled: getColor('text.disabled', '#999999'),
      },
      background: {
        paper: getColor('background.paper', '#ffffff'),
        secondary: getColor('background.secondary', '#f5f5f5'),
        hover: getColor('action.hover', '#f5f5f5'),
        active: getColor('action.active', '#e0e0e0'),
      },
      primary: {
        main: getColor('primary.main', '#3366CC'),
        hover: getColor('primary.light', '#4477DD'),
        active: getColor('primary.dark', '#2255BB'),
      },
      border: {
        main: getColor('border.primary', '#e0e0e0'),
      },
    },
    typography: {
      sizes: {
        small: getTypography('size.small', '0.875rem') as string,
        medium: getTypography('size.medium', '1rem') as string,
        large: getTypography('size.large', '1.25rem') as string,
      },
      weights: {
        normal: getTypography('weights.normal', '400') as string,
        semibold: getTypography('weights.semibold', '600') as string,
      },
    },
    spacing: {
      small: {
        x: getSpacing('2', '0.5rem'),
        y: getSpacing('1', '0.25rem'),
      },
      medium: {
        x: getSpacing('3', '0.75rem'),
        y: getSpacing('2', '0.5rem'),
      },
      large: {
        x: getSpacing('4', '1rem'),
        y: getSpacing('3', '0.75rem'),
      },
      content: getSpacing('4', '1rem'),
    },
    borderRadius: {
      none: getBorderRadius('none', '0'),
      md: getBorderRadius('md', '0.375rem'),
      full: getBorderRadius('full', '9999px'),
    },
    transitions: {
      default: getTransition('normal', '0.2s ease'),
    },
  };
}

// Create filtered base components
const FilteredButton = filterTransientProps(styled.button``);
const FilteredDiv = filterTransientProps(styled.div``);

// Styled Components
const TabsContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  position: relative;
`;

const TabsList = styled(FilteredDiv)<{ $variant: TabsProps['variant']; $themeStyles: ThemeStyles; responsive?: boolean }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing.medium.x};
  border-bottom: ${props =>
    props.$variant === 'underline' ? `1px solid ${props.$themeStyles.colors.border.main}` : 'none'};
  margin-bottom: ${props => props.$themeStyles.spacing.content};
  overflow-x: ${props => props.responsive ? 'auto' : 'visible'};
  scrollbar-width: thin;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.$themeStyles.colors.border.main};
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    gap: ${props => props.$themeStyles.spacing.small.x};
    ${props => props.responsive && `
      flex-wrap: nowrap;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 4px;
    `}
  }
`;

const TabButton = styled(FilteredButton)<{
  $active: boolean;
  $variant: TabsProps['variant'];
  $size: TabsProps['size'];
  disabled?: boolean;
  $themeStyles: ThemeStyles;
}>`
  padding: ${props => {
    const spacing = props.$themeStyles.spacing[props.$size || 'medium'];
    return `${spacing.y} ${spacing.x}`;
  }};
  font-size: ${props => props.$themeStyles.typography.sizes[props.$size || 'medium']};
  font-weight: ${props =>
    props.$active
      ? props.$themeStyles.typography.weights.semibold
      : props.$themeStyles.typography.weights.normal};
  border: none;
  background: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  color: ${props =>
    props.disabled
      ? props.$themeStyles.colors.text.disabled
      : props.$active
      ? props.$themeStyles.colors.text.primary
      : props.$themeStyles.colors.text.secondary};
  transition: ${props => props.$themeStyles.transitions.default};
  position: relative;
  white-space: nowrap;
  background-color: ${props => {
    if (props.disabled) return 'transparent';
    if (props.$active) {
      switch (props.$variant) {
        case 'pills':
          return props.$themeStyles.colors.primary.main;
        default:
          return 'transparent';
      }
    }
    return 'transparent';
  }};
  border-bottom: ${props => {
    if (props.$variant === 'underline' && props.$active) {
      return `2px solid ${props.$themeStyles.colors.primary.main}`;
    }
    return props.$variant === 'underline' ? '2px solid transparent' : 'none';
  }};
  border-radius: ${props => {
    switch (props.$variant) {
      case 'pills':
        return props.$themeStyles.borderRadius.full;
      default:
        return props.$themeStyles.borderRadius.none;
    }
  }};
  
  &:hover:not(:disabled) {
    color: ${props =>
      props.$active
        ? props.$themeStyles.colors.primary.hover
        : props.$themeStyles.colors.primary.main};
    background-color: ${props => {
      if (props.$variant === 'pills') {
        return props.$active
          ? props.$themeStyles.colors.primary.hover
          : props.$themeStyles.colors.background.hover;
      }
      return props.$themeStyles.colors.background.hover;
    }};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.$themeStyles.colors.primary.main};
    outline-offset: 2px;
  }
`;

const TabContent = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.content};
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
`;

const OverflowButton = styled.button<{ $themeStyles: ThemeStyles }>`
  display: none;
  background: ${props => props.$themeStyles.colors.background.paper};
  border: 1px solid ${props => props.$themeStyles.colors.border.main};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  padding: ${props => `${props.$themeStyles.spacing.small.y} ${props.$themeStyles.spacing.small.x}`};
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 5;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: flex;
  }
  
  &:hover, &:focus {
    background: ${props => props.$themeStyles.colors.background.hover};
    outline: none;
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.$themeStyles.colors.primary.main};
    outline-offset: 2px;
  }
`;

const OverflowMenu = styled.div<{ isOpen: boolean; $themeStyles: ThemeStyles }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  right: 0;
  background: ${props => props.$themeStyles.colors.background.paper};
  border: 1px solid ${props => props.$themeStyles.colors.border.main};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 10;
  min-width: 150px;
  max-height: 300px;
  overflow-y: auto;
`;

const OverflowMenuItem = styled(FilteredButton)<{ $active: boolean; $themeStyles: ThemeStyles }>`
  display: block;
  width: 100%;
  text-align: left;
  padding: ${props => `${props.$themeStyles.spacing.medium.y} ${props.$themeStyles.spacing.medium.x}`};
  background: ${props => props.$active ? props.$themeStyles.colors.background.active : 'transparent'};
  border: none;
  cursor: pointer;
  color: ${props => props.$active ? props.$themeStyles.colors.primary.main : props.$themeStyles.colors.text.primary};
  font-weight: ${props => props.$active ? props.$themeStyles.typography.weights.semibold : props.$themeStyles.typography.weights.normal};
  
  &:hover, &:focus {
    background: ${props => props.$themeStyles.colors.background.hover};
    outline: none;
  }
`;

/**
 * Tabs component for displaying content in a tabbed interface.
 * Supports different variants (default, pills, underline) and sizes.
 * Enhanced with responsive behavior for mobile devices.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  className,
  responsive = true,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false);
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
    setIsOverflowMenuOpen(false);
    
    // Scroll the active tab into view
    if (responsive && tabsListRef.current) {
      const tabElement = tabsListRef.current.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement;
      if (tabElement) {
        const containerWidth = tabsListRef.current.offsetWidth;
        const tabLeft = tabElement.offsetLeft;
        const tabWidth = tabElement.offsetWidth;
        
        if (tabLeft < tabsListRef.current.scrollLeft) {
          // Tab is to the left of the visible area
          tabsListRef.current.scrollLeft = tabLeft;
        } else if (tabLeft + tabWidth > tabsListRef.current.scrollLeft + containerWidth) {
          // Tab is to the right of the visible area
          tabsListRef.current.scrollLeft = tabLeft + tabWidth - containerWidth;
        }
      }
    }
  };
  
  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOverflowMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle overflow menu
  const toggleOverflowMenu = () => {
    setIsOverflowMenuOpen(!isOverflowMenuOpen);
  };

  return (
    <TabsContainer className={className} fullWidth={fullWidth} ref={containerRef}>
      <TabsList 
        $variant={variant} 
        $themeStyles={themeStyles}
        responsive={responsive}
        ref={tabsListRef}
        role="tablist"
      >
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            $variant={variant}
            $size={size}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            $themeStyles={themeStyles}
            data-tab-id={tab.id}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsList>
      
      {responsive && (
        <>
          <OverflowButton 
            onClick={toggleOverflowMenu} 
            $themeStyles={themeStyles}
            aria-label="More tabs"
            aria-expanded={isOverflowMenuOpen}
            aria-haspopup="true"
          >
            •••
          </OverflowButton>
          
          <OverflowMenu isOpen={isOverflowMenuOpen} $themeStyles={themeStyles} role="menu">
            {tabs.map(tab => (
              <OverflowMenuItem
                key={tab.id}
                $active={activeTab === tab.id}
                $themeStyles={themeStyles}
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
                role="menuitem"
              >
                {tab.label}
              </OverflowMenuItem>
            ))}
          </OverflowMenu>
        </>
      )}

      {tabs.map(tab => (
        <TabContent
          key={tab.id}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          id={`tabpanel-${tab.id}`}
          hidden={activeTab !== tab.id}
          $themeStyles={themeStyles}
        >
          {tab.content}
        </TabContent>
      ))}
    </TabsContainer>
  );
};

export default Tabs;
