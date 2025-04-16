// Base colors with multiple shades
export const colors = {
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  violet: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  fuchsia: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
};

// Semantic color tokens
export const semanticColors = {
  primary: {
    50: colors.blue[50],
    100: colors.blue[100],
    200: colors.blue[200],
    300: colors.blue[300],
    400: colors.blue[400],
    500: colors.blue[500],
    600: colors.blue[600],
    700: colors.blue[700],
    800: colors.blue[800],
    900: colors.blue[900],
  },
  secondary: {
    50: colors.purple[50],
    100: colors.purple[100],
    200: colors.purple[200],
    300: colors.purple[300],
    400: colors.purple[400],
    500: colors.purple[500],
    600: colors.purple[600],
    700: colors.purple[700],
    800: colors.purple[800],
    900: colors.purple[900],
  },
  accent: {
    50: colors.pink[50],
    100: colors.pink[100],
    200: colors.pink[200],
    300: colors.pink[300],
    400: colors.pink[400],
    500: colors.pink[500],
    600: colors.pink[600],
    700: colors.pink[700],
    800: colors.pink[800],
    900: colors.pink[900],
  },
  neutral: {
    50: colors.gray[50],
    100: colors.gray[100],
    200: colors.gray[200],
    300: colors.gray[300],
    400: colors.gray[400],
    500: colors.gray[500],
    600: colors.gray[600],
    700: colors.gray[700],
    800: colors.gray[800],
    900: colors.gray[900],
  },
};

// State colors
export const stateColors = {
  success: {
    50: colors.green[50],
    100: colors.green[100],
    200: colors.green[200],
    300: colors.green[300],
    400: colors.green[400],
    500: colors.green[500],
    600: colors.green[600],
    700: colors.green[700],
    800: colors.green[800],
    900: colors.green[900],
  },
  warning: {
    50: colors.yellow[50],
    100: colors.yellow[100],
    200: colors.yellow[200],
    300: colors.yellow[300],
    400: colors.yellow[400],
    500: colors.yellow[500],
    600: colors.yellow[600],
    700: colors.yellow[700],
    800: colors.yellow[800],
    900: colors.yellow[900],
  },
  error: {
    50: colors.red[50],
    100: colors.red[100],
    200: colors.red[200],
    300: colors.red[300],
    400: colors.red[400],
    500: colors.red[500],
    600: colors.red[600],
    700: colors.red[700],
    800: colors.red[800],
    900: colors.red[900],
  },
  info: {
    50: colors.cyan[50],
    100: colors.cyan[100],
    200: colors.cyan[200],
    300: colors.cyan[300],
    400: colors.cyan[400],
    500: colors.cyan[500],
    600: colors.cyan[600],
    700: colors.cyan[700],
    800: colors.cyan[800],
    900: colors.cyan[900],
  },
};

// Function to get a color by key
export const getColor = (key: string): string => {
  const [category, shade] = key.split('.');

  if (category in semanticColors && shade in (semanticColors as any)[category]) {
    return (semanticColors as any)[category][shade];
  }

  if (category in stateColors && shade in (stateColors as any)[category]) {
    return (stateColors as any)[category][shade];
  }

  if (category in colors && shade in (colors as any)[category]) {
    return (colors as any)[category][shade];
  }

  return '#000000'; // Default fallback
};

// Function to generate CSS variables for colors
export const generateColorVariables = (): string => {
  const variables = [
    // Base colors
    ...Object.entries(colors).flatMap(([colorName, shades]) =>
      Object.entries(shades).map(([shade, value]) => `--color-${colorName}-${shade}: ${value};`)
    ),
    // Semantic colors
    ...Object.entries(semanticColors).flatMap(([semanticName, shades]) =>
      Object.entries(shades).map(([shade, value]) => `--color-${semanticName}-${shade}: ${value};`)
    ),
    // State colors
    ...Object.entries(stateColors).flatMap(([stateName, shades]) =>
      Object.entries(shades).map(([shade, value]) => `--color-${stateName}-${shade}: ${value};`)
    ),
  ];

  return variables.join('\n');
};
