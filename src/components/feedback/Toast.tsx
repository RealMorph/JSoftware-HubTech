/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
  borderRadius: string;
  shadowColor: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getBorderRadius, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    successColor: getColor('success', '#4caf50'),
    errorColor: getColor('error', '#f44336'),
    warningColor: getColor('warning', '#ff9800'),
    infoColor: getColor('info', '#2196f3'),
    borderRadius: getBorderRadius('md', '4px'),
    shadowColor: getShadow('md', '0 4px 6px rgba(0, 0, 0, 0.1)'),
  };
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  // eslint-disable-next-line no-unused-vars
  id?: string;
  type?: ToastType;
  message: string;
  duration?: number;
  onClose?: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

// Styled components
const ToastContainer = styled.div<{
  type: ToastType;
  position: string;
  $themeStyles: ThemeStyles;
  id?: string;
}>`
  position: fixed;
  ${props => {
    switch (props.position) {
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
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return props.$themeStyles.successColor;
      case 'error':
        return props.$themeStyles.errorColor;
      case 'warning':
        return props.$themeStyles.warningColor;
      case 'info':
        return props.$themeStyles.infoColor;
      default:
        return props.$themeStyles.infoColor;
    }
  }};
  color: #ffffff;
  padding: 12px 16px;
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.shadowColor};
  margin-bottom: 10px;
  min-width: 250px;
  max-width: 350px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 16px;
  height: 16px;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const Message = styled.div`
  flex: 1;
`;

// Generate a unique ID for each toast
const generateId = (): string => {
  return `toast-${Math.random().toString(36).substring(2, 11)}`;
};

// Main Toast component
export const Toast: React.FC<ToastProps & { id?: string }> = ({
  type = 'info',
  message,
  duration = 3000,
  onClose,
  position = 'top-right',
  id = generateId(),
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose(id);
      }
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, id, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose(id);
    }
  };

  if (!visible) return null;

  // Create portal for toast
  return ReactDOM.createPortal(
    <ToastContainer type={type} position={position} $themeStyles={themeStyles} id={id}>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </ToastContainer>,
    document.body
  );
};

// Add default export
export default Toast;

// ToastManager to handle multiple toasts
interface ToastItem extends ToastProps {
  id: string;
}

export interface ToastManagerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export const useToast = (position: ToastManagerProps['position'] = 'top-right') => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (props: Omit<ToastProps, 'id' | 'onClose' | 'position'>) => {
    const id = generateId();
    const newToast: ToastItem = {
      ...props,
      id,
      onClose: removeToast,
      position,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastManager: React.FC = () => {
    return (
      <>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </>
    );
  };

  return {
    addToast,
    removeToast,
    ToastManager,
    // Helper methods for convenience
    success: (message: string, duration?: number) =>
      addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => addToast({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) =>
      addToast({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => addToast({ type: 'info', message, duration }),
  };
};
