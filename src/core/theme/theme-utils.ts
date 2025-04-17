import { ThemeConfig } from './consolidated-types';
import { defaultTheme } from './default-theme';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import { DefaultTheme } from 'styled-components';
import { isThemeConfig } from './theme-adapter';

/**
 * Centralized theme utility for accessing theme values with smart fallbacks.
 * This should be the only way to access theme values in the application.
 */

// Common theme value fallbacks
export const themeValueFallbacks: Record<string, string> = {
  // Colors
  'colors.primary': '#007AFF',
  'colors.secondary': '#5856D6',
  'colors.primaryDark': '#0062CC',
  'colors.secondaryDark': '#4240B0',
  'colors.white': '#FFFFFF',
  'colors.surface': '#FFFFFF',
  'colors.text': '#000000',

  // Background colors
  'colors.background.primary': '#FFFFFF',
  'colors.background.secondary': '#F2F2F7',
  'colors.background.tertiary': '#E5E5EA',
  'colors.background.paper': '#FFFFFF',
  'colors.background.default': '#FFFFFF',

  // Text colors
  'colors.textColors.primary': '#000000',
  'colors.textColors.secondary': '#3C3C43',
  'colors.textColors.disabled': '#999999',
  'colors.textColors.contrastText': '#FFFFFF',
  'colors.text.primary': '#000000',
  'colors.text.secondary': '#3C3C43',

  // Border colors
  'colors.border.primary': '#C7C7CC',
  'colors.border.secondary': '#D1D1D6',

  // Semantic colors
  'colors.success': '#34C759',
  'colors.warning': '#FF9500',
  'colors.error': '#FF3B30',

  // Typography
  'typography.family.primary':
    'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
  'typography.family.secondary': 'Georgia, Cambria, Times New Roman, Times, serif',
  'typography.family.monospace':
    'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',

  // Typography scale
  'typography.scale.xs': '0.75rem',
  'typography.scale.sm': '0.875rem',
  'typography.scale.base': '1rem',
  'typography.scale.lg': '1.125rem',
  'typography.scale.xl': '1.25rem',
  'typography.scale.2xl': '1.5rem',

  // Typography weights
  'typography.weights.thin': '100',
  'typography.weights.extralight': '200',
  'typography.weights.light': '300',
  'typography.weights.normal': '400',
  'typography.weights.medium': '500',
  'typography.weights.semibold': '600',
  'typography.weights.bold': '700',

  // Spacing
  'spacing.0': '0',
  'spacing.1': '0.25rem',
  'spacing.2': '0.5rem',
  'spacing.3': '0.75rem',
  'spacing.4': '1rem',
  'spacing.6': '1.5rem',
  'spacing.unit': '0.25rem',
  'spacing.md': '1rem',

  // Border radius
  'borderRadius.none': '0',
  'borderRadius.sm': '0.125rem',
  'borderRadius.base': '0.25rem',
  'borderRadius.md': '0.375rem',
  'borderRadius.lg': '0.5rem',

  // Shadows
  'shadows.none': 'none',
  'shadows.sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'shadows.base': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  'shadows.md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',

  // Transitions
  'transitions.fast': '150ms',
  'transitions.normal': '300ms',
  'transitions.slow': '500ms',

  // Color scales (flat colors mapped to scale values)
  'colors.primary.50': '#EFF6FF',
  'colors.primary.100': '#DBEAFE',
  'colors.primary.500': '#007AFF',
  'colors.primary.600': '#0062CC',
  'colors.primary.700': '#0050A6',

  'colors.secondary.50': '#F5F3FF',
  'colors.secondary.100': '#E9D5FF',
  'colors.secondary.500': '#5856D6',
  'colors.secondary.600': '#4240B0',

  'colors.gray.50': '#F9FAFB',
  'colors.gray.100': '#F3F4F6',
  'colors.gray.200': '#E5E7EB',
  'colors.gray.300': '#D1D5DB',
  'colors.gray.400': '#9CA3AF',
  'colors.gray.500': '#6B7280',
  'colors.gray.600': '#4B5563',
  'colors.gray.700': '#374151',
  'colors.gray.800': '#1F2937',
  'colors.gray.900': '#111827',
};

/**
 * Gets a value from the theme by path with type safety
 * @param theme - The theme object
 * @param path - Dot notation path to the theme property (e.g. 'colors.primary')
 * @param defaultValue - Fallback value if path doesn't exist in theme
 * @returns The value from the theme or the default value
 * @deprecated Use useDirectTheme() hook instead: const { getColor, getTypography, etc. } = useDirectTheme();
 */
export function getThemeValue<T = string>(
  theme: DefaultTheme | ThemeConfig,
  path: string,
  defaultValue?: T
): T {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] getThemeValue is deprecated and will be removed in a future release. Use useDirectTheme() hook instead.`
    );
  }

  const value = get(theme, path, defaultValue);

  // Special handling for text color which can be string or object
  if (path === 'colors.text' && typeof value === 'object') {
    return get(value, 'primary', defaultValue) as T;
  }

  return value as T;
}

/**
 * Creates a function bound to a specific theme path for reuse
 * @param path - Dot notation path to the theme property
 * @param defaultValue - Default value if path doesn't exist
 * @returns A function that accepts a theme and returns the value at the path
 * @deprecated Use useDirectTheme() hook instead with the appropriate getter method
 */
export function createThemeValueGetter<T = string>(path: string, defaultValue?: T) {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] createThemeValueGetter is deprecated and will be removed in a future release. Use useDirectTheme() hook instead.`
    );
  }

  return (theme: DefaultTheme | ThemeConfig): T => {
    return getThemeValue<T>(theme, path, defaultValue);
  };
}

/**
 * Resolves responsive values based on breakpoints
 * @param theme - The theme object
 * @param values - Object with breakpoint keys and values
 * @param defaultValue - Default value if no breakpoints match
 * @returns A function that generates responsive CSS
 */
export function responsive<T>(
  theme: DefaultTheme | ThemeConfig,
  values: Record<string, T>,
  defaultValue?: T
) {
  // Implementation for responsive values would go here
  // This is a placeholder for the responsive utility
  return values;
}

/**
 * Validates if the given theme has all required properties
 * @param theme - The theme object to validate
 * @returns true if the theme has all required properties
 */
export function isCompleteTheme(theme: unknown): boolean {
  if (!theme || typeof theme !== 'object') return false;

  const requiredProperties = ['colors', 'typography', 'spacing', 'shadows', 'transitions'];

  return requiredProperties.every(prop => prop in (theme as Record<string, unknown>));
}

/**
 * Helper to access color values from a theme
 *
 * @param theme The theme object
 * @param colorName The name of the color to access
 * @param variant Optional variant of the color (for complex color objects)
 * @param fallback Optional fallback value
 * @returns The color value or fallback
 * @deprecated Use useDirectTheme().getColor() instead
 */
export function getThemeColor(
  theme: Partial<ThemeConfig>,
  colorName: string,
  variant?: string,
  fallback: string = '#000000'
): string {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] getThemeColor is deprecated and will be removed in a future release. Use useDirectTheme().getColor() instead.`
    );
  }
  if (!theme.colors) {
    return fallback || '';
  }

  const color = theme.colors[colorName as keyof typeof theme.colors];

  if (typeof color === 'string') {
    return color;
  }

  if (variant && color && typeof color === 'object') {
    const variantColor = (color as any)[variant];
    return variantColor || fallback || '';
  }

  return fallback || '';
}

/**
 * Gets a spacing value from the theme
 * @param theme The theme object
 * @param size The key of the spacing value to retrieve
 * @param fallback Fallback value if not found in theme
 * @returns The spacing value as a string
 * @deprecated Use useDirectTheme().getSpacing() instead
 */
export function getThemeSpacing(
  theme: Partial<ThemeConfig>,
  size: keyof ThemeConfig['spacing'],
  fallback?: string
): string {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] getThemeSpacing is deprecated and will be removed in a future release. Use useDirectTheme().getSpacing() instead.`
    );
  }

  if (!theme.spacing) {
    return fallback || '0';
  }

  return (theme.spacing[size] || fallback || '0') as string;
}

/**
 * Gets a font size value from the theme
 * @param theme The theme object
 * @param size The key of the font size to retrieve
 * @param fallback Fallback value if not found in theme
 * @returns The font size value as a string
 * @deprecated Use useDirectTheme().getTypography('fontSize.value') instead
 */
export function getThemeFontSize(
  theme: Partial<ThemeConfig>,
  size: keyof ThemeConfig['typography']['fontSize'],
  fallback?: string
): string {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] getThemeFontSize is deprecated and will be removed in a future release. Use useDirectTheme().getTypography() instead.`
    );
  }

  if (!theme.typography || !theme.typography.fontSize) {
    return fallback || '1rem';
  }

  return (theme.typography.fontSize[size] || fallback || '1rem') as string;
}

/**
 * Gets a shadow value from the theme
 * @param theme The theme object
 * @param size The key of the shadow to retrieve
 * @param fallback Fallback value if not found in theme
 * @returns The shadow value as a string
 * @deprecated Use useDirectTheme().getShadow() instead
 */
export function getThemeShadow(
  theme: Partial<ThemeConfig>,
  size: keyof ThemeConfig['shadows'],
  fallback?: string
): string {
  // In development, warn about deprecated usage
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Theme] getThemeShadow is deprecated and will be removed in a future release. Use useDirectTheme().getShadow() instead.`
    );
  }

  if (!theme.shadows) {
    return fallback || 'none';
  }

  return (theme.shadows[size] || fallback || 'none') as string;
}

/**
 * Helper to access border radius values from a theme
 *
 * @param theme The theme object
 * @param size The border radius size key
 * @param fallback Optional fallback value
 * @returns The border radius value or fallback
 */
export function getThemeBorderRadius(
  theme: Partial<ThemeConfig>,
  size: keyof ThemeConfig['borderRadius'],
  fallback?: string
): string {
  if (!theme.borderRadius) {
    return fallback || '0';
  }

  return theme.borderRadius[size] || fallback || '0';
}

/**
 * Helper to access transition duration values from a theme
 *
 * @param theme The theme object
 * @param speed The transition speed key
 * @param fallback Optional fallback value
 * @returns The transition duration value or fallback
 */
export function getThemeTransitionDuration(
  theme: Partial<ThemeConfig>,
  speed: keyof ThemeConfig['transitions']['duration'],
  fallback?: string
): string {
  if (!theme.transitions?.duration) {
    return fallback || '300ms';
  }

  return theme.transitions.duration[speed] || fallback || '300ms';
}

/**
 * Helper to build a full transition CSS value from theme
 *
 * @param theme The theme object
 * @param property CSS property to transition
 * @param speed Speed key from theme
 * @param easing Easing function key from theme
 * @returns Complete transition CSS value
 */
export function getThemeTransition(
  theme: Partial<ThemeConfig>,
  property: string,
  speed: keyof ThemeConfig['transitions']['duration'] = 'normal',
  easing: keyof ThemeConfig['transitions']['timing'] = 'easeInOut'
): string {
  const duration = getThemeTransitionDuration(theme, speed, '300ms');
  const timingFunction = theme.transitions?.timing?.[easing] || 'ease-in-out';

  return `${property} ${duration} ${timingFunction}`;
}

/**
 * Validates if a theme object conforms to the ThemeConfig interface
 * and returns detailed validation errors if not
 *
 * @param theme The theme object to validate
 * @returns Array of validation error messages, empty if valid
 */
export function validateTheme(theme: unknown): string[] {
  const errors: string[] = [];

  if (!theme) {
    errors.push('Theme object is undefined or null');
    return errors;
  }

  if (typeof theme !== 'object') {
    errors.push(`Theme must be an object, got ${typeof theme}`);
    return errors;
  }

  // Check required top-level properties
  const requiredProps = [
    'colors',
    'typography',
    'spacing',
    'borderRadius',
    'shadows',
    'transitions',
  ];

  for (const prop of requiredProps) {
    if (!(prop in (theme as any))) {
      errors.push(`Missing required property: ${prop}`);
    }
  }

  // Return early if missing required properties
  if (errors.length > 0) {
    return errors;
  }

  const { colors, typography, spacing, borderRadius, shadows, transitions } = theme as any;

  // Validate colors
  if (typeof colors !== 'object') {
    errors.push('colors must be an object');
  } else {
    // Check required color properties
    const requiredColors = ['primary', 'secondary', 'text', 'background'];
    for (const color of requiredColors) {
      if (!(color in colors)) {
        errors.push(`Missing required color: ${color}`);
      }
    }

    // Validate color scales
    if (colors.primary && typeof colors.primary === 'object') {
      const requiredScales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      requiredScales.forEach(scale => {
        if (!(scale in colors.primary)) {
          errors.push(`Missing required primary color scale: ${scale}`);
        }
      });
    }

    if (colors.secondary && typeof colors.secondary === 'object') {
      const requiredScales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      requiredScales.forEach(scale => {
        if (!(scale in colors.secondary)) {
          errors.push(`Missing required secondary color scale: ${scale}`);
        }
      });
    }
  }

  // Validate typography
  if (typeof typography !== 'object') {
    errors.push('typography must be an object');
  } else {
    // Check required typography properties
    const requiredTypo = ['fontSize', 'fontWeight', 'lineHeight', 'fontFamily'];
    for (const typo of requiredTypo) {
      if (!(typo in typography)) {
        errors.push(`Missing required typography property: ${typo}`);
      }
    }

    // Check for required font sizes
    if (typography.fontSize && typeof typography.fontSize === 'object') {
      const requiredSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
      requiredSizes.forEach(size => {
        if (!(size in typography.fontSize)) {
          errors.push(`Missing required font size: ${size}`);
        }
      });
    }

    // Check for font weights
    if (typography.fontWeight && typeof typography.fontWeight === 'object') {
      const requiredWeights = ['normal', 'medium', 'bold'];
      requiredWeights.forEach(weight => {
        if (!(weight in typography.fontWeight)) {
          errors.push(`Missing required font weight: ${weight}`);
        }
      });
    }
  }

  // Validate spacing
  if (typeof spacing !== 'object') {
    errors.push('spacing must be an object');
  } else {
    // Check for at least some spacing values
    if (Object.keys(spacing).length === 0) {
      errors.push('spacing object must contain at least one spacing value');
    } else {
      const requiredSpacing = ['0', '1', '2', '4', '8', '16', '24', '32'];
      requiredSpacing.forEach(space => {
        if (!(space in spacing)) {
          errors.push(`Missing required spacing value: ${space}`);
        }
      });
    }
  }

  // Validate borderRadius
  if (typeof borderRadius !== 'object') {
    errors.push('borderRadius must be an object');
  } else {
    const requiredRadii = ['none', 'sm', 'base', 'md', 'lg', 'xl', 'full'];
    requiredRadii.forEach(radius => {
      if (!(radius in borderRadius)) {
        errors.push(`Missing required border radius: ${radius}`);
      }
    });
  }

  // Validate shadows
  if (typeof shadows !== 'object') {
    errors.push('shadows must be an object');
  } else {
    // Check required shadow values
    const requiredShadows = ['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', 'inner'];
    for (const shadow of requiredShadows) {
      if (!(shadow in shadows)) {
        errors.push(`Missing required shadow: ${shadow}`);
      }
    }
  }

  // Validate transitions
  if (typeof transitions !== 'object') {
    errors.push('transitions must be an object');
  } else {
    if (!('duration' in transitions)) {
      errors.push('transitions must contain a "duration" property');
    } else if (typeof transitions.duration === 'object') {
      const requiredDurations = ['fast', 'normal', 'slow'];
      requiredDurations.forEach(duration => {
        if (!(duration in transitions.duration)) {
          errors.push(`Missing required transition duration: ${duration}`);
        }
      });
    }

    if (!('timing' in transitions)) {
      errors.push('transitions must contain a "timing" property');
    } else if (typeof transitions.timing === 'object') {
      const requiredTimings = ['easeIn', 'easeOut', 'easeInOut', 'linear'];
      requiredTimings.forEach(timing => {
        if (!(timing in transitions.timing)) {
          errors.push(`Missing required transition timing: ${timing}`);
        }
      });
    }
  }

  return errors;
}

/**
 * Checks if a theme object is valid
 *
 * @param theme The theme object to check
 * @returns True if the theme is valid, false otherwise
 */
export function isValidTheme(theme: unknown): theme is ThemeConfig {
  return isThemeConfig(theme) && validateTheme(theme).length === 0;
}

/**
 * Ensures a theme is valid, throwing an error with validation messages if not
 *
 * @param theme The theme object to validate
 * @returns The validated theme
 * @throws Error if the theme is invalid
 */
export function ensureValidTheme(theme: unknown): ThemeConfig {
  const errors = validateTheme(theme);

  if (errors.length > 0) {
    throw new Error(`Invalid theme: ${errors.join(', ')}`);
  }

  return {
    ...(theme as ThemeConfig),
    id: (theme as Partial<ThemeConfig>).id || 'default-theme-id',
  };
}

/**
 * Creates a theme validator function that validates themes when NODE_ENV is 'development',
 * but only performs a basic check in production for performance
 *
 * @returns A theme validator function
 */
export function createThemeValidator() {
  const isDev = process.env.NODE_ENV !== 'production';

  return (theme: unknown): ThemeConfig => {
    if (isDev) {
      // Perform full validation in development
      return ensureValidTheme(theme);
    } else {
      // Perform basic validation in production
      if (!isThemeConfig(theme)) {
        throw new Error('Invalid theme structure');
      }

      // In production, still ensure the ID exists
      return {
        ...(theme as ThemeConfig),
        id: (theme as Partial<ThemeConfig>).id || 'default-theme-id',
      };
    }
  };
}

// Create a theme validator instance
export const validateThemeObject = createThemeValidator();

/**
 * Gets a theme object with all values defaulted
 */
export function getDefaultedTheme(theme?: ThemeConfig | null): ThemeConfig {
  return theme || defaultTheme;
}

/**
 * Extract custom component props from a props object
 * This helps avoid DOM warnings about non-standard props
 */
export function extractCustomProps<T extends Record<string, any>>(
  props: T,
  customPropNames: string[]
): {
  customProps: Record<string, any>;
  restProps: Omit<T, keyof Record<string, any>>;
} {
  const customProps: Record<string, any> = {};
  const restProps = { ...props };

  customPropNames.forEach(name => {
    if (name in restProps) {
      customProps[name] = restProps[name];
      delete (restProps as Record<string, any>)[name];
    }
  });

  return { customProps, restProps };
}

/**
 * Type assertion helper for styled components to prevent TypeScript errors
 * when passing theme objects
 */
export function asTheme(theme: any): Record<string, any> {
  return theme as Record<string, any>;
}
