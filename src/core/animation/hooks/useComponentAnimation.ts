import { useCallback, useState, useEffect } from 'react';
import { useAnimation } from '../AnimationProvider';
import { AnimationType, DirectionType, DurationType, EasingType } from '../types';

/**
 * Interface for component animation props
 */
export interface ComponentAnimationProps {
  /**
   * Whether the component is visible/mounted
   */
  isVisible?: boolean;
  
  /**
   * Type of animation
   */
  animationType?: AnimationType;
  
  /**
   * Direction of animation
   */
  animationDirection?: DirectionType;
  
  /**
   * Duration of animation
   */
  animationDuration?: DurationType;
  
  /**
   * Easing function for animation
   */
  animationEasing?: EasingType;
  
  /**
   * Delay before animation starts (ms)
   */
  animationDelay?: number;
  
  /**
   * Whether animation is disabled
   */
  animationDisabled?: boolean;
  
  /**
   * Callback fired when animation completes
   */
  onAnimationComplete?: () => void;
}

/**
 * Hook for adding animation capabilities to components
 */
export function useComponentAnimation({
  isVisible = true,
  animationType = 'fade',
  animationDirection = 'in',
  animationDuration = 'standard',
  animationEasing = 'easeOut',
  animationDelay = 0,
  animationDisabled = false,
  onAnimationComplete
}: ComponentAnimationProps = {}) {
  const animation = useAnimation();
  const [animationState, setAnimationState] = useState<'initial' | 'animating' | 'complete'>('initial');
  
  // Skip animation if disabled or reduced motion is preferred
  const shouldAnimate = !animationDisabled && 
                       animation.isMotionEnabled && 
                       !animation.isReducedMotion;
  
  // Get animation properties from the animation system
  const variantData = animation.getVariant(animationType, animationDirection);
  const transitionProps = animation.getTransition(animationDuration, animationEasing);
  
  // Initialize animation styles
  const [styles, setStyles] = useState(() => {
    // If not animating or not visible, return empty styles
    if (!shouldAnimate || !isVisible) return {};
    
    // Return initial styles
    const initialStyles: Record<string, string> = {};
    Object.entries(variantData).forEach(([key, value]) => {
      if (!key.includes('_to')) {
        initialStyles[key] = value as string;
      }
    });
    return initialStyles;
  });
  
  // Animation effect
  useEffect(() => {
    if (!shouldAnimate || !isVisible) return;
    
    // Set to initial state
    setAnimationState('initial');
    
    // Start with initial styles
    const initialStyles: Record<string, string> = {};
    Object.entries(variantData).forEach(([key, value]) => {
      if (!key.includes('_to')) {
        initialStyles[key] = value as string;
      }
    });
    
    // Add transition property
    initialStyles.transition = `all ${transitionProps.duration} ${transitionProps.easing}`;
    
    // Add will-change if performance settings allow
    if (animation.performance.willChangeEnabled) {
      const properties = Object.keys(variantData)
        .filter(key => !key.includes('_to'))
        .join(', ');
      
      if (properties) {
        initialStyles.willChange = properties;
      }
    }
    
    setStyles(initialStyles);
    
    // Start animation after a frame to ensure initial styles are applied
    const animationFrame = requestAnimationFrame(() => {
      // Small delay to ensure initial styles are applied
      setTimeout(() => {
        setAnimationState('animating');
        
        // Apply final styles
        const finalStyles: Record<string, string> = { ...initialStyles };
        Object.entries(variantData).forEach(([key, value]) => {
          const finalKey = key.replace('_to', '');
          if (key.includes('_to')) {
            finalStyles[finalKey] = value as string;
          }
        });
        
        setStyles(finalStyles);
        
        // Set a timeout to mark animation as complete
        const timeoutDuration = 
          parseFloat(transitionProps.duration) * 1000 + (animationDelay || 0) + 50;
        
        const timeout = setTimeout(() => {
          setAnimationState('complete');
          // Remove will-change after animation completes
          if (animation.performance.willChangeEnabled) {
            setStyles(current => ({ ...current, willChange: 'auto' }));
          }
          
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, timeoutDuration);
        
        return () => clearTimeout(timeout);
      }, animationDelay || 0);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [
    isVisible, 
    shouldAnimate, 
    variantData, 
    transitionProps, 
    animationDelay, 
    animation.performance.willChangeEnabled,
    onAnimationComplete
  ]);
  
  // Animation exit effect
  useEffect(() => {
    if (!shouldAnimate || isVisible || animationState !== 'complete') return;
    
    // Apply exit animation if component becomes invisible
    const exitDirection = animationDirection === 'in' ? 'out' : 'in';
    const exitVariant = animation.getVariant(animationType, exitDirection);
    
    const exitStyles: Record<string, string> = { ...styles };
    Object.entries(exitVariant).forEach(([key, value]) => {
      if (!key.includes('_to')) {
        exitStyles[key] = value as string;
      }
    });
    
    setStyles(exitStyles);
  }, [isVisible, shouldAnimate, animationType, animationDirection, animationState, styles, animation]);
  
  // Method to apply animation styles to element props
  const getAnimationProps = useCallback(() => {
    if (!shouldAnimate) return {};
    
    return {
      style: styles,
      'data-animation-state': animationState,
    };
  }, [shouldAnimate, styles, animationState]);
  
  return {
    getAnimationProps,
    animationState,
    isAnimating: animationState === 'animating',
  };
}

export default useComponentAnimation; 