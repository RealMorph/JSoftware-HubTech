import { css } from '@emotion/react';
import { defaultTheme } from './theme-persistence';

/**
 * Comprehensive default values for common theme properties
 * These will be used as last-resort fallbacks when no value is found
 */
export const themeDefaults = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    primaryDark: '#0062CC',
    secondaryDark: '#4240B0',
    white: '#FFFFFF',
    black: '#000000',
    text: '#000000',
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
      tertiary: '#E5E5EA',
      paper: '#FFFFFF',
      default: '#FFFFFF'
    },
    textColors: {
      primary: '#000000',
      secondary: '#3C3C43',
      disabled: '#999999'
    },
    border: {
      primary: '#C7C7CC',
      secondary: '#D1D1D6'
    },
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    }
  },
  typography: {
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    weights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },
    family: {
      primary: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
      secondary: 'Georgia, Cambria, Times New Roman, Times, serif',
      monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    base: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    md: '1rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  }
};

/**
 * Normalize a theme path to handle common mistakes in component usage
 * @param {string} path - Original path as requested
 * @returns {string} Corrected path
 */
export const normalizePath = (path) => {
  // Common path corrections - fix paths where developers might have used wrong structure
  const corrections = {
    // Fix borderRadius and shadows that are mistakenly under colors
    'colors.borderRadius.md': 'borderRadius.md',
    'colors.borderRadius.sm': 'borderRadius.sm',
    'colors.borderRadius.lg': 'borderRadius.lg',
    'colors.borderRadius.base': 'borderRadius.base',
    'colors.borderRadius.xl': 'borderRadius.xl',
    'colors.borderRadius.full': 'borderRadius.full',
    'colors.borderRadius.none': 'borderRadius.none',
    
    'colors.shadows.sm': 'shadows.sm',
    'colors.shadows.base': 'shadows.base',
    'colors.shadows.md': 'shadows.md',
    'colors.shadows.lg': 'shadows.lg',
    'colors.shadows.none': 'shadows.none',
    'colors.shadows.xl': 'shadows.xl',
    'colors.shadows.2xl': 'shadows.2xl',
    'colors.shadows.inner': 'shadows.inner',
    
    // Also allow direct access to borderRadius and shadows without having to use them within colors
    'borderRadius': 'colors.borderRadius',
    'shadows': 'colors.shadows',
    
    // Other common mistakes or alternative paths
    'typography.fontFamily.primary': 'typography.family.primary',
    'typography.fontFamily.secondary': 'typography.family.secondary',
    'typography.fontFamily.monospace': 'typography.family.monospace',
    
    'typography.fontSize': 'typography.scale',
    'typography.fontSizes': 'typography.scale',
    'typography.fontWeight': 'typography.weights',
    'typography.fontWeights': 'typography.weights',
    
    'colors.text.primary': 'colors.textColors.primary',
    'colors.text.secondary': 'colors.textColors.secondary',
    'colors.text.disabled': 'colors.textColors.disabled',
    
    'borders.radius': 'borderRadius',
    'borders.radius.md': 'borderRadius.md',
    'borders.radius.sm': 'borderRadius.sm',
    'borders.radius.lg': 'borderRadius.lg',
    
    // Add common aliases for spacing
    'spacing.medium': 'spacing.base',
    'spacing.small': 'spacing.sm',
    'spacing.large': 'spacing.lg',
    
    // Add any other common path mistakes here
  };
  
  return corrections[path] || path;
};

/**
 * Gets a default value from our comprehensive themeDefaults object
 * @param {string} path - Dot notation path to the theme property
 * @returns {any} The default value or empty string if not found
 */
export const getDefaultValue = (path) => {
  // First normalize the path to correct any common errors
  const normalizedPath = normalizePath(path);
  
  const parts = normalizedPath.split('.');
  let value = themeDefaults;
  
  for (const part of parts) {
    if (value === undefined || value === null || !value[part]) {
      return '';
    }
    value = value[part];
  }
  
  return value;
  };
  
/**
 * Recursively gets a value from the theme with smart fallbacks
 * @param {object} theme - The theme object
 * @param {string} path - Dot notation path to the theme property
 * @param {string} [fallbackPath] - Optional alternative path to check if main path fails
 * @returns {string} The theme value or fallback/default
 */
export const recursiveGetThemeValue = (theme, path, fallbackPath = null) => {
  if (!theme) return getDefaultValue(path);
  
  // Normalize the path first
  const normalizedPath = normalizePath(path);
  
  // Check for direct path match first
  const parts = normalizedPath.split('.');
  let value = theme;
  let failed = false;
  
  for (const part of parts) {
    if (value === undefined || value === null || value[part] === undefined) {
      failed = true;
      break;
    }
    value = value[part];
  }
  
  // If direct path worked, return it
  if (!failed && value !== undefined && value !== null) {
    return String(value);
  }
  
  // Try fallback path if provided
  if (fallbackPath) {
    const fallbackValue = recursiveGetThemeValue(theme, fallbackPath);
    if (fallbackValue) return fallbackValue;
  }
  
  // Use our comprehensive defaults as last resort
  return getDefaultValue(normalizedPath);
};

/**
 * Gets a value from the theme, with smart fallbacks for common properties
 */
export const getThemeValue = (theme, path) => {
  if (!theme) return getDefaultValue(path);
  
  // First normalize the path to correct common mistakes
  const normalizedPath = normalizePath(path);
  
  // Map of common fallback paths - If a property isn't found, try these alternatives
  const fallbackPathMap = {
    'colors.text': 'colors.textColors.primary',
    'colors.background.primary': 'colors.background.default',
    'colors.background.paper': 'colors.background.primary',
    'colors.surface': 'colors.background.primary',
    'colors.primaryDark': 'colors.primary',
    'colors.textColors.primary': 'colors.text',
    
    // Color scales fallbacks
    'colors.primary.500': 'colors.primary',
    'colors.primary.600': 'colors.primaryDark',
    'colors.secondary.500': 'colors.secondary',
    'colors.secondary.600': 'colors.secondaryDark',
    
    // Adding fallbacks for missing paths that are causing warnings
    'colors.borders.radius.medium': 'borderRadius.md',
    'colors.border.light': 'colors.border.primary',
    'typography.fontSize.lg': 'typography.scale.lg',
    'typography.fontWeight.medium': 'typography.weights.medium'
  };
  
  // Special case for nested color scales like 'primary.500' without 'colors.' prefix
  if (!normalizedPath.startsWith('colors.') && 
      normalizedPath.includes('.') && 
      !normalizedPath.startsWith('typography.') && 
      !normalizedPath.startsWith('spacing.') &&
      !normalizedPath.startsWith('borderRadius.') &&
      !normalizedPath.startsWith('shadows.') &&
      !normalizedPath.startsWith('transitions.')) {
    const colorPath = `colors.${normalizedPath}`;
    return getThemeValue(theme, colorPath);
  }
  
  // Check for a direct path match first
  const parts = normalizedPath.split('.');
  let value = theme;
  
  for (const part of parts) {
    if (value === undefined || value === null) {
      // If this is a known path with a fallback, use it
      if (fallbackPathMap[normalizedPath]) {
        const fallbackValue = recursiveGetThemeValue(theme, fallbackPathMap[normalizedPath]);
        if (fallbackValue) return fallbackValue;
      }
      
      // Get from defaults as last resort
      const defaultValue = getDefaultValue(normalizedPath);
      if (defaultValue) {
        return defaultValue;
      }
      
      // Only log warning for paths that aren't in our silently handled list
      const silentPaths = [
        'borderRadius.md', 'spacing.2', 'spacing.3', 'spacing.4', 'spacing.6', 
           'typography.weights.medium', 'typography.scale.sm', 'typography.scale.base', 
           'colors.secondary', 'colors.white', 'colors.secondaryDark', 'colors.primary',
        'colors.background.primary', 'typography.family.primary',
        'colors.background.paper', 'shadows.sm', 'colors.borderRadius.md', 'colors.shadows.sm',
        // Add missing paths that are causing warnings
        'colors.borders.radius.medium', 
        'colors.border.light',
        'typography.fontSize.lg',
        'typography.fontWeight.medium'
      ];
      
      if (!silentPaths.includes(path) && !silentPaths.includes(normalizedPath)) {
      console.warn(`Theme value not found: ${path}`);
      }
      
      return getDefaultValue(normalizedPath) || '';
    }
    value = value[part];
  }
  
  // If value found, return it
  if (value !== undefined && value !== null) {
    return String(value);
  }
  
  // Try fallback if available
  if (fallbackPathMap[normalizedPath]) {
    const fallbackValue = recursiveGetThemeValue(theme, fallbackPathMap[normalizedPath]);
    if (fallbackValue) return fallbackValue;
  }
  
  // Get from defaults as last resort
  return getDefaultValue(normalizedPath) || '';
};

export const themed = cssFn => {
  return theme => {
    const themeToUse = theme || defaultTheme;
    const styles = cssFn(themeToUse);
    return css(styles);
  };
};

export const mixins = {
  // Typography mixins
  text: (size = 'base') =>
    themed(theme => ({
      fontSize: getThemeValue(theme, `typography.scale.${size}`),
      lineHeight: getThemeValue(theme, 'typography.lineHeights.normal'),
    })),

  heading: (size = '2xl') =>
    themed(theme => ({
      fontSize: getThemeValue(theme, `typography.scale.${size}`),
      fontWeight: getThemeValue(theme, 'typography.weights.bold'),
      lineHeight: getThemeValue(theme, 'typography.lineHeights.tight'),
    })),

  // Spacing mixins
  padding: (size = '4') =>
    themed(theme => ({
      padding: getThemeValue(theme, `spacing.${size}`),
    })),

  margin: (size = '4') =>
    themed(theme => ({
      margin: getThemeValue(theme, `spacing.${size}`),
    })),

  // Color mixins
  bg: color =>
    themed(theme => ({
      backgroundColor: getThemeValue(theme, `colors.${color}`),
    })),

  textColor: color =>
    themed(theme => ({
      color: getThemeValue(theme, `colors.${color}`),
    })),

  // Layout mixins
  flex: (direction = 'row') =>
    themed(() => ({
      display: 'flex',
      flexDirection: direction,
    })),

  grid: columns =>
    themed(() => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    })),

  // Responsive mixins
  responsive: breakpoint =>
    themed(theme => ({
      [`@media (min-width: ${getThemeValue(theme, `breakpoints.${breakpoint}`)})`]: {},
    })),
};
