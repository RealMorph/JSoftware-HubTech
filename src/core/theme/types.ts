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
