import { ReactNode } from 'react';

/**
 * Variant options for Alert component
 */
export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Alert type matches the Alert variant type for consistency
 */
export type AlertType = AlertVariant;

/**
 * Position options for Alert positioning
 */
export type AlertPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/**
 * Props for Alert component
 */
export interface AlertProps {
  /**
   * The severity of the alert
   * @default 'info'
   */
  variant?: AlertVariant;
  
  /**
   * Title of the alert
   */
  title?: ReactNode;
  
  /**
   * Main message of the alert
   */
  message?: ReactNode;
  
  /**
   * Icon to display at the beginning of the alert
   */
  icon?: ReactNode;
  
  /**
   * Whether the alert can be dismissed
   * @default false
   */
  closable?: boolean;
  
  /**
   * Function to call when the alert is closed
   */
  onClose?: () => void;
  
  /**
   * Duration before auto-hiding the alert (in milliseconds)
   * If not provided, the alert won't auto-hide
   */
  autoHideDuration?: number;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Additional CSS styles
   */
  style?: React.CSSProperties;
  
  /**
   * Type of animation to apply
   * @default 'fade'
   */
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate';
  
  /**
   * Direction of animation
   * @default 'in'
   */
  animationDirection?: 'in' | 'out' | 'up' | 'down' | 'left' | 'right';
  
  /**
   * Duration of animation
   * @default 'standard'
   */
  animationDuration?: 'shortest' | 'shorter' | 'short' | 'standard' | 'medium' | 'long' | 'longer' | 'longest';
  
  /**
   * Easing function for animation
   * @default 'easeOut'
   */
  animationEasing?: 'easeInOut' | 'easeIn' | 'easeOut' | 'sharp' | 'elastic' | 'bounce' | 'cubic';
  
  /**
   * Delay before animation starts (in milliseconds)
   * @default 0
   */
  animationDelay?: number;
  
  /**
   * Whether animation is disabled
   * @default false
   */
  animationDisabled?: boolean;
  
  /**
   * Children of the alert
   */
  children?: ReactNode;
  
  /**
   * Any additional props to pass to the component
   */
  [key: string]: any;
} 