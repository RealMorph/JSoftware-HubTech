import { useCallback, useState, useRef, useEffect } from 'react';
import { useAnimation } from '../AnimationProvider';
import { AnimationType, DirectionType, DurationType, EasingType } from '../types';

/**
 * Interface for scroll animation options
 */
export interface ScrollAnimationOptions {
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
   * Offset percentage when animation should start (0-1)
   * 0 = top of element at bottom of viewport
   * 0.5 = middle of element at middle of viewport
   * 1 = bottom of element at top of viewport
   */
  triggerOffset?: number;
  
  /**
   * Whether animation should run only once
   */
  once?: boolean;
  
  /**
   * Whether animation is disabled
   */
  animationDisabled?: boolean;
  
  /**
   * Callback fired when scroll animation starts
   */
  onAnimationStart?: () => void;
  
  /**
   * Callback fired when scroll animation completes
   */
  onAnimationComplete?: () => void;
  
  /**
   * Root margin for Intersection Observer
   */
  rootMargin?: string;
}

/**
 * Hook for adding scroll-based animations
 */
export function useScrollAnimation({
  animationType = 'fade',
  animationDirection = 'in',
  animationDuration = 'standard',
  animationEasing = 'easeOut',
  triggerOffset = 0.2,
  once = true,
  animationDisabled = false,
  onAnimationStart,
  onAnimationComplete,
  rootMargin = '0px'
}: ScrollAnimationOptions = {}) {
  const animation = useAnimation();
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Skip animation if disabled, already animated (if once=true), or reduced motion is preferred
  const shouldAnimate = !animationDisabled && 
                       animation.isMotionEnabled && 
                       !animation.isReducedMotion &&
                       !(once && hasAnimated);
  
  // Get animation properties from the animation system
  const variantData = animation.getVariant(animationType, animationDirection);
  const transitionProps = animation.getTransition(animationDuration, animationEasing);
  
  // Handle intersection changes
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (!shouldAnimate) return;
    
    const [entry] = entries;
    const isIntersecting = entry.isIntersecting;
    
    // Apply animation based on visibility
    if (isIntersecting && !isVisible) {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (onAnimationStart) {
        onAnimationStart();
      }
      
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
      
      // Apply final styles after a frame to ensure initial styles are applied
      requestAnimationFrame(() => {
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
            setHasAnimated(true);
            
            if (onAnimationComplete) {
              onAnimationComplete();
            }
            
            // If animation should only run once, disconnect the observer
            if (once && observerRef.current) {
              observerRef.current.disconnect();
            }
          }, timeoutDuration);
        }, 10);
      });
    } else if (!isIntersecting && isVisible && !once) {
      // If element is no longer visible and animation should repeat
      setIsVisible(false);
      
      // Reset styles for next animation if needed
      if (!hasAnimated || !once) {
        // Start with final styles (reversed for exit)
        const initialStyles: Record<string, string> = {};
        Object.entries(variantData).forEach(([key, value]) => {
          const finalKey = key.replace('_to', '');
          if (key.includes('_to')) {
            initialStyles[finalKey] = value as string;
          }
        });
        
        setStyles(initialStyles);
      }
    }
  }, [
    shouldAnimate, 
    isVisible, 
    variantData, 
    transitionProps, 
    once, 
    hasAnimated,
    onAnimationStart,
    onAnimationComplete
  ]);
  
  // Initialize Intersection Observer
  const initializeObserver = useCallback(() => {
    if (!elementRef.current || !shouldAnimate) return;
    
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      handleIntersection,
      {
        rootMargin,
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );
    
    // Start observing the element
    observerRef.current.observe(elementRef.current);
  }, [handleIntersection, shouldAnimate, rootMargin]);
  
  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  // Re-initialize observer when dependencies change
  useEffect(() => {
    initializeObserver();
  }, [initializeObserver]);
  
  // Ref callback to set the element reference
  const ref = useCallback((element: HTMLElement | null) => {
    if (element) {
      elementRef.current = element;
      initializeObserver();
    }
  }, [initializeObserver]);
  
  // Calculate scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    if (!elementRef.current || !shouldAnimate) return;
    
    const calculateProgress = () => {
      if (!elementRef.current) return;
      
      const rect = elementRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on element position
      // 0 = element just entered viewport
      // 1 = element just left viewport
      let progress = 0;
      
      if (rect.top >= windowHeight) {
        // Element is below viewport
        progress = 0;
      } else if (rect.bottom <= 0) {
        // Element is above viewport
        progress = 1;
      } else {
        // Element is partially in viewport
        const elementHeight = rect.height;
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        progress = visibleHeight / elementHeight;
      }
      
      setScrollProgress(progress);
    };
    
    // Calculate initial progress
    calculateProgress();
    
    // Add scroll listener
    window.addEventListener('scroll', calculateProgress, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', calculateProgress);
    };
  }, [shouldAnimate]);
  
  return {
    ref,
    isVisible,
    isAnimating,
    hasAnimated,
    styles,
    scrollProgress,
  };
}

export default useScrollAnimation; 