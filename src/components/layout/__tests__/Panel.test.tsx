import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Panel, PanelHeader, PanelBody, PanelFooter } from '../Panel';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';

// Mock theme to match expectations in tests
const mockTheme = {
  colors: {
    primary: '#3f51b5',
    secondary: '#f50057',
    tertiary: '#9c27b0',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#000000',
      secondary: '#757575',
      disabled: '#9e9e9e',
    },
    background: '#ffffff',
    surface: '#f5f5f5',
    border: '#e5e7eb',
    white: '#ffffff', // Required by ThemeConfig interface
  },
  typography: {
    fontFamily: {
      base: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      heading: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      monospace: "'Roboto Mono', monospace",
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
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
    '2xl': '2560px',
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
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  transitions: {
    duration: {
      fast: '150ms',
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
};

// Wrap component with ThemeProvider for testing
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DirectThemeProvider initialTheme={mockTheme}>{children}</DirectThemeProvider>;
};

describe('Panel Component', () => {
  test('renders panel with children', () => {
    render(
      <ThemeWrapper>
        <Panel data-testid="panel">Panel Content</Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('panel')).toBeInTheDocument();
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  test('renders different panel variants', () => {
    render(
      <ThemeWrapper>
        <Panel data-testid="default-panel" variant="default">
          Default Panel
        </Panel>
        <Panel data-testid="outlined-panel" variant="outlined">
          Outlined Panel
        </Panel>
        <Panel data-testid="flat-panel" variant="flat">
          Flat Panel
        </Panel>
      </ThemeWrapper>
    );

    const defaultPanel = screen.getByTestId('default-panel');
    const outlinedPanel = screen.getByTestId('outlined-panel');
    const flatPanel = screen.getByTestId('flat-panel');

    // Default has shadow
    expect(defaultPanel).toHaveStyle(
      'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    );

    // Outlined has border
    expect(outlinedPanel).toHaveStyle('border: 1px solid #e5e7eb');
    expect(outlinedPanel).toHaveStyle('box-shadow: none');

    // Flat has no shadow or border
    expect(flatPanel).toHaveStyle('box-shadow: none');
    expect(flatPanel).not.toHaveStyle('border: 1px solid #e5e7eb');
  });

  test('renders panel with different padding sizes', () => {
    render(
      <ThemeWrapper>
        <Panel data-testid="none-padding" padding="none">
          No Padding
        </Panel>
        <Panel data-testid="small-padding" padding="small">
          Small Padding
        </Panel>
        <Panel data-testid="medium-padding" padding="medium">
          Medium Padding
        </Panel>
        <Panel data-testid="large-padding" padding="large">
          Large Padding
        </Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('none-padding')).toHaveStyle('padding: 0');
    expect(screen.getByTestId('small-padding')).toHaveStyle('padding: 1rem');
    expect(screen.getByTestId('medium-padding')).toHaveStyle('padding: 1.5rem');
    expect(screen.getByTestId('large-padding')).toHaveStyle('padding: 2rem');
  });

  test('renders panel with full width and height', () => {
    render(
      <ThemeWrapper>
        <Panel data-testid="full-width" fullWidth>
          Full Width
        </Panel>
        <Panel data-testid="full-height" fullHeight>
          Full Height
        </Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('full-width')).toHaveStyle('width: 100%');
    expect(screen.getByTestId('full-height')).toHaveStyle('height: 100%');
  });

  test('renders panel with custom background and border colors', () => {
    render(
      <ThemeWrapper>
        <Panel data-testid="panel" bgColor="surface" borderColor="border" variant="outlined">
          Custom Colors
        </Panel>
      </ThemeWrapper>
    );

    const panel = screen.getByTestId('panel');
    expect(panel).toHaveStyle('background-color: #f5f5f5');
    expect(panel).toHaveStyle('border: 1px solid #e5e7eb');
  });

  test('renders panel with header and footer', () => {
    render(
      <ThemeWrapper>
        <Panel data-testid="panel">
          <PanelHeader data-testid="panel-header">Header Content</PanelHeader>
          <PanelBody data-testid="panel-body">Body Content</PanelBody>
          <PanelFooter data-testid="panel-footer">Footer Content</PanelFooter>
        </Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('panel-header')).toBeInTheDocument();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByTestId('panel-body')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
    expect(screen.getByTestId('panel-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  test('renders PanelHeader with divider', () => {
    render(
      <ThemeWrapper>
        <Panel>
          <PanelHeader data-testid="panel-header" divider>
            Header with Divider
          </PanelHeader>
        </Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('panel-header')).toHaveStyle('border-bottom: 1px solid #e5e7eb');
  });

  test('renders PanelBody correctly', () => {
    render(
      <ThemeWrapper>
        <Panel>
          <PanelBody data-testid="panel-body">Body Content</PanelBody>
        </Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('panel-body')).toBeInTheDocument();
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  test('renders PanelFooter with divider', () => {
    render(
      <ThemeWrapper>
        <Panel>
          <PanelFooter data-testid="panel-footer" divider>
            Footer with Divider
          </PanelFooter>
        </Panel>
      </ThemeWrapper>
    );

    expect(screen.getByTestId('panel-footer')).toHaveStyle('border-top: 1px solid #e5e7eb');
  });
});
