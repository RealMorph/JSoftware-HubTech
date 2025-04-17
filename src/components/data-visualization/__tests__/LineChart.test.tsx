import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineChart, DataPoint } from '../Charts';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    tertiary: '#f9a825',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: '#ffffff',
    border: '#e0e0e0',
    white: '#ffffff',
    surface: '#f5f5f5',
  },
  typography: {
    fontFamily: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      monospace: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      '4xl': '4rem',
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
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
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
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    base: '0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
};

// Test data
const testData: DataPoint[] = [
  { id: '1', label: 'Jan', value: 10 },
  { id: '2', label: 'Feb', value: 25 },
  { id: '3', label: 'Mar', value: 15 },
  { id: '4', label: 'Apr', value: 30 },
  { id: '5', label: 'May', value: 22 },
];

// Custom render function with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

// Mock the getBoundingClientRect method
const mockGetBoundingClientRect = () => {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 500,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 500,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));

  return () => {
    Element.prototype.getBoundingClientRect = original;
  };
};

describe('LineChart Component with DirectThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data using theme from DirectThemeProvider', () => {
    renderWithTheme(<LineChart data={testData} />);

    // Check that SVG element exists
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that path element exists (the line)
    const path = document.querySelector('path');
    expect(path).toBeInTheDocument();

    // Check that we have as many circles as data points
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(testData.length);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<LineChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    const testTitle = 'Monthly Revenue';
    renderWithTheme(<LineChart data={testData} title={testTitle} />);
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('applies theme styles from DirectThemeProvider to chart elements', () => {
    renderWithTheme(<LineChart data={testData} />);

    // Check style-related attributes on SVG elements that should reflect theme values
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width');
    expect(svg).toHaveAttribute('height');

    // Line path should have stroke color from theme
    const path = document.querySelector('path');
    expect(path).toHaveAttribute('stroke');
  });

  it('shows tooltip when hovering over data points', () => {
    renderWithTheme(<LineChart data={testData} showTooltips={true} />);

    // Find the first circle (data point) and hover over it
    const circle = document.querySelector('circle');
    if (circle) {
      fireEvent.mouseEnter(circle);

      // Wait for tooltip to be created
      const tooltipText = `${testData[0].label}: ${testData[0].value}`;
      const tooltip = screen.getByText(tooltipText);
      expect(tooltip).toBeInTheDocument();

      // Mouse leave should hide the tooltip
      fireEvent.mouseLeave(circle);
      expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    }
  });

  it('calls onDataPointClick when a data point is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<LineChart data={testData} onDataPointClick={mockOnClick} />);

    // Find all circle elements and click the first one
    const circles = document.querySelectorAll('circle');
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      expect(mockOnClick).toHaveBeenCalledWith(testData[0].id);
    }
  });

  it('renders the legend when showLegend is true', () => {
    renderWithTheme(<LineChart data={testData} showLegend={true} />);

    // Legend should contain the labels from test data
    testData.forEach(item => {
      const legendText = screen.getAllByText(item.label);
      expect(legendText.length).toBeGreaterThan(0);
    });
  });

  it('does not render legend when showLegend is false', () => {
    renderWithTheme(<LineChart data={testData} showLegend={false} />);

    // Should not display legend items
    const legendElements = document.querySelectorAll('div > div > span');
    const legendLabels = Array.from(legendElements).filter(el =>
      testData.some(item => el.textContent === item.label)
    );
    expect(legendLabels.length).toBe(0);
  });

  it('applies custom color scale when provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    renderWithTheme(<LineChart data={testData} colorScale={customColors} />);

    const path = document.querySelector('path');
    expect(path).toBeInTheDocument();
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(testData.length);

    // The colors should be applied, but we can't easily test CSS properties in JSDOM
    // Just verify it renders correctly with custom colors
    expect(path).toHaveAttribute('stroke', customColors[0]);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineChart, DataPoint } from '../Charts';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock theme for testing
const mockTheme: ThemeConfig = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    tertiary: '#f9a825',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: '#ffffff',
    border: '#e0e0e0',
    white: '#ffffff',
    surface: '#f5f5f5',
  },
  typography: {
    fontFamily: {
      base: 'Arial, sans-serif',
      heading: 'Arial, sans-serif',
      monospace: 'monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      '4xl': '4rem',
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
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
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
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    base: '0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)',
    '2xl': '0 25px 50px -12px rgba(0,0,0,0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
    },
  },
};

// Test data
const testData: DataPoint[] = [
  { id: '1', label: 'Jan', value: 10 },
  { id: '2', label: 'Feb', value: 25 },
  { id: '3', label: 'Mar', value: 15 },
  { id: '4', label: 'Apr', value: 30 },
  { id: '5', label: 'May', value: 22 },
];

// Custom render function with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<DirectThemeProvider initialTheme={mockTheme}>{ui}</DirectThemeProvider>);
};

// Mock the getBoundingClientRect method
const mockGetBoundingClientRect = () => {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = jest.fn(() => ({
    width: 500,
    height: 300,
    top: 0,
    left: 0,
    bottom: 300,
    right: 500,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));

  return () => {
    Element.prototype.getBoundingClientRect = original;
  };
};

describe('LineChart Component with DirectThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data using theme from DirectThemeProvider', () => {
    renderWithTheme(<LineChart data={testData} />);

    // Check that SVG element exists
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that path element exists (the line)
    const path = document.querySelector('path');
    expect(path).toBeInTheDocument();

    // Check that we have as many circles as data points
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(testData.length);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<LineChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    const testTitle = 'Monthly Revenue';
    renderWithTheme(<LineChart data={testData} title={testTitle} />);
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('applies theme styles from DirectThemeProvider to chart elements', () => {
    renderWithTheme(<LineChart data={testData} />);

    // Check style-related attributes on SVG elements that should reflect theme values
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width');
    expect(svg).toHaveAttribute('height');

    // Line path should have stroke color from theme
    const path = document.querySelector('path');
    expect(path).toHaveAttribute('stroke');
  });

  it('shows tooltip when hovering over data points', () => {
    renderWithTheme(<LineChart data={testData} showTooltips={true} />);

    // Find the first circle (data point) and hover over it
    const circle = document.querySelector('circle');
    if (circle) {
      fireEvent.mouseEnter(circle);

      // Wait for tooltip to be created
      const tooltipText = `${testData[0].label}: ${testData[0].value}`;
      const tooltip = screen.getByText(tooltipText);
      expect(tooltip).toBeInTheDocument();

      // Mouse leave should hide the tooltip
      fireEvent.mouseLeave(circle);
      expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    }
  });

  it('calls onDataPointClick when a data point is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<LineChart data={testData} onDataPointClick={mockOnClick} />);

    // Find all circle elements and click the first one
    const circles = document.querySelectorAll('circle');
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      expect(mockOnClick).toHaveBeenCalledWith(testData[0].id);
    }
  });

  it('renders the legend when showLegend is true', () => {
    renderWithTheme(<LineChart data={testData} showLegend={true} />);

    // Legend should contain the labels from test data
    testData.forEach(item => {
      const legendText = screen.getAllByText(item.label);
      expect(legendText.length).toBeGreaterThan(0);
    });
  });

  it('does not render legend when showLegend is false', () => {
    renderWithTheme(<LineChart data={testData} showLegend={false} />);

    // Should not display legend items
    const legendElements = document.querySelectorAll('div > div > span');
    const legendLabels = Array.from(legendElements).filter(el =>
      testData.some(item => el.textContent === item.label)
    );
    expect(legendLabels.length).toBe(0);
  });

  it('applies custom color scale when provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    renderWithTheme(<LineChart data={testData} colorScale={customColors} />);

    const path = document.querySelector('path');
    expect(path).toBeInTheDocument();
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(testData.length);

    // The colors should be applied, but we can't easily test CSS properties in JSDOM
    // Just verify it renders correctly with custom colors
    expect(path).toHaveAttribute('stroke', customColors[0]);
  });
});
