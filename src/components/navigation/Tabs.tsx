import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

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

// Styled Components
const TabsContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
`;

const TabsList = styled.div<{ variant: TabsProps['variant']; $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing.medium.x};
  border-bottom: ${props =>
    props.variant === 'underline' ? `1px solid ${props.$themeStyles.colors.border.main}` : 'none'};
  margin-bottom: ${props => props.$themeStyles.spacing.content};
`;

const TabButton = styled.button<{
  active: boolean;
  variant: TabsProps['variant'];
  size: TabsProps['size'];
  disabled?: boolean;
  $themeStyles: ThemeStyles;
}>`
  padding: ${props => {
    const spacing = props.$themeStyles.spacing[props.size || 'medium'];
    return `${spacing.y} ${spacing.x}`;
  }};
  font-size: ${props => props.$themeStyles.typography.sizes[props.size || 'medium']};
  font-weight: ${props =>
    props.active
      ? props.$themeStyles.typography.weights.semibold
      : props.$themeStyles.typography.weights.normal};
  border: none;
  background: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  transition: all ${props => props.$themeStyles.transitions.default};
  color: ${props =>
    props.disabled
      ? props.$themeStyles.colors.text.disabled
      : props.active
      ? props.$themeStyles.colors.text.primary
      : props.$themeStyles.colors.text.secondary};
  border-radius: ${props =>
    props.variant === 'pills'
      ? props.$themeStyles.borderRadius.full
      : props.$themeStyles.borderRadius.none};
  background-color: ${props => {
    if (props.disabled) return 'transparent';
    if (props.active) {
      switch (props.variant) {
        case 'pills':
          return props.$themeStyles.colors.primary.main;
        case 'underline':
          return 'transparent';
        default:
          return props.$themeStyles.colors.background.paper;
      }
    }
    return 'transparent';
  }};
  border-bottom: ${props => {
    if (props.variant === 'underline' && props.active) {
      return `2px solid ${props.$themeStyles.colors.primary.main}`;
    }
    return 'none';
  }};

  &:hover:not(:disabled) {
    color: ${props =>
      props.active
        ? props.$themeStyles.colors.primary.hover
        : props.$themeStyles.colors.primary.main};
    background-color: ${props => {
      if (props.variant === 'pills') {
        return props.active
          ? props.$themeStyles.colors.primary.hover
          : props.$themeStyles.colors.background.hover;
      }
      return 'transparent';
    }};
  }

  &:active:not(:disabled) {
    color: ${props => props.$themeStyles.colors.primary.active};
    background-color: ${props =>
      props.variant === 'pills'
        ? props.$themeStyles.colors.primary.active
        : props.$themeStyles.colors.background.active};
  }
`;

const TabContent = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.content};
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
`;

/**
 * Tabs component for displaying content in a tabbed interface.
 * Supports different variants (default, pills, underline) and sizes.
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <TabsContainer className={className} fullWidth={fullWidth}>
      <TabsList variant={variant} $themeStyles={themeStyles}>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            variant={variant}
            size={size}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            $themeStyles={themeStyles}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabsList>

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
