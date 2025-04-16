import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomTabStyles } from '../CustomTabStyles';
import { ThemeProvider } from '@emotion/react';

// Mock the useTheme hook
jest.mock('../../../theme', () => ({
  useTheme: () => ({
    currentTheme: {
      colors: {
        primary: {
          100: '#e6f7ff',
          500: '#1890ff',
          800: '#0050b3'
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          800: '#333333'
        }
      }
    }
  })
}));

describe('CustomTabStyles', () => {
  it('renders CustomTabStyles component', () => {
    render(
      <ThemeProvider theme={{}}>
        <CustomTabStyles />
      </ThemeProvider>
    );
    
    // Check that the component renders with its main sections
    expect(screen.getByText('Custom Tab Styles')).toBeInTheDocument();
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('Usage Example')).toBeInTheDocument();
  });
  
  it('displays TabThemeCustomizer with form controls', () => {
    render(
      <ThemeProvider theme={{}}>
        <CustomTabStyles />
      </ThemeProvider>
    );
    
    // Check that customizer controls are present
    expect(screen.getByText('Tab Theme Customizer')).toBeInTheDocument();
    expect(screen.getByText('Border Radius')).toBeInTheDocument();
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('Default Style')).toBeInTheDocument();
    expect(screen.getByText('Apply Theme')).toBeInTheDocument();
  });
  
  it('displays tab demo with different tab styles', () => {
    render(
      <ThemeProvider theme={{}}>
        <CustomTabStyles />
      </ThemeProvider>
    );
    
    // Check that tab demos are present
    expect(screen.getByText('Standard Tabs')).toBeInTheDocument();
    expect(screen.getByText('Pill Style Tabs with Blue Theme')).toBeInTheDocument();
    expect(screen.getByText('Underlined Tabs')).toBeInTheDocument();
    
    // Check for tab content - using getAllByText as these appear multiple times
    expect(screen.getAllByText('Dashboard')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Reports')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Settings')[0]).toBeInTheDocument();
  });
  
  it('allows switching between customization sections', () => {
    render(
      <ThemeProvider theme={{}}>
        <CustomTabStyles />
      </ThemeProvider>
    );
    
    // Initially on Default Style tab
    expect(screen.getByText('Border Radius')).toBeInTheDocument();
    
    // Switch to Animation tab
    fireEvent.click(screen.getByText('Animation'));
    
    // Should now show animation options
    expect(screen.getByText('Duration (ms)')).toBeInTheDocument();
    expect(screen.getByText('Easing')).toBeInTheDocument();
    expect(screen.getByText('Enable Tab Switch Animation')).toBeInTheDocument();
  });
}); 