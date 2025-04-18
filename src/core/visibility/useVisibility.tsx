import { useState, useCallback, useRef, useEffect, MutableRefObject } from 'react';

export interface UseVisibilityOptions {
  /**
   * Root element to use as viewport
   * @default null (browser viewport)
   */
  root?: Element | null;
  
  /**
   * Margin around the root element
   * @default '0px'
   */
  rootMargin?: string;
  
  /**
   * Threshold(s) at which the callback should be triggered
   * @default 0
   */
  threshold?: number | number[];
  
  /**
   * Whether to only trigger once when the element becomes visible
   * @default false
   */
  triggerOnce?: boolean;
  
  /**
   * Initial visibility state
   * @default false
   */
  initialIsVisible?: boolean;
}

export interface UseVisibilityReturn<T extends Element = Element> {
  /**
   * Whether the element is currently visible
   */
  isVisible: boolean;
  
  /**
   * Ref to attach to the target element
   */
  ref: MutableRefObject<T | null>;
  
  /**
   * Whether the element has ever been visible
   */
  hasBeenVisible: boolean;
}

/**
 * Hook for tracking when an element is visible in the viewport
 * 
 * @param options - Configuration options
 * @returns Object with isVisible state and ref to attach to target element
 */
export const useVisibility = <T extends Element = Element>({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  triggerOnce = false,
  initialIsVisible = false,
}: UseVisibilityOptions = {}): UseVisibilityReturn<T> => {
  const [isVisible, setIsVisible] = useState(initialIsVisible);
  const [hasBeenVisible, setHasBeenVisible] = useState(initialIsVisible);
  const ref = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Cleanup function to disconnect the observer
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);
  
  // Setup the intersection observer
  useEffect(() => {
    // If we don't have a valid ref or we've already observed and triggerOnce is true, return
    if (!ref.current || (triggerOnce && hasBeenVisible)) {
      return cleanup;
    }
    
    // Create a new IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        // Use the first entry as we're only observing one element
        const entry = entries[0];
        const isEntryVisible = entry.isIntersecting;
        
        setIsVisible(isEntryVisible);
        
        // If the element becomes visible and hasn't been visible before, update hasBeenVisible
        if (isEntryVisible && !hasBeenVisible) {
          setHasBeenVisible(true);
          
          // If triggerOnce is true, disconnect the observer after the element becomes visible
          if (triggerOnce) {
            cleanup();
          }
        }
      },
      { root, rootMargin, threshold }
    );
    
    // Start observing the target element
    observer.observe(ref.current);
    
    // Store the observer in the ref
    observerRef.current = observer;
    
    // Cleanup the observer when the component unmounts or dependencies change
    return cleanup;
  }, [root, rootMargin, threshold, triggerOnce, hasBeenVisible, cleanup]);
  
  return { isVisible, ref, hasBeenVisible };
};

export default useVisibility; 