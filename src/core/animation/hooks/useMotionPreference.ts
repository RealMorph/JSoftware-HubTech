import { useEffect, useState } from 'react';
import { useAnimation } from '../AnimationProvider';

/**
 * Hook that provides access to motion preference settings and system detection
 * @returns Object containing motion preference information and settings
 */
export function useMotionPreference() {
  const animation = useAnimation();
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  
  // Check system preferences for reduced motion
  useEffect(() => {
    // Check for prefers-reduced-motion media query
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Initial check
    setSystemReducedMotion(motionQuery.matches);
    
    // Listen for changes
    const handleMotionChange = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };
    
    // Add listener
    motionQuery.addEventListener('change', handleMotionChange);
    
    // Clean up
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
  
  const isMotionEnabled = animation.isMotionEnabled;
  const isReducedMotion = animation.isReducedMotion || systemReducedMotion;
  
  const toggleMotionEnabled = animation.toggleMotionEnabled;
  const setIsReducedMotion = animation.setIsReducedMotion;
  
  return {
    // Current motion settings
    isMotionEnabled,
    isReducedMotion,
    systemReducedMotion,
    
    // Controls
    toggleMotionEnabled,
    setReducedMotion: setIsReducedMotion,
    
    // Utility methods
    shouldUseMotion: () => isMotionEnabled && !isReducedMotion,
    getReducedMotionDuration: (duration: number) => isReducedMotion ? 0 : duration
  };
}

export default useMotionPreference; 