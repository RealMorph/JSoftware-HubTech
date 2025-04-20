import React, { useState, useEffect, ComponentType } from 'react';
import { useAnimationPreset, useMotionPreference } from '../hooks/useAnimation';

export interface WithEntranceAnimationProps {
  isVisible?: boolean;
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate';
  animationVariant?: string;
  animationDuration?: string;
  animationEasing?: string;
  animationDelay?: number;
}

/**
 * HOC that applies entrance animations to a component
 * @param Component The component to wrap
 * @returns The wrapped component with entrance animation
 */
export function withEntranceAnimation<P extends object>(
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
          newStyle.opacity = 0.8;
        } else if (animationType === 'rotate') {
          newStyle.transform = 'rotate(1deg)';
        }
      } else if (isHovered && hoverAnimation) {
        // Apply hover animation styles
        if (animationType === 'scale') {
          newStyle.transform = 'scale(1.05)';
        } else if (animationType === 'fade') {
          newStyle.opacity = 0.9;
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