// Define ColorScheme type directly
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Base color palette with semantic naming
const baseColors = {
  // Primary colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Base primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  // Secondary colors
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Base secondary
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E', // Base neutral
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Semantic colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Base success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Base warning
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Base error
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Base info
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
};

// Function to generate a complete color scheme
export const generateColorScheme = (mode: 'light' | 'dark'): ColorScheme => {
  const isDark = mode === 'dark';

  return {
    primary: baseColors.primary[isDark ? 400 : 500],
    secondary: baseColors.secondary[isDark ? 400 : 500],
    accent: baseColors.info[isDark ? 400 : 500],
    background: baseColors.neutral[isDark ? 900 : 50],
    surface: baseColors.neutral[isDark ? 800 : 100],
    text: baseColors.neutral[isDark ? 50 : 900],
    error: baseColors.error[isDark ? 400 : 500],
    warning: baseColors.warning[isDark ? 400 : 500],
    success: baseColors.success[isDark ? 400 : 500],
    info: baseColors.info[isDark ? 400 : 500],
  };
};

// Utility function to get a color with specific shade
export const getColor = (colorName: keyof typeof baseColors, shade: number): string => {
  return baseColors[colorName][shade as keyof typeof baseColors.primary];
};

// Function to generate CSS variables for the color palette
export const generateColorVariables = (mode: 'light' | 'dark'): string => {
  const scheme = generateColorScheme(mode);
  return Object.entries(scheme)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join('\n');
};

// Export the base colors for direct access
export { baseColors };
