import React, { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import VisibilitySensor from './VisibilitySensor';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';

export interface InfiniteScrollProps {
  /**
   * Content to render
   */
  children: ReactNode;
  
  /**
   * Function called when more items should be loaded
   * Should return a promise that resolves when loading is complete
   */
  onLoadMore: () => Promise<boolean | void>;
  
  /**
   * Element to display while loading more items
   */
  loadingElement?: ReactNode;
  
  /**
   * Element to display when all items are loaded (end reached)
   */
  endElement?: ReactNode;
  
  /**
   * Whether there are more items to load
   * @default true
   */
  hasMore?: boolean;
  
  /**
   * Custom class name for the container
   */
  className?: string;
  
  /**
   * Threshold before the end of the list when onLoadMore should be called
   * @default 300
   */
  threshold?: number;
  
  /**
   * Whether to reset the scroll state when children change
   * @default false
   */
  resetOnChildrenChange?: boolean;
  
  /**
   * Minimum time between load more calls in milliseconds
   * @default 1000
   */
  throttleMs?: number;
  
  /**
   * Initial loading state
   * @default false
   */
  initialLoading?: boolean;
}

/**
 * InfiniteScroll component that loads more items as the user scrolls down
 * 
 * Features:
 * - Load more trigger with configurable threshold
 * - Loading and end indicators
 * - Throttling to prevent too many load calls
 * - TypeScript support
 */
export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  onLoadMore,
  loadingElement,
  endElement,
  hasMore = true,
  className = '',
  threshold = 300,
  resetOnChildrenChange = false,
  throttleMs = 1000,
  initialLoading = false,
}) => {
  const [loading, setLoading] = useState(initialLoading);
  const [end, setEnd] = useState(!hasMore);
  const [error, setError] = useState<Error | null>(null);
  const lastLoadTimeRef = useRef<number>(0);
  const childrenRef = useRef<ReactNode>(children);
  const themeContext = useDirectTheme();
  const styles = useThemeStyles(themeContext);
  
  // Reset state when children change if enabled
  useEffect(() => {
    if (resetOnChildrenChange && children !== childrenRef.current) {
      childrenRef.current = children;
      setEnd(false);
    }
  }, [children, resetOnChildrenChange]);
  
  // Update end state when hasMore changes
  useEffect(() => {
    setEnd(!hasMore);
  }, [hasMore]);
  
  // Handle visibility change for the sensor at the bottom
  const handleVisibilityChange = useCallback(async (isVisible: boolean) => {
    if (isVisible && !loading && !end) {
      const now = Date.now();
      // Throttle calls to onLoadMore
      if (now - lastLoadTimeRef.current > throttleMs) {
        lastLoadTimeRef.current = now;
        try {
          setLoading(true);
          setError(null);
          
          // Call onLoadMore and wait for result
          const result = await onLoadMore();
          
          // If onLoadMore returns false, it means we've reached the end
          if (result === false) {
            setEnd(true);
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load more items'));
          console.error('Error loading more items:', err);
        } finally {
          setLoading(false);
        }
      }
    }
  }, [loading, end, onLoadMore, throttleMs]);
  
  // Render loader or end message
  const renderFooter = () => {
    if (error) {
      return (
        <div className={styles.error}>
          <p>Error loading more items. Please try again.</p>
          <button onClick={() => handleVisibilityChange(true)}>Retry</button>
        </div>
      );
    }
    
    if (loading) {
      return loadingElement || <div className={styles.loading}>Loading more items...</div>;
    }
    
    if (end) {
      return endElement || <div className={styles.end}>No more items to load</div>;
    }
    
    return null;
  };
  
  return (
    <div className={`${styles.container} ${className}`}>
      {children}
      
      {/* Invisible sensor that triggers loading more when it becomes visible */}
      <VisibilitySensor
        onChange={handleVisibilityChange}
        offset={{ bottom: threshold, top: 0, right: 0, left: 0 }}
        partialVisibility={true}
        style={{ height: '20px', width: '100%' }}
      >
        <div />
      </VisibilitySensor>
      
      {renderFooter()}
    </div>
  );
};

// Theme styles for the component
const useThemeStyles = (theme: DirectThemeContextType) => ({
  container: 'infinite-scroll-container',
  loading: 'infinite-scroll-loading',
  end: 'infinite-scroll-end',
  error: 'infinite-scroll-error'
});

export default InfiniteScroll; 