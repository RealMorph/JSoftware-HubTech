import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  lighten,
  darken,
  saturate,
  desaturate,
  adjustHue,
  generateColorScale,
  generateGrayScale,
  generateThemePalette,
  generateSemanticColors,
  generateStateColors,
  getContrastText,
} from '../palette-generator';

describe('Color Palette Generator', () => {
  describe('Color Conversion', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
    });

    it('should convert RGB to HSL', () => {
      const redHsl = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(redHsl.h).toBe(0);
      expect(redHsl.s).toBe(100);
      expect(redHsl.l).toBe(50);

      const greenHsl = rgbToHsl({ r: 0, g: 255, b: 0 });
      expect(greenHsl.h).toBe(120);
      expect(greenHsl.s).toBe(100);
      expect(greenHsl.l).toBe(50);
    });

    it('should convert HSL to RGB', () => {
      expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual({ r: 255, g: 0, b: 0 });
      expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual({ r: 0, g: 255, b: 0 });
      expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle edge cases in conversions', () => {
      // Black
      expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
      expect(hslToRgb({ h: 0, s: 0, l: 0 })).toEqual({ r: 0, g: 0, b: 0 });

      // White
      expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
      expect(hslToRgb({ h: 0, s: 0, l: 100 })).toEqual({ r: 255, g: 255, b: 255 });

      // Gray
      expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
    });
  });

  describe('Color Manipulation', () => {
    it('should lighten colors', () => {
      const lightened = lighten('#ff0000', 20);
      const hsl = rgbToHsl(hexToRgb(lightened));
      expect(hsl.l).toBe(70); // 50 + 20
    });

    it('should darken colors', () => {
      const darkened = darken('#ff0000', 20);
      const hsl = rgbToHsl(hexToRgb(darkened));
      expect(hsl.l).toBe(30); // 50 - 20
    });

    it('should saturate colors', () => {
      const color = '#808080'; // Gray (0% saturation)
      const saturated = saturate(color, 50);
      const hsl = rgbToHsl(hexToRgb(saturated));
      expect(hsl.s).toBe(50); // 0 + 50
    });

    it('should desaturate colors', () => {
      const color = '#ff0000'; // Red (100% saturation)
      const desaturated = desaturate(color, 50);
      const hsl = rgbToHsl(hexToRgb(desaturated));
      expect(hsl.s).toBe(50); // 100 - 50
    });

    it('should adjust hue', () => {
      const color = '#ff0000'; // Red (0° hue)
      const adjusted = adjustHue(color, 120);
      const hsl = rgbToHsl(hexToRgb(adjusted));
      expect(hsl.h).toBe(120); // 0 + 120 = Green
    });

    it('should handle hue wrapping', () => {
      const color = '#ff0000'; // Red (0° hue)
      const adjusted = adjustHue(color, 420); // 360 + 60
      const hsl = rgbToHsl(hexToRgb(adjusted));
      expect(hsl.h).toBe(60); // Should wrap around to 60° (yellow)
    });
  });

  describe('Color Scale Generation', () => {
    it('should generate a color scale from a base color', () => {
      const scale = generateColorScale('#3B82F6'); // Blue

      // Check that all shades exist
      expect(scale[50]).toBeDefined();
      expect(scale[100]).toBeDefined();
      expect(scale[500]).toBeDefined();
      expect(scale[900]).toBeDefined();

      // Check that lightness decreases as the shade number increases
      const hsl50 = rgbToHsl(hexToRgb(scale[50]));
      const hsl900 = rgbToHsl(hexToRgb(scale[900]));
      expect(hsl50.l).toBeGreaterThan(hsl900.l);
    });

    it('should generate a gray scale', () => {
      const grayScale = generateGrayScale('#6B7280');

      // Check all shades exist
      expect(grayScale[50]).toBeDefined();
      expect(grayScale[100]).toBeDefined();
      expect(grayScale[500]).toBeDefined();
      expect(grayScale[900]).toBeDefined();

      // Check proper lightness progression
      for (let i = 1; i < 9; i++) {
        const lighter = grayScale[(i * 100) as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800];
        const darker = grayScale[((i + 1) * 100) as 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900];
        const lighterHsl = rgbToHsl(hexToRgb(lighter));
        const darkerHsl = rgbToHsl(hexToRgb(darker));
        expect(lighterHsl.l).toBeGreaterThan(darkerHsl.l);
      }
    });
  });

  describe('Theme Palette Generation', () => {
    it('should generate a complete theme palette from a primary color', () => {
      const palette = generateThemePalette({ primary: '#3B82F6' });

      // Should have the primary color
      expect(palette.primary).toBeDefined();
      expect(palette.primary[500]).toBe('#3B82F6');

      // Should have auto-generated secondary and accent colors
      expect(palette.secondary).toBeDefined();
      expect(palette.accent).toBeDefined();

      // Should have a gray scale
      expect(palette.gray).toBeDefined();

      // Should have state colors
      expect(palette.success).toBeDefined();
      expect(palette.warning).toBeDefined();
      expect(palette.error).toBeDefined();
      expect(palette.info).toBeDefined();
    });

    it('should respect provided colors', () => {
      const palette = generateThemePalette({
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#EF4444',
      });

      expect(palette.primary[500]).toBe('#3B82F6');
      expect(palette.secondary[500]).toBe('#10B981');
      expect(palette.accent[500]).toBe('#EF4444');
    });
  });

  describe('Semantic and State Colors', () => {
    it('should generate semantic colors from a palette', () => {
      const palette = generateThemePalette({ primary: '#3B82F6' });
      const semanticColors = generateSemanticColors(palette);

      expect(semanticColors.primary).toBe(palette.primary[500]);
      expect(semanticColors.primaryLight).toBe(palette.primary[300]);
      expect(semanticColors.primaryDark).toBe(palette.primary[700]);

      expect(semanticColors.background).toBe(palette.gray[50]);
      expect(semanticColors.text).toBe(palette.gray[900]);
    });

    it('should generate state colors from a palette', () => {
      const palette = generateThemePalette({ primary: '#3B82F6' });
      const stateColors = generateStateColors(palette);

      expect(stateColors.success).toBe(palette.success[500]);
      expect(stateColors.warning).toBe(palette.warning[500]);
      expect(stateColors.error).toBe(palette.error[500]);
      expect(stateColors.info).toBe(palette.info[500]);
    });
  });

  describe('Contrast Text', () => {
    it('should return black text for light backgrounds', () => {
      expect(getContrastText('#FFFFFF')).toBe('#000000');
      expect(getContrastText('#F3F4F6')).toBe('#000000');
      expect(getContrastText('#FFEB3B')).toBe('#000000');
    });

    it('should return white text for dark backgrounds', () => {
      expect(getContrastText('#000000')).toBe('#FFFFFF');
      expect(getContrastText('#1F2937')).toBe('#FFFFFF');
      expect(getContrastText('#3B82F6')).toBe('#FFFFFF');
    });
  });
});
