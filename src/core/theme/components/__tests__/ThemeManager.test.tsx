import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeManager } from '../ThemeManager';
import { useTheme } from '../../hooks/useTheme';
import { ThemeConfig } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Helper function to parse dates in theme
const parseDates = (theme: ThemeConfig): ThemeConfig => ({
  ...theme,
  createdAt: new Date(theme.createdAt),
  updatedAt: new Date(theme.updatedAt),
});

// Mock themes
const mockThemes = [
  {
    id: '1',
    name: 'Light Theme',
    description: 'Default light theme',
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      background: {
        primary: '#FFFFFF',
        secondary: '#F3F4F6',
        tertiary: '#E5E7EB',
      },
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        disabled: '#9CA3AF',
      },
      border: {
        primary: '#D1D5DB',
        secondary: '#E5E7EB',
      },
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      weights: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      family: {
        primary: 'Inter, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Menlo, monospace',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    breakpoints: {
      xs: '320px',
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
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    transitions: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    isDefault: true,
    createdAt: new Date('2025-04-08T04:15:19.757Z'),
    updatedAt: new Date('2025-04-08T04:15:19.757Z'),
  },
  {
    id: '2',
    name: 'Dark Theme',
    description: 'Default dark theme',
    colors: {
      primary: '#60A5FA',
      secondary: '#9CA3AF',
      background: {
        primary: '#111827',
        secondary: '#1F2937',
        tertiary: '#374151',
      },
      text: {
        primary: '#F9FAFB',
        secondary: '#E5E7EB',
        disabled: '#9CA3AF',
      },
      border: {
        primary: '#4B5563',
        secondary: '#374151',
      },
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
    },
    typography: {
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      weights: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      family: {
        primary: 'Inter, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Menlo, monospace',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      base: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    breakpoints: {
      xs: '320px',
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
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    transitions: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    isDefault: false,
    createdAt: new Date('2025-04-08T04:15:19.757Z'),
    updatedAt: new Date('2025-04-08T04:15:19.757Z'),
  },
] as const satisfies readonly ThemeConfig[];

// Mock the theme context
const mockSetTheme = jest.fn();
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: mockThemes[0],
    setTheme: mockSetTheme,
  }),
}));

describe('ThemeManager', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockThemes));
  });

  it('renders the theme manager with available themes', async () => {
    render(<ThemeManager />);

    // Wait for themes to load
    await waitFor(() => {
      expect(screen.getByText('Theme Manager')).toBeInTheDocument();
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });
  });

  it('shows the current theme as active', async () => {
    render(<ThemeManager />);

    await waitFor(() => {
      const themeCard = screen.getByTestId('theme-card-1');
      expect(themeCard).toHaveClass('active');
    });
  });

  it('allows switching themes', async () => {
    render(<ThemeManager />);

    // Wait for themes to load first
    await waitFor(() => {
      expect(screen.getByTestId('preview-button-2')).toBeInTheDocument();
    });

    const previewButton = screen.getByTestId('preview-button-2');
    fireEvent.click(previewButton);

    const darkTheme = mockThemes[1];
    if (!darkTheme) {
      throw new Error('Dark theme not found in mock themes');
    }

    expect(mockSetTheme).toHaveBeenCalledWith(parseDates(darkTheme));
  });

  it('allows creating a new theme', async () => {
    render(<ThemeManager />);

    // Wait for themes to load first
    await waitFor(() => {
      expect(screen.getByTestId('create-theme-button')).toBeInTheDocument();
    });

    const createButton = screen.getByTestId('create-theme-button');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme-editor')).toBeInTheDocument();
    });
  });

  it('allows editing a theme', async () => {
    render(<ThemeManager />);

    // Wait for themes to load first
    await waitFor(() => {
      expect(screen.getByTestId('edit-button-1')).toBeInTheDocument();
    });

    const editButton = screen.getByTestId('edit-button-1');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme-editor')).toBeInTheDocument();
    });
  });

  it('allows deleting a theme', async () => {
    render(<ThemeManager />);

    await waitFor(() => {
      const deleteButton = screen.getByTestId('delete-button-1');
      fireEvent.click(deleteButton);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });
});
