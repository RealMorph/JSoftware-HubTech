/**
 * @deprecated - Import from './consolidated-types' instead
 * This file is maintained for backward compatibility but will be removed in future versions.
 */

import {
  ThemeColors,
  TypographyConfig,
  SpacingConfig,
  BreakpointConfig,
  BorderRadiusConfig,
  ShadowConfig,
  TransitionConfig,
  ThemeConfig,
} from './consolidated-types';

// Re-export all types from consolidated-types for backward compatibility
export * from './consolidated-types';

// Align Theme with ThemeConfig for compatibility
export interface Theme extends ThemeConfig {
  // All properties are inherited from ThemeConfig
  // This ensures full compatibility between Theme and ThemeConfig
}

export type ThemeVisualConfig = ThemeConfig;

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export type ThemeTypography = {
  fontFamily: Record<string, string>;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number | string>;
  letterSpacing: Record<string, string>;
};

/**
 * Base interface for DirectTheme styles
 * Provides a foundation for component-specific theme styles
 */
export interface DirectThemeStyles {
  typography?: {
    scale?: Record<string, string>;
    weight?: Record<string, number>;
  };
  colors?: {
    text?: Record<string, string>;
    error?: Record<string, string>;
    border?: string;
    primary?: Record<string, string>;
  };
  borderRadius?: Record<string, string>;
  spacing?: Record<string, string>;
}

/**
 * Valid spacing scale values
 */
export type SpacingScale = 
  | '0' | '0.5' | '1' | '1.5' | '2' | '2.5' | '3' | '3.5' | '4' 
  | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '14' 
  | '16' | '20' | '24' | '28' | '32' | '36' | '40' | '44' 
  | '48' | '52' | '56' | '60' | '64' | '72' | '80' | '96';

/**
 * Theme context type
 */
export interface ThemeContext {
  getColor: (path: string) => string;
  getTypography: (path: string) => string | number;
  getBorderRadius: (size: string) => string;
  getSpacing: (scale: SpacingScale) => string;
}

/**
 * Theme Types
 * 
 * This file contains TypeScript definitions for theme-related types used throughout the application.
 * These types provide strong typing for theme values and ensure consistency across components.
 */

// Core theme type from the theme context
export interface Theme {
  getColor: (path: string, fallback?: string) => string;
  getTypography: (path: string, fallback?: string | number) => string | number;
  getSpacing: (path: string, fallback?: string) => string;
  getBorderRadius: (path: string, fallback?: string) => string;
  getShadow: (path: string, fallback?: string) => string;
}

// Generated theme styles used in components
export interface ThemeStyles {
  colors: {
    background: {
      default: string;
      paper: string;
      subtle: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary?: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    border: {
      main: string;
    };
    hover: {
      light: string;
    };
    icon?: {
      primary: string;
      secondary: string;
    };
    separator?: {
      main: string;
    };
    chart?: {
      axis: string;
      grid: string;
      tooltip: string;
      point: {
        default: string;
        hover: string;
        active: string;
      };
      bar?: {
        default: string;
        hover: string;
        active: string;
      };
      line?: {
        default: string;
        hover: string;
        active: string;
      };
      pie?: {
        default: string;
        hover: string;
        active: string;
      };
    };
  };
  typography: {
    family?: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight?: {
      normal: number;
    };
    size?: {
      small: string;
      base: string;
      large: string;
    };
    weight?: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    item?: string;
    icon?: string;
    container?: {
      vertical: string;
      horizontal: string;
    };
    element?: {
      height: string;
      padding: string;
    };
  };
  borders: {
    radius: {
      small: string;
      medium: string;
      large: string;
    };
    focus?: {
      width: string;
      color: string;
    };
    width?: {
      thin: string;
      medium: string;
      thick: string;
    };
  };
  shadows: {
    card: string;
    tooltip?: string;
    legend?: string;
  };
  animation?: {
    duration: {
      fast: string;
      normal: string;
      slow?: string;
    };
    easing: {
      easeInOut: string;
      easeOut?: string;
      easeIn?: string;
    };
    hover?: {
      scale: string;
    };
  };
}

// Interface for styled components with transient theme props
export interface StyledComponentProps {
  $themeStyles: ThemeStyles;
}

// Demo component status
export enum ComponentStatus {
  STABLE = 'stable',
  BETA = 'beta',
  ALPHA = 'alpha',
  DEPRECATED = 'deprecated'
}

// Demo component size variants
export type SizeVariant = 'small' | 'medium' | 'large';

// Component display variants
export type DisplayVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

// Export theme utility types
export type ThemeColorPath = string;
export type ThemeSpacingPath = string;
export type ThemeTypographyPath = string;
