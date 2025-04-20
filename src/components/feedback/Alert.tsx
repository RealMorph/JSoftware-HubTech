import React, { useEffect } from 'react';
import styled, { css } from 'styled-components';
import { AlertVariant, AlertProps } from './types';
import { useDirectTheme } from '../../core/theme/hooks/useDirectTheme';
import { useComponentAnimation } from '../../core/animation/hooks/useComponentAnimation';

// Helper type to handle color objects
interface ColorObject {
  light: string;
  main: string;
  dark: string;
}

const AlertContainer = styled.div<{
  variant: AlertVariant;
  $hasIcon: boolean;
  $isDismissible: boolean;
}>`
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: ${({ theme }) => theme.spacing?.sm || '0.75rem'};
  border-radius: ${({ theme }) => theme.borderRadius?.md || '0.25rem'};
  margin-bottom: ${({ theme }) => theme.spacing?.sm || '0.75rem'};
  box-sizing: border-box;
  
  ${({ variant, theme }) => {
    // Type-safe way to access color properties
    const getColor = (type: string, shade: 'light' | 'main' | 'dark'): string => {
      const colorObj = theme.colors?.[type] as ColorObject | undefined;
      return colorObj?.[shade] || '';
    };

    switch (variant) {
      case 'success':
        return css`
          background-color: ${getColor('success', 'light')};
          color: ${getColor('success', 'dark')};
          border-left: 4px solid ${getColor('success', 'main')};
        `;
      case 'warning':
        return css`
          background-color: ${getColor('warning', 'light')};
          color: ${getColor('warning', 'dark')};
          border-left: 4px solid ${getColor('warning', 'main')};
        `;
      case 'error':
        return css`
          background-color: ${getColor('error', 'light')};
          color: ${getColor('error', 'dark')};
          border-left: 4px solid ${getColor('error', 'main')};
        `;
      case 'info':
      default:
        return css`
          background-color: ${getColor('info', 'light')};
          color: ${getColor('info', 'dark')};
          border-left: 4px solid ${getColor('info', 'main')};
        `;
    }
  }}
  
  ${({ $hasIcon, theme }) => $hasIcon && css`
    padding-left: ${theme.spacing?.md || '1rem'};
  `}
`;

const AlertIcon = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing?.sm || '0.75rem'};
  color: inherit;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: ${({ theme }) => theme.fontWeight?.bold || 700};
  margin-bottom: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
`;

const AlertMessage = styled.div`
  font-size: ${({ theme }) => theme.fontSize?.sm || '0.875rem'};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing?.xs || '0.5rem'};
  margin-left: ${({ theme }) => theme.spacing?.sm || '0.75rem'};
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
  
  &:focus {
    outline: none;
    opacity: 1;
  }
`;

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  icon,
  onClose,
  closable = false,
  className,
  style,
  autoHideDuration,
  children,
  // Animation props
  animationType = 'fade',
  animationDirection = 'in',
  animationDuration = 'standard',
  animationEasing = 'easeOut',
  animationDelay = 0,
  animationDisabled = false,
  ...rest
}) => {
  const theme = useDirectTheme();
  
  // Animation integration
  const { getAnimationProps } = useComponentAnimation({
    isVisible: true,
    animationType,
    animationDirection,
    animationDuration,
    animationEasing,
    animationDelay,
    animationDisabled
  });
  
  // Auto-hide functionality
  useEffect(() => {
    if (autoHideDuration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoHideDuration, onClose]);
  
  // Get animation styles
  const animationProps = getAnimationProps();
  
  // Combine styles
  const combinedStyle = {
    ...style,
    ...(animationProps.style || {})
  };
  
  return (
    <AlertContainer 
      variant={variant} 
      $hasIcon={!!icon} 
      $isDismissible={closable}
      className={className} 
      style={combinedStyle}
      {...animationProps}
      {...rest}
    >
      {icon && <AlertIcon>{icon}</AlertIcon>}
      
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message && <AlertMessage>{message}</AlertMessage>}
        {children}
      </AlertContent>
      
      {closable && onClose && (
        <CloseButton onClick={onClose} aria-label="Close alert">
          ✕
        </CloseButton>
      )}
    </AlertContainer>
  );
};

export default Alert;