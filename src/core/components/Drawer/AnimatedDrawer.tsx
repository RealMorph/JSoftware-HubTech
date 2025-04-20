import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference, useEntranceAnimation, useExitAnimation } from '../../animation';
import { createPortal } from 'react-dom';
import { AnimationType, DurationType } from '../../animation/types';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'custom';
  customSize?: string;
  className?: string;
  showBackdrop?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  animationType?: AnimationType;
  animationDuration?: DurationType;
}

/**
 * AnimatedDrawer - A drawer/sidebar component with built-in animations
 */
export const AnimatedDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'medium',
  customSize,
  className = '',
  showBackdrop = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  showCloseButton = true,
  header,
  footer,
  animationType = 'slide',
  animationDuration = 'standard',
}) => {
  const theme = useTheme();
  const { shouldUseMotion, getReducedMotionDuration } = useMotionPreference();
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // State for managing animation
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Determine animation variant based on position
  const getAnimationVariant = () => {
    switch (position) {
      case 'left': return 'left';
      case 'right': return 'right';
      case 'top': return 'up';
      case 'bottom': return 'down';
      default: return 'right';
    }
  };
  
  // Get animation presets
  const entranceAnimation = useEntranceAnimation(animationType, getAnimationVariant(), animationDuration);
  const exitAnimation = useExitAnimation(animationType, getAnimationVariant(), animationDuration);
  
  const useMotion = shouldUseMotion();
  const duration = getReducedMotionDuration(
    parseInt(theme.animation?.duration?.[animationDuration] || '300')
  );
  const durationMs = `${duration}ms`;
  
  // Calculate size based on props
  const getSize = () => {
    if (size === 'custom' && customSize) {
      return customSize;
    }
    
    switch (size) {
      case 'small': return position === 'left' || position === 'right' ? '300px' : '200px';
      case 'medium': return position === 'left' || position === 'right' ? '400px' : '300px';
      case 'large': return position === 'left' || position === 'right' ? '600px' : '400px';
      default: return position === 'left' || position === 'right' ? '400px' : '300px';
    }
  };
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [closeOnEscape, isOpen, onClose]);
  
  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // End animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    } else if (!isOpen && isVisible) {
      setIsAnimating(true);
      
      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, duration]);
  
  // Base styles for drawer
  const getBaseStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      backgroundColor: theme.colors.surface,
      boxShadow: theme.shadows.lg,
      zIndex: theme.zIndex.modal,
      display: 'flex',
      flexDirection: 'column',
    };
    
    // Add transform transition
    if (useMotion) {
      const easing = theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)';
      baseStyles.transition = `transform ${durationMs} ${easing}`;
    }
    
    // Position-specific styles and animations
    switch (position) {
      case 'left':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          bottom: 0,
          width: getSize(),
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        };
      case 'right':
        return {
          ...baseStyles,
          top: 0,
          right: 0,
          bottom: 0,
          width: getSize(),
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        };
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          height: getSize(),
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          height: getSize(),
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        };
      default:
        return baseStyles;
    }
  };
  
  // Backdrop styles
  const getBackdropStyles = (): React.CSSProperties => {
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: theme.zIndex.overlay,
      opacity: isOpen ? 1 : 0,
      transition: useMotion 
        ? `opacity ${durationMs} ${theme.animation?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)'}`
        : 'none',
      visibility: isVisible ? 'visible' : 'hidden',
    };
  };
  
  // Only render when visible
  if (!isVisible) {
    return null;
  }
  
  return createPortal(
    <div className="drawer-container">
      {/* Backdrop */}
      {showBackdrop && (
        <div 
          className="drawer-backdrop"
          style={getBackdropStyles()}
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`drawer drawer-${position} ${className}`}
        style={getBaseStyles()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(header || showCloseButton) && (
          <div 
            className="drawer-header"
            style={{
              padding: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {header}
            
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: theme.spacing.xs,
                  lineHeight: 1,
                  color: theme.colors.text.secondary,
                }}
              >
                &times;
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div 
          className="drawer-content"
          style={{
            padding: theme.spacing.md,
            overflow: 'auto',
            flexGrow: 1,
          }}
        >
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div 
            className="drawer-footer"
            style={{
              padding: theme.spacing.md,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AnimatedDrawer; 