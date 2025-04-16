import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  /**
   * Whether the focus trap is active
   */
  active: boolean;
  
  /**
   * The content within which to trap focus
   */
  children: React.ReactNode;
}

/**
 * A component that traps focus within its children when active.
 * Used by modal dialogs and other overlay components to ensure keyboard navigation stays within the component.
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({ active, children }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  
  // Keep track of which element was focused before activating the trap
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement;
    }
  }, [active]);
  
  // Focus the trap container when activated
  useEffect(() => {
    if (!active || !rootRef.current) return;
    
    const root = rootRef.current;
    
    // Get all focusable elements in the trap
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      
      const elements = root.querySelectorAll<HTMLElement>(focusableSelectors.join(', '));
      return Array.from(elements);
    };
    
    // Focus the first focusable element inside the trap
    const focusFirstElement = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        // If no focusable elements, focus the container itself
        root.setAttribute('tabindex', '-1');
        root.focus();
      }
    };
    
    // Set initial focus
    focusFirstElement();
    
    // Handle tab key to keep focus trapped
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // If shift+tab on first element, move to last element
      if (event.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      } 
      // If tab on last element, move to first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);
  
  // Restore previous focus when trap is deactivated
  useEffect(() => {
    return () => {
      if (previousFocusRef.current && typeof (previousFocusRef.current as HTMLElement).focus === 'function') {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, []);
  
  return (
    <div ref={rootRef} style={{ outline: 'none' }}>
      {children}
    </div>
  );
}; 