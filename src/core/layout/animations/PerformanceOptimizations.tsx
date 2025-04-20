import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../theme/ThemeContext';
import { AnimationType, DurationType } from '../../animation/types';

/**
 * Performance Optimizations for Animations
 * 
 * This file contains performance-optimized animation components and hooks
 * that build upon our existing animation system.
 */

// Helper hooks for optimized animations
export const useOptimizedAnimation = (
  animationType: AnimationType,
  animationDuration: DurationType,
  shouldAnimate: boolean = true
) => {
  // Memoize animation configuration to prevent unnecessary recalculations
  const animationConfig = useMemo(() => {
    if (!shouldAnimate) return { animation: 'none' as AnimationType };
    
    return {
      animation: animationType,
      duration: animationDuration
    };
  }, [animationType, animationDuration, shouldAnimate]);
  
  return animationConfig;
};

// Use IntersectionObserver to only animate when element is in viewport
export const useAnimateOnVisible = (
  animationType: AnimationType,
  animationDuration: DurationType,
  rootMargin: string = '0px',
  threshold: number = 0.1
) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );
    
    // Observe element
    if (ref.current) {
      observerRef.current.observe(ref.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold]);
  
  // Get optimized animation config
  const animationConfig = useOptimizedAnimation(
    animationType,
    animationDuration,
    isVisible
  );
  
  return { ref, isVisible, animationConfig };
};

// Optimized grid component that only renders visible items
export const OptimizedAnimatedGrid: React.FC<{
  children: React.ReactNode[];
  columns: number;
  gap?: number;
  animationType: AnimationType;
  animationDuration: DurationType;
  itemHeight?: number;
  containerHeight?: number;
  itemsPerPage?: number;
}> = React.memo(({
  children,
  columns,
  gap = 16,
  animationType,
  animationDuration,
  itemHeight = 200,
  containerHeight = 600,
  itemsPerPage = 20
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate total number of items
  const totalItems = children.length;
  
  // Calculate visible items based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const newStartIndex = Math.max(
          0,
          Math.floor(scrollTop / itemHeight) * columns
        );
        setStartIndex(newStartIndex);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [columns, itemHeight]);
  
  // Only render visible items plus some buffer
  const visibleChildren = useMemo(() => {
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return children.slice(startIndex, endIndex);
  }, [children, startIndex, itemsPerPage, totalItems]);
  
  // Calculate total height of all items for proper scrolling
  const totalHeight = Math.ceil(totalItems / columns) * (itemHeight + gap) - gap;
  
  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`,
            position: 'absolute',
            top: startIndex / columns * (itemHeight + gap),
            width: '100%'
          }}
        >
          {visibleChildren}
        </div>
      </div>
    </div>
  );
});

// Debounce function for optimizing event handlers
export const useDebounce = <T,>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// RequestAnimationFrame hook for smooth animations
export const useRaf = (callback: (timestamp: number) => void, deps: any[] = []) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      callback(time);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame((time: number) => animate(time));
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, ...deps]);
};

// Optimized tab panel component with hardware acceleration
export const OptimizedTabPanel = React.memo(({
  children,
  activeIndex,
  animationType,
  animationDuration
}: {
  children: React.ReactNode[];
  activeIndex: number;
  animationType: AnimationType;
  animationDuration: DurationType;
}) => {
  const theme = useTheme();
  const [previousIndex, setPreviousIndex] = useState(activeIndex);
  
  // Update previous index after animation completes
  useEffect(() => {
    const duration = theme.animation.duration[animationDuration];
    const timer = setTimeout(() => {
      setPreviousIndex(activeIndex);
    }, typeof duration === 'number' ? duration : 300);
    
    return () => clearTimeout(timer);
  }, [activeIndex, animationDuration, theme.animation.duration]);
  
  // Determine animation direction
  const direction = useMemo(() => {
    return activeIndex > previousIndex ? 'forward' : 'backward';
  }, [activeIndex, previousIndex]);
  
  // Apply hardware-accelerated transforms
  const getTransformStyles = useCallback((index: number) => {
    if (index !== activeIndex) return { display: 'none' };
    
    const baseStyles = {
      transform: 'translate3d(0, 0, 0)',
      backfaceVisibility: 'hidden' as const,
      willChange: 'transform, opacity'
    };
    
    if (animationType === 'none' as AnimationType) return baseStyles;
    
    return baseStyles;
  }, [activeIndex, animationType]);
  
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            position: index === activeIndex ? 'relative' : 'absolute',
            width: '100%',
            ...getTransformStyles(index)
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});

// Usage example for the optimized components
export const PerformanceOptimizedExample: React.FC = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [gridItems, setGridItems] = useState(
    Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`)
  );
  
  // Memoize expensive calculations
  const gridItemsWithColors = useMemo(() => {
    const colors = [
      '#1E88E5', '#43A047', '#E53935', '#FB8C00', '#8E24AA', '#3949AB',
      '#00ACC1', '#7CB342', '#C0CA33', '#FFB300', '#F4511E', '#5D4037'
    ];
    
    return gridItems.map((item, index) => ({
      id: `item-${index}`,
      text: item,
      color: colors[index % colors.length]
    }));
  }, [gridItems]);
  
  // Debounced search for filtering grid items
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Filter grid items based on search term
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return gridItemsWithColors;
    
    return gridItemsWithColors.filter(item =>
      item.text.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [gridItemsWithColors, debouncedSearchTerm]);
  
  // Optimized tab change handler
  const handleTabChange = useCallback((index: number) => {
    setActiveTabIndex(index);
  }, []);
  
  // Memoized grid item renderer
  const renderGridItem = useCallback(({ id, text, color }: { id: string, text: string, color: string }) => (
    <div
      key={id}
      style={{
        backgroundColor: color,
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        height: '100%',
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      {text}
    </div>
  ), []);
  
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Performance Optimized Animations</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>Optimized Tab Panel</h2>
        <div style={{ marginBottom: '20px' }}>
          {['First Tab', 'Second Tab', 'Third Tab'].map((tab, index) => (
            <button 
              key={index}
              onClick={() => handleTabChange(index)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTabIndex === index ? '#f0f0f0' : 'transparent',
                border: '1px solid #ccc',
                borderBottom: activeTabIndex === index ? 'none' : '1px solid #ccc',
                borderRadius: '4px 4px 0 0',
                marginRight: '4px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <OptimizedTabPanel
          activeIndex={activeTabIndex}
          animationType="fade"
          animationDuration="standard"
        >
          <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>First Tab Content</h3>
            <p>This tab panel uses optimized rendering techniques.</p>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>Second Tab Content</h3>
            <p>Hardware accelerated animations improve performance.</p>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #ccc' }}>
            <h3>Third Tab Content</h3>
            <p>Memoization prevents unnecessary re-renders.</p>
          </div>
        </OptimizedTabPanel>
      </section>
      
      <section>
        <h2>Virtualized Grid with 100 Items</h2>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        
        <OptimizedAnimatedGrid
          columns={3}
          gap={16}
          animationType="fade"
          animationDuration="standard"
          itemHeight={120}
          containerHeight={500}
          itemsPerPage={24}
        >
          {filteredItems.map(item => renderGridItem(item))}
        </OptimizedAnimatedGrid>
      </section>
    </div>
  );
};

export default {
  useOptimizedAnimation,
  useAnimateOnVisible,
  OptimizedAnimatedGrid,
  OptimizedTabPanel,
  useDebounce,
  useRaf,
  PerformanceOptimizedExample
}; 