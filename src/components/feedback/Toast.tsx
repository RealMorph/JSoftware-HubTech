/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
    };
    info: {
      main: string;
      light: string;
      dark: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      light: string;
    };
    background: {
      default: string;
      paper: string;
      disabled: string;
    };
  };
  typography: {
    family: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    weight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      none: number;
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    unit: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borders: {
    width: {
      thin: string;
      normal: string;
      thick: string;
    };
    radius: {
      none: string;
      small: string;
      medium: string;
      large: string;
      full: string;
    };
    style: {
      solid: string;
      dashed: string;
    };
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  animation: {
    duration: {
      fastest: string;
      fast: string;
      normal: string;
      slow: string;
      slowest: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  zIndex: {
    toast: number;
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      primary: {
        main: theme.getColor('primary.main', '#3b82f6'),
        light: theme.getColor('primary.light', '#60a5fa'),
        dark: theme.getColor('primary.dark', '#2563eb'),
      },
      secondary: {
        main: theme.getColor('secondary.main', '#8b5cf6'),
        light: theme.getColor('secondary.light', '#a78bfa'),
        dark: theme.getColor('secondary.dark', '#7c3aed'),
      },
      success: {
        main: theme.getColor('success.main', '#22c55e'),
        light: theme.getColor('success.light', '#4ade80'),
        dark: theme.getColor('success.dark', '#16a34a'),
      },
      error: {
        main: theme.getColor('error.main', '#ef4444'),
        light: theme.getColor('error.light', '#f87171'),
        dark: theme.getColor('error.dark', '#dc2626'),
      },
      warning: {
        main: theme.getColor('warning.main', '#f59e0b'),
        light: theme.getColor('warning.light', '#fbbf24'),
        dark: theme.getColor('warning.dark', '#d97706'),
      },
      info: {
        main: theme.getColor('info.main', '#3b82f6'),
        light: theme.getColor('info.light', '#60a5fa'),
        dark: theme.getColor('info.dark', '#2563eb'),
      },
      text: {
        primary: theme.getColor('text.primary', '#111827'),
        secondary: theme.getColor('text.secondary', '#4b5563'),
        disabled: theme.getColor('text.disabled', '#9ca3af'),
        light: theme.getColor('text.light', '#ffffff'),
      },
      background: {
        default: theme.getColor('background.default', '#ffffff'),
        paper: theme.getColor('background.paper', '#ffffff'),
        disabled: theme.getColor('background.disabled', '#f3f4f6'),
      },
    },
    typography: {
      family: String(theme.getTypography('family.base', 'system-ui')),
      size: {
        xs: String(theme.getTypography('scale.xs', '0.75rem')),
        sm: String(theme.getTypography('scale.sm', '0.875rem')),
        base: String(theme.getTypography('scale.base', '1rem')),
        lg: String(theme.getTypography('scale.lg', '1.125rem')),
        xl: String(theme.getTypography('scale.xl', '1.25rem')),
      },
      weight: {
        normal: Number(theme.getTypography('weights.normal', 400)),
        medium: Number(theme.getTypography('weights.medium', 500)),
        semibold: Number(theme.getTypography('weights.semibold', 600)),
        bold: Number(theme.getTypography('weights.bold', 700)),
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      unit: theme.getSpacing('1', '0.25rem'),
      xs: theme.getSpacing('2', '0.5rem'),
      sm: theme.getSpacing('3', '0.75rem'),
      md: theme.getSpacing('4', '1rem'),
      lg: theme.getSpacing('6', '1.5rem'),
      xl: theme.getSpacing('8', '2rem'),
    },
    borders: {
      width: {
        thin: '1px',
        normal: '2px',
        thick: '3px',
      },
      radius: {
        none: '0',
        small: theme.getBorderRadius('sm', '0.25rem'),
        medium: theme.getBorderRadius('md', '0.375rem'),
        large: theme.getBorderRadius('lg', '0.5rem'),
        full: '9999px',
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
      },
    },
    shadows: {
      none: 'none',
      sm: theme.getShadow('sm', '0 1px 2px rgba(0, 0, 0, 0.05)'),
      md: theme.getShadow('md', '0 4px 6px -1px rgba(0, 0, 0, 0.1)'),
      lg: theme.getShadow('lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1)'),
      xl: theme.getShadow('xl', '0 20px 25px -5px rgba(0, 0, 0, 0.1)'),
      inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    animation: {
      duration: {
        fastest: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slowest: '400ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    zIndex: {
      toast: 1000,
    },
  };
};

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
    const spacing = props.$themeStyles.spacing.lg;
    switch (props.position) {
      case 'top-right':
        return `top: ${spacing}; right: ${spacing};`;
      case 'top-left':
        return `top: ${spacing}; left: ${spacing};`;
      case 'bottom-right':
        return `bottom: ${spacing}; right: ${spacing};`;
      case 'bottom-left':
        return `bottom: ${spacing}; left: ${spacing};`;
      case 'top-center':
        return `top: ${spacing}; left: 50%; transform: translateX(-50%);`;
      case 'bottom-center':
        return `bottom: ${spacing}; left: 50%; transform: translateX(-50%);`;
      default:
        return `top: ${spacing}; right: ${spacing};`;
    }
  }}
  background-color: ${props => props.$themeStyles.colors[props.type].main};
  color: ${props => props.$themeStyles.colors.text.light};
  padding: ${props => `${props.$themeStyles.spacing.sm} ${props.$themeStyles.spacing.md}`};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  box-shadow: ${props => props.$themeStyles.shadows.lg};
  margin-bottom: ${props => props.$themeStyles.spacing.sm};
  min-width: 250px;
  max-width: 350px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: ${props => props.$themeStyles.zIndex.toast};
  font-family: ${props => props.$themeStyles.typography.family};
  font-size: ${props => props.$themeStyles.typography.size.sm};
  font-weight: ${props => props.$themeStyles.typography.weight.medium};
  line-height: ${props => props.$themeStyles.typography.lineHeight.normal};
  animation: fadeIn ${props => props.$themeStyles.animation.duration.normal} ${props => props.$themeStyles.animation.easing.easeOut};

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

const Message = styled.div<{ $themeStyles: ThemeStyles }>`
  flex: 1;
  margin-right: ${props => props.$themeStyles.spacing.sm};
  line-height: ${props => props.$themeStyles.typography.lineHeight.normal};
`;

const CloseButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background: none;
  border: none;
  color: ${props => props.$themeStyles.colors.text.light};
  font-size: ${props => props.$themeStyles.typography.size.lg};
  cursor: pointer;
  margin-left: ${props => props.$themeStyles.spacing.xs};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$themeStyles.spacing.unit};
  width: 24px;
  height: 24px;
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  opacity: 0.7;
  transition: all ${props => props.$themeStyles.animation.duration.fast} ${props => props.$themeStyles.animation.easing.easeInOut};

  &:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
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
      <Message $themeStyles={themeStyles}>{message}</Message>
      <CloseButton $themeStyles={themeStyles} onClick={handleClose}>×</CloseButton>
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
