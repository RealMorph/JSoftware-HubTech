import { ReactNode, MutableRefObject } from 'react';
import useVisibility from './useVisibility';

export interface UseVisibilitySystemOptions {
  /**
   * Root element to use as viewport
   */
  root?: Element | null;
  
  /**
   * Margin around the root element
   */
  rootMargin?: string;
  
  /**
   * Threshold(s) at which the callback should be triggered
   */
  threshold?: number | number[];
  
  /**
   * Whether to only trigger once when the element becomes visible
   */
  triggerOnce?: boolean;
  
  /**
   * Initial visibility state
   */
  initialIsVisible?: boolean;
  
  /**
   * Callback to run when visibility changes
   */
  onVisibilityChange?: (isVisible: boolean) => void;
  
  /**
   * Callback to run when element first becomes visible
   */
  onFirstVisible?: () => void;
}

export interface LazyLoadConfig {
  /**
   * Content to render
   */
  children?: ReactNode;
  
  /**
   * Placeholder to show while content is not yet visible
   */
  placeholder?: ReactNode;
  
  /**
   * Height to use for placeholder
   */
  height?: string | number;
  
  /**
   * Width to use for placeholder
   */
  width?: string | number;
  
  /**
   * Whether to show a fade-in animation
   */
  fadeIn?: boolean;
  
  /**
   * Fade-in animation duration in milliseconds
   */
  fadeInDuration?: number;
  
  /**
   * Offset before element comes into view when it should start loading
   */
  offset?: { top?: number; right?: number; bottom?: number; left?: number };
  
  /**
   * Additional props to pass to LazyLoad component
   */
  [key: string]: any;
}

export interface InfiniteScrollConfig {
  /**
   * Content to render
   */
  children?: ReactNode;
  
  /**
   * Function called when more items should be loaded
   */
  onLoadMore: () => Promise<boolean | void>;
  
  /**
   * Element to display while loading more items
   */
  loadingElement?: ReactNode;
  
  /**
   * Element to display when all items are loaded
   */
  endElement?: ReactNode;
  
  /**
   * Whether there are more items to load
   */
  hasMore?: boolean;
  
  /**
   * Threshold before end of list to trigger loading
   */
  threshold?: number;
  
  /**
   * Additional props to pass to InfiniteScroll component
   */
  [key: string]: any;
}

export interface UseVisibilitySystemReturn<T extends Element = Element> {
  /**
   * Whether the element is currently visible
   */
  isVisible: boolean;
  
  /**
   * Whether the element has ever been visible
   */
  hasBeenVisible: boolean;
  
  /**
   * Ref to attach to the target element
   */
  ref: MutableRefObject<T | null>;
  
  /**
   * Create configuration for LazyLoad component
   * Use this with the LazyLoad component: <LazyLoad {...config} />
   */
  createLazyLoadConfig: (props: Omit<LazyLoadConfig, 'children'>) => LazyLoadConfig;
  
  /**
   * Create configuration for InfiniteScroll component
   * Use this with the InfiniteScroll component: <InfiniteScroll {...config} />
   */
  createInfiniteScrollConfig: (props: InfiniteScrollConfig) => InfiniteScrollConfig;
}

/**
 * A comprehensive hook that combines all visibility-related features
 * 
 * Features:
 * - Visibility tracking with IntersectionObserver
 * - First visibility detection
 * - Helper configuration creators for LazyLoad and InfiniteScroll
 * 
 * @param options Configuration options
 * @returns Object with visibility state, ref, and helper functions
 */
export const useVisibilitySystem = <T extends Element = Element>(
  options: UseVisibilitySystemOptions = {}
): UseVisibilitySystemReturn<T> => {
  const {
    onVisibilityChange,
    onFirstVisible,
    ...visibilityOptions
  } = options;
  
  // Use base visibility hook
  const { isVisible, hasBeenVisible, ref } = useVisibility<T>(visibilityOptions);
  
  // Call onVisibilityChange callback when visibility changes
  if (onVisibilityChange && typeof onVisibilityChange === 'function') {
    onVisibilityChange(isVisible);
  }
  
  // Call onFirstVisible callback when element first becomes visible
  if (hasBeenVisible && onFirstVisible && isVisible && typeof onFirstVisible === 'function') {
    onFirstVisible();
  }
  
  /**
   * Create configuration for LazyLoad component
   */
  const createLazyLoadConfig = (props: Omit<LazyLoadConfig, 'children'>): LazyLoadConfig => {
    return {
      ...props
    };
  };
  
  /**
   * Create configuration for InfiniteScroll component
   */
  const createInfiniteScrollConfig = (props: InfiniteScrollConfig): InfiniteScrollConfig => {
    if (!props.onLoadMore) {
      throw new Error('onLoadMore is required for InfiniteScroll');
    }
    
    return {
      ...props
    };
  };
  
  return {
    isVisible,
    hasBeenVisible,
    ref,
    createLazyLoadConfig,
    createInfiniteScrollConfig
  };
};

export default useVisibilitySystem; 