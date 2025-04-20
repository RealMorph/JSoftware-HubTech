import React, { ReactNode, useRef, useLayoutEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';
import { AnimationType, DurationType } from '../../animation/types';

// === Types ===
export interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  gap?: string | number;
  columns?: number | string;
  rows?: number | string;
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  alignItems?: 'start' | 'end' | 'center' | 'stretch';
  justifyItems?: 'start' | 'end' | 'center' | 'stretch';
  alignContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  fullWidth?: boolean;
  fullHeight?: boolean;
  testId?: string;
  // Animation props
  animationType?: AnimationType;
  animationDuration?: DurationType;
  animateChanges?: boolean;
  animateOnMount?: boolean;
}

export interface AnimatedGridItemProps {
  children: ReactNode;
  className?: string;
  colSpan?: number | { [key: string]: number };
  rowSpan?: number;
  colStart?: number;
  rowStart?: number;
  alignSelf?: 'start' | 'end' | 'center' | 'stretch';
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
  testId?: string;
  // Animation props
  animationDelay?: number;
  exitAnimation?: boolean;
}

// Utility functions
const processGap = (
  gapValue: string | number | undefined,
  getSpacing: (key: string, fallback?: string) => string
): string => {
  if (gapValue === undefined) {
    return getSpacing('md', '1rem');
  }

  if (typeof gapValue === 'number') {
    return `${gapValue}px`;
  }

  return gapValue;
};

const getResponsiveValue = (
  value: number | { [key: string]: number },
  defaultValue: number = 0
) => {
  if (typeof value === 'object') {
    return value.base || defaultValue;
  }
  return value || defaultValue;
};

// === Styled Components ===
const StyledGrid = styled.div<Omit<AnimatedGridProps, 'testId' | 'children' | 'className'>>`
  display: grid;
  grid-template-columns: ${({ columns }) =>
    columns ? (typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns) : undefined};
  grid-template-rows: ${({ rows }) =>
    rows ? (typeof rows === 'number' ? `repeat(${rows}, auto)` : rows) : undefined};
  grid-auto-flow: ${({ autoFlow }) => autoFlow || undefined};
  gap: ${({ gap, theme }) => {
    if (gap === undefined) return theme.spacing?.md || '1rem';
    if (typeof gap === 'number') return `${gap}px`;
    return gap;
  }};
  align-items: ${({ alignItems }) => alignItems || undefined};
  justify-items: ${({ justifyItems }) => justifyItems || undefined};
  align-content: ${({ alignContent }) => alignContent || undefined};
  justify-content: ${({ justifyContent }) => justifyContent || undefined};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : undefined)};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : undefined)};
`;

interface StyledGridItemProps extends Omit<AnimatedGridItemProps, 'testId' | 'children' | 'className'> {
  duration: string;
  easing: string;
  useMotion: boolean;
  initialAnimation: boolean;
  animationDelay: number;
  exitAnimation: boolean;
}

const StyledGridItem = styled.div<StyledGridItemProps>`
  grid-column: ${({ colSpan, colStart }) => {
    if (!colSpan) return undefined;
    const span = getResponsiveValue(colSpan);
    return colStart ? `${colStart} / span ${span}` : `span ${span}`;
  }};
  grid-row: ${({ rowSpan, rowStart }) => {
    if (!rowSpan) return undefined;
    return rowStart ? `${rowStart} / span ${rowSpan}` : `span ${rowSpan}`;
  }};
  align-self: ${({ alignSelf }) => alignSelf || undefined};
  justify-self: ${({ justifySelf }) => justifySelf || undefined};
  transition: ${({ useMotion, duration, easing }) => useMotion ? `transform ${duration} ${easing}, opacity ${duration} ${easing}` : 'none'};
  opacity: ${({ initialAnimation }) => initialAnimation ? 0 : 1};
  transform: ${({ initialAnimation }) => initialAnimation ? 'scale(0.9)' : 'scale(1)'};
`;

// === Components ===
export const AnimatedGridItem: React.FC<AnimatedGridItemProps> = ({
  children,
  className,
  colSpan,
  rowSpan,
  colStart,
  rowStart,
  alignSelf,
  justifySelf,
  testId,
  animationDelay = 0,
  exitAnimation = false,
}) => {
  const theme = useTheme();
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  const useMotion = shouldUseMotion();
  const itemRef = useRef<HTMLDivElement>(null);
  const [initialAnimation, setInitialAnimation] = React.useState(true);
  
  // Animation timing
  const defaultDuration = theme.animation?.duration?.standard || '300ms';
  const defaultEasing = theme.animation?.easing?.easeOut || 'cubic-bezier(0, 0, 0.2, 1)';
  
  // Handle initial animation
  React.useEffect(() => {
    if (initialAnimation && useMotion) {
      const timer = setTimeout(() => {
        setInitialAnimation(false);
      }, animationDelay);
      
      return () => clearTimeout(timer);
    }
  }, [initialAnimation, animationDelay, useMotion]);
  
  return (
    <StyledGridItem
      ref={itemRef}
      className={`animated-grid-item ${className || ''}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
      colStart={colStart}
      rowStart={rowStart}
      alignSelf={alignSelf}
      justifySelf={justifySelf}
      data-testid={testId}
      duration={defaultDuration}
      easing={defaultEasing}
      useMotion={useMotion}
      initialAnimation={initialAnimation}
      animationDelay={animationDelay}
      exitAnimation={exitAnimation}
    >
      {children}
    </StyledGridItem>
  );
};

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  children,
  className,
  gap,
  columns = 3,
  rows,
  autoFlow,
  alignItems,
  justifyItems,
  alignContent,
  justifyContent,
  fullWidth,
  fullHeight,
  testId,
  animationType = 'fade',
  animationDuration = 'standard',
  animateChanges = true,
  animateOnMount = true,
}) => {
  const theme = useTheme();
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  const useMotion = shouldUseMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const prevChildrenCount = useRef<number>(0);
  
  // Apply FLIP animation technique on child position changes
  // FLIP: First, Last, Invert, Play
  useLayoutEffect(() => {
    if (!useMotion || !animateChanges || !gridRef.current) return;
    
    const gridElement = gridRef.current;
    const childElements = Array.from(gridElement.children) as HTMLElement[];
    
    // Do nothing if there are no child elements or it's the first render
    if (childElements.length === 0 || prevChildrenCount.current === 0) {
      prevChildrenCount.current = childElements.length;
      return;
    }
    
    // Store current positions
    const positions = childElements.map(child => {
      const rect = child.getBoundingClientRect();
      return { element: child, rect };
    });
    
    // Force a reflow so the browser calculates new positions
    window.requestAnimationFrame(() => {
      // Get new positions after DOM update
      positions.forEach(({ element, rect }) => {
        const newRect = element.getBoundingClientRect();
        
        // Skip if position hasn't changed
        if (
          rect.left === newRect.left && 
          rect.top === newRect.top
        ) return;
        
        // Calculate the delta between old and new positions
        const deltaX = rect.left - newRect.left;
        const deltaY = rect.top - newRect.top;
        
        if (deltaX === 0 && deltaY === 0) return;
        
        // Apply the inverted position as a transform
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        element.style.transition = 'none';
        
        // Force a reflow to make sure the transform is applied
        element.offsetHeight; // eslint-disable-line no-unused-expressions
        
        // Apply animation to return to the actual position
        const duration = parseFloat(theme.animation?.duration?.[animationDuration] || '300') / 1000;
        const easing = theme.animation?.easing?.easeOut || 'cubic-bezier(0, 0, 0.2, 1)';
        
        element.style.transition = `transform ${duration}s ${easing}`;
        element.style.transform = '';
      });
    });
    
    prevChildrenCount.current = childElements.length;
  }, [children, useMotion, animateChanges, theme.animation, animationDuration]);
  
  // Process children to add staggered animation delays
  const processedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;
    
    // Only apply animation props to AnimatedGridItem components
    if (child.type === AnimatedGridItem) {
      return React.cloneElement(child, {
        animationDelay: animateOnMount ? index * 50 : 0, // Staggered delay
      } as { animationDelay: number });
    }
    
    return child;
  });
  
  return (
    <StyledGrid
      ref={gridRef}
      className={`animated-grid ${className || ''}`}
      gap={gap}
      columns={columns}
      rows={rows}
      autoFlow={autoFlow}
      alignItems={alignItems}
      justifyItems={justifyItems}
      alignContent={alignContent}
      justifyContent={justifyContent}
      fullWidth={fullWidth}
      fullHeight={fullHeight}
      data-testid={testId}
    >
      {processedChildren}
    </StyledGrid>
  );
};

export default AnimatedGrid; 