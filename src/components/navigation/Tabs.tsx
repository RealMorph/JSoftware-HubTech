import React, { useState } from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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

// Styled Components
const TabsContainer = styled.div<{ fullWidth?: boolean }>`
  width: ${props => props.fullWidth ? '100%' : 'auto'};
`;

const TabsList = styled.div<{ variant: TabsProps['variant'] }>`
  display: flex;
  gap: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.2')};
  border-bottom: ${props => props.variant === 'underline' ? `1px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.border.primary')}` : 'none'};
  margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
`;

const TabButton = styled.button<{ 
  active: boolean; 
  variant: TabsProps['variant'];
  size: TabsProps['size'];
  disabled?: boolean;
}>`
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return `${getThemeValue(props.theme as ThemeConfig, 'spacing.1')} ${getThemeValue(props.theme as ThemeConfig, 'spacing.2')}`;
      case 'large':
        return `${getThemeValue(props.theme as ThemeConfig, 'spacing.3')} ${getThemeValue(props.theme as ThemeConfig, 'spacing.4')}`;
      default:
        return `${getThemeValue(props.theme as ThemeConfig, 'spacing.2')} ${getThemeValue(props.theme as ThemeConfig, 'spacing.3')}`;
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return getThemeValue(props.theme as ThemeConfig, 'typography.scale.sm');
      case 'large':
        return getThemeValue(props.theme as ThemeConfig, 'typography.scale.lg');
      default:
        return getThemeValue(props.theme as ThemeConfig, 'typography.scale.base');
    }
  }};
  font-weight: ${props => props.active ? getThemeValue(props.theme as ThemeConfig, 'typography.weights.semibold') : getThemeValue(props.theme as ThemeConfig, 'typography.weights.normal')};
  border: none;
  background: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all ${props => getThemeValue(props.theme as ThemeConfig, 'transitions.normal')};
  color: ${props => props.active ? getThemeValue(props.theme as ThemeConfig, 'colors.text.primary') : getThemeValue(props.theme as ThemeConfig, 'colors.text.secondary')};
  border-radius: ${props => {
    switch (props.variant) {
      case 'pills':
        return getThemeValue(props.theme as ThemeConfig, 'borderRadius.full');
      default:
        return getThemeValue(props.theme as ThemeConfig, 'borderRadius.none');
    }
  }};
  background-color: ${props => {
    if (props.active) {
      switch (props.variant) {
        case 'pills':
          return getThemeValue(props.theme as ThemeConfig, 'colors.primary');
        case 'underline':
          return 'transparent';
        default:
          return getThemeValue(props.theme as ThemeConfig, 'colors.background.paper');
      }
    }
    return 'transparent';
  }};
  border-bottom: ${props => {
    if (props.variant === 'underline' && props.active) {
      return `2px solid ${getThemeValue(props.theme as ThemeConfig, 'colors.primary')}`;
    }
    return 'none';
  }};

  &:hover {
    color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.primary')};
    background-color: ${props => {
      if (props.variant === 'pills') {
        return props.active ? getThemeValue(props.theme as ThemeConfig, 'colors.primary') : getThemeValue(props.theme as ThemeConfig, 'colors.background.secondary');
      }
      return 'transparent';
    }};
  }
`;

const TabContent = styled.div`
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  background-color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.background.paper')};
  border-radius: ${props => getThemeValue(props.theme as ThemeConfig, 'borderRadius.md')};
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
  className
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <TabsContainer className={className} fullWidth={fullWidth}>
      <TabsList variant={variant}>
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
        >
          {tab.content}
        </TabContent>
      ))}
    </TabsContainer>
  );
}; 