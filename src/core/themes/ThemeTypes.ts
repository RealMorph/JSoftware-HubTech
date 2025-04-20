/**
 * Theme Types
 * 
 * This file contains type definitions for the theme structure used throughout the application.
 * These types ensure proper TypeScript type checking for theme access in styled-components.
 */

/**
 * Color object structure
 */
export interface ColorObject {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

/**
 * Background color structure
 */
export interface BackgroundColors {
  default: string;
  paper: string;
  subtle: string;
}

/**
 * Text color structure
 */
export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
  hint: string;
}

/**
 * Action color structure
 */
export interface ActionColors {
  active: string;
  hover: string;
  selected: string;
  disabled: string;
  disabledBackground: string;
  focus: string;
}

/**
 * Theme colors structure
 */
export interface ThemeColors {
  primary: ColorObject;
  secondary: ColorObject;
  error: ColorObject;
  warning: ColorObject;
  info: ColorObject;
  success: ColorObject;
  background: BackgroundColors;
  text: TextColors;
  action: ActionColors;
  divider: string;
  common: {
    black: string;
    white: string;
  };
}

/**
 * Complete theme structure
 */
export interface Theme {
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeightLight: number;
    fontWeightRegular: number;
    fontWeightMedium: number;
    fontWeightBold: number;
    h1: object;
    h2: object;
    h3: object;
    h4: object;
    h5: object;
    h6: object;
    subtitle1: object;
    subtitle2: object;
    body1: object;
    body2: object;
    button: object;
    caption: object;
    overline: object;
  };
  spacing: (factor: number) => number;
  shape: {
    borderRadius: number;
  };
  shadows: string[];
  zIndex: {
    appBar: number;
    drawer: number;
    modal: number;
    tooltip: number;
    snackbar: number;
  };
  transitions: {
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
    };
    duration: {
      shortest: number;
      shorter: number;
      short: number;
      standard: number;
      complex: number;
      enteringScreen: number;
      leavingScreen: number;
    };
  };
  breakpoints: {
    up: (key: string) => string;
    down: (key: string) => string;
    between: (start: string, end: string) => string;
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
}

// Default fallback values to be used when properties might be missing
export const fallbackValues = {
  colors: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    divider: '#e0e0e0',
    text: {
      primary: '#000000',
      secondary: '#757575'
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)'
    }
  }
}; 