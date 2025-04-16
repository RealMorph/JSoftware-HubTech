import React from 'react';
import { render, RenderResult, act } from '@testing-library/react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { ThemeProvider } from './theme/ThemeProvider';
import {
  inMemoryThemeService,
  defaultTheme,
  ThemeConfig,
  ThemeService,
  InMemoryThemeDatabase,
} from './theme/theme-persistence';
import { colors, semanticColors, stateColors } from './theme/colors';
import {
  typographyScale,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
} from './theme/typography';
import { spacingScale, semanticSpacing } from './theme/spacing';
import { breakpointValues, containerMaxWidths } from './theme/breakpoints';

// Mock the document.documentElement
const mockDocumentElement = {
  style: {
    setProperty: jest.fn(),
  },
};

// Mock document object
Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true,
});

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      // Return mock values for CSS variables
      const mockValues: { [key: string]: string } = {
        '--color-primary-500': '#3b82f6',
        '--color-primary-600': '#2563eb',
        '--color-primary-200': '#bfdbfe',
        '--color-primary-50': '#eff6ff',
        '--color-gray-200': '#e5e7eb',
        '--color-gray-300': '#d1d5db',
        '--color-gray-500': '#6b7280',
        '--color-gray-600': '#4b5563',
        '--color-gray-50': '#f9fafb',
        '--font-size-sm': defaultTheme.typography.fontSize.sm,
        '--font-size-base': defaultTheme.typography.fontSize.md,
        '--font-size-lg': defaultTheme.typography.fontSize.lg,
        '--font-weight-medium': String(defaultTheme.typography.fontWeight.medium),
        '--spacing-2': defaultTheme.spacing.xs,
        '--spacing-3': defaultTheme.spacing.sm,
        '--spacing-4': defaultTheme.spacing.md,
        '--spacing-6': defaultTheme.spacing.lg,
        '--border-radius-base': defaultTheme.borderRadius.base,
        '--transition-base': defaultTheme.transitions.duration.normal,
      };
      return mockValues[prop] || '';
    },
  }),
});

// Mock CSS variables in jsdom
function mockCSSVariables() {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --color-primary-500: #3b82f6;
      --color-primary-600: #2563eb;
      --color-primary-200: #bfdbfe;
      --color-primary-50: #eff6ff;
      --color-gray-200: #e5e7eb;
      --color-gray-300: #d1d5db;
      --color-gray-500: #6b7280;
      --color-gray-600: #4b5563;
      --color-gray-50: #f9fafb;
      --font-size-sm: ${defaultTheme.typography.fontSize.sm};
      --font-size-base: ${defaultTheme.typography.fontSize.md};
      --font-size-lg: ${defaultTheme.typography.fontSize.lg};
      --font-weight-medium: ${defaultTheme.typography.fontWeight.medium};
      --spacing-2: ${defaultTheme.spacing.xs};
      --spacing-3: ${defaultTheme.spacing.sm};
      --spacing-4: ${defaultTheme.spacing.md};
      --spacing-6: ${defaultTheme.spacing.lg};
      --border-radius-base: ${defaultTheme.borderRadius.base};
      --transition-base: ${defaultTheme.transitions.duration.normal};
    }
  `;
  document.head.appendChild(style);
}

export const mockTheme: ThemeConfig = {
  id: 'mock-theme',
  name: 'Mock Theme',
  description: 'A mock theme for testing',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
    info: '#06b6d4',
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      disabled: '#9ca3af'
    },
    background: '#ffffff',
    border: '#d1d5db',
    white: '#ffffff',
    surface: '#f9fafb',
  },
  typography: {
    fontFamily: {
      base: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
      monospace: 'SFMono-Regular, Menlo, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  transitions: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock CSS variables for legacy components that still use them
const mockValues = {
  '--color-primary-50': '#eff6ff',
  '--color-primary-500': '#3b82f6',
  '--color-primary-600': '#2563eb',
  '--color-gray-50': '#f9fafb',
  '--color-gray-200': '#e5e7eb',
  '--color-gray-300': '#d1d5db',
  '--color-gray-500': '#6b7280',
  '--color-gray-600': '#4b5563',
  '--spacing-2': defaultTheme.spacing.xs,
  '--spacing-3': defaultTheme.spacing.sm,
  '--spacing-4': defaultTheme.spacing.md,
  '--spacing-6': defaultTheme.spacing.lg,
  '--border-radius-base': mockTheme.borderRadius.base,
  '--transition-base': mockTheme.transitions.duration.normal,
};

export const renderWithTheme = async (ui: React.ReactElement): Promise<RenderResult> => {
  let result: RenderResult;

  mockCSSVariables();

  // Create a wrapper component that provides the theme
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <EmotionThemeProvider theme={mockTheme as any}>
      <ThemeProvider initialTheme={mockTheme}>{children}</ThemeProvider>
    </EmotionThemeProvider>
  );

  await act(async () => {
    result = render(ui, { wrapper: Wrapper });
    // Wait for theme to be loaded
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return result!;
};
