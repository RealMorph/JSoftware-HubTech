import { useAnimation } from '../AnimationProvider';
import { 
  AnimationType, 
  DurationType, 
  EasingType, 
  AnimationPreset, 
  VariantData 
} from '../types';

/**
 * Hook to easily access theme-defined animation presets
 * @param type The animation type (fade, slide, scale, rotate)
 * @param variant The specific variant (in, out, up, down, etc)
 * @param duration The animation duration
 * @param easing The animation easing function
 * @returns Animation preset ready to be used with Framer Motion
 */
export function useAnimationPreset(
  type: AnimationType,
  variant: string,
  duration: DurationType = 'standard',
  easing: EasingType = 'easeInOut'
): AnimationPreset {
  const animation = useAnimation();
  
  if (!animation.isMotionEnabled || animation.isReducedMotion) {
    // Return minimal animation when motion is disabled or reduced
    return {
      initial: {},
      animate: {},
      transition: { duration: 0 }
    };
  }
  
  const variantData = animation.getVariant(type, variant);
  const transitionProps = animation.getTransition(duration, easing);
  
  // Handle different animation types
  switch (type) {
    case 'fade':
      return {
        initial: { opacity: variantData.opacity },
        animate: { opacity: variantData.opacity_to },
        transition: { 
          duration: transitionProps.duration,
          easing: transitionProps.easing
        }
      };
    
    case 'slide':
    case 'scale':
    case 'rotate':
      return {
        initial: { transform: variantData.transform },
        animate: { transform: variantData.transform_to },
        transition: { 
          duration: transitionProps.duration,
          easing: transitionProps.easing
        }
      };
    
    default:
      return {
        initial: {},
        animate: {},
        transition: { 
          duration: transitionProps.duration,
          easing: transitionProps.easing
        }
      };
  }
}

/**
 * Specialized hook for entrance animations
 */
export function useEntranceAnimation(
  type: AnimationType = 'fade',
  variant: string = 'in',
  duration: DurationType = 'standard',
  easing: EasingType = 'easeOut'
): AnimationPreset {
  return useAnimationPreset(type, variant, duration, easing);
}

/**
 * Specialized hook for exit animations
 */
export function useExitAnimation(
  type: AnimationType = 'fade',
  variant: string = 'out',
  duration: DurationType = 'standard',
  easing: EasingType = 'easeIn'
): AnimationPreset {
  return useAnimationPreset(type, variant, duration, easing);
}

/**
 * Specialized hook for hover animations
 */
export function useHoverAnimation(
  type: AnimationType = 'scale',
  variant: string = 'in',
  duration: DurationType = 'shorter',
  easing: EasingType = 'easeOut'
): AnimationPreset {
  return useAnimationPreset(type, variant, duration, easing);
}

export default useAnimationPreset; 