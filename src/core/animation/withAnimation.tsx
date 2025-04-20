import React, { ComponentType, useState, useEffect } from 'react';
import { useAnimation } from './AnimationProvider';
import { 
  AnimationType, 
  DurationType, 
  EasingType,
  DirectionType,
  VariantData 
} from './types';
import { useAnimationPreset, useMotionPreference } from '../hooks/useAnimation';

interface WithAnimationProps {
  animationDisabled?: boolean;
  animationDelay?: number;
}

interface AnimationOptions {
  type: AnimationType;
  direction: DirectionType;
  duration?: DurationType;
  easing?: EasingType;
  runOnMount?: boolean;
  exitAnimation?: boolean;
}

/**
 * Higher-order component that adds animation capabilities to a component
 * @param WrappedComponent The component to enhance with animations
 * @param options Animation configuration options
 * @returns Enhanced component with animation capabilities
 */
export function withAnimation<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: AnimationOptions
) {
  const {
    type,
    direction,
    duration = 'standard',
    easing = 'easeOut',
    runOnMount = true,
    exitAnimation = false
  } = options;

  // The enhanced component with animation capabilities
  const WithAnimation = React.forwardRef<unknown, P & WithAnimationProps>((props, ref) => {
    const { animationDisabled, animationDelay, ...rest } = props;
    const animation = useAnimation();
    
    // Skip animation if explicitly disabled via props or system settings
    const shouldAnimate = !animationDisabled && 
                          animation.isMotionEnabled && 
                          !animation.isReducedMotion;
                          
    if (!shouldAnimate) {
      return <WrappedComponent ref={ref} {...rest as P} />;
    }
    
    // Get animation properties from the animation system
    const variantData = animation.getVariant(type, direction);
    const transitionProps = animation.getTransition(duration, easing);
    
    // Prepare animation properties based on animation type
    let animationProps: any = {
      style: { 
        // Apply base motion styles
        transition: `${transitionProps.duration} ${transitionProps.easing}${animationDelay ? ` ${animationDelay}ms` : ''}`,
      }
    };
    
    if (runOnMount) {
      switch (type) {
        case 'fade':
          animationProps = {
            ...animationProps,
            style: {
              ...animationProps.style,
              opacity: variantData.opacity,
              animation: `fadeIn ${transitionProps.duration} ${transitionProps.easing}${animationDelay ? ` ${animationDelay}ms` : ''} forwards`
            }
          };
          break;
          
        case 'slide':
        case 'scale':
        case 'rotate':
          animationProps = {
            ...animationProps,
            style: {
              ...animationProps.style,
              transform: variantData.transform,
              animation: `transformIn ${transitionProps.duration} ${transitionProps.easing}${animationDelay ? ` ${animationDelay}ms` : ''} forwards`
            }
          };
          break;
      }
    }
    
    // Merge props
    const componentProps = {
      ...rest as P,
      ...animationProps
    };
    
    return <WrappedComponent ref={ref} {...componentProps} />;
  });
  
  // Display name for debugging
  WithAnimation.displayName = `WithAnimation(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithAnimation;
}

/**
 * Higher-order component specifically for entrance animations
 */
export function withEntranceAnimation<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<AnimationOptions, 'runOnMount' | 'exitAnimation'> = {
    type: 'fade',
    direction: 'in',
    duration: 'standard',
    easing: 'easeOut'
  }
) {
  return withAnimation(WrappedComponent, {
    ...options,
    runOnMount: true,
    exitAnimation: false
  });
}

/**
 * Higher-order component specifically for interactive hover animations
 */
export function withHoverAnimation<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<AnimationOptions, 'runOnMount' | 'exitAnimation'> = {
    type: 'scale',
    direction: 'in',
    duration: 'shorter',
    easing: 'easeOut'
  }
) {
  // TODO: Implement hover animation logic
  return withAnimation(WrappedComponent, {
    ...options,
    runOnMount: false,
    exitAnimation: false
  });
}

export default withAnimation;

export interface WithEntranceAnimationProps {
  isVisible?: boolean;
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate';
  animationVariant?: string;
  animationDuration?: string;
  animationEasing?: string;
  animationDelay?: number;
}

/**
 * Enhanced HOC that applies entrance animations to a component using hooks
 * @param Component The component to wrap
 * @returns The wrapped component with entrance animation
 */
export function withCustomEntranceAnimation<P extends object>(
  Component: ComponentType<P>
) {
  const WithEntranceAnimation = (props: P & WithEntranceAnimationProps) => {
    const {
      isVisible = true,
      animationType = 'fade',
      animationVariant = 'in',
      animationDuration = 'standard',
      animationEasing = 'easeInOut',
      animationDelay = 0,
      ...rest
    } = props;

    const { getAnimationCSS } = useAnimationPreset();
    const { isMotionSafe } = useMotionPreference();
    const [mounted, setMounted] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({
      opacity: isMotionSafe ? 0 : 1,
    });

    useEffect(() => {
      if (!isMotionSafe) {
        setStyle({});
        return;
      }

      // Set initial style
      const initialStyle = getAnimationCSS(
        animationType,
        animationVariant,
        animationDuration as any,
        animationEasing as any
      );

      setStyle(initialStyle as any);

      // Set mounted after delay for animation
      const mountTimeout = setTimeout(() => {
        setMounted(true);
      }, animationDelay);

      return () => clearTimeout(mountTimeout);
    }, [
      animationDelay,
      animationType,
      animationVariant,
      animationDuration,
      animationEasing,
      getAnimationCSS,
      isMotionSafe,
    ]);

    useEffect(() => {
      if (!isMotionSafe || !mounted) return;

      // Get the target styles
      const variantData = getAnimationCSS(
        animationType,
        animationVariant,
        animationDuration as any,
        animationEasing as any
      );

      // Apply target styles with _to values
      const targetStyle: Record<string, any> = { ...variantData };
      Object.entries(variantData).forEach(([key, value]) => {
        const toKey = `${key}_to`;
        if (variantData[toKey]) {
          targetStyle[key] = variantData[toKey];
        }
      });

      setStyle(targetStyle as any);
    }, [
      mounted, 
      animationType,
      animationVariant,
      animationDuration,
      animationEasing,
      getAnimationCSS,
      isMotionSafe,
    ]);

    if (!isVisible && mounted) {
      return null;
    }

    return <Component {...(rest as P)} style={{ ...style, ...(rest as any)?.style }} />;
  };

  WithEntranceAnimation.displayName = `WithEntranceAnimation(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithEntranceAnimation;
}

export interface WithInteractionAnimationProps {
  hoverAnimation?: boolean;
  activeAnimation?: boolean;
  animationType?: 'fade' | 'scale' | 'rotate';
  animationDuration?: string;
  animationEasing?: string;
}

/**
 * HOC that applies interaction animations to a component (hover, active states)
 * @param Component The component to wrap
 * @returns The wrapped component with interaction animations
 */
export function withInteractionAnimation<P extends object>(
  Component: ComponentType<P>
) {
  const WithInteractionAnimation = (props: P & WithInteractionAnimationProps) => {
    const {
      hoverAnimation = true,
      activeAnimation = true,
      animationType = 'scale',
      animationDuration = 'fast',
      animationEasing = 'easeOut',
      ...rest
    } = props;

    const { getAnimationCSS } = useAnimationPreset();
    const { isMotionSafe } = useMotionPreference();
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
      if (!isMotionSafe) {
        setStyle({});
        return;
      }

      let newStyle: React.CSSProperties = {
        transition: `transform ${animationDuration} ${animationEasing}`,
      };

      if (isActive && activeAnimation) {
        // Apply active animation styles
        if (animationType === 'scale') {
          newStyle.transform = 'scale(0.95)';
        } else if (animationType === 'fade') {
          newStyle.opacity = '0.8';
        } else if (animationType === 'rotate') {
          newStyle.transform = 'rotate(1deg)';
        }
      } else if (isHovered && hoverAnimation) {
        // Apply hover animation styles
        if (animationType === 'scale') {
          newStyle.transform = 'scale(1.05)';
        } else if (animationType === 'fade') {
          newStyle.opacity = '0.9';
        } else if (animationType === 'rotate') {
          newStyle.transform = 'rotate(-1deg)';
        }
      }

      setStyle(newStyle);
    }, [
      isHovered,
      isActive,
      hoverAnimation,
      activeAnimation,
      animationType,
      animationDuration,
      animationEasing,
      isMotionSafe,
    ]);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);

    const interactionHandlers = isMotionSafe
      ? {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onMouseDown: handleMouseDown,
          onMouseUp: handleMouseUp,
        }
      : {};

    return (
      <Component
        {...(rest as P)}
        {...interactionHandlers}
        style={{ ...style, ...(rest as any)?.style }}
      />
    );
  };

  WithInteractionAnimation.displayName = `WithInteractionAnimation(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithInteractionAnimation;
}

/**
 * HOC that applies transition animations when a component mounts/unmounts
 * @param Component The component to wrap
 * @returns The wrapped component with transition animations
 */
export function withTransitionAnimation<P extends object>(
  Component: ComponentType<P>
) {
  // This would typically be implemented using a library like react-transition-group
  // or framer-motion, but here's a simplified version
  const WithTransitionAnimation = (props: P) => {
    return <Component {...props} />;
  };

  WithTransitionAnimation.displayName = `WithTransitionAnimation(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WithTransitionAnimation;
} 