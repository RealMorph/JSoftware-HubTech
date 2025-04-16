import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../theme';
import { TabStyleOptions, TabThemeExtension } from './tab-theme-extension';
import { getTabStyles, getTabAnimations, useTabTheme } from './useTabTheme';
import { ThemeConfig } from '../../theme/theme-persistence';
import { css } from '@emotion/react';

// Extend Emotion's Theme type
declare module '@emotion/react' {
  export interface Theme {
    currentTheme?: ThemeConfig;
  }
}

/**
 * Styled tab container component
 */
interface TabContainerProps {
  variant?: 'default' | 'pill' | 'underlined';
  spacing?: string;
}

export const StyledTabContainer = styled.div<TabContainerProps>`
  display: flex;
  overflow-x: auto;
  background-color: ${props => props.variant === 'pill' ? '#EBF2FA' : '#f5f5f5'};
  border-bottom: ${props => props.variant === 'underlined' ? 'none' : '1px solid #e0e0e0'};
  padding: ${props => props.spacing || '0.5rem'};
  border-radius: ${props => props.variant === 'pill' ? '8px' : '0'};
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
`;

/**
 * Styled tab component
 */
interface StyledTabProps {
  active?: boolean;
  disabled?: boolean;
  styles?: Partial<TabStyleOptions>;
  variant?: 'default' | 'pill' | 'underlined';
  tabShape?: 'rectangle' | 'rounded' | 'pill' | 'underlined';
  separatorStyle?: 'none' | 'line' | 'dot' | 'space';
}

export const StyledTab = styled.div<StyledTabProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  // Base styles
  height: ${props => props.styles?.height || '36px'};
  min-width: ${props => props.styles?.minWidth || '120px'};
  max-width: ${props => props.styles?.maxWidth || '240px'};
  padding: ${props => props.styles?.padding || '0 12px'};
  margin: ${props => props.styles?.margin || '0 2px 0 0'};
  font-weight: ${props => props.styles?.fontWeight || 400};
  text-transform: ${props => props.styles?.textTransform || 'none'};
  box-shadow: ${props => props.styles?.shadow || 'none'};
  opacity: ${props => props.disabled ? 0.5 : props.styles?.opacity || 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  // Tab shape variants
  border-radius: ${props => {
    if (props.tabShape === 'pill') return '9999px';
    if (props.tabShape === 'rounded') return props.styles?.borderRadius || '4px 4px 0 0';
    if (props.tabShape === 'underlined') return '0';
    return '0';
  }};
  border: 1px solid rgba(0, 0, 0, 0.08);
  margin: 4px;
  
  // Pill specific styles for both active and inactive states
  ${props => props.tabShape === 'pill' && `
    padding: 0 16px;
    background-color: ${props.active ? '#0052CC' : '#F0F5FA'};
    color: ${props.active ? '#FFFFFF' : '#2C3E50'};
    border: 1px solid ${props.active ? '#0047B3' : '#C7D4E2'};
    font-weight: ${props.active ? '600' : '400'};
    box-shadow: ${props.active ? '0 2px 4px rgba(0, 82, 204, 0.2)' : 'none'};
    
    ${!props.active ? `
      &:hover {
        background-color: #D2DFE9;
        border-color: #4C9AFF;
        color: #1A365D;
      }
    ` : ''}
  `}
  
  // Active state styles  
  ${props => props.active && `
    background-color: ${props.theme?.currentTheme?.colors?.gray?.[50] || '#fff'};
    font-weight: 600;
    box-shadow: ${props.styles?.shadow || '0 2px 4px rgba(0, 0, 0, 0.1)'};
    border: 1px solid rgba(0, 0, 0, 0.15);
    
    ${props.tabShape === 'underlined' ? `
      border-bottom: 2px solid #0052CC;
    ` : ''}
    
    ${props.tabShape === 'pill' ? `
      background-color: #0052CC;
      color: #FFFFFF;
      border: 1px solid #0047B3;
    ` : ''}
  `}
  
  // Separator styles
  ${props => {
    if (props.separatorStyle === 'line') {
      return `
        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 20%;
          height: 60%;
          width: 1px;
          background-color: rgba(0, 0, 0, 0.1);
        }
      `;
    }
    if (props.separatorStyle === 'dot') {
      return `
        &:not(:last-child)::after {
          content: '•';
          position: absolute;
          right: -2px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(0, 0, 0, 0.3);
        }
      `;
    }
    if (props.separatorStyle === 'space') {
      return `
        margin-right: 8px;
      `;
    }
    return '';
  }}
  
  // Transitions for animations
  transition: background-color 0.2s, box-shadow 0.2s, opacity 0.2s, color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => {
      if (props.active) {
        if (props.tabShape === 'pill') {
          return '#0047B3';
        }
        return '';
      }
      return 'rgba(0, 0, 0, 0.05)';
    }};
  }
  
  .tab-icon {
    margin-right: 6px;
    width: ${props => props.styles?.iconSize || '16px'};
    height: ${props => props.styles?.iconSize || '16px'};
  }
  
  .tab-close {
    margin-left: 6px;
    width: ${props => props.styles?.closeButtonSize || '14px'};
    height: ${props => props.styles?.closeButtonSize || '14px'};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: transparent;
    border: none;
    padding: 0;
    color: rgba(0, 0, 0, 0.5);
    font-size: ${props => props.styles?.closeButtonSize || '14px'};
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
`;

/**
 * React Tab component that uses the styled components with theme
 */
interface TabProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  tabShape?: 'rectangle' | 'rounded' | 'pill' | 'underlined';
  separatorStyle?: 'none' | 'line' | 'dot' | 'space';
  customStyles?: Partial<TabStyleOptions>;
}

export const Tab: React.FC<TabProps> = ({
  id,
  label,
  icon,
  active = false,
  disabled = false,
  onClose,
  onClick,
  tabShape = 'rounded',
  separatorStyle = 'none',
  customStyles = {}
}) => {
  const tabTheme = useTabTheme();
  const tabStyles = {
    ...getTabStyles(active ? 'active' : 'default'),
    ...customStyles
  };
  
  return (
    <StyledTab 
      active={active}
      disabled={disabled}
      styles={tabStyles}
      tabShape={tabShape || tabStyles.tabShape}
      separatorStyle={separatorStyle}
      onClick={disabled ? undefined : onClick}
      data-testid={`tab-${id}`}
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
    >
      {icon && <span className="tab-icon">{icon}</span>}
      <span className="tab-label">{label}</span>
      {onClose && (
        <button 
          className="tab-close" 
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && onClose) onClose();
          }}
          aria-label={`Close ${label} tab`}
        >
          ×
        </button>
      )}
    </StyledTab>
  );
};

/**
 * Demo component for the styled tabs
 */
export const TabsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('tab1');
  const [activeTheme, setActiveTheme] = React.useState('blue');
  const tabTheme = useTabTheme();
  
  // Color themes for demo
  const themes = {
    blue: {
      active: '#0052CC',
      hover: '#0047B3',
      inactive: '#E9EFF6'
    },
    green: {
      active: '#00875A',
      hover: '#006644',
      inactive: '#E3FCEF'
    },
    purple: {
      active: '#6554C0',
      hover: '#5243AA',
      inactive: '#EAE6FF'
    }
  };

  const currentColors = themes[activeTheme as keyof typeof themes];

  // Override the tab styles using style attribute instead of customStyles
  const getTabStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? currentColors.active : currentColors.inactive,
    color: isActive ? '#FFFFFF' : '#2C3E50',
    borderColor: isActive ? currentColors.hover : '#C7D4E2'
  });
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setActiveTheme('blue')} style={{ marginRight: '8px' }}>Blue Theme</button>
        <button onClick={() => setActiveTheme('green')} style={{ marginRight: '8px' }}>Green Theme</button>
        <button onClick={() => setActiveTheme('purple')}>Purple Theme</button>
      </div>

      <h3>Standard Tabs</h3>
      <StyledTabContainer>
        <Tab 
          id="tab1" 
          label="Dashboard" 
          active={activeTab === 'tab1'} 
          onClick={() => setActiveTab('tab1')}
          onClose={() => console.log('Close tab 1')}
        />
        <Tab 
          id="tab2" 
          label="Reports" 
          active={activeTab === 'tab2'} 
          onClick={() => setActiveTab('tab2')}
          onClose={() => console.log('Close tab 2')}
        />
        <Tab 
          id="tab3" 
          label="Settings" 
          active={activeTab === 'tab3'} 
          onClick={() => setActiveTab('tab3')}
          onClose={() => console.log('Close tab 3')}
        />
        <Tab 
          id="tab4" 
          label="Disabled Tab" 
          disabled={true}
        />
      </StyledTabContainer>
      
      <h3>Pill Style Tabs with {activeTheme.charAt(0).toUpperCase() + activeTheme.slice(1)} Theme</h3>
      <StyledTabContainer variant="pill" spacing="8px" style={{ backgroundColor: `${currentColors.inactive}40` }}>
        <div 
          id="pill1" 
          style={{
            ...getTabStyle(activeTab === 'pill1'),
            padding: '0 16px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '9999px',
            margin: '0 4px',
            cursor: 'pointer',
            border: `1px solid ${activeTab === 'pill1' ? currentColors.hover : '#C7D4E2'}`
          }}
          onClick={() => setActiveTab('pill1')}
        >
          Home
        </div>
        <div 
          id="pill2" 
          style={{
            ...getTabStyle(activeTab === 'pill2'),
            padding: '0 16px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '9999px',
            margin: '0 4px',
            cursor: 'pointer',
            border: `1px solid ${activeTab === 'pill2' ? currentColors.hover : '#C7D4E2'}`
          }}
          onClick={() => setActiveTab('pill2')}
        >
          Analytics
        </div>
        <div 
          id="pill3" 
          style={{
            ...getTabStyle(activeTab === 'pill3'),
            padding: '0 16px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '9999px',
            margin: '0 4px',
            cursor: 'pointer',
            border: `1px solid ${activeTab === 'pill3' ? currentColors.hover : '#C7D4E2'}`
          }}
          onClick={() => setActiveTab('pill3')}
        >
          Projects
        </div>
      </StyledTabContainer>
      
      <h3>Underlined Tabs</h3>
      <StyledTabContainer variant="underlined">
        <div 
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: activeTab === 'underlined1' ? `2px solid ${currentColors.active}` : '2px solid transparent'
          }}
          onClick={() => setActiveTab('underlined1')}
        >
          Overview
        </div>
        <div 
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: activeTab === 'underlined2' ? `2px solid ${currentColors.active}` : '2px solid transparent'
          }}
          onClick={() => setActiveTab('underlined2')}
        >
          Activity
        </div>
        <div 
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            borderBottom: activeTab === 'underlined3' ? `2px solid ${currentColors.active}` : '2px solid transparent'
          }}
          onClick={() => setActiveTab('underlined3')}
        >
          Timeline
        </div>
      </StyledTabContainer>
      
      <h3>Tabs with Separators</h3>
      <StyledTabContainer>
        <Tab 
          id="sep1" 
          label="Files" 
          active={activeTab === 'sep1'} 
          onClick={() => setActiveTab('sep1')}
          separatorStyle="line"
        />
        <Tab 
          id="sep2" 
          label="Documents" 
          active={activeTab === 'sep2'} 
          onClick={() => setActiveTab('sep2')}
          separatorStyle="line"
        />
        <Tab 
          id="sep3" 
          label="Media" 
          active={activeTab === 'sep3'} 
          onClick={() => setActiveTab('sep3')}
          separatorStyle="line"
        />
      </StyledTabContainer>
    </div>
  );
}; 