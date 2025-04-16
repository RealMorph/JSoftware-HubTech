import { generateColorScheme, getColor, generateColorVariables } from '../colorPalette';

describe('Color Palette System', () => {
  describe('generateColorScheme', () => {
    it('should generate light mode color scheme', () => {
      const scheme = generateColorScheme('light');

      expect(scheme).toHaveProperty('primary');
      expect(scheme).toHaveProperty('secondary');
      expect(scheme).toHaveProperty('accent');
      expect(scheme).toHaveProperty('background');
      expect(scheme).toHaveProperty('surface');
      expect(scheme).toHaveProperty('text');
      expect(scheme.background).toBe('#FAFAFA'); // neutral-50
      expect(scheme.text).toBe('#212121'); // neutral-900
    });

    it('should generate dark mode color scheme', () => {
      const scheme = generateColorScheme('dark');

      expect(scheme.background).toBe('#212121'); // neutral-900
      expect(scheme.text).toBe('#FAFAFA'); // neutral-50
    });
  });

  describe('getColor', () => {
    it('should return correct color for given name and shade', () => {
      expect(getColor('primary', 500)).toBe('#2196F3');
      expect(getColor('secondary', 500)).toBe('#9C27B0');
      expect(getColor('neutral', 500)).toBe('#9E9E9E');
    });
  });

  describe('generateColorVariables', () => {
    it('should generate CSS variables for light mode', () => {
      const variables = generateColorVariables('light');

      expect(variables).toContain('--color-primary:');
      expect(variables).toContain('--color-secondary:');
      expect(variables).toContain('--color-background:');
      expect(variables).toContain('--color-text:');
    });

    it('should generate CSS variables for dark mode', () => {
      const variables = generateColorVariables('dark');

      expect(variables).toContain('--color-primary:');
      expect(variables).toContain('--color-secondary:');
      expect(variables).toContain('--color-background:');
      expect(variables).toContain('--color-text:');
    });
  });
});
