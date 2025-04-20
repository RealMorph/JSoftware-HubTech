import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useAnimation } from '../AnimationProvider';
import { AnimationType, DirectionType, DurationType, EasingType } from '../types';
import { useMotionPreference } from '../hooks/useMotionPreference';

export interface StaggeredAnimationProps {
  /**
   * Array of items to animate
   */
  children: ReactNode[];
  
  /**
   * Animation type
   * @default 'fade'
   */
  animationType?: AnimationType;
  
  /**
   * Animation direction
   * @default 'in'
   */
  direction?: DirectionType;
  
  /**
   * Animation duration preset
   * @default 'standard'
   */
  duration?: DurationType;
  
  /**
   * Animation easing function
   * @default 'easeOut'
   */
  easing?: EasingType;
  
  /**
   * Stagger delay between items in ms
   * @default 50
   */
  staggerDelay?: number;
  
  /**
   * Initial delay before starting the first animation in ms
   * @default 0
   */
  initialDelay?: number;
  
  /**
   * Whether to animate on mount
   * @default true
   */
  animateOnMount?: boolean;
  
  /**
   * Trigger value - when changed, animations will restart
   */
  animationTrigger?: any;
  
  /**
   * Whether to stagger from start or end of list
   * @default 'start'
   */
  staggerFrom?: 'start' | 'end';
  
  /**
   * Container className
   */
  className?: string;
  
  /**
   * Container style
   */
  style?: React.CSSProperties;
  
  /**
   * Optional callback when all items have animated
   */
  onComplete?: () => void;
  
  /**
   * Optional callback before animation starts
   */
  onStart?: () => void;
  
  /**
   * Container tag or component
   * @default 'div'
   */
  as?: React.ElementType;
}

/**
 * StaggeredAnimation component for animating lists of items with a stagger effect
 */
const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  animationType = 'fade',
  direction = 'in',
  duration = 'standard',
  easing = 'easeOut',
  staggerDelay = 50,
  initialDelay = 0,
  animateOnMount = true,
  animationTrigger,
  staggerFrom = 'start',
  className,
  style,
  onComplete,
  onStart,
  as: Component = 'div'
}) => {
  const animation = useAnimation();
  const { isReducedMotion, isMotionEnabled } = useMotionPreference();
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const isAnimatingRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  
  // Skip animation if motion is disabled or reduced motion is preferred
  const shouldAnimate = isMotionEnabled && !isReducedMotion;
  
  // Get variant data and transition props from animation context
  const variant = animation.getVariant(animationType, direction);
  const transition = animation.getTransition(duration, easing);
  
  // Convert to milliseconds for timeouts
  const durationMs = parseInt(transition.duration) || 300;
  
  // Reset and restart animation
  const startAnimation = () => {
    // Clear any running animations
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    
    // Reset active indices
    setActiveIndices([]);
    
    // Get items to animate
    const items = React.Children.toArray(children);
    if (!items.length) return;
    
    // Call onStart callback
    if (onStart) {
      onStart();
    }
    
    // Flag that we're animating
    isAnimatingRef.current = true;
    
    // Animate each item with staggered delay
    const newTimeouts: NodeJS.Timeout[] = [];
    
    items.forEach((_, index) => {
      // Determine the delay based on staggerFrom direction
      const itemIndex = staggerFrom === 'start' ? index : items.length - 1 - index;
      const delay = initialDelay + (itemIndex * staggerDelay);
      
      const timeout = setTimeout(() => {
        setActiveIndices(prev => [...prev, itemIndex]);
        
        // Check if this is the last item
        if (
          (staggerFrom === 'start' && itemIndex === items.length - 1) ||
          (staggerFrom === 'end' && itemIndex === 0)
        ) {
          // Wait for animation to complete before calling onComplete
          setTimeout(() => {
            isAnimatingRef.current = false;
            if (onComplete) {
              onComplete();
            }
          }, durationMs);
        }
      }, delay);
      
      newTimeouts.push(timeout);
    });
    
    timeoutsRef.current = newTimeouts;
  };
  
  // Start animation on mount if enabled
  useEffect(() => {
    if (animateOnMount && shouldAnimate) {
      startAnimation();
    } else {
      // If not animating, show all items immediately
      const items = React.Children.toArray(children);
      const allIndices = items.map((_, index) => index);
      setActiveIndices(allIndices);
    }
    
    return () => {
      // Clean up timeouts on unmount
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);
  
  // Restart animation when trigger changes
  useEffect(() => {
    if (animationTrigger !== undefined && shouldAnimate) {
      startAnimation();
    }
  }, [animationTrigger]);
  
  // Restart animation when children array length changes
  useEffect(() => {
    const childrenCount = React.Children.count(children);
    
    // Check if we need to add newly appended children to the animation
    if (shouldAnimate && !isAnimatingRef.current) {
      const currentActiveCount = activeIndices.length;
      
      if (childrenCount > currentActiveCount) {
        // Start animation for only the new children
        isAnimatingRef.current = true;
        
        // Get new items to animate
        const newItems = Array.from({ length: childrenCount - currentActiveCount }, (_, i) => i + currentActiveCount);
        
        // Create timeouts for each new item
        const newTimeouts: NodeJS.Timeout[] = [];
        
        newItems.forEach((itemIndex, i) => {
          const delay = initialDelay + (i * staggerDelay);
          
          const timeout = setTimeout(() => {
            setActiveIndices(prev => [...prev, itemIndex]);
            
            // Check if this is the last new item
            if (i === newItems.length - 1) {
              // Wait for animation to complete before calling onComplete
              setTimeout(() => {
                isAnimatingRef.current = false;
                if (onComplete) {
                  onComplete();
                }
              }, durationMs);
            }
          }, delay);
          
          newTimeouts.push(timeout);
        });
        
        timeoutsRef.current = [...timeoutsRef.current, ...newTimeouts];
      }
    }
  }, [React.Children.count(children)]);
  
  return (
    <Component className={className} style={style}>
      {React.Children.map(children, (child, index) => {
        const isActive = activeIndices.includes(index);
        
        // Skip wrapping if not animating
        if (!shouldAnimate) {
          return child;
        }
        
        // Determine animation properties based on animation type
        let animationStyle: React.CSSProperties = {
          transition: `all ${transition.duration} ${transition.easing}`,
        };
        
        // Add specific properties based on animation type
        switch (animationType) {
          case 'fade':
            animationStyle.opacity = isActive ? variant.opacity_to : variant.opacity;
            break;
            
          case 'slide':
          case 'scale':
          case 'rotate':
            animationStyle.transform = isActive ? variant.transform_to : variant.transform;
            break;
        }
        
        return (
          <div 
            style={{
              ...animationStyle,
              display: 'contents', // Transparent container that doesn't affect layout
            }}
          >
            {child}
          </div>
        );
      })}
    </Component>
  );
};

export default StaggeredAnimation; 