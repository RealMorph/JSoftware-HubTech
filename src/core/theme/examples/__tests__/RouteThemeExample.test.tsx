import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DirectThemeProvider } from '../../DirectThemeProvider';
import { defaultTheme } from '../../theme-persistence';
import CustomThemedRoute from '../RouteThemeExample';

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
};

describe('RouteThemeExample', () => {
  const renderWithTheme = (initialEntries = ['/']) => {
    return render(
      <DirectThemeProvider initialTheme={defaultTheme} themeService={mockThemeService}>
        <MemoryRouter initialEntries={initialEntries}>
          <CustomThemedRoute />
        </MemoryRouter>
      </DirectThemeProvider>
    );
  };

  it('renders home page with correct theme', () => {
    renderWithTheme();
    
    const heading = screen.getByText('Welcome to Theme Examples');
    const container = heading.closest('div');
    
    expect(container).toHaveStyle({
      backgroundColor: defaultTheme.colors.surface,
    });
  });

  it('navigates to settings page and applies theme', () => {
    renderWithTheme();
    
    const settingsLink = screen.getByText('Go to Settings');
    fireEvent.click(settingsLink);
    
    const settingsHeading = screen.getByText('Theme Settings');
    expect(settingsHeading).toBeInTheDocument();
  });

  it('toggles dark mode on settings page', () => {
    renderWithTheme(['/settings']);
    
    const toggleButton = screen.getByText('Toggle Dark Mode');
    fireEvent.click(toggleButton);
    
    const container = screen.getByText('Theme Settings').closest('div');
    expect(container).toHaveStyle({
      backgroundColor: mockThemeService.getDarkTheme().colors.surface,
    });
  });

  it('maintains theme state when navigating between routes', () => {
    renderWithTheme();
    
    // Navigate to settings
    const settingsLink = screen.getByText('Go to Settings');
    fireEvent.click(settingsLink);
    
    // Toggle dark mode
    const toggleButton = screen.getByText('Toggle Dark Mode');
    fireEvent.click(toggleButton);
    
    // Navigate back home
    const homeLink = screen.getByText('Back to Home');
    fireEvent.click(homeLink);
    
    // Check if dark theme is maintained
    const container = screen.getByText('Welcome to Theme Examples').closest('div');
    expect(container).toHaveStyle({
      backgroundColor: mockThemeService.getDarkTheme().colors.surface,
    });
  });

  it('applies route-specific theme colors', () => {
    renderWithTheme();
    
    // Check home route color
    const homeLink = screen.getByText('Go to Settings');
    expect(homeLink).toHaveStyle({
      color: '#2196f3', // Blue for home
    });
    
    // Navigate to settings
    fireEvent.click(homeLink);
    
    // Check settings route color
    const backLink = screen.getByText('Back to Home');
    expect(backLink).toHaveStyle({
      color: '#9c27b0', // Purple for settings
    });
  });
}); 