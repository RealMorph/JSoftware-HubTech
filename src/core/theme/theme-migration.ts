import { merge } from 'lodash';
import { ThemeConfig } from './consolidated-types';
import { validateTheme, isValidTheme } from './theme-utils';

/**
 * Legacy theme formats may have various structures.
 * This type represents a partial, unknown theme object structure.
 */
export type LegacyTheme = Record<string, any>;

/**
 * Default values to use when properties are missing from legacy themes
 */
const defaultValues = {
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    default: 'all 0.2s ease',
    slow: 'all 0.5s ease',
    fast: 'all 0.1s ease',
    easeIn: 'all 0.2s ease-in',
    easeOut: 'all 0.2s ease-out',
    easeInOut: 'all 0.2s ease-in-out'
  }
};

/**
 * Standard color scale values that must be present in each color scale
 */
const standardColorScaleValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/**
 * Required color scales that must be present in the colors object
 */
const requiredColorScales = [
  'primary',
  'secondary',
  'accent',
  'error',
  'warning',
  'success',
  'info',
  'background',
  'text'
];

/**
 * Convert a legacy theme object to a valid ThemeConfig
 * 
 * @param legacyTheme The legacy theme object to migrate
 * @param options Optional migration options
 * @returns A valid ThemeConfig object
 */
export function migrateFromLegacyTheme(
  legacyTheme: LegacyTheme,
  options: {
    generateMissingColors?: boolean;
    addDefaultShadows?: boolean;
    addDefaultTransitions?: boolean;
    addDefaultBorderRadius?: boolean;
  } = {}
): ThemeConfig {
  const {
    generateMissingColors = true,
    addDefaultShadows = true,
    addDefaultTransitions = true,
    addDefaultBorderRadius = true
  } = options;

  // Start with a minimal valid theme structure
  const baseTheme: Partial<ThemeConfig> = {
    id: legacyTheme.id || `migrated-theme-${Date.now()}`,
    name: legacyTheme.name || 'Migrated Theme',
    description: legacyTheme.description || 'Automatically migrated from legacy theme format'
  };

  // Migrate colors
  if (legacyTheme.colors) {
    baseTheme.colors = migrateColors(legacyTheme.colors, { generateMissingColors });
  }

  // Migrate typography
  if (legacyTheme.typography) {
    baseTheme.typography = migrateTypography(legacyTheme.typography);
  }

  // Migrate spacing
  if (legacyTheme.spacing) {
    baseTheme.spacing = migrateSpacing(legacyTheme.spacing);
  }

  // Add other required properties with defaults if they don't exist
  if (addDefaultBorderRadius) {
    baseTheme.borderRadius = legacyTheme.borderRadius || defaultValues.borderRadius;
  }

  if (addDefaultShadows) {
    baseTheme.shadows = legacyTheme.shadows || defaultValues.shadows;
  }

  if (addDefaultTransitions) {
    baseTheme.transitions = legacyTheme.transitions || defaultValues.transitions;
  }

  // Apply any direct properties that might exist in the legacy theme
  const migratedTheme = merge({}, baseTheme, {
    // Extract any other properties that might be directly available
    borderRadius: legacyTheme.borderRadius,
    shadows: legacyTheme.shadows,
    transitions: legacyTheme.transitions
  }) as ThemeConfig;

  // Validate the migrated theme
  const validationErrors = validateTheme(migratedTheme);
  if (validationErrors.length > 0) {
    console.warn('Theme migration produced validation errors:', validationErrors);
  }

  return migratedTheme;
}

/**
 * Migrate a legacy colors object to the new format
 */
function migrateColors(
  legacyColors: Record<string, any>,
  options: { generateMissingColors: boolean }
): ThemeConfig['colors'] {
  const { generateMissingColors } = options;
  const migratedColors: Partial<ThemeConfig['colors']> = {};

  // Process each color scale that exists in the legacy theme
  for (const scale of requiredColorScales) {
    if (legacyColors[scale]) {
      migratedColors[scale] = migrateColorScale(legacyColors[scale], scale);
    } else if (generateMissingColors) {
      // Generate a placeholder color scale
      migratedColors[scale] = generatePlaceholderColorScale(scale);
    }
  }

  // Handle background and text colors, which may have different structures
  if (!migratedColors.background && legacyColors.bg) {
    migratedColors.background = legacyColors.bg;
  }

  if (!migratedColors.text && legacyColors.text) {
    migratedColors.text = legacyColors.text;
  }

  return migratedColors as ThemeConfig['colors'];
}

/**
 * Migrate a single color scale to ensure it has all required values
 */
function migrateColorScale(
  legacyScale: Record<string, string> | string,
  scaleName: string
): Record<number, string> {
  // If the scale is just a string (e.g., primary: '#00f'), expand it to a full scale
  if (typeof legacyScale === 'string') {
    return expandColorToScale(legacyScale);
  }

  const migratedScale: Record<number, string> = {};

  // Map commonly used scale names to standard numbers
  const keyMappings: Record<string, number> = {
    lightest: 50,
    lighter: 100,
    light: 200,
    default: 500,
    dark: 700,
    darker: 800,
    darkest: 900
  };

  // First, map any named keys
  for (const [key, value] of Object.entries(legacyScale)) {
    if (keyMappings[key]) {
      migratedScale[keyMappings[key]] = value;
    }
  }

  // Then, map numeric keys directly
  for (const [key, value] of Object.entries(legacyScale)) {
    const numKey = parseInt(key, 10);
    if (!isNaN(numKey)) {
      migratedScale[numKey] = value;
    }
  }

  // Fill in any missing values
  const baseColor = migratedScale[500] || legacyScale['default'] || Object.values(legacyScale)[0];
  for (const value of standardColorScaleValues) {
    if (!migratedScale[value]) {
      migratedScale[value] = generateColorVariant(baseColor, value);
    }
  }

  return migratedScale;
}

/**
 * Expand a single color value to a full color scale
 */
function expandColorToScale(color: string): Record<number, string> {
  const scale: Record<number, string> = {};
  
  for (const value of standardColorScaleValues) {
    scale[value] = generateColorVariant(color, value);
  }
  
  return scale;
}

/**
 * Generate a variant of a color based on the scale value
 * This is a simplified algorithm - in a real implementation, you would use a proper color library
 */
function generateColorVariant(baseColor: string, scaleValue: number): string {
  // This is a placeholder implementation
  // In a real project, use a color manipulation library like tinycolor2
  return baseColor; // Return the original color for now
}

/**
 * Generate a placeholder color scale for missing required scales
 */
function generatePlaceholderColorScale(scaleName: string): Record<number, string> {
  // Default colors for different scales
  const defaultColors: Record<string, string> = {
    primary: '#3f51b5',
    secondary: '#f50057',
    accent: '#00bcd4',
    error: '#f44336',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#2196f3',
    background: '#ffffff',
    text: '#212121'
  };
  
  return expandColorToScale(defaultColors[scaleName] || '#cccccc');
}

/**
 * Migrate a legacy typography object to the new format
 */
function migrateTypography(legacyTypography: Record<string, any>): ThemeConfig['typography'] {
  // Start with a basic typography structure
  const baseTypography: Partial<ThemeConfig['typography']> = {
    fontFamily: {
      heading: '"Roboto", "Helvetica Neue", sans-serif',
      body: '"Open Sans", "Helvetica", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem'
    },
    fontWeight: {
      hairline: 100,
      thin: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    lineHeight: {
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
    }
  };

  // Merge any existing typography properties
  return merge({}, baseTypography, legacyTypography) as ThemeConfig['typography'];
}

/**
 * Migrate a legacy spacing object to the new format
 */
function migrateSpacing(legacySpacing: Record<string, any>): ThemeConfig['spacing'] {
  // If legacySpacing is an array, convert it to an object
  if (Array.isArray(legacySpacing)) {
    const spacingObj: Record<string, string> = {};
    legacySpacing.forEach((value, index) => {
      spacingObj[index.toString()] = value;
    });
    return spacingObj as ThemeConfig['spacing'];
  }

  // If it's an object, ensure it has numeric keys
  const spacingObj: Record<string, string> = {};
  for (const [key, value] of Object.entries(legacySpacing)) {
    // If the key is a named size, convert it
    const namedSizeMappings: Record<string, string> = {
      xs: '1',
      sm: '2',
      md: '4',
      lg: '6',
      xl: '8',
      '2xl': '10',
      '3xl': '12',
    };

    const mappedKey = namedSizeMappings[key] || key;
    spacingObj[mappedKey] = value;
  }

  // Add standard spacing values if they don't exist
  const standardSpacing: Record<string, string> = {
    '0': '0',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '32': '8rem',
    '40': '10rem',
    '48': '12rem',
    '56': '14rem',
    '64': '16rem'
  };

  return { ...standardSpacing, ...spacingObj } as ThemeConfig['spacing'];
}

/**
 * Apply automatic fixes to a theme based on validation errors
 * 
 * @param theme The theme to fix
 * @param validationErrors Array of validation error messages
 * @returns The fixed theme
 */
export function autoFixTheme(theme: Partial<ThemeConfig>, validationErrors: string[]): ThemeConfig {
  let fixedTheme = { ...theme } as ThemeConfig;
  
  for (const error of validationErrors) {
    if (error.includes('Missing required property:')) {
      const property = error.split('Missing required property:')[1].trim();
      fixedTheme = applyFixForMissingProperty(fixedTheme, property);
    } else if (error.includes('Color scale')) {
      fixedTheme = applyFixForColorScale(fixedTheme, error);
    }
    // Add more error types and fixes as needed
  }
  
  return fixedTheme;
}

/**
 * Apply a fix for a missing property
 */
function applyFixForMissingProperty(theme: ThemeConfig, property: string): ThemeConfig {
  const fixedTheme = { ...theme };
  
  switch (property) {
    case 'id':
      fixedTheme.id = `theme-${Date.now()}`;
      break;
    case 'colors':
      fixedTheme.colors = {
        primary: generatePlaceholderColorScale('primary'),
        secondary: generatePlaceholderColorScale('secondary'),
        accent: generatePlaceholderColorScale('accent'),
        error: generatePlaceholderColorScale('error'),
        warning: generatePlaceholderColorScale('warning'),
        success: generatePlaceholderColorScale('success'),
        info: generatePlaceholderColorScale('info'),
        background: { default: '#ffffff', paper: '#f5f5f5' },
        text: { primary: '#212121', secondary: '#757575' }
      };
      break;
    case 'typography':
      fixedTheme.typography = {
        fontFamily: {
          heading: '"Roboto", "Helvetica Neue", sans-serif',
          body: '"Open Sans", "Helvetica", sans-serif'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
          '6xl': '3.75rem',
          '7xl': '4.5rem',
          '8xl': '6rem',
          '9xl': '8rem'
        },
        fontWeight: {
          hairline: 100,
          thin: 200,
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
          extrabold: 800,
          black: 900
        },
        lineHeight: {
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
        }
      };
      break;
    case 'spacing':
      fixedTheme.spacing = {
        '0': '0',
        '0.5': '0.125rem',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem'
      };
      break;
    case 'borderRadius':
      fixedTheme.borderRadius = defaultValues.borderRadius;
      break;
    case 'shadows':
      fixedTheme.shadows = defaultValues.shadows;
      break;
    case 'transitions':
      fixedTheme.transitions = defaultValues.transitions;
      break;
    default:
      // Unknown property, can't fix automatically
      console.warn(`Can't automatically fix unknown property: ${property}`);
  }
  
  return fixedTheme;
}

/**
 * Apply a fix for a color scale error
 */
function applyFixForColorScale(theme: ThemeConfig, error: string): ThemeConfig {
  const fixedTheme = { ...theme };
  const colorScaleMatch = error.match(/Color scale (\w+) is missing/);
  
  if (colorScaleMatch && colorScaleMatch[1]) {
    const scaleName = colorScaleMatch[1];
    
    if (!fixedTheme.colors) {
      fixedTheme.colors = {} as ThemeConfig['colors'];
    }
    
    fixedTheme.colors[scaleName] = generatePlaceholderColorScale(scaleName);
  }
  
  const scaleValueMatch = error.match(/missing required value: (\d+)/);
  if (scaleValueMatch && scaleValueMatch[1]) {
    const missingValue = parseInt(scaleValueMatch[1], 10);
    const scaleNameMatch = error.match(/Color scale (\w+)/);
    
    if (scaleNameMatch && scaleNameMatch[1] && fixedTheme.colors) {
      const scaleName = scaleNameMatch[1];
      const scale = fixedTheme.colors[scaleName];
      
      if (scale) {
        // Find a base color to derive the missing value from
        const baseColor = scale[500] || Object.values(scale)[0];
        
        if (baseColor) {
          scale[missingValue] = generateColorVariant(baseColor, missingValue);
        }
      }
    }
  }
  
  return fixedTheme;
}

/**
 * Create a theme migration report detailing changes made during migration
 */
export function createMigrationReport(
  originalTheme: LegacyTheme,
  migratedTheme: ThemeConfig
): {
  addedProperties: string[];
  modifiedProperties: string[];
  originalValidationErrors: string[];
  migratedValidationErrors: string[];
} {
  const addedProperties: string[] = [];
  const modifiedProperties: string[] = [];
  
  // Check for added top-level properties
  for (const key of Object.keys(migratedTheme)) {
    if (!(key in originalTheme)) {
      addedProperties.push(key);
    }
  }
  
  // Check for modified properties (simplified check)
  for (const key of Object.keys(originalTheme)) {
    if (key in migratedTheme && JSON.stringify(originalTheme[key]) !== JSON.stringify(migratedTheme[key])) {
      modifiedProperties.push(key);
    }
  }
  
  // Get validation errors for both themes
  const originalValidationErrors = validateTheme(originalTheme as ThemeConfig);
  const migratedValidationErrors = validateTheme(migratedTheme);
  
  return {
    addedProperties,
    modifiedProperties,
    originalValidationErrors,
    migratedValidationErrors
  };
} 