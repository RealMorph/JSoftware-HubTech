import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import OriginalVisibilitySensor from 'react-visibility-sensor';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';

export interface VisibilitySensorProps {
  /**
   * Content to render inside the visibility sensor
   */
  children: ReactNode;
  
  /**
   * Function called when visibility changes
   */
  onChange?: (isVisible: boolean) => void;
  
  /**
   * Minimum time (in ms) the element needs to be visible before triggering onChange
   * @default 0
   */
  minVisibleTime?: number;
  
  /**
   * Offset to determine visibility (in px)
   * @default 0
   */
  offset?: { top?: number; right?: number; bottom?: number; left?: number };
  
  /**
   * Whether to trigger once and then stop monitoring
   * @default false
   */
  partialVisibility?: boolean;
  
  /**
   * Whether to trigger once and then stop monitoring
   * @default false
   */
  triggerOnce?: boolean;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Function to run when the element first becomes visible
   */
  onFirstVisible?: () => void;
  
  /**
   * Function to run when the element first becomes invisible
   */
  onFirstInvisible?: () => void;
  
  /**
   * Additional styles to apply to the container
   */
  style?: React.CSSProperties;
}

/**
 * Enhanced Visibility Sensor component
 * 
 * Wraps react-visibility-sensor with additional functionality including:
 * - Minimum visible time
 * - First visibility callbacks
 * - Theme integration
 * - TypeScript support
 */
export const VisibilitySensor: React.FC<VisibilitySensorProps> = ({
  children,
  onChange,
  minVisibleTime = 0,
  offset = { top: 0, right: 0, bottom: 0, left: 0 },
  partialVisibility = false,
  triggerOnce = false,
  className,
  onFirstVisible,
  onFirstInvisible,
  style,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [hasBeenInvisible, setHasBeenInvisible] = useState(false);
  const [visibleStartTime, setVisibleStartTime] = useState<number | null>(null);
  const themeContext = useDirectTheme();
  const styles = useThemeStyles(themeContext);
  
  const handleVisibilityChange = useCallback((visible: boolean) => {
    if (visible) {
      if (!isVisible) {
        // Element just became visible
        setVisibleStartTime(Date.now());
      }
      
      // Check if minVisibleTime has elapsed
      if (minVisibleTime > 0) {
        if (visibleStartTime !== null && Date.now() - visibleStartTime >= minVisibleTime) {
          setIsVisible(true);
          if (!hasBeenVisible) {
            setHasBeenVisible(true);
            onFirstVisible?.();
          }
          onChange?.(true);
        }
      } else {
        setIsVisible(true);
        if (!hasBeenVisible) {
          setHasBeenVisible(true);
          onFirstVisible?.();
        }
        onChange?.(true);
      }
    } else {
      setVisibleStartTime(null);
      setIsVisible(false);
      
      if (!hasBeenInvisible) {
        setHasBeenInvisible(true);
        onFirstInvisible?.();
      }
      
      onChange?.(false);
    }
  }, [
    isVisible, 
    hasBeenVisible, 
    hasBeenInvisible, 
    minVisibleTime, 
    onChange, 
    onFirstVisible, 
    onFirstInvisible, 
    visibleStartTime
  ]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setVisibleStartTime(null);
    };
  }, []);

  return (
    <OriginalVisibilitySensor
      onChange={handleVisibilityChange}
      partialVisibility={partialVisibility}
      offset={offset}
      active={!triggerOnce || !hasBeenVisible}
      {...rest}
    >
      <div className={`${styles.container} ${className || ''}`} style={style}>
        {children}
      </div>
    </OriginalVisibilitySensor>
  );
};

// Theme styles for the component
const useThemeStyles = (theme: DirectThemeContextType) => ({
  container: {
    transition: theme.getTransition('standard', '0.3s ease'),
  }
});

export default VisibilitySensor; 