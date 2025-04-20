import { useCallback, useState, useRef, useEffect } from 'react';
import { useAnimation } from '../AnimationProvider';
import { AnimationType, DirectionType, DurationType, EasingType } from '../types';

/**
 * Interface for gesture animation options
 */
export interface GestureAnimationOptions {
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
   * Threshold for gesture to trigger animation (in pixels)
   */
  threshold?: number;
  
  /**
   * Whether animation is disabled
   */
  animationDisabled?: boolean;
  
  /**
   * Callback fired when gesture animation completes
   */
  onAnimationComplete?: () => void;
  
  /**
   * Callback fired when gesture is detected
   */
  onGestureDetected?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

/**
 * Hook for adding gesture-based animations
 */
export function useGestureAnimation({
  animationType = 'slide',
  animationDirection = 'up',
  animationDuration = 'standard',
  animationEasing = 'easeOut',
  threshold = 50,
  animationDisabled = false,
  onAnimationComplete,
  onGestureDetected
}: GestureAnimationOptions = {}) {
  const animation = useAnimation();
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [gestureDirection, setGestureDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs for gesture tracking
  const startX = useRef(0);
  const startY = useRef(0);
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Skip animation if disabled or reduced motion is preferred
  const shouldAnimate = !animationDisabled && 
                       animation.isMotionEnabled && 
                       !animation.isReducedMotion;
  
  // Handle touch/mouse start
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!shouldAnimate) return;
    
    startX.current = clientX;
    startY.current = clientY;
  }, [shouldAnimate]);
  
  // Handle touch/mouse end
  const handleEnd = useCallback((clientX: number, clientY: number) => {
    if (!shouldAnimate) return;
    
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Determine gesture direction
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    
    if (absX > absY && absX > threshold) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (absY > absX && absY > threshold) {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    if (direction) {
      setGestureDirection(direction);
      
      if (onGestureDetected) {
        onGestureDetected(direction);
      }
      
      // Apply animation based on gesture direction
      applyAnimation(direction);
    }
  }, [shouldAnimate, threshold, onGestureDetected]);
  
  // Apply animation based on direction
  const applyAnimation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!shouldAnimate || !elementRef.current) return;
    
    setIsAnimating(true);
    
    // Get animation properties from the animation system
    // Use the detected direction or fallback to the provided direction
    const effectiveDirection = animationType === 'slide' ? direction : animationDirection;
    const variantData = animation.getVariant(animationType, effectiveDirection);
    const transitionProps = animation.getTransition(animationDuration, animationEasing);
    
    // Start with initial styles
    const initialStyles: Record<string, string> = {};
    Object.entries(variantData).forEach(([key, value]) => {
      if (!key.includes('_to')) {
        initialStyles[key] = value as string;
      }
    });
    
    // Add transition property
    initialStyles.transition = `all ${transitionProps.duration} ${transitionProps.easing}`;
    
    setStyles(initialStyles);
    
    // Apply final styles after a short delay
    setTimeout(() => {
      const finalStyles: Record<string, string> = { ...initialStyles };
      Object.entries(variantData).forEach(([key, value]) => {
        const finalKey = key.replace('_to', '');
        if (key.includes('_to')) {
          finalStyles[finalKey] = value as string;
        }
      });
      
      setStyles(finalStyles);
      
      // Mark animation as complete after duration
      const timeoutDuration = parseFloat(transitionProps.duration) * 1000 + 50;
      setTimeout(() => {
        setIsAnimating(false);
        
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, timeoutDuration);
    }, 10);
  }, [
    shouldAnimate, 
    animationType, 
    animationDirection, 
    animationDuration, 
    animationEasing, 
    animation,
    onAnimationComplete
  ]);
  
  // Event listeners for touch events
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleStart]);
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.changedTouches.length === 1) {
      handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
  }, [handleEnd]);
  
  // Event listeners for mouse events
  const handleMouseDown = useCallback((e: MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);
  
  const handleMouseUp = useCallback((e: MouseEvent) => {
    handleEnd(e.clientX, e.clientY);
  }, [handleEnd]);
  
  // Cleanup function to remove event listeners
  const cleanup = useCallback(() => {
    if (!elementRef.current) return;
    
    elementRef.current.removeEventListener('touchstart', handleTouchStart);
    elementRef.current.removeEventListener('touchend', handleTouchEnd);
    elementRef.current.removeEventListener('mousedown', handleMouseDown);
    elementRef.current.removeEventListener('mouseup', handleMouseUp);
  }, [handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp]);
  
  // Initialize event listeners when the element reference changes
  const initializeEvents = useCallback((element: HTMLElement) => {
    // Clean up previous listeners
    cleanup();
    
    // Save the element reference
    elementRef.current = element;
    
    // Add new listeners
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
  }, [cleanup, handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp]);
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Ref callback to initialize event listeners
  const ref = useCallback((element: HTMLElement | null) => {
    if (element && shouldAnimate) {
      initializeEvents(element);
    }
  }, [initializeEvents, shouldAnimate]);
  
  return {
    ref,
    gestureDirection,
    isAnimating,
    styles,
    setGestureDirection,
    applyAnimation,
  };
}

export default useGestureAnimation; 