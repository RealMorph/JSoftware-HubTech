// Base spacing unit in pixels
const baseSpacingUnit = 4;

// Spacing scale in pixels
export const spacingScale = {
  '0': '0px',
  '0.5': `${baseSpacingUnit * 0.5}px`,
  '1': `${baseSpacingUnit}px`,
  '1.5': `${baseSpacingUnit * 1.5}px`,
  '2': `${baseSpacingUnit * 2}px`,
  '2.5': `${baseSpacingUnit * 2.5}px`,
  '3': `${baseSpacingUnit * 3}px`,
  '3.5': `${baseSpacingUnit * 3.5}px`,
  '4': `${baseSpacingUnit * 4}px`,
  '5': `${baseSpacingUnit * 5}px`,
  '6': `${baseSpacingUnit * 6}px`,
  '7': `${baseSpacingUnit * 7}px`,
  '8': `${baseSpacingUnit * 8}px`,
  '9': `${baseSpacingUnit * 9}px`,
  '10': `${baseSpacingUnit * 10}px`,
  '11': `${baseSpacingUnit * 11}px`,
  '12': `${baseSpacingUnit * 12}px`,
  '14': `${baseSpacingUnit * 14}px`,
  '16': `${baseSpacingUnit * 16}px`,
  '20': `${baseSpacingUnit * 20}px`,
  '24': `${baseSpacingUnit * 24}px`,
  '28': `${baseSpacingUnit * 28}px`,
  '32': `${baseSpacingUnit * 32}px`,
  '36': `${baseSpacingUnit * 36}px`,
  '40': `${baseSpacingUnit * 40}px`,
  '44': `${baseSpacingUnit * 44}px`,
  '48': `${baseSpacingUnit * 48}px`,
  '52': `${baseSpacingUnit * 52}px`,
  '56': `${baseSpacingUnit * 56}px`,
  '60': `${baseSpacingUnit * 60}px`,
  '64': `${baseSpacingUnit * 64}px`,
  '72': `${baseSpacingUnit * 72}px`,
  '80': `${baseSpacingUnit * 80}px`,
  '96': `${baseSpacingUnit * 96}px`,
};

// Semantic spacing definitions
export const semanticSpacing = {
  // Component spacing
  component: {
    padding: spacingScale['4'],
    margin: spacingScale['0'],
    gap: spacingScale['2'],
  },
  // Layout spacing
  layout: {
    padding: spacingScale['6'],
    margin: spacingScale['0'],
    gap: spacingScale['4'],
  },
  // Section spacing
  section: {
    padding: spacingScale['8'],
    margin: spacingScale['0'],
    gap: spacingScale['6'],
  },
  // Container spacing
  container: {
    padding: spacingScale['4'],
    margin: spacingScale['0'],
    maxWidth: '100%',
  },
  // Grid spacing
  grid: {
    gap: spacingScale['4'],
    columnGap: spacingScale['4'],
    rowGap: spacingScale['4'],
  },
  // Form spacing
  form: {
    labelGap: spacingScale['2'],
    inputGap: spacingScale['4'],
    groupGap: spacingScale['6'],
  },
  // List spacing
  list: {
    itemGap: spacingScale['2'],
    listGap: spacingScale['4'],
  },
  // Card spacing
  card: {
    padding: spacingScale['4'],
    gap: spacingScale['4'],
  },
  // Modal spacing
  modal: {
    padding: spacingScale['6'],
    gap: spacingScale['4'],
  },
  // Button spacing
  button: {
    paddingX: spacingScale['4'],
    paddingY: spacingScale['2'],
    gap: spacingScale['2'],
  },
  // Icon spacing
  icon: {
    size: spacingScale['4'],
    gap: spacingScale['2'],
  },
};

// Function to get spacing value
export const getSpacing = (key: string | number | keyof typeof spacingScale): string => {
  if (typeof key === 'string' || typeof key === 'number') {
    const stringKey = String(key);
    if (stringKey in spacingScale) {
      return spacingScale[stringKey as keyof typeof spacingScale];
    }
  }
  return spacingScale['4']; // Default fallback to 16px (4 x base unit)
};

// Function to get semantic spacing
export const getSemanticSpacing = (
  category: keyof typeof semanticSpacing,
  property: string
): string => {
  if (category in semanticSpacing && property in (semanticSpacing as any)[category]) {
    return (semanticSpacing as any)[category][property];
  }
  return '0px'; // Default fallback
};

// Function to generate CSS variables for spacing
export const generateSpacingVariables = (): string => {
  const variables = [
    // Spacing scale
    ...Object.entries(spacingScale).map(([key, value]) => `--spacing-${key}: ${value};`),
    // Semantic spacing
    ...Object.entries(semanticSpacing).flatMap(([category, properties]) =>
      Object.entries(properties).map(
        ([property, value]) => `--spacing-${category}-${property}: ${value};`
      )
    ),
  ];

  return variables.join('\n');
};
