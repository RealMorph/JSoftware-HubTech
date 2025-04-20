import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import styled from '@emotion/styled';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';
import { AnimationType, DurationType } from '../../animation/types';

// Types
export type TransitionMode = 'out-in' | 'in-out' | 'concurrent';
export type LocationState = {
  preventAnimation?: boolean;
}

interface AnimatedRouteContextValue {
  currentPath: string;
  prevPath: string | null;
  isTransitioning: boolean;
}

// Context for route animations
const AnimatedRouteContext = createContext<AnimatedRouteContextValue>({
  currentPath: '',
  prevPath: null,
  isTransitioning: false,
});

export const useAnimatedRoute = () => useContext(AnimatedRouteContext);

// Props
export interface AnimatedRouteTransitionProps {
  children?: React.ReactNode;
  animationType?: AnimationType;
  animationDuration?: DurationType;
  mode?: TransitionMode;
  className?: string;
  skipPaths?: string[];
  scrollToTop?: boolean;
}

interface RouteContainerProps {
  duration: string;
  easing: string;
  useMotion: boolean;
  isEntering: boolean;
  isExiting: boolean;
  animationType: AnimationType;
  mode: TransitionMode;
  skipAnimation: boolean;
}

// Styled components
const TransitionContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
`;

const RouteContainer = styled.div<RouteContainerProps>`
  width: 100%;
  height: 100%;
  transition: ${({ useMotion, duration, easing, skipAnimation }) => 
    useMotion && !skipAnimation ? `opacity ${duration} ${easing}, transform ${duration} ${easing}` : 'none'};
  
  /* Positioning */
  position: ${({ mode, isEntering, isExiting }) => {
    // For concurrent mode, we need both routes displayed simultaneously
    if (mode === 'concurrent') return 'absolute';
    // For in-out we need both routes displayed during transition
    if (mode === 'in-out' && (isEntering || isExiting)) return 'absolute';
    // For out-in, only one route is displayed at a time
    if (mode === 'out-in') return isEntering || isExiting ? 'absolute' : 'relative';
    
    return 'relative';
  }};
  
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* Fade animations - Applied to all transition types */
  opacity: ${({ isEntering, isExiting, skipAnimation }) => {
    if (skipAnimation) return 1;
    return isEntering ? 1 : isExiting ? 0 : 1;
  }};
  
  /* Slide animations */
  ${({ animationType, isEntering, isExiting, skipAnimation }) => {
    if (skipAnimation) return 'transform: translateX(0);';
    
    if (animationType === 'slide') {
      if (isEntering) return 'transform: translateX(0);';
      if (isExiting) return 'transform: translateX(-100%);';
      return 'transform: translateX(100%);';
    }
    return '';
  }}
  
  /* Scale animations */
  ${({ animationType, isEntering, isExiting, skipAnimation }) => {
    if (skipAnimation) return 'transform: scale(1);';
    
    if (animationType === 'scale') {
      if (isEntering) return 'transform: scale(1);';
      if (isExiting) return 'transform: scale(0.95);';
      return 'transform: scale(1.05);';
    }
    return '';
  }}
  
  /* Fade transitions don't need special transform styling */
  ${({ animationType }) => 
    animationType === 'fade' ? 'transform: none;' : ''}
  
  /* z-index to control layers */
  z-index: ${({ isEntering, isExiting, mode }) => {
    if (mode === 'in-out') {
      // New route on top
      return isEntering ? 2 : 1;
    } else {
      // Old route on top
      return isExiting ? 2 : 1;
    }
  }};
`;

/**
 * AnimatedRouteTransition - Provides smooth transitions between routes
 */
export const AnimatedRouteTransition: React.FC<AnimatedRouteTransitionProps> = ({
  children,
  animationType = 'fade',
  animationDuration = 'standard',
  mode = 'out-in',
  className = '',
  skipPaths = [],
  scrollToTop = true,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  const useMotion = shouldUseMotion();
  const currentOutlet = useOutlet();
  
  // Animation timing settings
  const duration = theme.animation?.duration?.[animationDuration] || '300ms';
  const numericDuration = parseInt(duration);
  const easing = theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Route tracking state
  const [prevPath, setPrevPath] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [prevRoute, setPrevRoute] = useState<React.ReactNode | null>(null);
  const [currentRoute, setCurrentRoute] = useState<React.ReactNode>(currentOutlet || children);
  
  // Animation state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldShowPrev, setShouldShowPrev] = useState(false);
  const [shouldShowCurrent, setShouldShowCurrent] = useState(true);
  
  // Track if this is initial load
  const initialRender = useRef(true);
  
  // Check if the animation should be skipped for this path
  const shouldSkipAnimation = (path: string) => {
    return skipPaths.some(skipPath => 
      skipPath === path || 
      (skipPath.endsWith('*') && path.startsWith(skipPath.slice(0, -1)))
    );
  };
  
  // Handle route changes
  useEffect(() => {
    // Skip animation on first render or if path is in the skip list
    const shouldSkip = initialRender.current || 
      shouldSkipAnimation(location.pathname) || 
      shouldSkipAnimation(currentPath) ||
      (location.state as LocationState)?.preventAnimation;
    
    if (location.pathname !== currentPath) {
      if (shouldSkip) {
        // Immediate update without animation
        setCurrentPath(location.pathname);
        setCurrentRoute(currentOutlet || children);
        setPrevPath(null);
        setPrevRoute(null);
        setShouldShowPrev(false);
        setShouldShowCurrent(true);
        initialRender.current = false;
        return;
      }
      
      // Start transition
      setIsTransitioning(true);
      setPrevPath(currentPath);
      setPrevRoute(currentRoute);
      
      // Handle different transition modes
      if (mode === 'out-in') {
        // First hide current route
        setShouldShowCurrent(false);
        
        // After exit animation, show new route
        setTimeout(() => {
          setCurrentPath(location.pathname);
          setCurrentRoute(currentOutlet || children);
          setShouldShowPrev(false);
          setShouldShowCurrent(true);
          
          // End transition after enter animation
          setTimeout(() => {
            setIsTransitioning(false);
          }, useMotion ? numericDuration : 0);
        }, useMotion ? numericDuration : 0);
      } else {
        // in-out or concurrent mode
        // Show both routes, update new route immediately
        setShouldShowPrev(true);
        setCurrentPath(location.pathname);
        setCurrentRoute(currentOutlet || children);
        setShouldShowCurrent(true);
        
        // End transition after animations complete
        setTimeout(() => {
          setShouldShowPrev(false);
          setIsTransitioning(false);
        }, useMotion ? numericDuration : 0);
      }
      
      // Scroll to top if enabled
      if (scrollToTop) {
        window.scrollTo(0, 0);
      }
    }
    
    initialRender.current = false;
  }, [location, currentOutlet, children, mode, useMotion, numericDuration, scrollToTop, currentPath]);
  
  // Context value for child components
  const contextValue = {
    currentPath,
    prevPath,
    isTransitioning
  };
  
  // Check if we should skip animation (e.g., initial load or specific route)
  const skipAnimation = initialRender.current || 
    shouldSkipAnimation(location.pathname) || 
    shouldSkipAnimation(currentPath) ||
    Boolean((location.state as LocationState)?.preventAnimation);
  
  return (
    <AnimatedRouteContext.Provider value={contextValue}>
      <TransitionContainer className={`animated-route-transition ${className}`}>
        {shouldShowPrev && prevRoute && (
          <RouteContainer
            className="route-container previous"
            duration={duration}
            easing={easing}
            useMotion={useMotion}
            isEntering={false}
            isExiting={true}
            animationType={animationType}
            mode={mode}
            skipAnimation={skipAnimation}
          >
            {prevRoute}
          </RouteContainer>
        )}
        
        {shouldShowCurrent && (
          <RouteContainer
            className="route-container current"
            duration={duration}
            easing={easing}
            useMotion={useMotion}
            isEntering={isTransitioning}
            isExiting={false}
            animationType={animationType}
            mode={mode}
            skipAnimation={skipAnimation}
          >
            {currentRoute}
          </RouteContainer>
        )}
      </TransitionContainer>
    </AnimatedRouteContext.Provider>
  );
};

export default AnimatedRouteTransition; 