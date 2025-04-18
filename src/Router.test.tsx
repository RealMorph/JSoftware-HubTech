import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRouter from './Router';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { defaultTheme, ThemeConfig } from './core/theme/theme-persistence';

// Create a synchronous mock ThemeService for testing
const mockThemeService = {
  getDefaultTheme: () => defaultTheme,
  getLightTheme: () => defaultTheme,
  getDarkTheme: () => ({
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      text: {
        primary: '#ffffff',
        secondary: '#e2e8f0',
        disabled: '#718096',
      },
      background: '#1a202c',
      surface: '#2d3748',
      border: '#4a5568',
    },
  }),
  getAllThemes: () => [defaultTheme],
  getThemeById: () => defaultTheme,
  createTheme: (theme: ThemeConfig) => theme,
  updateTheme: () => defaultTheme,
  deleteTheme: () => true,
  setDefaultTheme: () => true,
};

describe('Router Theme Integration', () => {
  it('applies theme correctly across routes', () => {
    render(
      <DirectThemeProvider initialTheme={defaultTheme} themeService={mockThemeService}>
        <MemoryRouter initialEntries={['/']}>
          <AppRouter />
        </MemoryRouter>
      </DirectThemeProvider>
    );

    // Verify theme is applied to the home page
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      borderBottom: expect.stringContaining(defaultTheme.colors.border)
    });
  });

  it('maintains theme when navigating between routes', () => {
    render(
      <DirectThemeProvider initialTheme={defaultTheme} themeService={mockThemeService}>
        <MemoryRouter initialEntries={['/']}>
          <AppRouter />
        </MemoryRouter>
      </DirectThemeProvider>
    );

    // Navigate to a demo page
    const demoLink = screen.getByText('Data Display Components');
    fireEvent.click(demoLink);

    // Verify theme persists after navigation
    const demoContainer = screen.getByRole('main');
    expect(demoContainer).toHaveStyle({
      backgroundColor: defaultTheme.colors.background
    });
  });

  it('supports theme switching across routes', () => {
    render(
      <DirectThemeProvider initialTheme={defaultTheme} themeService={mockThemeService}>
        <MemoryRouter initialEntries={['/']}>
          <AppRouter />
        </MemoryRouter>
      </DirectThemeProvider>
    );

    // TODO: Add theme toggle button and test theme switching
    // This will be implemented when the theme toggle UI is added
  });

  it('preserves theme preferences in local storage', () => {
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(
      <DirectThemeProvider initialTheme={defaultTheme} themeService={mockThemeService}>
        <MemoryRouter initialEntries={['/']}>
          <AppRouter />
        </MemoryRouter>
      </DirectThemeProvider>
    );

    // TODO: Add theme persistence tests when local storage integration is complete
  });
}); 