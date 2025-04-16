import {
  typographyScale,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
  typographyStyles,
  generateTypographyVariables,
} from '../typography';

describe('Typography System', () => {
  describe('Typography Scale', () => {
    it('should have correct base font size', () => {
      expect(typographyScale.base).toBe('1rem');
    });

    it('should have a complete scale from xs to 9xl', () => {
      expect(typographyScale.xs).toBe('0.75rem');
      expect(typographyScale['9xl']).toBe('8rem');
    });
  });

  describe('Font Weights', () => {
    it('should have correct normal weight', () => {
      expect(fontWeights.normal).toBe('400');
    });

    it('should have a complete range of weights', () => {
      expect(fontWeights.thin).toBe('100');
      expect(fontWeights.black).toBe('900');
    });
  });

  describe('Line Heights', () => {
    it('should have correct normal line height', () => {
      expect(lineHeights.normal).toBe('1.5');
    });

    it('should have a range of line heights', () => {
      expect(lineHeights.none).toBe('1');
      expect(lineHeights.loose).toBe('2');
    });
  });

  describe('Letter Spacing', () => {
    it('should have correct normal letter spacing', () => {
      expect(letterSpacing.normal).toBe('0');
    });

    it('should have a range of letter spacing values', () => {
      expect(letterSpacing.tighter).toBe('-0.05em');
      expect(letterSpacing.widest).toBe('0.1em');
    });
  });

  describe('Font Families', () => {
    it('should have sans-serif font family', () => {
      expect(fontFamilies.sans).toContain('system-ui');
    });

    it('should have serif font family', () => {
      expect(fontFamilies.serif).toContain('Georgia');
    });

    it('should have monospace font family', () => {
      expect(fontFamilies.mono).toContain('Menlo');
    });
  });

  describe('Typography Styles', () => {
    it('should have correct h1 style', () => {
      expect(typographyStyles.h1).toEqual({
        fontSize: typographyScale['4xl'],
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.tight,
        letterSpacing: letterSpacing.tight,
      });
    });

    it('should have correct body1 style', () => {
      expect(typographyStyles.body1).toEqual({
        fontSize: typographyScale.base,
        fontWeight: fontWeights.normal,
        lineHeight: lineHeights.normal,
        letterSpacing: letterSpacing.normal,
      });
    });
  });

  describe('Typography Variables Generation', () => {
    it('should generate font size variables', () => {
      const variables = generateTypographyVariables();
      expect(variables).toContain('--font-size-base: 1rem;');
    });

    it('should generate font weight variables', () => {
      const variables = generateTypographyVariables();
      expect(variables).toContain('--font-weight-normal: 400;');
    });

    it('should generate line height variables', () => {
      const variables = generateTypographyVariables();
      expect(variables).toContain('--line-height-normal: 1.5;');
    });

    it('should generate letter spacing variables', () => {
      const variables = generateTypographyVariables();
      expect(variables).toContain('--letter-spacing-normal: 0;');
    });

    it('should generate font family variables', () => {
      const variables = generateTypographyVariables();
      expect(variables).toContain('--font-family-sans:');
    });
  });
});
