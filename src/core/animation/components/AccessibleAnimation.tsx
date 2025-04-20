import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { useAnimation } from '../AnimationProvider';
import { useMotionPreference } from '../hooks/useMotionPreference';
import { AnimationType, DirectionType, DurationType, EasingType } from '../types';

export interface AccessibleAnimationProps {
  /**
   * The content to be animated
   */
  children: ReactNode;
  
  /**
   * Type of animation to use
   * @default 'fade'
   */
  type?: AnimationType;
  
  /**
   * Direction of animation
   * @default 'in'
   */
  direction?: DirectionType;
  
  /**
   * Duration of animation
   * @default 'standard'
   */
  duration?: DurationType;
  
  /**
   * Easing function for animation
   * @default 'easeOut'
   */
  easing?: EasingType;
  
  /**
   * Whether animation should run on mount
   * @default true
   */
  animateOnMount?: boolean;
  
  /**
   * Whether the component respects user's reduced motion preference
   * @default true
   */
  respectReducedMotion?: boolean;
  
  /**
   * When true, allows exit animations
   * @default false
   */
  animateExit?: boolean;
  
  /**
   * Delay before animation starts in ms
   * @default 0
   */
  delay?: number;
  
  /**
   * Whether animation is triggered by focus events
   * @default false
   */
  animateOnFocus?: boolean;
  
  /**
   * Whether animation is triggered by hover events
   * @default false
   */
  animateOnHover?: boolean;
  
  /**
   * Alternative for users with reduced motion preference
   * @default 'opacity'
   */
  reducedMotionAlternative?: 'none' | 'opacity' | 'border' | 'background';
  
  /**
   * Container className
   */
  className?: string;
  
  /**
   * Container style
   */
  style?: React.CSSProperties;
  
  /**
   * Callback when animation starts
   */
  onAnimationStart?: () => void;
  
  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;
  
  /**
   * Additional ARIA attributes
   */
  ariaLive?: 'off' | 'polite' | 'assertive';
  
  /**
   * Whether content is visible to screen readers before animation completes
   * @default true
   */
  accessibleBeforeComplete?: boolean;
  
  /**
   * Parent focus management: when true, maintains focus on child elements even during animation
   * @default true
   */
  maintainChildFocus?: boolean;
}

/**
 * AccessibleAnimation component provides accessible animations with consideration for motion preferences
 */
const AccessibleAnimation: React.FC<AccessibleAnimationProps> = ({
  children,
  type = 'fade',
  direction = 'in',
  duration = 'standard',
  easing = 'easeOut',
  animateOnMount = true,
  respectReducedMotion = true,
  animateExit = false,
  delay = 0,
  animateOnFocus = false,
  animateOnHover = false,
  reducedMotionAlternative = 'opacity',
  className,
  style,
  onAnimationStart,
  onAnimationComplete,
  ariaLive,
  accessibleBeforeComplete = true,
  maintainChildFocus = true,
}) => {
  const animation = useAnimation();
  const { isReducedMotion } = useMotionPreference();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(animateOnMount ? false : true);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  
  // Determine if we should skip animation based on motion preferences
  const shouldUseReducedMotion = respectReducedMotion && isReducedMotion;
  
  // Get animation properties from the animation system
  const variant = animation.getVariant(type, direction);
  const transitionProps = animation.getTransition(duration, easing);
  
  // Initialize animation on mount if required
  useEffect(() => {
    if (animateOnMount) {
      startAnimation();
    }
  }, []);
  
  // Start animation
  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsVisible(true);
    
    if (onAnimationStart) {
      onAnimationStart();
    }
    
    // Complete animation after duration + delay
    const timeoutDuration = parseFloat(transitionProps.duration) * 1000 + delay;
    setTimeout(() => {
      setIsAnimating(false);
      
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, timeoutDuration);
  };
  
  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
    if (animateOnFocus && !isVisible) {
      startAnimation();
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    
    if (animateOnFocus && animateExit && isVisible) {
      setIsVisible(false);
    }
  };
  
  // Handle hover events
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (animateOnHover && !isVisible) {
      startAnimation();
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (animateOnHover && animateExit && isVisible) {
      setIsVisible(false);
    }
  };
  
  // Find and store focusable elements for focus management
  useEffect(() => {
    if (!containerRef.current || !maintainChildFocus) return;
    
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      focusableSelectors.join(',')
    );
    
    focusableElementsRef.current = Array.from(elements);
    
    // If animation is in progress, add tabindex to focusable elements
    updateFocusability(isAnimating);
  }, [children, isAnimating, maintainChildFocus]);
  
  // Update focusability based on animation state
  const updateFocusability = (isAnimating: boolean) => {
    if (!maintainChildFocus) return;
    
    focusableElementsRef.current.forEach(element => {
      if (isAnimating && !accessibleBeforeComplete) {
        // Store original tabindex and make temporarily unfocusable
        const currentTabIndex = element.getAttribute('tabindex');
        if (currentTabIndex !== '-1') {
          element.setAttribute('data-original-tabindex', currentTabIndex || '0');
          element.setAttribute('tabindex', '-1');
        }
      } else {
        // Restore original tabindex
        const originalTabIndex = element.getAttribute('data-original-tabindex');
        if (originalTabIndex) {
          element.setAttribute('tabindex', originalTabIndex);
          element.removeAttribute('data-original-tabindex');
        }
      }
    });
  };
  
  // Apply accessibility updates when animation state changes
  useEffect(() => {
    updateFocusability(isAnimating);
  }, [isAnimating, accessibleBeforeComplete]);
  
  // Determine the appropriate style for the current state
  const getAnimationStyle = (): React.CSSProperties => {
    // Skip animated styles if using reduced motion
    if (shouldUseReducedMotion) {
      return getReducedMotionStyle();
    }
    
    // Base style with transition
    const style: React.CSSProperties = {
      transition: `all ${transitionProps.duration} ${transitionProps.easing}`,
      transitionDelay: delay ? `${delay}ms` : undefined,
    };
    
    // Apply animation properties based on type
    switch (type) {
      case 'fade':
        style.opacity = isVisible ? variant.opacity_to : variant.opacity;
        break;
        
      case 'slide':
      case 'scale':
      case 'rotate':
        style.transform = isVisible ? variant.transform_to : variant.transform;
        
        // Add opacity for combined effect
        if (type !== 'rotate') {
          style.opacity = isVisible ? 1 : 0;
        }
        break;
    }
    
    return style;
  };
  
  // Get alternative style for reduced motion preference
  const getReducedMotionStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    
    switch (reducedMotionAlternative) {
      case 'none':
        // No visual indicator, just show content
        break;
        
      case 'opacity':
        // Simple fade only
        style.transition = `opacity ${transitionProps.duration} ${transitionProps.easing}`;
        style.opacity = isVisible ? 1 : 0;
        break;
        
      case 'border':
        // Highlight with a border
        style.transition = `border ${transitionProps.duration} ${transitionProps.easing}`;
        style.border = isVisible ? '1px solid currentColor' : 'none';
        break;
        
      case 'background':
        // Highlight with background
        style.transition = `background-color ${transitionProps.duration} ${transitionProps.easing}`;
        style.backgroundColor = isVisible ? 'rgba(0, 0, 0, 0.05)' : 'transparent';
        break;
    }
    
    return style;
  };
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        ...style,
        ...getAnimationStyle(),
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-live={ariaLive}
      aria-hidden={!accessibleBeforeComplete && isAnimating ? 'true' : undefined}
    >
      {children}
    </div>
  );
};

export default AccessibleAnimation; 