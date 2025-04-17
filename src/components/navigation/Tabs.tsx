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
  spacing2: string;
  spacing1: string;
  spacing3: string;
  spacing4: string;
  spacing6: string;
  borderPrimary: string;
  fontSizeSm: string;
  fontSizeLg: string;
  fontSizeBase: string;
  fontWeightSemibold: string;
  fontWeightNormal: string;
  transitions: string;
  textPrimary: string;
  textSecondary: string;
  borderRadiusFull: string;
  borderRadiusNone: string;
  borderRadiusMd: string;
  primary: string;
  backgroundPaper: string;
  backgroundSecondary: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getSpacing, getBorderRadius, getTypography, getTransition } = themeContext;

  return {
    spacing1: getSpacing('1', '0.25rem'),
    spacing2: getSpacing('2', '0.5rem'),
    spacing3: getSpacing('3', '0.75rem'),
    spacing4: getSpacing('4', '1rem'),
    spacing6: getSpacing('6', '1.5rem'),
    borderPrimary: getColor('border.primary', '#e0e0e0'),
    fontSizeSm: getTypography('scale.sm', '0.875rem') as string,
    fontSizeLg: getTypography('scale.lg', '1.25rem') as string,
    fontSizeBase: getTypography('scale.base', '1rem') as string,
    fontWeightSemibold: getTypography('weights.semibold', '600') as string,
    fontWeightNormal: getTypography('weights.normal', '400') as string,
    transitions: getTransition('normal', '0.2s ease'),
    textPrimary: getColor('text.primary', '#333333'),
    textSecondary: getColor('text.secondary', '#666666'),
    borderRadiusFull: getBorderRadius('full', '9999px'),
    borderRadiusNone: getBorderRadius('none', '0'),
    borderRadiusMd: getBorderRadius('md', '0.375rem'),
    primary: getColor('primary', '#3366CC'),
    backgroundPaper: getColor('background.paper', '#ffffff'),
    backgroundSecondary: getColor('background.secondary', '#f5f5f5'),
  };
}

// Styled Components
const TabsContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
`;

const TabsList = styled.div<{ variant: TabsProps['variant']; $themeStyles: ThemeStyles }>`
  display: flex;
  gap: ${props => props.$themeStyles.spacing2};
  border-bottom: ${props =>
    props.variant === 'underline' ? `1px solid ${props.$themeStyles.borderPrimary}` : 'none'};
  margin-bottom: ${props => props.$themeStyles.spacing4};
`;

const TabButton = styled.button<{
  active: boolean;
  variant: TabsProps['variant'];
  size: TabsProps['size'];
  disabled?: boolean;
  $themeStyles: ThemeStyles;
}>`
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return `${props.$themeStyles.spacing1} ${props.$themeStyles.spacing2}`;
      case 'large':
        return `${props.$themeStyles.spacing3} ${props.$themeStyles.spacing4}`;
      default:
        return `${props.$themeStyles.spacing2} ${props.$themeStyles.spacing3}`;
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return props.$themeStyles.fontSizeSm;
      case 'large':
        return props.$themeStyles.fontSizeLg;
      default:
        return props.$themeStyles.fontSizeBase;
    }
  }};
  font-weight: ${props =>
    props.active ? props.$themeStyles.fontWeightSemibold : props.$themeStyles.fontWeightNormal};
  border: none;
  background: none;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  transition: all ${props => props.$themeStyles.transitions};
  color: ${props =>
    props.active ? props.$themeStyles.textPrimary : props.$themeStyles.textSecondary};
  border-radius: ${props => {
    switch (props.variant) {
      case 'pills':
        return props.$themeStyles.borderRadiusFull;
      default:
        return props.$themeStyles.borderRadiusNone;
    }
  }};
  background-color: ${props => {
    if (props.active) {
      switch (props.variant) {
        case 'pills':
          return props.$themeStyles.primary;
        case 'underline':
          return 'transparent';
        default:
          return props.$themeStyles.backgroundPaper;
      }
    }
    return 'transparent';
  }};
  border-bottom: ${props => {
    if (props.variant === 'underline' && props.active) {
      return `2px solid ${props.$themeStyles.primary}`;
    }
    return 'none';
  }};

  &:hover {
    color: ${props => props.$themeStyles.primary};
    background-color: ${props => {
      if (props.variant === 'pills') {
        return props.active ? props.$themeStyles.primary : props.$themeStyles.backgroundSecondary;
      }
      return 'transparent';
    }};
  }
`;

const TabContent = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing4};
  background-color: ${props => props.$themeStyles.backgroundPaper};
  border-radius: ${props => props.$themeStyles.borderRadiusMd};
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
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);
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
