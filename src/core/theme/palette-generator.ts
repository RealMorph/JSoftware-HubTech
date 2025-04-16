/**
 * Theme Color Palette Generator
 *
 * This module provides utilities for generating complete color palettes
 * from base colors. It includes functions for color manipulation and
 * generation of color scales.
 */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

type ShadeNumber = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface ColorPalette {
  gray: ColorScale;
  red: ColorScale;
  orange: ColorScale;
  yellow: ColorScale;
  green: ColorScale;
  teal: ColorScale;
  blue: ColorScale;
  indigo: ColorScale;
  purple: ColorScale;
  pink: ColorScale;
  [key: string]: ColorScale;
}

/**
 * Convert a hex color string to RGB values
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  let r, g, b;
  if (hex.length === 3) {
    // Short form #RGB
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // Standard form #RRGGBB
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return { r, g, b };
}

/**
 * Convert RGB values to a hex color string
 */
export function rgbToHex(rgb: RGB): string {
  const { r, g, b } = rgb;
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

/**
 * Convert RGB values to HSL values
 */
export function rgbToHsl(rgb: RGB): HSL {
  let { r, g, b } = rgb;
  // Convert RGB to 0-1 range
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL values to RGB values
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  // Convert HSL to 0-1 range
  const h1 = h / 360;
  const s1 = s / 100;
  const l1 = l / 100;

  let r, g, b;

  if (s1 === 0) {
    // Achromatic (grey)
    r = g = b = l1;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l1 < 0.5 ? l1 * (1 + s1) : l1 + s1 - l1 * s1;
    const p = 2 * l1 - q;

    r = hue2rgb(p, q, h1 + 1 / 3);
    g = hue2rgb(p, q, h1);
    b = hue2rgb(p, q, h1 - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Lighten a color by a specified percentage
 */
export function lighten(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);

  // Increase lightness
  hsl.l = Math.min(100, hsl.l + amount);

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}

/**
 * Darken a color by a specified percentage
 */
export function darken(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);

  // Decrease lightness
  hsl.l = Math.max(0, hsl.l - amount);

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}

/**
 * Adjust the saturation of a color
 */
export function saturate(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);

  // Increase saturation
  hsl.s = Math.min(100, Math.max(0, hsl.s + amount));

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}

/**
 * Desaturate a color
 */
export function desaturate(color: string, amount: number): string {
  return saturate(color, -amount);
}

/**
 * Adjust the hue of a color
 */
export function adjustHue(color: string, degrees: number): string {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);

  // Adjust hue (ensure it stays in 0-360 range)
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}

/**
 * Generate a color scale based on a single color
 */
export function generateColorScale(baseColor: string): ColorScale {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);

  // Use the base color as the 500 shade
  const baseShade = 500 as ShadeNumber;
  const scale = {} as ColorScale;

  // Calculate lighter shades (50-400)
  const lighterShades = [
    { shade: 50 as ShadeNumber, lightness: 97, saturation: -15 },
    { shade: 100 as ShadeNumber, lightness: 94, saturation: -10 },
    { shade: 200 as ShadeNumber, lightness: 85, saturation: -5 },
    { shade: 300 as ShadeNumber, lightness: 75, saturation: 0 },
    { shade: 400 as ShadeNumber, lightness: 65, saturation: 0 },
  ];

  // Calculate darker shades (600-900)
  const darkerShades = [
    { shade: 600 as ShadeNumber, lightness: -10, saturation: 5 },
    { shade: 700 as ShadeNumber, lightness: -20, saturation: 5 },
    { shade: 800 as ShadeNumber, lightness: -30, saturation: 0 },
    { shade: 900 as ShadeNumber, lightness: -40, saturation: -5 },
  ];

  // Set the base shade
  scale[baseShade] = baseColor;

  // Generate lighter shades
  for (const { shade, lightness, saturation } of lighterShades) {
    const newHsl = { ...hsl };
    newHsl.l = Math.min(100, Math.max(0, lightness));
    newHsl.s = Math.min(100, Math.max(0, hsl.s + saturation));
    scale[shade] = rgbToHex(hslToRgb(newHsl));
  }

  // Generate darker shades
  for (const { shade, lightness, saturation } of darkerShades) {
    const newHsl = { ...hsl };
    newHsl.l = Math.min(100, Math.max(0, hsl.l + lightness));
    newHsl.s = Math.min(100, Math.max(0, hsl.s + saturation));
    scale[shade] = rgbToHex(hslToRgb(newHsl));
  }

  return scale;
}

/**
 * Generate a full color palette from base colors
 */
export function generatePalette(baseColors: Record<string, string>): ColorPalette {
  const palette: Record<string, ColorScale> = {};

  // Generate a scale for each base color
  for (const [name, color] of Object.entries(baseColors)) {
    palette[name] = generateColorScale(color);
  }

  // If gray isn't provided, generate it from a slightly desaturated primary color
  if (!palette.gray && baseColors.primary) {
    const primaryRgb = hexToRgb(baseColors.primary);
    const primaryHsl = rgbToHsl(primaryRgb);
    const grayBase = rgbToHex(hslToRgb({ ...primaryHsl, s: 10 }));
    palette.gray = generateGrayScale(grayBase);
  } else if (!palette.gray) {
    // Default gray scale if no primary color
    palette.gray = generateGrayScale('#6B7280');
  }

  return palette as ColorPalette;
}

/**
 * Generate a specialized gray scale
 */
export function generateGrayScale(baseGray: string): ColorScale {
  const rgb = hexToRgb(baseGray);
  const hsl = rgbToHsl(rgb);

  const scale = {} as ColorScale;

  // Gray needs special handling for a more neutral appearance
  const shades = [
    { shade: 50 as ShadeNumber, lightness: 98 },
    { shade: 100 as ShadeNumber, lightness: 96 },
    { shade: 200 as ShadeNumber, lightness: 90 },
    { shade: 300 as ShadeNumber, lightness: 80 },
    { shade: 400 as ShadeNumber, lightness: 70 },
    { shade: 500 as ShadeNumber, lightness: 60 },
    { shade: 600 as ShadeNumber, lightness: 50 },
    { shade: 700 as ShadeNumber, lightness: 40 },
    { shade: 800 as ShadeNumber, lightness: 30 },
    { shade: 900 as ShadeNumber, lightness: 20 },
  ];

  for (const { shade, lightness } of shades) {
    const newHsl = { ...hsl, l: lightness };
    scale[shade] = rgbToHex(hslToRgb(newHsl));
  }

  return scale;
}

/**
 * Generate a complete theme color palette from primary and secondary colors
 */
export function generateThemePalette(options: {
  primary: string;
  secondary?: string;
  accent?: string;
  gray?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}): ColorPalette {
  const {
    primary,
    secondary = adjustHue(primary, 60),
    accent = adjustHue(primary, 180),
    gray = desaturate(primary, 90),
    success = '#10B981', // Default green
    warning = '#F59E0B', // Default orange
    error = '#EF4444', // Default red
    info = '#3B82F6', // Default blue
  } = options;

  return generatePalette({
    primary,
    secondary,
    accent,
    gray,
    success,
    warning,
    error,
    info,
  });
}

/**
 * Generate semantic colors based on a color palette
 */
export function generateSemanticColors(palette: ColorPalette) {
  return {
    primary: palette.primary[500],
    primaryLight: palette.primary[300],
    primaryDark: palette.primary[700],

    secondary: palette.secondary?.[500] || palette.primary[300],
    secondaryLight: palette.secondary?.[300] || palette.primary[200],
    secondaryDark: palette.secondary?.[700] || palette.primary[400],

    accent: palette.accent?.[500] || adjustHue(palette.primary[500], 180),
    accentLight: palette.accent?.[300] || adjustHue(palette.primary[300], 180),
    accentDark: palette.accent?.[700] || adjustHue(palette.primary[700], 180),

    background: palette.gray[50],
    surface: '#FFFFFF',
    surfaceHover: palette.gray[100],
    surfaceActive: palette.gray[200],

    text: palette.gray[900],
    textSecondary: palette.gray[700],
    textTertiary: palette.gray[500],
    textDisabled: palette.gray[400],

    border: palette.gray[200],
    borderHover: palette.gray[300],
    borderFocus: palette.primary[500],

    shadow: 'rgba(0, 0, 0, 0.1)',
  };
}

/**
 * Generate state colors based on a color palette
 */
export function generateStateColors(palette: ColorPalette) {
  return {
    success: palette.success?.[500] || '#10B981',
    successLight: palette.success?.[100] || '#D1FAE5',
    successDark: palette.success?.[700] || '#047857',

    warning: palette.warning?.[500] || '#F59E0B',
    warningLight: palette.warning?.[100] || '#FEF3C7',
    warningDark: palette.warning?.[700] || '#B45309',

    error: palette.error?.[500] || '#EF4444',
    errorLight: palette.error?.[100] || '#FEE2E2',
    errorDark: palette.error?.[700] || '#B91C1C',

    info: palette.info?.[500] || '#3B82F6',
    infoLight: palette.info?.[100] || '#DBEAFE',
    infoDark: palette.info?.[700] || '#1D4ED8',
  };
}

/**
 * Get a contrasting text color (black or white) for a given background color
 */
export function getContrastText(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);

  // Calculate luminance using the perceived brightness formula
  // https://www.w3.org/TR/AERT/#color-contrast
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  // Use black text on light backgrounds, white text on dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Create a complete theme color configuration from a base color
 */
export function createThemeColors(baseColor: string) {
  const palette = generateThemePalette({ primary: baseColor });
  const semanticColors = generateSemanticColors(palette);
  const stateColors = generateStateColors(palette);

  return {
    palette,
    semantic: semanticColors,
    state: stateColors,
  };
}
