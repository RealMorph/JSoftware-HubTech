import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes, css } from 'styled-components';
import { Theme } from '@emotion/react';
import { getThemeValue } from '../../core/theme/styled';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  showProgressBar?: boolean;
  showCloseButton?: boolean;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  position?: ToastPosition;
  showProgressBar?: boolean;
  showCloseButton?: boolean;
}

interface ToastContextProps {
  showToast: (options: ToastOptions) => string;
  closeToast: (id: string) => void;
  closeAllToasts: () => void;
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
}

// Helper function for theming
const themeValue = (theme: Theme) => (path: string, fallback?: string) => {
  const value = getThemeValue(theme, path);
  return value || fallback || '';
};

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const getToastColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#4caf50';
    case 'error':
      return '#f44336';
    case 'warning':
      return '#ff9800';
    case 'info':
    default:
      return '#2196f3';
  }
};

// Styled Components
const ToastContainer = styled.div<{ type: ToastType; isExiting: boolean }>`
  display: flex;
  align-items: flex-start;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${({ type }) => getToastColor(type)};
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  max-width: 400px;
  animation: ${({ isExiting }) => 
    isExiting
      ? css`${slideOut} 0.3s forwards`
      : css`${slideIn} 0.3s forwards`
  };
`;

const ToastsWrapper = styled.div<{ position: ToastPosition }>`
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-width: 400px;
  
  ${({ position }) => {
    switch (position) {
      case 'top-right':
        return 'top: 20px; right: 20px;';
      case 'top-left':
        return 'top: 20px; left: 20px;';
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;';
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;';
      case 'top-center':
        return 'top: 20px; left: 50%; transform: translateX(-50%);';
      case 'bottom-center':
        return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
      default:
        return 'top: 20px; right: 20px;';
    }
  }}
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div<{ type: ToastType }>`
  color: ${({ type }) => getToastColor(type)};
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ToastMessage = styled.div`
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.25rem;
  margin-left: 0.5rem;
  padding: 0;
  height: 24px;
  width: 24px;
  line-height: 24px;
  text-align: center;
  
  &:hover {
    color: #666;
  }
`;

const ToastIcon = ({ type }: { type: ToastType }) => {
  switch (type) {
    case 'success':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    case 'error':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      );
    case 'warning':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    case 'info':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      );
    default:
      return null;
  }
};

// Context
const ToastContext = createContext<ToastContextProps>({
  showToast: () => '',
  closeToast: () => {},
  closeAllToasts: () => {},
  position: 'top-right',
  setPosition: () => {},
});

// Toast Component
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  showProgressBar = true,
  showCloseButton = true,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300); // Wait for exit animation to complete
  }, [id, onClose]);
  
  useEffect(() => {
    if (duration > 0) {
      const timeout = setTimeout(handleClose, duration);
      return () => clearTimeout(timeout);
    }
  }, [duration, handleClose]);
  
  return (
    <ToastContainer type={type} isExiting={isExiting}>
      <ToastContent>
        <ToastTitle type={type}>
          <ToastIcon type={type} />
          {title || type.charAt(0).toUpperCase() + type.slice(1)}
        </ToastTitle>
        <ToastMessage>{message}</ToastMessage>
      </ToastContent>
      {showCloseButton && (
        <CloseButton onClick={handleClose}>&times;</CloseButton>
      )}
    </ToastContainer>
  );
};

// Toast Provider Component
export const ToastProvider: React.FC<{
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
}> = ({ children, defaultPosition = 'top-right' }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);
  const [mounted, setMounted] = useState(false);
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    setPortalElement(portal);
    return () => {
      document.body.removeChild(portal);
      setMounted(false);
    };
  }, []);
  
  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const toast = {
        id,
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        duration: options.duration !== undefined ? options.duration : 5000,
        onClose: (toastId: string) => closeToast(toastId),
        showProgressBar: options.showProgressBar !== undefined ? options.showProgressBar : true,
        showCloseButton: options.showCloseButton !== undefined ? options.showCloseButton : true,
      };
      
      setToasts((prevToasts) => [...prevToasts, toast]);
      
      if (options.position && options.position !== position) {
        setPosition(options.position);
      }
      
      return id;
    },
    [position]
  );
  
  const closeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);
  
  const closeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  const contextValue = {
    showToast,
    closeToast,
    closeAllToasts,
    position,
    setPosition,
  };

  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted && portalElement && createPortal(
        <ToastsWrapper position={position}>
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} />
          ))}
        </ToastsWrapper>,
        portalElement
      )}
    </ToastContext.Provider>
  );
};

// Hook for using toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 