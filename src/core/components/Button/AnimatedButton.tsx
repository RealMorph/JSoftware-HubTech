import React, { useState, useRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useMotionPreference } from '../../animation';

export interface RippleProps {
  x: number;
  y: number;
  size: number;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animateOnHover?: boolean;
  animateOnClick?: boolean;
  disableRipple?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

/**
 * AnimatedButton - A button component with built-in animations
 */
export const AnimatedButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
  animateOnHover = true,
  animateOnClick = true,
  disableRipple = false,
  color = 'primary',
}) => {
  const theme = useTheme();
  const { isMotionEnabled, isReducedMotion } = useMotionPreference();
  const isMotionSafe = isMotionEnabled && !isReducedMotion;
  
  // Ref for ripple effect
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // State for hover and ripple animations
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  
  // Handle ripple effect on click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    
    if (!isMotionSafe || disabled || disableRipple || !animateOnClick) return;
    
    const button = buttonRef.current;
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add new ripple
    const ripple = { x, y, size };
    setRipples([...ripples, ripple]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(r => r !== ripple));
    }, 600);
  };
  
  // Get button sizing
  const getPadding = () => {
    switch (size) {
      case 'small': return `${theme.spacing.xs} ${theme.spacing.sm}`;
      case 'large': return `${theme.spacing.md} ${theme.spacing.lg}`;
      default: return `${theme.spacing.sm} ${theme.spacing.md}`;
    }
  };
  
  const getFontSize = () => {
    switch (size) {
      case 'small': return theme.typography.fontSize.sm;
      case 'large': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.md;
    }
  };
  
  // Get the appropriate color based on the color prop
  const getColorValue = () => {
    switch (color) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };
  
  // Get button colors based on variant
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.text.disabled;
    
    switch (variant) {
      case 'primary': return getColorValue();
      case 'secondary': return theme.colors.secondary;
      case 'outlined': 
      case 'text': 
        return 'transparent';
      default: return getColorValue();
    }
  };
  
  const getHoverBackgroundColor = () => {
    if (disabled) return theme.colors.text.disabled;
    
    switch (variant) {
      case 'primary': return theme.colors.hover.background;
      case 'secondary': return theme.colors.hover.background;
      case 'outlined': return 'rgba(0, 0, 0, 0.05)';
      case 'text': return 'rgba(0, 0, 0, 0.05)';
      default: return theme.colors.hover.background;
    }
  };
  
  const getTextColor = () => {
    if (disabled) return '#ffffff';
    
    switch (variant) {
      case 'primary': 
      case 'secondary': 
        return '#ffffff';
      case 'outlined': 
        return getColorValue();
      case 'text': 
        return theme.colors.text.primary;
      default: return '#ffffff';
    }
  };
  
  const getBorder = () => {
    if (variant === 'outlined') {
      return `1px solid ${disabled ? theme.colors.text.disabled : getColorValue()}`;
    }
    
    return 'none';
  };
  
  // Animation styles
  const getHoverStyles = () => {
    if (!isMotionSafe || disabled || !animateOnHover) return {};
    
    return {
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: isHovered ? 
        (variant !== 'text' && variant !== 'outlined' ? theme.shadows.md : 'none') : 
        (variant !== 'text' && variant !== 'outlined' ? theme.shadows.sm : 'none'),
    };
  };
  
  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      className={`animated-button ${variant} ${size} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: theme.typography.fontWeight.medium,
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        border: getBorder(),
        borderRadius: theme.borderRadius.md,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: isMotionSafe ? 
          `all ${theme.transitions.fast} ${theme.animation.easing.easeInOut}` : 
          'none',
        overflow: 'hidden',
        outline: 'none',
        ...getHoverStyles(),
      }}
    >
      {/* Ripple effects */}
      {ripples.map((ripple, i) => (
        <span 
          key={i}
          style={{
            position: 'absolute',
            top: ripple.y - ripple.size / 2,
            left: ripple.x - ripple.size / 2,
            width: `${ripple.size}px`,
            height: `${ripple.size}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            transform: 'scale(0)',
            animation: isMotionSafe ? 
              `ripple ${theme.transitions.normal} ${theme.animation.easing.easeOut}` : 
              'none',
          }}
        />
      ))}
      
      {/* Icon and content */}
      {icon && iconPosition === 'left' && (
        <span style={{ marginRight: theme.spacing.sm }}>{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span style={{ marginLeft: theme.spacing.sm }}>{icon}</span>
      )}
      
      {/* Add keyframes for ripple animation */}
      {isMotionSafe && (
        <style>
          {`
            @keyframes ripple {
              0% {
                transform: scale(0);
                opacity: 0.5;
              }
              100% {
                transform: scale(1);
                opacity: 0;
              }
            }
          `}
        </style>
      )}
    </button>
  );
};

export default AnimatedButton; 