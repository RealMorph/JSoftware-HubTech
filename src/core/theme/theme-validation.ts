import { ThemeConfig } from './consolidated-types';
import { defaultTheme } from './default-theme';

/**
 * Type guard to check if an object matches the ThemeConfig interface
 */
export function isThemeConfig(obj: any): obj is ThemeConfig {
  return (
    obj &&
    typeof obj === 'object' &&
    'colors' in obj &&
    'typography' in obj &&
    'spacing' in obj &&
    'breakpoints' in obj &&
    'borderRadius' in obj &&
    'shadows' in obj &&
    'transitions' in obj
  );
}

/**
 * Validates a theme object and returns an array of validation errors
 */
export function validateTheme(theme: unknown): string[] {
  const errors: string[] = [];

  if (!theme || typeof theme !== 'object') {
    errors.push('Theme must be an object');
    return errors;
  }

  // Required top-level properties
  const requiredProps = [
    'colors',
    'typography',
    'spacing',
    'breakpoints',
    'borderRadius',
    'shadows',
    'transitions',
  ];

  requiredProps.forEach(prop => {
    if (!(prop in (theme as any))) {
      errors.push(`Missing required property: ${prop}`);
    }
  });

  // Validate colors
  if ('colors' in (theme as any)) {
    const colors = (theme as any).colors;
    if (!colors || typeof colors !== 'object') {
      errors.push('colors must be an object');
    } else {
      // Validate required color properties
      ['primary', 'secondary', 'text', 'background'].forEach(colorProp => {
        if (!(colorProp in colors)) {
          errors.push(`Missing required color: ${colorProp}`);
        }
      });
    }
  }

  // Validate typography
  if ('typography' in (theme as any)) {
    const typography = (theme as any).typography;
    if (!typography || typeof typography !== 'object') {
      errors.push('typography must be an object');
    } else {
      // Validate required typography properties
      ['family', 'size', 'weight', 'lineHeight'].forEach(typoProp => {
        if (!(typoProp in typography)) {
          errors.push(`Missing required typography property: ${typoProp}`);
        }
      });
    }
  }

  // Validate spacing
  if ('spacing' in (theme as any)) {
    const spacing = (theme as any).spacing;
    if (!spacing || typeof spacing !== 'object') {
      errors.push('spacing must be an object');
    }
  }

  // Validate breakpoints
  if ('breakpoints' in (theme as any)) {
    const breakpoints = (theme as any).breakpoints;
    if (!breakpoints || typeof breakpoints !== 'object') {
      errors.push('breakpoints must be an object');
    }
  }

  return errors;
}

/**
 * Type guard to check if a theme is valid
 */
export function isValidTheme(theme: unknown): theme is ThemeConfig {
  return validateTheme(theme).length === 0;
}

/**
 * Ensures a theme is valid, throwing an error if it's not
 */
export function ensureValidTheme(theme: unknown): ThemeConfig {
  const errors = validateTheme(theme);
  if (errors.length > 0) {
    throw new Error(`Invalid theme:\n${errors.join('\n')}`);
  }
  return theme as ThemeConfig;
}

/**
 * Creates a theme validator function
 */
export function createThemeValidator() {
  return {
    validate: validateTheme,
    isValid: isValidTheme,
    ensure: ensureValidTheme,
  };
}

/**
 * Gets a defaulted theme by merging with the default theme
 */
export function getDefaultedTheme(theme?: ThemeConfig | null): ThemeConfig {
  return theme ? { ...defaultTheme, ...theme } : defaultTheme;
} 