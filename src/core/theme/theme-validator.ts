import { ThemeConfig } from './consolidated-types';

/**
 * Validates a theme object against the ThemeConfig interface requirements
 * @param theme The theme object to validate
 * @returns Array of validation error messages, empty if valid
 */
export function validateTheme(theme: unknown): string[] {
  const errors: string[] = [];

  if (!theme) {
    return ['Theme object is undefined or null'];
  }

  if (typeof theme !== 'object') {
    return ['Theme must be an object'];
  }

  const themeObj = theme as Partial<ThemeConfig>;

  // Validate required top-level properties
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
    if (!themeObj[prop as keyof ThemeConfig]) {
      errors.push(`Missing required property: ${prop}`);
    }
  });

  // Validate colors
  if (themeObj.colors) {
    const requiredColors = [
      'primary',
      'secondary',
      'success',
      'warning',
      'error',
      'info',
      'text',
      'background',
      'border',
      'white',
      'surface',
    ];

    requiredColors.forEach(color => {
      if (!(color in themeObj.colors!)) {
        errors.push(`Missing required color: ${color}`);
      }
    });

    // Validate that text is either a string or an object with required properties
    if ('text' in themeObj.colors!) {
      const text = themeObj.colors!.text;
      if (typeof text !== 'string' && typeof text === 'object') {
        if (!text || typeof text !== 'object') {
          errors.push('Text color must be either a string or an object with required properties');
        } else {
          const textObj = text as any;
          ['primary', 'secondary', 'disabled'].forEach(prop => {
            if (!(prop in textObj)) {
              errors.push(`Missing required text color property: ${prop}`);
            }
          });
        }
      }
    }
  }

  // Validate typography
  if (themeObj.typography) {
    const typographyProps = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
    typographyProps.forEach(prop => {
      if (!(prop in themeObj.typography!)) {
        errors.push(`Missing required typography property: ${prop}`);
      }
    });

    // Validate fontFamily
    if (themeObj.typography!.fontFamily) {
      const fontFamilyProps = ['base', 'heading', 'monospace'];
      fontFamilyProps.forEach(prop => {
        if (!(prop in themeObj.typography!.fontFamily!)) {
          errors.push(`Missing required fontFamily property: ${prop}`);
        }
      });
    }

    // Validate fontSize
    if (themeObj.typography!.fontSize) {
      const fontSizeProps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
      fontSizeProps.forEach(prop => {
        if (!(prop in themeObj.typography!.fontSize!)) {
          errors.push(`Missing required fontSize property: ${prop}`);
        }
      });
    }
  }

  // Validate spacing
  if (themeObj.spacing) {
    const spacingProps = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
    spacingProps.forEach(prop => {
      if (!(prop in themeObj.spacing!)) {
        errors.push(`Missing required spacing property: ${prop}`);
      }
    });
  }

  // Validate shadows
  if (themeObj.shadows) {
    const shadowProps = ['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', 'inner'];
    shadowProps.forEach(prop => {
      if (!(prop in themeObj.shadows!)) {
        errors.push(`Missing required shadow property: ${prop}`);
      }
    });
  }

  // Validate transitions
  if (themeObj.transitions) {
    const transitionProps = ['duration', 'timing'];
    transitionProps.forEach(prop => {
      if (!(prop in themeObj.transitions!)) {
        errors.push(`Missing required transitions property: ${prop}`);
      }
    });

    // Validate duration
    if (themeObj.transitions!.duration) {
      const durationProps = ['fast', 'normal', 'slow'];
      durationProps.forEach(prop => {
        if (!(prop in themeObj.transitions!.duration!)) {
          errors.push(`Missing required transition duration property: ${prop}`);
        }
      });
    }

    // Validate timing
    if (themeObj.transitions!.timing) {
      const timingProps = ['easeIn', 'easeOut', 'easeInOut', 'linear'];
      timingProps.forEach(prop => {
        if (!(prop in themeObj.transitions!.timing!)) {
          errors.push(`Missing required transition timing property: ${prop}`);
        }
      });
    }
  }

  return errors;
}

/**
 * Helper function to check if a theme has all required properties
 * @param theme The theme to validate
 * @returns boolean indicating if the theme is valid
 */
export function isValidTheme(theme: unknown): boolean {
  return validateTheme(theme).length === 0;
}

/**
 * Ensures a theme object is valid or throws an error with validation messages
 * @param theme The theme to validate
 * @returns The validated theme object cast to ThemeConfig
 * @throws Error if the theme is invalid
 */
export function ensureValidTheme(theme: unknown): ThemeConfig {
  const errors = validateTheme(theme);
  if (errors.length > 0) {
    throw new Error(`Invalid theme: ${errors.join(', ')}`);
  }
  return theme as ThemeConfig;
}
