import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';

export interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  showIcon?: boolean;
  showCloseButton?: boolean;
  className?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
  animationDuration?: number;
  isOpen?: boolean;
}

/**
 * AnimatedAlert - An alert component with built-in animations
 */
export const AnimatedAlert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  showIcon = true,
  showCloseButton = true,
  className = '',
  autoClose = false,
  autoCloseDelay = 5000,
  animationType = 'fade',
  animationDuration = 300,
  isOpen = true,
}) => {
  const theme = useTheme();
  const { isMotionEnabled, isReducedMotion } = useMotionPreference();
  const isMotionSafe = isMotionEnabled && !isReducedMotion;
  
  // State for animation
  const [isVisible, setIsVisible] = useState(isOpen);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Set up autoClose timer
  useEffect(() => {
    if (autoClose && isVisible && !isAnimatingOut && onClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, isVisible, isAnimatingOut]);
  
  // Handle external open/close
  useEffect(() => {
    if (isOpen && !isVisible) {
      setIsVisible(true);
      setIsAnimatingOut(false);
    } else if (!isOpen && isVisible && !isAnimatingOut) {
      handleClose();
    }
  }, [isOpen]);
  
  // Handle close with animation
  const handleClose = () => {
    if (!isAnimatingOut) {
      setIsAnimatingOut(true);
      
      // Wait for animation to complete before removing from DOM
      if (isMotionSafe) {
        setTimeout(() => {
          setIsVisible(false);
          if (onClose) onClose();
        }, animationDuration);
      } else {
        setIsVisible(false);
        if (onClose) onClose();
      }
    }
  };
  
  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(0, 200, 83, 0.1)',
          borderColor: theme.colors.success,
          color: theme.colors.success,
          icon: '✓',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: theme.colors.warning,
          color: theme.colors.warning,
          icon: '⚠',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderColor: theme.colors.error,
          color: theme.colors.error,
          icon: '✕',
        };
      case 'info':
      default:
        return {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderColor: theme.colors.info,
          color: theme.colors.info,
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
    
    switch (animationType) {
      case 'slide':
        return {
          ...baseStyles,
          transform: isAnimatingOut ? 'translateX(100%)' : 'translateX(0)',
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
  
  const variantStyles = getVariantStyles();
  
  return (
    <div 
      className={`animated-alert ${variant} ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        borderLeft: `4px solid ${variantStyles.borderColor}`,
        backgroundColor: variantStyles.backgroundColor,
        color: theme.colors.text.primary,
        boxShadow: theme.shadows.md,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        ...getAnimationStyles(),
      }}
    >
      {/* Icon */}
      {showIcon && (
        <div 
          style={{
            marginRight: theme.spacing.md,
            color: variantStyles.color,
            fontSize: theme.typography.fontSize.xl,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {variantStyles.icon}
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
        <div>{children}</div>
      </div>
      
      {/* Close button */}
      {showCloseButton && onClose && (
        <button
          onClick={handleClose}
          aria-label="Close alert"
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colors.text.secondary,
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
      
      {/* Progress bar for autoClose */}
      {autoClose && isVisible && !isAnimatingOut && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            backgroundColor: variantStyles.color,
            width: '100%',
            animation: isMotionSafe ? `countdown ${autoCloseDelay}ms linear forwards` : 'none',
          }}
        />
      )}
      
      {/* Add keyframes for countdown animation */}
      {isMotionSafe && autoClose && (
        <style>
          {`
            @keyframes countdown {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}
        </style>
      )}
    </div>
  );
};

export default AnimatedAlert; 