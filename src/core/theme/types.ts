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
  ThemeConfig
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
