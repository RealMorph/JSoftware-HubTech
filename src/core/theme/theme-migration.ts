import { merge } from 'lodash';
import { 
  ThemeConfig, 
  ThemeColors, 
  TypographyConfig, 
  SpacingConfig, 
  BorderRadiusConfig,
  ShadowConfig,
  TransitionConfig,
  ColorScale
} from './consolidated-types';
import { validateTheme, isValidTheme } from './theme-validation';

/**
 * Legacy theme formats may have various structures.
 * This type represents a partial, unknown theme object structure.
 */
export type LegacyTheme = Record<string, any>;

type ColorKey = keyof ThemeColors;
type TypographyKey = keyof TypographyConfig;

/**
 * Default values to use when properties are missing from legacy themes
 */
const defaultValues = {
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  } as BorderRadiusConfig,
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  } as ShadowConfig,
  transitions: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    timing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  } as TransitionConfig,
  typography: {
    fontFamily: {
      base: 'system-ui, -apple-system, sans-serif',
      heading: 'system-ui, -apple-system, sans-serif',
      monospace: 'ui-monospace, monospace',
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
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  } as TypographyConfig,
};

/**
 * Standard color scale values that must be present in each color scale
 */
const standardColorScaleValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Required color scales that must be present in the colors object
 */
const requiredColorScales: ColorKey[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
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
    addDefaultBorderRadius = true,
  } = options;

  // Start with a minimal valid theme structure
  const baseTheme: Partial<ThemeConfig> = {
    id: legacyTheme.id || `migrated-theme-${Date.now()}`,
    name: legacyTheme.name || 'Migrated Theme',
    description: legacyTheme.description || 'Automatically migrated from legacy theme format',
  };

  // Migrate colors
  if (legacyTheme.colors) {
    baseTheme.colors = migrateColors(legacyTheme.colors, { generateMissingColors });
  }

  // Migrate typography
  if (legacyTheme.typography) {
    baseTheme.typography = migrateTypography(legacyTheme.typography);
  } else {
    baseTheme.typography = defaultValues.typography;
  }

  // Migrate spacing
  if (legacyTheme.spacing) {
    baseTheme.spacing = migrateSpacing(legacyTheme.spacing);
  }

  // Add other required properties with defaults if they don't exist
  if (addDefaultBorderRadius) {
    baseTheme.borderRadius = merge({}, defaultValues.borderRadius, legacyTheme.borderRadius);
  }

  if (addDefaultShadows) {
    baseTheme.shadows = merge({}, defaultValues.shadows, legacyTheme.shadows);
  }

  if (addDefaultTransitions) {
    baseTheme.transitions = merge({}, defaultValues.transitions, legacyTheme.transitions);
  }

  // Apply any direct properties that might exist in the legacy theme
  const migratedTheme = merge({}, baseTheme) as ThemeConfig;

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
): ThemeColors {
  const { generateMissingColors } = options;
  const migratedColors: ThemeColors = {
    primary: '#000000',
    secondary: '#666666',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: '#ffffff',
    border: '#e2e8f0',
    white: '#ffffff',
    surface: '#ffffff',
  };

  // Override with any existing colors from legacy theme
  for (const scale of requiredColorScales) {
    if (legacyColors[scale]) {
      const colorValue = legacyColors[scale];
      const finalColor = typeof colorValue === 'string' 
        ? colorValue 
        : colorValue[500] || colorValue.default || colorValue;
      
      if (typeof finalColor === 'string') {
        migratedColors[scale] = finalColor;
      }
    }
  }

  // Handle special color properties
  if (legacyColors.text) {
    const textValue = legacyColors.text;
    if (typeof textValue === 'string') {
      migratedColors.text = {
        primary: textValue,
        secondary: textValue,
        disabled: textValue,
      };
    } else if (typeof textValue === 'object' && textValue !== null) {
      const textObj = migratedColors.text as { primary: string; secondary: string; disabled: string };
      if (textValue.primary) textObj.primary = textValue.primary;
      if (textValue.secondary) textObj.secondary = textValue.secondary;
      if (textValue.disabled) textObj.disabled = textValue.disabled;
    }
  }

  if (typeof legacyColors.background === 'string') {
    migratedColors.background = legacyColors.background;
  }

  if (typeof legacyColors.border === 'string') {
    migratedColors.border = legacyColors.border;
  }

  return migratedColors;
}

/**
 * Migrate a legacy typography object to the new format
 */
function migrateTypography(legacyTypography: Record<string, any>): TypographyConfig {
  return merge({}, defaultValues.typography, {
    fontFamily: {
      base: legacyTypography.fontFamily?.base || defaultValues.typography.fontFamily.base,
      heading: legacyTypography.fontFamily?.heading || defaultValues.typography.fontFamily.heading,
      monospace: legacyTypography.fontFamily?.monospace || defaultValues.typography.fontFamily.monospace,
    },
    fontSize: {
      xs: legacyTypography.fontSize?.xs || defaultValues.typography.fontSize.xs,
      sm: legacyTypography.fontSize?.sm || defaultValues.typography.fontSize.sm,
      md: legacyTypography.fontSize?.md || defaultValues.typography.fontSize.md,
      lg: legacyTypography.fontSize?.lg || defaultValues.typography.fontSize.lg,
      xl: legacyTypography.fontSize?.xl || defaultValues.typography.fontSize.xl,
      '2xl': legacyTypography.fontSize?.['2xl'] || defaultValues.typography.fontSize['2xl'],
      '3xl': legacyTypography.fontSize?.['3xl'] || defaultValues.typography.fontSize['3xl'],
      '4xl': legacyTypography.fontSize?.['4xl'] || defaultValues.typography.fontSize['4xl'],
    },
    fontWeight: {
      light: Number(legacyTypography.fontWeight?.light) || defaultValues.typography.fontWeight.light,
      normal: Number(legacyTypography.fontWeight?.normal) || defaultValues.typography.fontWeight.normal,
      medium: Number(legacyTypography.fontWeight?.medium) || defaultValues.typography.fontWeight.medium,
      semibold: Number(legacyTypography.fontWeight?.semibold) || defaultValues.typography.fontWeight.semibold,
      bold: Number(legacyTypography.fontWeight?.bold) || defaultValues.typography.fontWeight.bold,
    },
    lineHeight: {
      none: Number(legacyTypography.lineHeight?.none) || defaultValues.typography.lineHeight.none,
      tight: Number(legacyTypography.lineHeight?.tight) || defaultValues.typography.lineHeight.tight,
      normal: Number(legacyTypography.lineHeight?.normal) || defaultValues.typography.lineHeight.normal,
      relaxed: Number(legacyTypography.lineHeight?.relaxed) || defaultValues.typography.lineHeight.relaxed,
      loose: Number(legacyTypography.lineHeight?.loose) || defaultValues.typography.lineHeight.loose,
    },
    letterSpacing: defaultValues.typography.letterSpacing,
  });
}

/**
 * Migrate a legacy spacing object to the new format
 */
function migrateSpacing(legacySpacing: Record<string, any>): SpacingConfig {
  return {
    xs: legacySpacing.xs || '0.5rem',
    sm: legacySpacing.sm || '1rem',
    md: legacySpacing.md || '1.5rem',
    lg: legacySpacing.lg || '2rem',
    xl: legacySpacing.xl || '2.5rem',
    '2xl': legacySpacing['2xl'] || '3rem',
    '3xl': legacySpacing['3xl'] || '4rem',
    '4xl': legacySpacing['4xl'] || '6rem',
  };
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
        primary: defaultColors.primary,
        secondary: defaultColors.secondary,
        success: defaultColors.success,
        warning: defaultColors.warning,
        error: defaultColors.error,
        info: defaultColors.info,
        background: '#ffffff',
        border: '#e2e8f0',
        white: '#ffffff',
        surface: '#ffffff',
        text: {
          primary: '#212121',
          secondary: '#757575',
          disabled: '#9e9e9e',
        },
      };
      break;
    case 'typography':
      fixedTheme.typography = defaultValues.typography;
      break;
    case 'spacing':
      fixedTheme.spacing = {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
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
    const scaleName = colorScaleMatch[1] as keyof typeof defaultColors;

    if (!fixedTheme.colors) {
      fixedTheme.colors = {} as ThemeColors;
    }

    if (scaleName in defaultColors) {
      fixedTheme.colors[scaleName as keyof ThemeColors] = defaultColors[scaleName];
    }
  }

  const scaleValueMatch = error.match(/missing required value: (\d+)/);
  if (scaleValueMatch && scaleValueMatch[1]) {
    const missingValue = parseInt(scaleValueMatch[1], 10);
    const scaleNameMatch = error.match(/Color scale (\w+)/);

    if (scaleNameMatch && scaleNameMatch[1] && fixedTheme.colors) {
      const scaleName = scaleNameMatch[1] as keyof typeof defaultColors;
      if (scaleName in defaultColors && scaleName in fixedTheme.colors) {
        const scale = fixedTheme.colors[scaleName as keyof ThemeColors];
        if (typeof scale === 'string') {
          fixedTheme.colors[scaleName as keyof ThemeColors] = scale;
        }
      }
    }
  }

  return fixedTheme;
}

const defaultColors = {
  primary: '#3f51b5',
  secondary: '#f50057',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
} as const;

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
    if (key in migratedTheme) {
      const originalValue = originalTheme[key];
      const migratedValue = (migratedTheme as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(originalValue) !== JSON.stringify(migratedValue)) {
        modifiedProperties.push(key);
      }
    }
  }

  // Get validation errors for both themes
  const originalValidationErrors = validateTheme(originalTheme as ThemeConfig);
  const migratedValidationErrors = validateTheme(migratedTheme);

  return {
    addedProperties,
    modifiedProperties,
    originalValidationErrors,
    migratedValidationErrors,
  };
}
