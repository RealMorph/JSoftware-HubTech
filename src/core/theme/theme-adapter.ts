import React from 'react';
import { Theme } from '@emotion/react';
import {
  ThemeConfig,
  TypographyConfig,
  SpacingConfig,
  ThemeColors,
  BorderRadiusConfig,
  ShadowConfig,
  TransitionConfig,
} from './consolidated-types';

/**
 * Legacy theme property mapping to handle refactored theme structure
 * Maps old property paths to new ones
 */
interface PropertyPathMap {
  [oldPath: string]: string;
}

const TYPOGRAPHY_PATH_MAP: PropertyPathMap = {
  'typography.scale': 'typography.fontSize',
  'typography.weights': 'typography.fontWeight',
  'typography.lineHeights': 'typography.lineHeight',
  'typography.family': 'typography.fontFamily',
};

const SPACING_PATH_MAP: PropertyPathMap = {
  'spacing.1': 'spacing.xs',
  'spacing.2': 'spacing.sm',
  'spacing.3': 'spacing.md',
  'spacing.4': 'spacing.lg',
  'spacing.6': 'spacing.xl',
  'spacing.8': 'spacing.2xl',
  'spacing.12': 'spacing.3xl',
  'spacing.16': 'spacing.4xl',
};

const COLORS_PATH_MAP: PropertyPathMap = {
  'colors.textColors.primary': 'colors.text.primary',
  'colors.textColors.secondary': 'colors.text.secondary',
  'colors.textColors.disabled': 'colors.text.disabled',
  'colors.background.primary': 'colors.background',
  'colors.primary.500': 'colors.primary',
  'colors.secondary.500': 'colors.secondary',
};

/**
 * Converts our internal ThemeConfig to a format compatible with Emotion's Theme
 *
 * This adapter function serves as a bridge between our rich theme configuration
 * and the format expected by the Emotion styling library
 *
 * @param themeConfig Our internal theme configuration
 * @returns A theme object compatible with Emotion's Theme type
 * @deprecated Use DirectThemeProvider instead of theme adapters
 */
export function adaptThemeForEmotion(themeConfig: ThemeConfig): any {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] adaptThemeForEmotion is deprecated and will be removed in a future release. Use DirectThemeProvider instead.`
    );
  }

  // Base colors to satisfy Emotion's expected color schema
  const baseColors = {
    // Neutral colors
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Red spectrum
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Orange spectrum
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    // Remaining base colors to satisfy type requirements
    yellow: { 50: '#fefce8', 100: '#fef9c3', 500: '#eab308', 900: '#713f12' },
    green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 900: '#14532d' },
    blue: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 900: '#1e3a8a' },
    indigo: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 900: '#312e81' },
    purple: { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 900: '#581c87' },
    pink: { 50: '#fdf2f8', 100: '#fce7f3', 500: '#ec4899', 900: '#831843' },
    cyan: { 50: '#ecfeff', 100: '#cffafe', 500: '#06b6d4', 900: '#164e63' },
    teal: { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 900: '#134e4a' },
    lime: { 50: '#f7fee7', 100: '#ecfccb', 500: '#84cc16', 900: '#365314' },
    emerald: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 900: '#064e3b' },
    rose: { 50: '#fff1f2', 100: '#ffe4e6', 500: '#f43f5e', 900: '#881337' },
  };

  // Helper to create color scales from single colors
  const createColorScale = (color: string) => {
    return {
      50: color,
      100: color,
      200: color,
      300: color,
      400: color,
      500: color,
      600: color,
      700: color,
      800: color,
      900: color,
      DEFAULT: color,
    };
  };

  // Get text colors based on format
  const textColors =
    typeof themeConfig.colors.text === 'string'
      ? {
          primary: themeConfig.colors.text,
          secondary: themeConfig.colors.text,
          disabled: themeConfig.colors.text,
        }
      : (themeConfig.colors.text as { primary: string; secondary: string; disabled: string });

  // Map our spacing to Emotion's expected format
  const spacing: Record<string, string> = {};
  if (themeConfig.spacing) {
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      spacing[key] = value;
      // Add numeric equivalents for backward compatibility
      if (key === 'xs') spacing['1'] = value;
      if (key === 'sm') spacing['2'] = value;
      if (key === 'md') spacing['3'] = value;
      if (key === 'lg') spacing['4'] = value;
      if (key === 'xl') spacing['6'] = value;
      if (key === '2xl') spacing['8'] = value;
      if (key === '3xl') spacing['12'] = value;
      if (key === '4xl') spacing['16'] = value;
    });
  }

  // Map typography to include both old and new formats
  const typography = {
    // Original format
    fontFamily: {
      base: themeConfig.typography.fontFamily?.base || 'system-ui, sans-serif',
      heading: themeConfig.typography.fontFamily?.heading || 'system-ui, sans-serif',
      monospace: themeConfig.typography.fontFamily?.monospace || 'ui-monospace, monospace',
    },
    fontSize: themeConfig.typography.fontSize,
    fontWeight: themeConfig.typography.fontWeight,
    lineHeight: themeConfig.typography.lineHeight,
    letterSpacing: themeConfig.typography.letterSpacing,

    // Legacy compatibility
    scale: { ...themeConfig.typography.fontSize },
    weights: { ...themeConfig.typography.fontWeight },
    lineHeights: { ...themeConfig.typography.lineHeight },
    family: {
      primary: themeConfig.typography.fontFamily.base,
      secondary: themeConfig.typography.fontFamily.heading,
      monospace: themeConfig.typography.fontFamily.monospace,
    },
  };

  // Primary and secondary colors with scale
  const primaryColorScale = createColorScale(themeConfig.colors.primary);
  const secondaryColorScale = createColorScale(themeConfig.colors.secondary);

  // Construct a compliant theme object for Emotion
  return {
    // Use our theme colors while ensuring the base colors exist
    colors: {
      ...baseColors,
      // Our custom theme colors with scales for compatibility
      primary: {
        ...primaryColorScale,
        ...createColorScale(themeConfig.colors.primary),
      },
      secondary: {
        ...secondaryColorScale,
        ...createColorScale(themeConfig.colors.secondary),
      },
      // Other theme properties
      background:
        typeof themeConfig.colors.background === 'string'
          ? themeConfig.colors.background
          : (themeConfig.colors.background as any)?.primary || '#ffffff',
      text: textColors.primary,
      textColors, // For backward compatibility
      error: themeConfig.colors.error,
      success: themeConfig.colors.success,
      warning: themeConfig.colors.warning,
      info: themeConfig.colors.info || '#3b82f6',
      white: themeConfig.colors.white || '#ffffff',
      surface: themeConfig.colors.surface || '#ffffff',
    },

    // Typography with both formats
    typography,

    // Spacing with both formats
    spacing,

    // Other properties
    borderRadius: themeConfig.borderRadius,
    shadows: themeConfig.shadows,
    transitions: {
      ...themeConfig.transitions,
      // Legacy support for direct transition values
      fast: themeConfig.transitions.duration.fast,
      normal: themeConfig.transitions.duration.normal,
      slow: themeConfig.transitions.duration.slow,
    },

    // Add breakpoints property to satisfy Theme interface
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1440px',
      '2xl': '1920px',
    },
  };
}

/**
 * Converts an Emotion Theme to our internal ThemeConfig format
 *
 * @param emotionTheme The Emotion theme to convert
 * @returns Our internal ThemeConfig format
 * @deprecated Use DirectThemeProvider instead of theme adapters
 */
export function adaptEmotionTheme(emotionTheme: Theme | any): ThemeConfig {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] adaptEmotionTheme is deprecated and will be removed in a future release. Use DirectThemeProvider instead.`
    );
  }

  // Extract or provide default values for text colors
  const textColors = emotionTheme.colors.textColors || {
    primary: emotionTheme.colors.text || '#000000',
    secondary: emotionTheme.colors.text || '#666666',
    disabled: emotionTheme.colors.text || '#999999',
  };

  return {
    colors: {
      primary: emotionTheme.colors.primary?.DEFAULT || emotionTheme.colors.primary || '#1976d2',
      secondary:
        emotionTheme.colors.secondary?.DEFAULT || emotionTheme.colors.secondary || '#9c27b0',
      success: emotionTheme.colors.success || '#4caf50',
      warning: emotionTheme.colors.warning || '#ff9800',
      error: emotionTheme.colors.error || '#f44336',
      info: emotionTheme.colors.info || '#2196f3',
      text: textColors,
      background: emotionTheme.colors.background || '#ffffff',
      border: emotionTheme.colors.border || '#e0e0e0',
      white: emotionTheme.colors.white || '#ffffff',
      surface: emotionTheme.colors.surface || '#ffffff',
    },
    typography: {
      fontFamily: {
        base:
          emotionTheme.typography?.fontFamily?.base ||
          emotionTheme.typography?.family?.primary ||
          'system-ui, sans-serif',
        heading:
          emotionTheme.typography?.fontFamily?.heading ||
          emotionTheme.typography?.family?.secondary ||
          'system-ui, sans-serif',
        monospace:
          emotionTheme.typography?.fontFamily?.monospace ||
          emotionTheme.typography?.family?.monospace ||
          'ui-monospace, monospace',
      },
      fontSize: emotionTheme.typography?.fontSize ||
        emotionTheme.typography?.scale || {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
      fontWeight: emotionTheme.typography?.fontWeight ||
        emotionTheme.typography?.weights || {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      lineHeight: emotionTheme.typography?.lineHeight ||
        emotionTheme.typography?.lineHeights || {
          none: 1,
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75,
          loose: 2,
        },
      letterSpacing: emotionTheme.typography?.letterSpacing || {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: emotionTheme.spacing || {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1440px',
      '2xl': '1920px',
    },
    borderRadius: emotionTheme.borderRadius || {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
    shadows: emotionTheme.shadows || {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    transitions: {
      duration: {
        fast: emotionTheme.transitions?.duration?.fast || emotionTheme.transitions?.fast || '150ms',
        normal:
          emotionTheme.transitions?.duration?.normal || emotionTheme.transitions?.normal || '300ms',
        slow: emotionTheme.transitions?.duration?.slow || emotionTheme.transitions?.slow || '500ms',
      },
      timing: {
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
      },
    },
  };
}

/**
 * Type guard to check if a given object is a valid ThemeConfig
 *
 * @param theme The object to check
 * @returns True if the object is a valid ThemeConfig, false otherwise
 */
export function isThemeConfig(theme: any): theme is ThemeConfig {
  return (
    theme &&
    typeof theme === 'object' &&
    theme.colors &&
    theme.typography &&
    theme.spacing &&
    theme.borderRadius &&
    theme.shadows &&
    theme.transitions
  );
}

/**
 * Type guard to check if a given object is a valid Emotion Theme
 *
 * @param theme The object to check
 * @returns True if the object is a valid Emotion Theme, false otherwise
 */
export function isEmotionTheme(theme: any): theme is Theme {
  return theme && typeof theme === 'object' && theme.colors && (theme.typography || theme.fonts);
}

/**
 * Normalizes a property path, mapping from legacy to modern paths if needed
 *
 * @param path The property path to normalize
 * @returns The normalized property path
 */
export function normalizePropertyPath(path: string): string {
  // Check typography paths
  for (const [oldPath, newPath] of Object.entries(TYPOGRAPHY_PATH_MAP)) {
    if (path.startsWith(oldPath)) {
      return path.replace(oldPath, newPath);
    }
  }

  // Check spacing paths
  for (const [oldPath, newPath] of Object.entries(SPACING_PATH_MAP)) {
    if (path === oldPath) {
      return newPath;
    }
  }

  // Check color paths
  for (const [oldPath, newPath] of Object.entries(COLORS_PATH_MAP)) {
    if (path.startsWith(oldPath)) {
      return path.replace(oldPath, newPath);
    }
  }

  return path;
}

/**
 * Gets a value from the theme, handling both our ThemeConfig and Emotion Theme formats
 *
 * @param theme The theme object (either format)
 * @param path The path to the property
 * @param fallback Optional fallback value
 * @returns The theme value or fallback
 * @deprecated Use useDirectTheme() hook instead
 */
export function getThemeValue(theme: ThemeConfig | Theme, path: string, fallback?: any): any {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] getThemeValue (adapter) is deprecated and will be removed in a future release. Use useDirectTheme() hook instead.`
    );
  }

  // Check for empty theme
  if (!theme) return fallback;

  // Try to normalize the path
  const normalizedPath = normalizePropertyPath(path);

  // First try the normalized path
  const parts = normalizedPath.split('.');
  let current: any = theme;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Path doesn't exist in normalized form, try original path
      if (path !== normalizedPath) {
        // Reset and try with original path
        current = theme;
        const originalParts = path.split('.');

        for (const originalPart of originalParts) {
          if (current && typeof current === 'object' && originalPart in current) {
            current = current[originalPart];
          } else {
            return fallback;
          }
        }

        return current;
      }

      return fallback;
    }
  }

  return current;
}

/**
 * Specialized helper to get theme color values with proper typing
 *
 * @param theme The theme object
 * @param colorPath The color path (e.g., 'primary', 'text.secondary')
 * @param fallback Optional fallback color
 * @returns The color value
 */
export function getThemeColor(
  theme: ThemeConfig | Theme,
  colorPath: string,
  fallback: string = '#000000'
): string {
  return getThemeValue(theme, `colors.${colorPath}`, fallback);
}

/**
 * Specialized helper to get theme typography values with proper typing
 *
 * @param theme The theme object
 * @param typographyPath The typography path (e.g., 'fontSize.sm', 'fontWeight.bold')
 * @param fallback Optional fallback value
 * @returns The typography value
 */
export function getThemeTypography(
  theme: ThemeConfig | Theme,
  typographyPath: string,
  fallback?: string | number
): string | number {
  return getThemeValue(theme, `typography.${typographyPath}`, fallback);
}

/**
 * Specialized helper to get theme spacing values with proper typing
 *
 * @param theme The theme object
 * @param key The spacing key (e.g., 'sm', 'lg', '2')
 * @param fallback Optional fallback spacing value
 * @returns The spacing value
 */
export function getThemeSpacing(
  theme: ThemeConfig | Theme,
  key: string,
  fallback: string = '0'
): string {
  // Handle numeric keys for backward compatibility
  if (/^\d+$/.test(key)) {
    // Map numeric keys to named keys
    if (key === '1') key = 'xs';
    else if (key === '2') key = 'sm';
    else if (key === '3') key = 'md';
    else if (key === '4') key = 'lg';
    else if (key === '6') key = 'xl';
    else if (key === '8') key = '2xl';
    else if (key === '12') key = '3xl';
    else if (key === '16') key = '4xl';
  }

  return getThemeValue(theme, `spacing.${key}`, fallback);
}

/**
 * Creates a component wrapper that adapts theme objects
 *
 * @param Component The component to wrap
 * @param adapter The adapter function to use
 * @returns A wrapped component with theme adaption
 * @deprecated Use DirectThemeProvider instead for consistent theme access
 */
export function withThemeAdapter(
  Component: React.ComponentType<any>,
  adapter: (theme: any) => any = adaptThemeForEmotion
): React.FC<any> {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] withThemeAdapter is deprecated and will be removed in a future release. Use DirectThemeProvider instead.`
    );
  }

  return function ThemeAdapterWrapper(props: any) {
    const { theme, ...rest } = props;
    const adaptedTheme = theme ? adapter(theme) : undefined;

    return React.createElement(Component, {
      ...rest,
      theme: adaptedTheme,
    });
  };
}
