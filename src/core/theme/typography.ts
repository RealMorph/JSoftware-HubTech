// Typography scale based on a modular scale (1.2 ratio)
const typographyScale = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
};

// Font weights
const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// Line heights
const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

// Letter spacing
const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Font families
const fontFamilies = {
  sans: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ].join(', '),
  serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'].join(', '),
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ].join(', '),
};

// Typography styles for different text elements
export const typographyStyles = {
  h1: {
    fontSize: typographyScale['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: typographyScale['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: typographyScale['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: typographyScale.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: typographyScale.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: typographyScale.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  body1: {
    fontSize: typographyScale.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontSize: typographyScale.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontSize: typographyScale.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontSize: typographyScale.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
};

// Function to generate CSS variables for typography
export const generateTypographyVariables = (): string => {
  const variables = [
    // Scale
    ...Object.entries(typographyScale).map(([key, value]) => `--font-size-${key}: ${value};`),
    // Weights
    ...Object.entries(fontWeights).map(([key, value]) => `--font-weight-${key}: ${value};`),
    // Line heights
    ...Object.entries(lineHeights).map(([key, value]) => `--line-height-${key}: ${value};`),
    // Letter spacing
    ...Object.entries(letterSpacing).map(([key, value]) => `--letter-spacing-${key}: ${value};`),
    // Font families
    ...Object.entries(fontFamilies).map(([key, value]) => `--font-family-${key}: ${value};`),
  ];

  return variables.join('\n');
};

// Export all typography-related constants and functions
export { typographyScale, fontWeights, lineHeights, letterSpacing, fontFamilies };
