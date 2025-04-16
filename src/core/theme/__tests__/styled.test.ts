import { getThemeValue, themed, mixins } from '../styled';
import { ThemeConfig } from '../theme-persistence';
import { colors, semanticColors, stateColors } from '../colors';
import { typographyScale, fontWeights, lineHeights, letterSpacing } from '../typography';
import { spacingScale, semanticSpacing } from '../spacing';
import { breakpointValues, containerMaxWidths } from '../breakpoints';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  colors: {
    ...colors,
    ...semanticColors,
    ...stateColors,
  },
  typography: {
    scale: typographyScale,
    weights: fontWeights,
    lineHeights: lineHeights,
    letterSpacing: letterSpacing,
  },
  spacing: {
    ...spacingScale,
    semantic: semanticSpacing,
  },
  breakpoints: {
    ...breakpointValues,
    containers: containerMaxWidths,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Styled Components Utilities', () => {
  describe('getThemeValue', () => {
    it('should get a theme value by path', () => {
      expect(getThemeValue(mockTheme, 'colors.primary.500')).toBe('#3b82f6');
      expect(getThemeValue(mockTheme, 'typography.scale.base')).toBe('1rem');
    });

    it('should return empty string for non-existent path', () => {
      expect(getThemeValue(mockTheme, 'colors.nonexistent')).toBe('');
    });
  });

  describe('themed', () => {
    it('should create a theme-aware CSS function', () => {
      const cssFn = themed(theme => ({
        color: theme.colors.primary[500],
        fontSize: theme.typography.scale.base,
      }));

      const result = cssFn(mockTheme);
      expect(result).toBeDefined();
      expect(result.styles).toBeDefined();
    });
  });

  describe('mixins', () => {
    describe('text', () => {
      it('should create text styles with default size', () => {
        const styles = mixins.text()(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('font-size:1rem');
        expect(styles.styles).toContain('line-height:1.5');
      });

      it('should create text styles with custom size', () => {
        const styles = mixins.text('2xl')(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('font-size:1.5rem');
      });
    });

    describe('heading', () => {
      it('should create heading styles', () => {
        const styles = mixins.heading()(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('font-size:1.5rem');
        expect(styles.styles).toContain('font-weight:700');
        expect(styles.styles).toContain('line-height:1.25');
      });
    });

    describe('spacing', () => {
      it('should create padding styles', () => {
        const styles = mixins.padding('4')(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('padding:16px');
      });

      it('should create margin styles', () => {
        const styles = mixins.margin('6')(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('margin:24px');
      });
    });

    describe('colors', () => {
      it('should create background color styles', () => {
        const styles = mixins.bg('primary.500')(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('background-color:#3b82f6');
      });

      it('should create text color styles', () => {
        const styles = mixins.textColor('gray.900')(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('color:#111827');
      });
    });

    describe('layout', () => {
      it('should create flex styles', () => {
        const styles = mixins.flex()(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('display:flex');
        expect(styles.styles).toContain('flex-direction:row');
      });

      it('should create grid styles', () => {
        const styles = mixins.grid(2)(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('display:grid');
        expect(styles.styles).toContain('grid-template-columns:repeat(2, 1fr)');
      });
    });

    describe('responsive', () => {
      it('should create responsive styles', () => {
        const styles = mixins.responsive('md')(mockTheme);
        expect(styles).toBeDefined();
        expect(styles.styles).toContain('@media (min-width: 768px)');
      });
    });
  });
});
