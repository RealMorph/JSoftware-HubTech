/**
 * Consolidated Theme Type Definitions
 * This file contains the unified theme interface definitions used across the application.
 */

// Color related types
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorPalette {
  [key: string]: ColorScale;
}

export interface SemanticColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface StateColors {
  hover: string;
  active: string;
  disabled: string;
  focus: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string | { 
    primary: string; 
    secondary: string; 
    disabled: string; 
  };
  background: string;
  border: string;
  white: string;
  surface: string;
}

// Typography related types
export interface TypographyConfig {
  fontFamily: {
    base: string;
    heading: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
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
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

// Spacing related types
export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

// Breakpoint related types
export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Border radius related types
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

// Shadow related types
export interface ShadowConfig {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// Transition related types
export interface TransitionConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    linear: string;
  };
}

// The consolidated ThemeConfig interface
export interface ThemeConfig {
  colors: ThemeColors;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  breakpoints: BreakpointConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  transitions: TransitionConfig;
  id?: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Theme state related types
export interface ThemeState {
  name: string;
  config: ThemeConfig;
}

export interface ThemeManager {
  currentTheme: ThemeState;
  setTheme: (theme: ThemeState) => void;
} 