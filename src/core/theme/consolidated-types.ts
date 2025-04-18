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
  error: string;
  warning: string;
  info: string;
  success: string;
  background: string;
  surface: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
  };
  private: {
    buttonBg: string;
    buttonHover: string;
    googleButton: string;
  };
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
    snug: number;
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
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
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
  md: string;
  lg: string;
  xl: string;
  full: string;
}

// Shadow related types
export interface ShadowConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  input: string;
  button: string;
}

// Transition related types
export interface TransitionConfig {
  fastest: string;
  faster: string;
  fast: string;
  normal: string;
  slow: string;
  slower: string;
  slowest: string;
}

export interface ZIndexConfig {
  hide: number;
  auto: 'auto';
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
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
  zIndex: ZIndexConfig;
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
