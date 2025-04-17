import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { Tab } from './StyledTab';
import { useTabTheme } from './useTabTheme';
import { TabAnimationOptions } from './tab-theme-extension';

// Extend StyledTabProps since it's not exported from StyledTab
interface AnimatedTabProps extends React.ComponentProps<typeof Tab> {
  isNew?: boolean;
  animationType?: 'switch' | 'hover' | 'dragPreview';
  active?: boolean;
  styles?: any;
  variant?: 'default' | 'pill' | 'underlined';
  tabShape?: 'rectangle' | 'rounded' | 'pill' | 'underlined';
  separatorStyle?: 'none' | 'line' | 'dot' | 'space';
}

// Keyframes for different animation types
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = (distance: string) => keyframes`
  from { transform: translateX(${distance}); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const scaleIn = (scale: number) => keyframes`
  from { transform: scale(${scale}); }
  to { transform: scale(1); }
`;

// Helper function to generate animation CSS based on animation options
const getAnimationStyles = (
  options: TabAnimationOptions,
  animationType: 'switch' | 'hover' | 'dragPreview' = 'switch'
) => {
  const { duration, easing, slideDistance, fadeOpacity, scaleEffect } = options;
  const animationDuration = `${duration}ms`;

  // Determine which animation to apply based on type
  if (animationType === 'switch' && options.enableTabSwitch) {
    return css`
      animation:
        ${fadeIn} ${animationDuration} ${easing} forwards,
        ${slideDistance
          ? css`
              ${slideIn(slideDistance)} ${animationDuration} ${easing} forwards
            `
          : ''};
    `;
  }

  if (animationType === 'dragPreview' && options.enableDragPreview) {
    return css`
      animation: ${scaleIn(scaleEffect || 0.97)} ${animationDuration} ${easing} forwards;
    `;
  }

  return '';
};

// Animated version of Tab
const AnimatedStyledTab = styled(Tab)<
  AnimatedTabProps & {
    animationOptions?: TabAnimationOptions;
  }
>`
  transition:
    background-color ${props => props.animationOptions?.duration || 200}ms
      ${props => props.animationOptions?.easing || 'ease-in-out'},
    box-shadow ${props => props.animationOptions?.duration || 200}ms
      ${props => props.animationOptions?.easing || 'ease-in-out'},
    opacity ${props => props.animationOptions?.duration || 200}ms
      ${props => props.animationOptions?.easing || 'ease-in-out'},
    transform ${props => props.animationOptions?.duration || 200}ms
      ${props => props.animationOptions?.easing || 'ease-in-out'};

  ${props =>
    props.isNew &&
    props.animationOptions &&
    getAnimationStyles(props.animationOptions, props.animationType)}

  &:hover {
    ${props => (props.active ? '' : 'transform: translateY(-2px);')}
  }
`;

// Animated container for tab content
const AnimatedContent = styled.div<{
  active: boolean;
  animationOptions?: TabAnimationOptions;
}>`
  padding: 16px;
  display: ${props => (props.active ? 'block' : 'none')};
  animation: ${props =>
    props.active && props.animationOptions?.enableTabSwitch
      ? css`
          ${fadeIn} ${props.animationOptions.duration}ms ${props.animationOptions.easing}
        `
      : 'none'};
`;

// Wrapper for grouped tabs with animation
const AnimatedGroupWrapper = styled.div<{
  collapsed: boolean;
  animationOptions?: TabAnimationOptions;
}>`
  overflow: hidden;
  max-height: ${props => (props.collapsed ? '0' : '1000px')};
  opacity: ${props => (props.collapsed ? 0 : 1)};
  transition:
    max-height ${props => props.animationOptions?.duration || 200}ms
      ${props => props.animationOptions?.easing || 'ease-in-out'},
    opacity ${props => props.animationOptions?.duration || 200}ms
      ${props => props.animationOptions?.easing || 'ease-in-out'};
`;

// AnimatedTab component with theme-aware animations
export const AnimatedTab: React.FC<AnimatedTabProps> = ({
  isNew = false,
  animationType = 'switch',
  ...props
}) => {
  const tabTheme = useTabTheme();
  const animationOptions = tabTheme.tabs.animation;

  return (
    <AnimatedStyledTab
      {...props}
      animationOptions={animationOptions}
      animationType={animationType}
      isNew={isNew}
    />
  );
};

// TabContent component with animations
interface TabContentProps {
  id: string;
  active: boolean;
  children: React.ReactNode;
}

export const AnimatedTabContent: React.FC<TabContentProps> = ({ id, active, children }) => {
  const tabTheme = useTabTheme();
  const [isVisible, setIsVisible] = useState(active);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (active) {
      setIsVisible(true);
    } else {
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, tabTheme.tabs.animation.duration);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [active, tabTheme.tabs.animation.duration]);

  if (!isVisible && !active) return null;

  return (
    <AnimatedContent
      id={`tab-content-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      active={active}
      animationOptions={tabTheme.tabs.animation}
    >
      {children}
    </AnimatedContent>
  );
};

// TabGroup component with collapse/expand animations
interface AnimatedTabGroupProps {
  id: string;
  collapsed: boolean;
  children: React.ReactNode;
}

export const AnimatedTabGroup: React.FC<AnimatedTabGroupProps> = ({ id, collapsed, children }) => {
  const tabTheme = useTabTheme();

  return (
    <AnimatedGroupWrapper
      id={`tab-group-${id}`}
      collapsed={collapsed}
      animationOptions={tabTheme.tabs.animation}
    >
      {children}
    </AnimatedGroupWrapper>
  );
};

// Demo component to showcase tab animations
export const TabAnimationsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [tabs, setTabs] = useState([
    { id: 'tab1', label: 'Dashboard' },
    { id: 'tab2', label: 'Reports' },
    { id: 'tab3', label: 'Settings' },
  ]);
  const [groupCollapsed, setGroupCollapsed] = useState(false);
  const [newTabAdded, setNewTabAdded] = useState(false);

  const handleAddTab = () => {
    const newTab = {
      id: `tab${tabs.length + 1}`,
      label: `New Tab ${tabs.length + 1}`,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setNewTabAdded(true);
    setTimeout(() => setNewTabAdded(false), 1000);
  };

  const handleRemoveTab = (id: string) => {
    const newTabs = tabs.filter(tab => tab.id !== id);
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
    setTabs(newTabs);
  };

  return (
    <div>
      <h3>Tab Animation Demo</h3>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleAddTab}>Add New Tab</button>
        <button onClick={() => setGroupCollapsed(!groupCollapsed)} style={{ marginLeft: '10px' }}>
          {groupCollapsed ? 'Expand Group' : 'Collapse Group'}
        </button>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '200px', marginRight: '20px' }}>
          <h4>Tab Group</h4>
          <AnimatedTabGroup id="demo-group" collapsed={groupCollapsed}>
            <div style={{ border: '1px solid #ddd', padding: '10px' }}>
              {tabs.map(tab => (
                <AnimatedTab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onClose={() => handleRemoveTab(tab.id)}
                  isNew={newTabAdded && tab.id === tabs[tabs.length - 1]?.id}
                  tabShape="rectangle"
                />
              ))}
            </div>
          </AnimatedTabGroup>
        </div>

        <div style={{ flex: 1 }}>
          {tabs.map(tab => (
            <AnimatedTabContent key={tab.id} id={tab.id} active={activeTab === tab.id}>
              <h4>{tab.label} Content</h4>
              <p>This is the content for {tab.label}.</p>
            </AnimatedTabContent>
          ))}
        </div>
      </div>
    </div>
  );
};
