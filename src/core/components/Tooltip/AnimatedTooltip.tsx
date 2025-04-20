import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';
import { createPortal } from 'react-dom';

export type TooltipPlacement = 
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
  offset?: number;
  arrow?: boolean;
  className?: string;
  disabled?: boolean;
  maxWidth?: string;
  triggerOn?: 'hover' | 'click' | 'focus' | 'hover-focus';
  animationType?: 'fade' | 'scale' | 'slide';
}

/**
 * AnimatedTooltip - A tooltip component with built-in animations
 */
export const AnimatedTooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  offset = 8,
  arrow = true,
  className = '',
  disabled = false,
  maxWidth = '250px',
  triggerOn = 'hover',
  animationType = 'fade',
}) => {
  const theme = useTheme();
  const { isMotionEnabled, isReducedMotion } = useMotionPreference();
  const isMotionSafe = isMotionEnabled && !isReducedMotion;
  
  // Refs for positioning
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  
  // State for controlling visibility and positioning
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0 });
  
  // Delay timers
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate position based on placement
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;
    
    // Calculate position based on placement
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - offset + scrollTop;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        arrowTop = tooltipRect.height;
        arrowLeft = tooltipRect.width / 2 - 5; // 5 is half arrow width
        break;
        
      case 'top-start':
        top = triggerRect.top - tooltipRect.height - offset + scrollTop;
        left = triggerRect.left + scrollLeft;
        arrowTop = tooltipRect.height;
        arrowLeft = Math.min(triggerRect.width / 2, 20);
        break;
        
      case 'top-end':
        top = triggerRect.top - tooltipRect.height - offset + scrollTop;
        left = triggerRect.right - tooltipRect.width + scrollLeft;
        arrowTop = tooltipRect.height;
        arrowLeft = tooltipRect.width - Math.min(triggerRect.width / 2, 20);
        break;
        
      case 'bottom':
        top = triggerRect.bottom + offset + scrollTop;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2) + scrollLeft;
        arrowTop = -10; // 10 is arrow height
        arrowLeft = tooltipRect.width / 2 - 5;
        break;
        
      case 'bottom-start':
        top = triggerRect.bottom + offset + scrollTop;
        left = triggerRect.left + scrollLeft;
        arrowTop = -10;
        arrowLeft = Math.min(triggerRect.width / 2, 20);
        break;
        
      case 'bottom-end':
        top = triggerRect.bottom + offset + scrollTop;
        left = triggerRect.right - tooltipRect.width + scrollLeft;
        arrowTop = -10;
        arrowLeft = tooltipRect.width - Math.min(triggerRect.width / 2, 20);
        break;
        
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollTop;
        left = triggerRect.left - tooltipRect.width - offset + scrollLeft;
        arrowTop = tooltipRect.height / 2 - 5;
        arrowLeft = tooltipRect.width;
        break;
        
      case 'left-start':
        top = triggerRect.top + scrollTop;
        left = triggerRect.left - tooltipRect.width - offset + scrollLeft;
        arrowTop = Math.min(triggerRect.height / 2, 20);
        arrowLeft = tooltipRect.width;
        break;
        
      case 'left-end':
        top = triggerRect.bottom - tooltipRect.height + scrollTop;
        left = triggerRect.left - tooltipRect.width - offset + scrollLeft;
        arrowTop = tooltipRect.height - Math.min(triggerRect.height / 2, 20);
        arrowLeft = tooltipRect.width;
        break;
        
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2) + scrollTop;
        left = triggerRect.right + offset + scrollLeft;
        arrowTop = tooltipRect.height / 2 - 5;
        arrowLeft = -10;
        break;
        
      case 'right-start':
        top = triggerRect.top + scrollTop;
        left = triggerRect.right + offset + scrollLeft;
        arrowTop = Math.min(triggerRect.height / 2, 20);
        arrowLeft = -10;
        break;
        
      case 'right-end':
        top = triggerRect.bottom - tooltipRect.height + scrollTop;
        left = triggerRect.right + offset + scrollLeft;
        arrowTop = tooltipRect.height - Math.min(triggerRect.height / 2, 20);
        arrowLeft = -10;
        break;
    }
    
    // Update positions
    setPosition({ top, left });
    setArrowPosition({ top: arrowTop, left: arrowLeft });
  };
  
  // Handle show/hide with delay
  const handleShow = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (!isVisible && !showTimeoutRef.current) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        showTimeoutRef.current = null;
      }, delay);
    }
  };
  
  const handleHide = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    
    if (isVisible && !hideTimeoutRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        hideTimeoutRef.current = null;
      }, delay / 2); // Hide faster than show
    }
  };
  
  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);
  
  // Update position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isVisible]);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);
  
  // Create props for trigger element
  const getTriggerProps = () => {
    const props: any = {
      ref: (el: HTMLElement | null) => {
        triggerRef.current = el;
        
        // Handle forwarding the ref safely
        const originalRef = (children as any).ref;
        if (originalRef) {
          if (typeof originalRef === 'function') {
            originalRef(el);
          } else if (originalRef.hasOwnProperty('current')) {
            originalRef.current = el;
          }
        }
      }
    };
    
    // Add event handlers based on triggerOn prop
    if (triggerOn === 'hover' || triggerOn === 'hover-focus') {
      props.onMouseEnter = handleShow;
      props.onMouseLeave = handleHide;
    }
    
    if (triggerOn === 'focus' || triggerOn === 'hover-focus') {
      props.onFocus = handleShow;
      props.onBlur = handleHide;
    }
    
    if (triggerOn === 'click') {
      props.onClick = () => setIsVisible(prev => !prev);
    }
    
    return props;
  };
  
  // Get animation styles
  const getAnimationStyles = (): React.CSSProperties => {
    if (!isMotionSafe) return {};
    
    const baseStyles: React.CSSProperties = {
      opacity: 0,
      transition: `opacity ${theme.transitions.fast} ${theme.animation.easing.easeOut}, 
                  transform ${theme.transitions.fast} ${theme.animation.easing.easeOut}`
    };
    
    if (isVisible) {
      switch (animationType) {
        case 'fade':
          return { ...baseStyles, opacity: 1 };
        case 'scale':
          return { 
            ...baseStyles, 
            opacity: 1, 
            transform: 'scale(1)'
          };
        case 'slide':
          let slideFrom = '';
          if (placement.startsWith('top')) slideFrom = 'translateY(10px)';
          else if (placement.startsWith('bottom')) slideFrom = 'translateY(-10px)';
          else if (placement.startsWith('left')) slideFrom = 'translateX(10px)';
          else if (placement.startsWith('right')) slideFrom = 'translateX(-10px)';
          
          return {
            ...baseStyles,
            opacity: 1,
            transform: 'translate(0,0)'
          };
        default:
          return { ...baseStyles, opacity: 1 };
      }
    } else {
      switch (animationType) {
        case 'scale':
          return { 
            ...baseStyles, 
            transform: 'scale(0.95)' 
          };
        case 'slide':
          let slideTo = '';
          if (placement.startsWith('top')) slideTo = 'translateY(-10px)';
          else if (placement.startsWith('bottom')) slideTo = 'translateY(10px)';
          else if (placement.startsWith('left')) slideTo = 'translateX(-10px)';
          else if (placement.startsWith('right')) slideTo = 'translateX(10px)';
          
          return {
            ...baseStyles,
            transform: slideTo
          };
        default:
          return baseStyles;
      }
    }
  };
  
  // Get arrow styles based on placement
  const getArrowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: '10px',
      height: '10px',
      backgroundColor: theme.colors.surface,
      boxShadow: 'inherit',
      top: arrowPosition.top,
      left: arrowPosition.left,
      zIndex: 2,
    };
    
    // Add rotation based on placement
    if (placement.startsWith('top')) {
      return {
        ...baseStyles,
        transform: 'rotate(45deg)',
        boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)',
      };
    } else if (placement.startsWith('bottom')) {
      return {
        ...baseStyles,
        transform: 'rotate(45deg)',
        boxShadow: '-1px -1px 1px rgba(0, 0, 0, 0.1)',
      };
    } else if (placement.startsWith('left')) {
      return {
        ...baseStyles,
        transform: 'rotate(45deg)',
        boxShadow: '1px -1px 1px rgba(0, 0, 0, 0.1)',
      };
    } else if (placement.startsWith('right')) {
      return {
        ...baseStyles,
        transform: 'rotate(45deg)',
        boxShadow: '-1px 1px 1px rgba(0, 0, 0, 0.1)',
      };
    }
    
    return baseStyles;
  };
  
  // Render tooltip
  const renderTooltip = () => {
    if (!isVisible || disabled) {
      return null;
    }
    
    return createPortal(
      <div 
        ref={tooltipRef}
        className={`tooltip ${className}`}
        role="tooltip"
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: theme.zIndex.tooltip,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text.primary,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.sm,
          boxShadow: theme.shadows.md,
          maxWidth,
          ...getAnimationStyles()
        }}
      >
        {arrow && (
          <div 
            className="tooltip-arrow"
            style={getArrowStyles()}
          />
        )}
        <div className="tooltip-content">
          {content}
        </div>
      </div>,
      document.body
    );
  };
  
  // If disabled, just render children
  if (disabled) {
    return children;
  }
  
  // Render trigger with cloned child element
  return (
    <>
      {React.cloneElement(children, getTriggerProps())}
      {renderTooltip()}
    </>
  );
};

export default AnimatedTooltip; 