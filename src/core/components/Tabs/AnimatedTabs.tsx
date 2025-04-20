import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useAnimationPreset } from '../../animation/hooks/useAnimationPreset';
import { useMotionPreference } from '../../animation/hooks/useMotionPreference';

// Types for tab items
export interface TabItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

// Props for the AnimatedTabs component
export interface AnimatedTabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string | number;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'contained' | 'pills' | 'underlined';
  animationType?: 'fade' | 'scale' | 'rotate';
  animationDuration?: number;
  onChange?: (tabId: string | number) => void;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}

/**
 * AnimatedTabs component with smooth transitions between tab content
 */
const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
  tabs,
  defaultActiveTab,
  orientation = 'horizontal',
  variant = 'default',
  animationType = 'fade',
  animationDuration = 300,
  onChange,
  className = '',
  tabClassName = '',
  contentClassName = '',
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<string | number>(
    defaultActiveTab || (tabs.length > 0 ? tabs[0].id : '')
  );
  const [indicatorStyle, setIndicatorStyle] = useState<CSSProperties>({});
  const tabRefs = useRef<Map<string | number, HTMLButtonElement>>(new Map());

  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();

  // Apply motion preferences
  const actualAnimationDuration = shouldUseMotion() 
    ? animationDuration 
    : getReducedMotionDuration(animationDuration);

  // Update the indicator position when the active tab changes
  useEffect(() => {
    const activeTabElement = tabRefs.current.get(activeTab);
    if (activeTabElement && variant !== 'pills') {
      if (orientation === 'horizontal') {
        setIndicatorStyle({
          left: `${activeTabElement.offsetLeft}px`,
          width: `${activeTabElement.offsetWidth}px`,
          transition: shouldUseMotion() 
            ? `left ${actualAnimationDuration}ms ${theme.animation.easing.easeInOut}, width ${actualAnimationDuration}ms ${theme.animation.easing.easeInOut}`
            : 'none',
        });
      } else {
        setIndicatorStyle({
          top: `${activeTabElement.offsetTop}px`,
          height: `${activeTabElement.offsetHeight}px`,
          transition: shouldUseMotion() 
            ? `top ${actualAnimationDuration}ms ${theme.animation.easing.easeInOut}, height ${actualAnimationDuration}ms ${theme.animation.easing.easeInOut}`
            : 'none',
        });
      }
    }
  }, [activeTab, orientation, variant, actualAnimationDuration, theme, shouldUseMotion]);

  // Handle tab change
  const handleTabChange = (tabId: string | number) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      onChange?.(tabId);
    }
  };

  // Get animation styles for tab content
  const getAnimationStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      transition: shouldUseMotion() 
        ? `opacity ${actualAnimationDuration}ms ${theme.animation.easing.easeInOut}, transform ${actualAnimationDuration}ms ${theme.animation.easing.easeInOut}`
        : 'none',
    };

    switch (animationType) {
      case 'fade':
        return {
          ...baseStyles,
          opacity: 1,
        };
      case 'scale':
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'scale(1)',
        };
      case 'rotate':
        return {
          ...baseStyles,
          opacity: 1,
          transform: 'rotate(0deg)',
        };
      default:
        return baseStyles;
    }
  };

  // Get initial animation styles (for enter animation)
  const getInitialAnimationStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
    };

    switch (animationType) {
      case 'fade':
        return {
          ...baseStyles,
          opacity: 0,
        };
      case 'scale':
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'scale(0.95)',
        };
      case 'rotate':
        return {
          ...baseStyles,
          opacity: 0,
          transform: 'rotate(-5deg)',
        };
      default:
        return baseStyles;
    }
  };

  // Get styles for the tab element based on variant
  const getTabStyles = (tabId: string | number, disabled?: boolean): CSSProperties => {
    const isActive = tabId === activeTab;
    const baseStyles: CSSProperties = {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: isActive ? 500 : 400,
      opacity: disabled ? 0.5 : 1,
      border: 'none',
      background: 'transparent',
      transition: `color ${actualAnimationDuration / 2}ms ${theme.animation.easing.easeInOut}, background-color ${actualAnimationDuration / 2}ms ${theme.animation.easing.easeInOut}`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing.sm,
    };

    switch (variant) {
      case 'contained':
        return {
          ...baseStyles,
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          color: isActive ? '#ffffff' : theme.colors.text.primary,
          borderRadius: theme.borderRadius.sm,
        };
      case 'pills':
        return {
          ...baseStyles,
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          color: isActive ? '#ffffff' : theme.colors.text.primary,
          borderRadius: theme.borderRadius.full,
        };
      case 'underlined':
        return {
          ...baseStyles,
          color: isActive ? theme.colors.primary : theme.colors.text.primary,
          borderBottom: isActive ? `2px solid ${theme.colors.primary}` : `2px solid transparent`,
        };
      default:
        return {
          ...baseStyles,
          color: isActive ? theme.colors.primary : theme.colors.text.primary,
        };
    }
  };

  // Determine the appropriate tab container styles based on orientation
  const getTabContainerStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      display: 'flex',
      position: 'relative',
    };

    const borderColor = theme.colors.border || '#e2e8f0'; // Fallback color

    return orientation === 'horizontal'
      ? {
          ...baseStyles,
          borderBottom: variant === 'underlined' ? 'none' : `1px solid ${borderColor}`,
        }
      : {
          ...baseStyles,
          flexDirection: 'column',
          borderRight: variant === 'underlined' ? 'none' : `1px solid ${borderColor}`,
        };
  };

  // Determine indicator styles based on orientation and variant
  const getIndicatorBaseStyles = (): CSSProperties => {
    if (variant === 'pills') return {}; // No indicator for pills variant

    const baseStyles: CSSProperties = {
      position: 'absolute',
      backgroundColor: variant === 'underlined' ? 'transparent' : theme.colors.primary,
    };

    return orientation === 'horizontal'
      ? {
          ...baseStyles,
          bottom: 0,
          height: '2px',
        }
      : {
          ...baseStyles,
          right: 0,
          width: '2px',
        };
  };

  // Get styles for content container
  const getContentContainerStyles = (): CSSProperties => {
    return {
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100px',
      padding: theme.spacing.md,
    };
  };

  // Ref callback to store references to tab elements
  const setTabRef = (el: HTMLButtonElement | null, id: string | number) => {
    if (el) {
      tabRefs.current.set(id, el);
    }
  };

  // Find the active tab content
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={className} data-testid="animated-tabs">
      {/* Tab headers */}
      <div 
        style={getTabContainerStyles()} 
        role="tablist" 
        aria-orientation={orientation}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            ref={(el) => setTabRef(el, tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            style={getTabStyles(tab.id, tab.disabled)}
            className={tabClassName}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
        
        {/* Active tab indicator */}
        {variant !== 'pills' && (
          <div 
            className="tab-indicator" 
            style={{
              ...getIndicatorBaseStyles(),
              ...indicatorStyle,
            }}
          />
        )}
      </div>
      
      {/* Tab content */}
      <div 
        style={getContentContainerStyles()} 
        className={contentClassName}
      >
        <div
          key={String(activeTab)}
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          style={getAnimationStyles()}
        >
          {activeTabContent}
        </div>
      </div>
    </div>
  );
};

export default AnimatedTabs; 