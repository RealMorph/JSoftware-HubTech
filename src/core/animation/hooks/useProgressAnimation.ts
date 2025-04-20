import { useCallback, useState, useEffect, useMemo } from 'react';
import { useAnimation } from '../AnimationProvider';
import { AnimationType, DirectionType, DurationType, EasingType } from '../types';

/**
 * Interface for progress animation options
 */
export interface ProgressAnimationOptions {
  /**
   * Type of animation to use
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
   * External progress value (0-1)
   */
  progress?: number;
  
  /**
   * Whether animation is disabled
   */
  animationDisabled?: boolean;
  
  /**
   * Callback fired when animation progress changes
   */
  onProgressChange?: (progress: number) => void;
}

interface AnimationValues {
  initialValues: Record<string, any>;
  finalValues: Record<string, any>;
}

/**
 * Hook for adding progress-based animations
 * This allows animations to be precisely controlled based on a progress value (0-1)
 */
export function useProgressAnimation({
  animationType = 'fade',
  animationDirection = 'in',
  animationDuration = 'standard',
  animationEasing = 'easeOut',
  progress = 0,
  animationDisabled = false,
  onProgressChange
}: ProgressAnimationOptions = {}) {
  const animation = useAnimation();
  const [styles, setStyles] = useState<Record<string, string>>({});
  
  // Skip animation if disabled or reduced motion is preferred
  const shouldAnimate = !animationDisabled && 
                       animation.isMotionEnabled && 
                       !animation.isReducedMotion;
  
  // Get animation properties from the animation system
  const variantData = animation.getVariant(animationType, animationDirection);
  const transitionProps = animation.getTransition(animationDuration, animationEasing);
  
  // Prepare animation properties
  const animationProps = useMemo((): AnimationValues => {
    if (!shouldAnimate) {
      return { initialValues: {}, finalValues: {} };
    }
    
    const initialValues: Record<string, any> = {};
    const finalValues: Record<string, any> = {};
    
    // Extract initial and final values from variant data
    Object.entries(variantData).forEach(([key, value]) => {
      if (!key.includes('_to')) {
        initialValues[key] = value;
      } else {
        const finalKey = key.replace('_to', '');
        finalValues[finalKey] = value;
      }
    });
    
    return { initialValues, finalValues };
  }, [shouldAnimate, variantData]);
  
  // Function to interpolate between values based on progress
  const interpolate = useCallback((start: string, end: string, progress: number) => {
    // Handle numeric values with units (e.g., '10px', '1.5em', '90%')
    const startMatch = start.match(/^([-\d.]+)(.*)$/);
    const endMatch = end.match(/^([-\d.]+)(.*)$/);
    
    if (startMatch && endMatch && startMatch[2] === endMatch[2]) {
      const startValue = parseFloat(startMatch[1]);
      const endValue = parseFloat(endMatch[1]);
      const unit = startMatch[2];
      
      const interpolatedValue = startValue + (endValue - startValue) * progress;
      return `${interpolatedValue}${unit}`;
    }
    
    // Handle transform values
    if (start.includes('translate') || start.includes('scale') || start.includes('rotate')) {
      // Extract numeric values from transforms
      const startValueMatch = start.match(/\(([-\d.]+)([^)]*)\)/);
      const endValueMatch = end.match(/\(([-\d.]+)([^)]*)\)/);
      
      if (startValueMatch && endValueMatch && startValueMatch[2] === endValueMatch[2]) {
        const startValue = parseFloat(startValueMatch[1]);
        const endValue = parseFloat(endValueMatch[1]);
        const unit = startValueMatch[2];
        const transformType = start.split('(')[0];
        
        const interpolatedValue = startValue + (endValue - startValue) * progress;
        return `${transformType}(${interpolatedValue}${unit})`;
      }
    }
    
    // For other types of values or when parsing fails, just return the appropriate value based on progress
    return progress < 0.5 ? start : end;
  }, []);
  
  // Apply styles based on current progress
  useEffect(() => {
    if (!shouldAnimate) return;
    
    // Ensure progress is between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    if (onProgressChange) {
      onProgressChange(clampedProgress);
    }
    
    const { initialValues, finalValues } = animationProps;
    const interpolatedStyles: Record<string, string> = {};
    
    // Interpolate between initial and final values based on progress
    Object.keys(initialValues).forEach((key) => {
      const initialValue = initialValues[key] as string;
      const finalValue = finalValues[key] as string;
      
      if (initialValue !== undefined && finalValue !== undefined) {
        interpolatedStyles[key] = interpolate(initialValue, finalValue, clampedProgress);
      }
    });
    
    // Add transition property if progress is not 0 or 1 (for smooth changes during progress adjustment)
    if (clampedProgress > 0 && clampedProgress < 1) {
      interpolatedStyles.transition = `all ${transitionProps.duration} ${transitionProps.easing}`;
    }
    
    setStyles(interpolatedStyles);
  }, [
    shouldAnimate, 
    progress, 
    animationProps, 
    interpolate, 
    transitionProps, 
    onProgressChange
  ]);
  
  // Function to get animation styles
  const getAnimationStyles = useCallback(() => {
    if (!shouldAnimate) return {};
    return styles;
  }, [shouldAnimate, styles]);
  
  // Function to apply styles to an element
  const applyStyles = useCallback((element: HTMLElement | null) => {
    if (!element || !shouldAnimate) return;
    
    Object.entries(styles).forEach(([property, value]) => {
      element.style[property as any] = value;
    });
  }, [shouldAnimate, styles]);
  
  return {
    styles,
    getAnimationStyles,
    applyStyles,
    progress: Math.max(0, Math.min(1, progress)),
  };
}

export default useProgressAnimation; 