import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';
import { AnimationType, DurationType } from '../../animation/types';

export interface AnimatedTabPanelProps {
  activeIndex: number;
  children: React.ReactNode;
  className?: string;
  animationType?: AnimationType;
  animationDuration?: DurationType;
  orientation?: 'horizontal' | 'vertical';
  keepMounted?: boolean;
}

interface PanelContainerProps {
  duration: string;
  easing: string;
  useMotion: boolean;
  animationType: AnimationType;
  orientation: 'horizontal' | 'vertical';
  isActive: boolean;
  isEntering: boolean;
  isExiting: boolean;
}

const TabContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const PanelContainer = styled.div<PanelContainerProps>`
  width: 100%;
  height: 100%;
  transition: ${({ useMotion, duration, easing }) => 
    useMotion ? `opacity ${duration} ${easing}, transform ${duration} ${easing}` : 'none'};
  
  /* Position based on active state */
  position: ${({ isActive, isEntering, isExiting }) => 
    isActive || isEntering || isExiting ? 'absolute' : 'absolute'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* Visibility and opacity */
  opacity: ${({ isActive, isEntering, isExiting }) => {
    if (isActive || isEntering) return 1;
    if (isExiting) return 0;
    return 0;
  }};
  
  /* Horizontal animations */
  ${({ animationType, orientation, isEntering, isExiting }) => {
    if (orientation === 'horizontal' && animationType === 'slide') {
      if (isEntering) return 'transform: translateX(0);';
      if (isExiting) return 'transform: translateX(-100%);';
      return 'transform: translateX(100%);';
    }
    return '';
  }}
  
  /* Vertical animations */
  ${({ animationType, orientation, isEntering, isExiting }) => {
    if (orientation === 'vertical' && animationType === 'slide') {
      if (isEntering) return 'transform: translateY(0);';
      if (isExiting) return 'transform: translateY(-100%);';
      return 'transform: translateY(100%);';
    }
    return '';
  }}
  
  /* Fade animations */
  ${({ animationType }) => 
    animationType === 'fade' ? 'transform: none;' : ''}
  
  /* Scale animations */
  ${({ animationType, isEntering, isExiting }) => {
    if (animationType === 'scale') {
      if (isEntering) return 'transform: scale(1);';
      if (isExiting) return 'transform: scale(0.9);';
      return 'transform: scale(1.1);';
    }
    return '';
  }}
  
  /* Pointer events */
  pointer-events: ${({ isActive }) => isActive ? 'auto' : 'none'};
  z-index: ${({ isActive, isEntering, isExiting }) => {
    if (isActive || isEntering) return 2;
    if (isExiting) return 1;
    return 0;
  }};
`;

export const AnimatedTabPanel: React.FC<AnimatedTabPanelProps> = ({
  activeIndex,
  children,
  className,
  animationType = 'fade',
  animationDuration = 'standard',
  orientation = 'horizontal',
  keepMounted = false,
}) => {
  const theme = useTheme();
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  const useMotion = shouldUseMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track previous active index for animation direction
  const [prevActiveIndex, setPrevActiveIndex] = useState(activeIndex);
  const [transitioning, setTransitioning] = useState(false);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  
  // Animation timing settings
  const duration = theme.animation?.duration?.[animationDuration] || '300ms';
  const easing = theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Convert children to array for easier access
  const childrenArray = React.Children.toArray(children);
  
  // Handle tab change animation
  useEffect(() => {
    if (activeIndex !== prevActiveIndex) {
      setExitingIndex(prevActiveIndex);
      setTransitioning(true);
      
      // Reset after animation completes
      const timeout = setTimeout(() => {
        setExitingIndex(null);
        setTransitioning(false);
        setPrevActiveIndex(activeIndex);
      }, useMotion ? parseInt(duration) : 0);
      
      return () => clearTimeout(timeout);
    }
  }, [activeIndex, prevActiveIndex, duration, useMotion]);
  
  return (
    <TabContainer ref={containerRef} className={`animated-tab-panel ${className || ''}`}>
      {childrenArray.map((child, index) => {
        // Determine if this panel should be rendered
        const isActive = index === activeIndex;
        const isExiting = index === exitingIndex;
        const shouldRender = isActive || isExiting || keepMounted;
        
        if (!shouldRender) return null;
        
        return (
          <PanelContainer
            key={index}
            className={`tab-panel ${isActive ? 'active' : ''} ${isExiting ? 'exiting' : ''}`}
            duration={duration}
            easing={easing}
            useMotion={useMotion}
            animationType={animationType}
            orientation={orientation}
            isActive={isActive}
            isEntering={isActive && transitioning}
            isExiting={isExiting}
          >
            {child}
          </PanelContainer>
        );
      })}
    </TabContainer>
  );
};

export default AnimatedTabPanel; 