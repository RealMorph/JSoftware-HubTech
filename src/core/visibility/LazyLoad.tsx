import React, { useState, ReactNode, useEffect } from 'react';
import VisibilitySensor from './VisibilitySensor';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';

export interface LazyLoadProps {
  /**
   * Content to render only when visible
   */
  children: ReactNode;
  
  /**
   * Placeholder to show while content is not yet visible
   * If not provided, an empty div with the same height will be shown
   */
  placeholder?: ReactNode;
  
  /**
   * Height to use for placeholder (only used if placeholder not provided)
   */
  height?: string | number;
  
  /**
   * Width to use for placeholder (only used if placeholder not provided)
   */
  width?: string | number;
  
  /**
   * Offset before element comes into view when it should start loading
   * Positive numbers mean the element will load earlier (before it comes into view)
   */
  offset?: { top?: number; right?: number; bottom?: number; left?: number };
  
  /**
   * Minimum time in milliseconds element should be visible before loading
   * @default 0 
   */
  visibleDelay?: number;
  
  /**
   * Whether to show a fade-in animation when content appears
   * @default true
   */
  fadeIn?: boolean;
  
  /**
   * Fade-in animation duration in milliseconds
   * @default 300
   */
  fadeInDuration?: number;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Whether to trigger once and then stop monitoring visibility
   * @default true
   */
  triggerOnce?: boolean;
  
  /**
   * Additional styles to apply to the container
   */
  style?: React.CSSProperties;
  
  /**
   * Whether to use partial visibility to trigger loading
   * @default true 
   */
  partialVisibility?: boolean;
}

/**
 * LazyLoad component that renders content only when it becomes visible in the viewport
 * 
 * Features:
 * - Configurable offset for early loading
 * - Placeholder support
 * - Fade-in animation
 * - TypeScript support
 */
export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  placeholder,
  height,
  width,
  offset = { top: 100, right: 0, bottom: 100, left: 0 },
  visibleDelay = 0,
  fadeIn = true,
  fadeInDuration = 300,
  className = '',
  triggerOnce = true,
  style = {},
  partialVisibility = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const themeContext = useDirectTheme();
  const styles = useThemeStyles(themeContext, fadeInDuration);
  
  // Handle visibility change
  const handleVisibilityChange = (visible: boolean) => {
    if (visible && !isVisible) {
      setIsVisible(true);
      
      // After the content is loaded, mark it as rendered after a small delay
      // This allows the fade-in animation to work properly
      if (!hasLoaded) {
        setHasLoaded(true);
        if (fadeIn) {
          setTimeout(() => {
            setIsRendered(true);
          }, 50); // Small delay to ensure DOM has updated
        } else {
          setIsRendered(true);
        }
      }
    }
  };
  
  // If fadeIn is disabled, immediately set isRendered to true when hasLoaded changes
  useEffect(() => {
    if (!fadeIn && hasLoaded) {
      setIsRendered(true);
    }
  }, [fadeIn, hasLoaded]);
  
  // Default placeholder style
  const placeholderStyle = {
    height: height || '100%',
    width: width || '100%',
    ...style,
  };
  
  // Render content with fade-in animation
  const renderContent = () => {
    if (!hasLoaded) {
      return placeholder || <div style={placeholderStyle} aria-hidden="true" />;
    }
    
    return (
      <div 
        className={`${fadeIn ? styles.fadeIn : ''} ${isRendered ? styles.visible : ''}`}
        style={style}
      >
        {children}
      </div>
    );
  };
  
  return (
    <VisibilitySensor
      onChange={handleVisibilityChange}
      offset={offset}
      minVisibleTime={visibleDelay}
      partialVisibility={partialVisibility}
      triggerOnce={triggerOnce}
      className={className}
    >
      {renderContent()}
    </VisibilitySensor>
  );
};

// Theme styles for the component
const useThemeStyles = (theme: DirectThemeContextType, duration: number) => ({
  fadeIn: {
    opacity: 0,
    transition: `opacity ${duration}ms ${theme.getTransition('timing.easeInOut', 'ease-in-out')}`,
  },
  visible: {
    opacity: 1,
  },
});

export default LazyLoad; 