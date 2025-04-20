import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { AlertType, AlertPosition } from './types';
import Alert from './Alert';
import { getSpacing } from '../../core/theme/spacing';

// Alert item interface
export interface AlertItem {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  showIcon?: boolean;
  position?: AlertPosition;
}

// Alert context state interface
interface AlertContextState {
  alerts: AlertItem[];
  defaultPosition: AlertPosition;
  defaultDuration: number;
  defaultAutoClose: boolean;
  defaultShowIcon: boolean;
}

// Alert context actions
type AlertAction = 
  | { type: 'ADD_ALERT'; payload: AlertItem }
  | { type: 'REMOVE_ALERT'; payload: { id: string } }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'SET_DEFAULT_POSITION'; payload: { position: AlertPosition } }
  | { type: 'SET_DEFAULT_DURATION'; payload: { duration: number } }
  | { type: 'SET_DEFAULT_AUTO_CLOSE'; payload: { autoClose: boolean } }
  | { type: 'SET_DEFAULT_SHOW_ICON'; payload: { showIcon: boolean } };

// Alert context interface
interface AlertContextProps {
  alerts: AlertItem[];
  defaultPosition: AlertPosition;
  defaultDuration: number;
  defaultAutoClose: boolean;
  defaultShowIcon: boolean;
  addAlert: (alert: Omit<AlertItem, 'id'>) => string;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  setDefaultPosition: (position: AlertPosition) => void;
  setDefaultDuration: (duration: number) => void;
  setDefaultAutoClose: (autoClose: boolean) => void;
  setDefaultShowIcon: (showIcon: boolean) => void;
}

// Create alert context
const AlertContext = createContext<AlertContextProps | undefined>(undefined);

// Initial state
const initialState: AlertContextState = {
  alerts: [],
  defaultPosition: 'top-right',
  defaultDuration: 5000,
  defaultAutoClose: true,
  defaultShowIcon: true,
};

// Reducer function
const alertReducer = (state: AlertContextState, action: AlertAction): AlertContextState => {
  switch (action.type) {
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload.id),
      };
    case 'CLEAR_ALERTS':
      return {
        ...state,
        alerts: [],
      };
    case 'SET_DEFAULT_POSITION':
      return {
        ...state,
        defaultPosition: action.payload.position,
      };
    case 'SET_DEFAULT_DURATION':
      return {
        ...state,
        defaultDuration: action.payload.duration,
      };
    case 'SET_DEFAULT_AUTO_CLOSE':
      return {
        ...state,
        defaultAutoClose: action.payload.autoClose,
      };
    case 'SET_DEFAULT_SHOW_ICON':
      return {
        ...state,
        defaultShowIcon: action.payload.showIcon,
      };
    default:
      return state;
  }
};

// Alert container with positional styling
const AlertContainer = styled.div<{ position: AlertPosition }>`
  position: fixed;
  display: flex;
  z-index: 1000;
  gap: ${getSpacing('4')};
  
  ${({ position }) => {
    switch (position) {
      case 'top-right':
        return `
          top: ${getSpacing('4')};
          right: ${getSpacing('4')};
          flex-direction: column;
        `;
      case 'top-left':
        return `
          top: ${getSpacing('4')};
          left: ${getSpacing('4')};
          flex-direction: column;
        `;
      case 'bottom-right':
        return `
          bottom: ${getSpacing('4')};
          right: ${getSpacing('4')};
          flex-direction: column-reverse;
        `;
      case 'bottom-left':
        return `
          bottom: ${getSpacing('4')};
          left: ${getSpacing('4')};
          flex-direction: column-reverse;
        `;
      case 'top-center':
        return `
          top: ${getSpacing('4')};
          left: 50%;
          transform: translateX(-50%);
          flex-direction: column;
        `;
      case 'bottom-center':
        return `
          bottom: ${getSpacing('4')};
          left: 50%;
          transform: translateX(-50%);
          flex-direction: column-reverse;
        `;
      default:
        return `
          top: ${getSpacing('4')};
          right: ${getSpacing('4')};
          flex-direction: column;
        `;
    }
  }}
`;

interface AlertProviderProps {
  children: ReactNode;
  defaultPosition?: AlertPosition;
  defaultAutoClose?: boolean;
  defaultDuration?: number;
  defaultShowIcon?: boolean;
}

/**
 * AlertProvider component
 * Provides the alert context to its children and renders the alerts
 */
export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  defaultAutoClose = true,
  defaultDuration = 5000,
  defaultShowIcon = true,
}) => {
  const [state, dispatch] = useReducer(alertReducer, {
    alerts: [],
    defaultPosition,
    defaultDuration,
    defaultAutoClose,
    defaultShowIcon,
  });
  
  // Memoize context value
  const contextValue = useMemo(() => ({
    alerts: state.alerts,
    defaultPosition: state.defaultPosition,
    defaultDuration: state.defaultDuration,
    defaultAutoClose: state.defaultAutoClose,
    defaultShowIcon: state.defaultShowIcon,
    addAlert: (alert: Omit<AlertItem, 'id'>) => {
      const id = uuidv4();
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          autoClose: alert.autoClose ?? state.defaultAutoClose,
          duration: alert.duration ?? state.defaultDuration,
          showIcon: alert.showIcon ?? state.defaultShowIcon,
          position: alert.position ?? state.defaultPosition,
        },
      });
      return id;
    },
    removeAlert: (id: string) => {
      dispatch({
        type: 'REMOVE_ALERT',
        payload: { id },
      });
    },
    clearAlerts: () => {
      dispatch({ type: 'CLEAR_ALERTS' });
    },
    setDefaultPosition: (position: AlertPosition) => {
      dispatch({
        type: 'SET_DEFAULT_POSITION',
        payload: { position },
      });
    },
    setDefaultDuration: (duration: number) => {
      dispatch({
        type: 'SET_DEFAULT_DURATION',
        payload: { duration },
      });
    },
    setDefaultAutoClose: (autoClose: boolean) => {
      dispatch({
        type: 'SET_DEFAULT_AUTO_CLOSE',
        payload: { autoClose },
      });
    },
    setDefaultShowIcon: (showIcon: boolean) => {
      dispatch({
        type: 'SET_DEFAULT_SHOW_ICON',
        payload: { showIcon },
      });
    },
  }), [state]);
  
  // Group alerts by position
  const alertsByPosition = state.alerts.reduce<Record<AlertPosition, AlertItem[]>>(
    (acc, alert) => {
      const position = alert.position || state.defaultPosition;
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(alert);
      return acc;
    },
    {} as Record<AlertPosition, AlertItem[]>
  );

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      
      {/* Render alert containers for each position with alerts */}
      {Object.entries(alertsByPosition).map(([position, alerts]) => (
        <AlertContainer 
          key={position} 
          position={position as AlertPosition}
          aria-live="polite"
        >
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              id={alert.id}
              type={alert.type}
              title={alert.title}
              message={alert.message}
              autoClose={alert.autoClose}
              duration={alert.duration}
              showIcon={alert.showIcon}
              onClose={() => contextValue.removeAlert(alert.id)}
            />
          ))}
        </AlertContainer>
      ))}
    </AlertContext.Provider>
  );
};

/**
 * useAlert hook
 * Provides access to the alert context
 */
export const useAlert = () => {
  const context = useContext(AlertContext);
  
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  
  return {
    alerts: context.alerts,
    addAlert: context.addAlert,
    removeAlert: context.removeAlert,
    clearAlerts: context.clearAlerts,
    setDefaultPosition: context.setDefaultPosition,
    setDefaultDuration: context.setDefaultDuration,
    setDefaultAutoClose: context.setDefaultAutoClose,
    setDefaultShowIcon: context.setDefaultShowIcon,
    
    // Convenience methods for different alert types
    success: (message: string, options?: Partial<Omit<AlertItem, 'id' | 'type' | 'message'>>) => 
      context.addAlert({ type: 'success', message, ...options }),
      
    error: (message: string, options?: Partial<Omit<AlertItem, 'id' | 'type' | 'message'>>) => 
      context.addAlert({ type: 'error', message, ...options }),
      
    warning: (message: string, options?: Partial<Omit<AlertItem, 'id' | 'type' | 'message'>>) => 
      context.addAlert({ type: 'warning', message, ...options }),
      
    info: (message: string, options?: Partial<Omit<AlertItem, 'id' | 'type' | 'message'>>) => 
      context.addAlert({ type: 'info', message, ...options }),
  };
};

export default AlertProvider; 