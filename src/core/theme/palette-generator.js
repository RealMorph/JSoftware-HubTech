export function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return { r, g, b };
}
export function rgbToHex(rgb) {
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
export function rgbToHsl(rgb) {
  let { r, g, b } = rgb;
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
export function hslToRgb(hsl) {
  const { h, s, l } = hsl;
  const h1 = h / 360;
  const s1 = s / 100;
  const l1 = l / 100;
  let r, g, b;
  if (s1 === 0) {
    r = g = b = l1;
  } else {
    const hue2rgb = (p, q, t) => {
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
export function lighten(color, amount) {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.min(100, hsl.l + amount);
  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}
export function darken(color, amount) {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, hsl.l - amount);
  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}
export function saturate(color, amount) {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);
  hsl.s = Math.min(100, Math.max(0, hsl.s + amount));
  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}
export function desaturate(color, amount) {
  return saturate(color, -amount);
}
export function adjustHue(color, degrees) {
  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + degrees) % 360;
  if (hsl.h < 0) hsl.h += 360;
  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb);
}
export function generateColorScale(baseColor) {
  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb);
  const baseShade = 500;
  const scale = {};
  const lighterShades = [
    { shade: 50, lightness: 97, saturation: -15 },
    { shade: 100, lightness: 94, saturation: -10 },
    { shade: 200, lightness: 85, saturation: -5 },
    { shade: 300, lightness: 75, saturation: 0 },
    { shade: 400, lightness: 65, saturation: 0 },
  ];
  const darkerShades = [
    { shade: 600, lightness: -10, saturation: 5 },
    { shade: 700, lightness: -20, saturation: 5 },
    { shade: 800, lightness: -30, saturation: 0 },
    { shade: 900, lightness: -40, saturation: -5 },
  ];
  scale[baseShade] = baseColor;
  for (const { shade, lightness, saturation } of lighterShades) {
    const newHsl = { ...hsl };
    newHsl.l = Math.min(100, Math.max(0, lightness));
    newHsl.s = Math.min(100, Math.max(0, hsl.s + saturation));
    scale[shade] = rgbToHex(hslToRgb(newHsl));
  }
  for (const { shade, lightness, saturation } of darkerShades) {
    const newHsl = { ...hsl };
    newHsl.l = Math.min(100, Math.max(0, hsl.l + lightness));
    newHsl.s = Math.min(100, Math.max(0, hsl.s + saturation));
    scale[shade] = rgbToHex(hslToRgb(newHsl));
  }
  return scale;
}
export function generatePalette(baseColors) {
  const palette = {};
  for (const [name, color] of Object.entries(baseColors)) {
    palette[name] = generateColorScale(color);
  }
  if (!palette.gray && baseColors.primary) {
    const primaryRgb = hexToRgb(baseColors.primary);
    const primaryHsl = rgbToHsl(primaryRgb);
    const grayBase = rgbToHex(hslToRgb({ ...primaryHsl, s: 10 }));
    palette.gray = generateGrayScale(grayBase);
  } else if (!palette.gray) {
    palette.gray = generateGrayScale('#6B7280');
  }
  return palette;
}
export function generateGrayScale(baseGray) {
  const rgb = hexToRgb(baseGray);
  const hsl = rgbToHsl(rgb);
  const scale = {};
  const shades = [
    { shade: 50, lightness: 98 },
    { shade: 100, lightness: 96 },
    { shade: 200, lightness: 90 },
    { shade: 300, lightness: 80 },
    { shade: 400, lightness: 70 },
    { shade: 500, lightness: 60 },
    { shade: 600, lightness: 50 },
    { shade: 700, lightness: 40 },
    { shade: 800, lightness: 30 },
    { shade: 900, lightness: 20 },
  ];
  for (const { shade, lightness } of shades) {
    const newHsl = { ...hsl, l: lightness };
    scale[shade] = rgbToHex(hslToRgb(newHsl));
  }
  return scale;
}
export function generateThemePalette(options) {
  const {
    primary,
    secondary = adjustHue(primary, 60),
    accent = adjustHue(primary, 180),
    gray = desaturate(primary, 90),
    success = '#10B981',
    warning = '#F59E0B',
    error = '#EF4444',
    info = '#3B82F6',
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
export function generateSemanticColors(palette) {
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
export function generateStateColors(palette) {
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
export function getContrastText(backgroundColor) {
  const rgb = hexToRgb(backgroundColor);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
export function createThemeColors(baseColor) {
  const palette = generateThemePalette({ primary: baseColor });
  const semanticColors = generateSemanticColors(palette);
  const stateColors = generateStateColors(palette);
  return {
    palette,
    semantic: semanticColors,
    state: stateColors,
  };
}
