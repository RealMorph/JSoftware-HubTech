import { Theme, ColorObject, BackgroundColors, TextColors, ActionColors, fallbackValues } from '../themes/ThemeTypes';

/**
 * Safely gets a color object from the theme, with fallbacks if not found
 * @param theme The theme object
 * @param colorPath The path to the color (e.g., 'primary', 'error')
 * @returns The color object or a fallback
 */
export function getColorObject(theme: any, colorPath: string): ColorObject {
  try {
    const color = theme?.colors?.[colorPath];
    if (color && typeof color === 'object' && 'main' in color) {
      return {
        main: color.main || fallbackValues.colors.primary.main,
        light: color.light || fallbackValues.colors.primary.light,
        dark: color.dark || fallbackValues.colors.primary.dark,
        contrastText: color.contrastText || fallbackValues.colors.primary.contrastText
      };
    }
    return fallbackValues.colors.primary;
  } catch (error) {
    console.warn(`Failed to get color object for path: ${colorPath}`, error);
    return fallbackValues.colors.primary;
  }
}

/**
 * Safely gets a color property from a color object
 * @param theme The theme object
 * @param colorPath The path to the color (e.g., 'primary', 'error')
 * @param property The property to access (e.g., 'main', 'dark')
 * @param fallback Fallback value if not found
 * @returns The color value or fallback
 */
export function getColor(theme: any, colorPath: string, property: keyof ColorObject, fallback = '#ccc'): string {
  try {
    const colorObj = getColorObject(theme, colorPath);
    return colorObj[property] || fallback;
  } catch (error) {
    console.warn(`Failed to get color ${property} for path: ${colorPath}`, error);
    return fallback;
  }
}

/**
 * Safely gets a background color from the theme
 * @param theme The theme object
 * @param property The background property to access
 * @param fallback Fallback value if not found
 * @returns The background color or fallback
 */
export function getBackground(theme: any, property: keyof BackgroundColors, fallback = '#fff'): string {
  try {
    return theme?.colors?.background?.[property] || fallbackValues.colors.background[property as keyof typeof fallbackValues.colors.background] || fallback;
  } catch (error) {
    console.warn(`Failed to get background color: ${property}`, error);
    return fallback;
  }
}

/**
 * Safely gets a text color from the theme
 * @param theme The theme object
 * @param property The text property to access
 * @param fallback Fallback value if not found
 * @returns The text color or fallback
 */
export function getText(theme: any, property: keyof TextColors, fallback = '#000'): string {
  try {
    return theme?.colors?.text?.[property] || fallbackValues.colors.text[property as keyof typeof fallbackValues.colors.text] || fallback;
  } catch (error) {
    console.warn(`Failed to get text color: ${property}`, error);
    return fallback;
  }
}

/**
 * Safely gets an action color from the theme
 * @param theme The theme object
 * @param property The action property to access
 * @param fallback Fallback value if not found
 * @returns The action color or fallback
 */
export function getAction(theme: any, property: keyof ActionColors, fallback = 'rgba(0,0,0,0.05)'): string {
  try {
    return theme?.colors?.action?.[property] || fallbackValues.colors.action[property as keyof typeof fallbackValues.colors.action] || fallback;
  } catch (error) {
    console.warn(`Failed to get action color: ${property}`, error);
    return fallback;
  }
}

/**
 * Safely gets the divider color from the theme
 * @param theme The theme object
 * @param fallback Fallback value if not found
 * @returns The divider color or fallback
 */
export function getDivider(theme: any, fallback = '#e0e0e0'): string {
  try {
    return theme?.colors?.divider || fallbackValues.colors.divider || fallback;
  } catch (error) {
    console.warn('Failed to get divider color', error);
    return fallback;
  }
}

/**
 * Type guard to check if a value is a proper color object
 * @param value The value to check
 * @returns True if the value is a color object
 */
export function isColorObject(value: any): value is ColorObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    'main' in value &&
    typeof value.main === 'string'
  );
}

/**
 * A general-purpose helper to safely access any theme property
 * @param theme The theme object
 * @param path Path to the property, dot notation supported (e.g., 'colors.primary.main')
 * @param fallback Fallback value if not found
 * @returns The theme property value or fallback
 */
export function getThemeValue<T>(theme: any, path: string, fallback: T): T {
  try {
    const parts = path.split('.');
    let value: any = theme;
    
    for (const part of parts) {
      if (value === undefined || value === null) return fallback;
      value = value[part];
    }
    
    return value !== undefined && value !== null ? value : fallback;
  } catch (error) {
    console.warn(`Failed to get theme value for path: ${path}`, error);
    return fallback;
  }
} 