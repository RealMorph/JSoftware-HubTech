import { useTheme } from '../theme/ThemeContext';
import { useCallback, useMemo } from 'react';

/**
 * Hook to access animation presets from the theme
 * @returns Animation preset utilities
 */
export function useAnimationPreset() {
  const { animation } = useTheme();

  return useMemo(() => {
    const getVariant = (type: 'fade' | 'slide' | 'scale' | 'rotate', variant?: string) => {
      if (type === 'fade') {
        return animation.variants.fade[variant as 'in' | 'out'] || animation.variants.fade.in;
      }
      
      if (type === 'slide') {
        return animation.variants.slide[variant as 'up' | 'down' | 'left' | 'right'] || animation.variants.slide.up;
      }
      
      if (type === 'scale') {
        return animation.variants.scale[variant as 'in' | 'out'] || animation.variants.scale.in;
      }
      
      if (type === 'rotate') {
        return animation.variants.rotate[variant as 'in' | 'out'] || animation.variants.rotate.in;
      }
      
      return {};
    };

    const getDuration = (preset: keyof typeof animation.duration) => {
      return animation.duration[preset];
    };

    const getEasing = (preset: keyof typeof animation.easing) => {
      return animation.easing[preset];
    };

    // Generate CSS for a transition
    const getTransitionCSS = (property: string, durationPreset: keyof typeof animation.duration, easingPreset: keyof typeof animation.easing) => {
      const duration = getDuration(durationPreset);
      const easing = getEasing(easingPreset);
      
      return `${property} ${duration} ${easing}`;
    };

    // Generate CSS for a complex animation
    const getAnimationCSS = (type: 'fade' | 'slide' | 'scale' | 'rotate', variant?: string, durationPreset: keyof typeof animation.duration = 'standard', easingPreset: keyof typeof animation.easing = 'easeInOut') => {
      const variantData = getVariant(type, variant);
      const duration = getDuration(durationPreset);
      const easing = getEasing(easingPreset);
      
      // Build the CSS for the animation
      const cssProperties: Record<string, string> = {};
      
      // Set the transition
      cssProperties.transition = `all ${duration} ${easing}`;
      
      // Set the starting values
      Object.entries(variantData).forEach(([key, value]) => {
        if (!key.includes('_to')) {
          cssProperties[key] = value as string;
        }
      });
      
      return cssProperties;
    };

    return {
      getVariant,
      getDuration,
      getEasing,
      getTransitionCSS,
      getAnimationCSS,
    };
  }, [animation]);
}

/**
 * Hook to check user's motion preferences
 * @returns Object with motion preferences
 */
export function useMotionPreference() {
  const { animation } = useTheme();
  
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  const isMotionSafe = useMemo(() => {
    // If animation is disabled in theme, return false
    if (!animation.motionSafe.enabled) return false;
    
    // If user prefers reduced motion and we respect it, return false
    if (prefersReducedMotion && !animation.motionSafe.reducedIntensity) return false;
    
    return true;
  }, [animation.motionSafe, prefersReducedMotion]);
  
  const shouldReduceIntensity = useMemo(() => {
    return prefersReducedMotion && animation.motionSafe.reducedIntensity;
  }, [prefersReducedMotion, animation.motionSafe.reducedIntensity]);
  
  return {
    isMotionSafe,
    prefersReducedMotion,
    shouldReduceIntensity,
  };
}

/**
 * Hook to animate a value directly
 * @param initialValue The initial value
 * @returns The animated value and controls
 */
export function useAnimatedValue<T>(initialValue: T) {
  const { animation } = useTheme();
  const { isMotionSafe } = useMotionPreference();
  
  // In a real implementation, we would use a state or ref to track the value
  // and apply animations. This is a placeholder for the actual implementation.
  const setValue = useCallback((newValue: T, options?: { duration?: keyof typeof animation.duration, easing?: keyof typeof animation.easing }) => {
    // Placeholder for animation logic
    console.log('Animating value from', initialValue, 'to', newValue, 'with options', options);
    
    // In a real implementation, we would animate the change
    return newValue;
  }, [animation, initialValue]);
  
  return {
    value: initialValue,
    setValue,
    isMotionSafe,
  };
}

/**
 * Generate CSS keyframes string for custom animations
 * @param name The animation name
 * @param keyframes The keyframes object
 * @returns CSS keyframes string
 */
export function generateKeyframes(name: string, keyframes: Record<string, Record<string, string>>) {
  const keyframeString = Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      
      return `${key} { ${styleString} }`;
    })
    .join(' ');
  
  return `@keyframes ${name} { ${keyframeString} }`;
} 