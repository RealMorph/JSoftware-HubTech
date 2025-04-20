import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';
import { createPortal } from 'react-dom';

export type ToastPosition = 
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastProps {
  id: string | number;
  message: React.ReactNode;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: (id: string | number) => void;
  position?: ToastPosition;
  showIcon?: boolean;
  showCloseButton?: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  animationDuration?: number;
  isClosing?: boolean;
}

interface ToastContainerProps {
  position: ToastPosition;
  children: React.ReactNode;
}

/**
 * Toast Container - For positioning groups of toasts
 */
const ToastContainer: React.FC<ToastContainerProps> = ({ position, children }) => {
  const getContainerPosition = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '100%',
      width: '320px',
      pointerEvents: 'none', // Allow clicking through container, but children will have pointerEvents: 'auto'
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-center':
        return { ...baseStyles, top: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-center':
        return { ...baseStyles, bottom: '20px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default:
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  return (
    <div style={getContainerPosition()}>
      {children}
    </div>
  );
};

/**
 * AnimatedToast - A toast notification component with built-in animations
 */
export const AnimatedToast: React.FC<ToastProps> = ({
  id,
  message,
  title,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  showIcon = true,
  showCloseButton = true,
  animationType = 'slide',
  animationDuration = 300,
  isClosing = false,
}) => {
  const theme = useTheme();
  const { isMotionEnabled, isReducedMotion } = useMotionPreference();
  const isMotionSafe = isMotionEnabled && !isReducedMotion;
  
  // State for animation
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Set up autoClose timer
  useEffect(() => {
    if (duration && isVisible && !isAnimatingOut && onClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, isAnimatingOut]);
  
  // Handle external close signal
  useEffect(() => {
    if (isClosing && !isAnimatingOut) {
      handleClose();
    }
  }, [isClosing]);
  
  // Handle close with animation
  const handleClose = () => {
    if (!isAnimatingOut) {
      setIsAnimatingOut(true);
      
      // Wait for animation to complete before removing from DOM
      if (isMotionSafe) {
        setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose(id);
        }, animationDuration);
      } else {
        setIsVisible(false);
        if (onClose) onClose(id);
      }
    }
  };
  
  // Get type-specific styles
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          color: '#ffffff',
          icon: '✓',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          color: '#ffffff',
          icon: '⚠',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          color: '#ffffff',
          icon: '✕',
        };
      case 'info':
      default:
        return {
          backgroundColor: theme.colors.info,
          color: '#ffffff',
          icon: 'ℹ',
        };
    }
  };
  
  // Animation styles
  const getAnimationStyles = () => {
    if (!isMotionSafe) {
      return { opacity: isVisible ? 1 : 0 };
    }
    
    const baseStyles = {
      transition: `all ${animationDuration}ms ${theme.animation.easing.easeInOut}`,
      opacity: isAnimatingOut ? 0 : 1,
    };
    
    const isTop = position.startsWith('top');
    
    switch (animationType) {
      case 'slide':
        return {
          ...baseStyles,
          transform: isAnimatingOut 
            ? `translateX(${position.includes('left') ? '-100%' : position.includes('right') ? '100%' : '0'}) translateY(${isTop ? '-10px' : '10px'})` 
            : 'translateX(0) translateY(0)',
        };
      case 'scale':
        return {
          ...baseStyles,
          transform: isAnimatingOut ? 'scale(0.8)' : 'scale(1)',
        };
      case 'fade':
      default:
        return baseStyles;
    }
  };
  
  if (!isVisible) {
    return null;
  }
  
  const typeStyles = getTypeStyles();
  
  // Render toast
  const toastElement = (
    <div 
      className={`animated-toast ${type}`}
      style={{
        position: 'relative',
        display: 'flex',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        backgroundColor: typeStyles.backgroundColor,
        color: typeStyles.color,
        boxShadow: theme.shadows.md,
        overflow: 'hidden',
        pointerEvents: 'auto', // Make toast clickable
        maxWidth: '100%',
        ...getAnimationStyles(),
      }}
    >
      {/* Icon */}
      {showIcon && (
        <div 
          style={{
            marginRight: theme.spacing.md,
            fontSize: theme.typography.fontSize.xl,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {typeStyles.icon}
        </div>
      )}
      
      {/* Content */}
      <div style={{ flexGrow: 1 }}>
        {title && (
          <div 
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.xs,
            }}
          >
            {title}
          </div>
        )}
        <div>{message}</div>
      </div>
      
      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          aria-label="Close toast"
          style={{
            background: 'transparent',
            border: 'none',
            color: typeStyles.color,
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.lg,
            padding: theme.spacing.xs,
            marginLeft: theme.spacing.sm,
            marginRight: '-8px',
            marginTop: '-8px',
            borderRadius: theme.borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
      
      {/* Progress bar */}
      {duration > 0 && !isAnimatingOut && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            width: '100%',
            animation: isMotionSafe ? `toast-countdown ${duration}ms linear forwards` : 'none',
          }}
        />
      )}
      
      {/* Add keyframes for countdown animation */}
      {isMotionSafe && duration > 0 && (
        <style>
          {`
            @keyframes toast-countdown {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}
        </style>
      )}
    </div>
  );
  
  return createPortal(
    <ToastContainer position={position}>
      {toastElement}
    </ToastContainer>,
    document.body
  );
};

/**
 * Toast Manager - To manage multiple toasts with different positions
 */
export interface ToastManagerProps {
  toasts: ToastProps[];
  onClose: (id: string | number) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onClose }) => {
  // Group toasts by position
  const groupedToasts = toasts.reduce<Record<ToastPosition, ToastProps[]>>((acc, toast) => {
    const position = toast.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastProps[]>);
  
  // Render containers for each position
  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <ToastContainer key={position} position={position as ToastPosition}>
          {positionToasts.map(toast => (
            <AnimatedToast 
              key={toast.id}
              {...toast}
              onClose={onClose}
            />
          ))}
        </ToastContainer>
      ))}
    </>
  );
};

export default AnimatedToast; 