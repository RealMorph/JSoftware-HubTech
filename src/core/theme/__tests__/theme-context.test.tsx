import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme, ThemeProviderProps } from '../ThemeProvider';
import { ThemeConfig } from '../consolidated-types';
import { ThemeServiceContext } from '../theme-context';

// Mock theme service
const mockThemeService = {
  getDefaultTheme: jest.fn(),
  getDarkTheme: jest.fn(),
  getLightTheme: jest.fn()
};

// Create a default theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e74c3c',
    info: '#00cec9',
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
      disabled: '#a0aec0',
    },
    background: '#ffffff',
    border: '#e2e8f0',
    white: '#ffffff',
    surface: '#f7fafc',
  },
  typography: {
    fontFamily: {
      base: 'Inter, sans-serif',
      heading: 'Inter, sans-serif',
      monospace: 'monospace',
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
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
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
  name: 'Test Theme'
};

// Mock the css-variables and theme-system modules
jest.mock('../css-variables', () => ({
  generateCssVariables: jest.fn(),
}));

jest.mock('../theme-system', () => ({
  applyTheme: jest.fn(),
}));

jest.mock('../theme-adapter', () => ({
  adaptThemeForEmotion: jest.fn().mockReturnValue({})
}));

// Test component that uses the theme context
function TestComponent() {
  const { currentTheme, setTheme, toggleDarkMode } = useTheme();
  return (
    <div>
      <div data-testid="current-theme">{currentTheme?.name}</div>
      <button data-testid="toggle-dark-mode" onClick={toggleDarkMode}>Toggle Dark Mode</button>
      <button 
        data-testid="set-theme-button" 
        onClick={() => setTheme({...mockTheme, name: 'New Theme'})}
      >
        Change Theme
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeService.getDefaultTheme.mockReturnValue(mockTheme);
    mockThemeService.getDarkTheme.mockReturnValue({...mockTheme, name: 'Dark Theme'});
    mockThemeService.getLightTheme.mockReturnValue({...mockTheme, name: 'Light Theme'});
  });

  it('should provide theme context to children', async () => {
    const { getByTestId } = render(
      <ThemeServiceContext.Provider value={mockThemeService}>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </ThemeServiceContext.Provider>
    );

    // Check theme is provided
    expect(getByTestId('current-theme')).toHaveTextContent('Test Theme');
  });

  it('should toggle between light and dark themes', async () => {
    const { getByTestId } = render(
      <ThemeServiceContext.Provider value={mockThemeService}>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </ThemeServiceContext.Provider>
    );

    // Toggle dark mode
    await act(async () => {
      getByTestId('toggle-dark-mode').click();
    });

    // Should now show dark theme
    expect(getByTestId('current-theme')).toHaveTextContent('Dark Theme');

    // Toggle back to light mode
    await act(async () => {
      getByTestId('toggle-dark-mode').click();
    });

    // Should now show light theme
    expect(getByTestId('current-theme')).toHaveTextContent('Light Theme');
  });

  it('should allow setting a custom theme', async () => {
    const { getByTestId } = render(
      <ThemeServiceContext.Provider value={mockThemeService}>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </ThemeServiceContext.Provider>
    );

    // Check theme is provided
    expect(getByTestId('current-theme')).toHaveTextContent('Test Theme');

    // Set a new theme
    await act(async () => {
      getByTestId('set-theme-button').click();
    });

    // Should now show the new theme
    expect(getByTestId('current-theme')).toHaveTextContent('New Theme');
  });

  it('should use initialTheme when provided', async () => {
    const customTheme = {...mockTheme, name: 'Custom Initial Theme'};
    
    const { getByTestId } = render(
      <ThemeServiceContext.Provider value={mockThemeService}>
        <ThemeProvider initialTheme={customTheme}>
          <TestComponent />
        </ThemeProvider>
      </ThemeServiceContext.Provider>
    );

    // Should show custom initial theme
    expect(getByTestId('current-theme')).toHaveTextContent('Custom Initial Theme');
  });
});
