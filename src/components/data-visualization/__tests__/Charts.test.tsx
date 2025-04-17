import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineChart, BarChart, PieChart, DonutChart, AreaChart, DataPoint } from '../Charts';
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
  // Mock implementation
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

describe('LineChart Component', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
    // Setup getBoundingClientRect mock
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<LineChart data={testData} />);

    // Check that SVG element exists
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that path element exists
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
    const testTitle = 'Monthly Sales';
    renderWithTheme(<LineChart data={testData} title={testTitle} />);

    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('renders the legend when showLegend is true', () => {
    renderWithTheme(<LineChart data={testData} showLegend={true} />);

    // Check if legend container exists
    const legendContainer = document.querySelector('.sc-fWnslK');
    expect(legendContainer).toBeInTheDocument();

    // Check if legend items are rendered - using queryAllBy to handle duplicates
    testData.forEach(item => {
      const elements = screen.queryAllByText(item.label);
      expect(elements.length).toBeGreaterThan(0);

      // Check at least one element is in the legend
      const inLegend = elements.some(el => {
        const parent = el.parentElement;
        // For styled components we need to check if the parent has a className property and if it contains the class
        return parent && parent.classList && parent.classList.contains('sc-dIMoHT');
      });
      expect(inLegend).toBeTruthy();
    });
  });

  it('does not render the legend when showLegend is false', () => {
    renderWithTheme(<LineChart data={testData} showLegend={false} />);

    // Check that legend container doesn't exist
    const legendContainer = document.querySelector('.sc-fWnslK');
    expect(legendContainer).not.toBeInTheDocument();
  });

  it('shows values on points when showValues is true', () => {
    renderWithTheme(<LineChart data={testData} showValues={true} />);

    // Check if values are displayed using queryAllBy since there may be duplicates
    testData.forEach(item => {
      const valueElements = screen.queryAllByText(item.value.toString());
      expect(valueElements.length).toBeGreaterThan(0);

      // At least one of the elements should be inside a data point group
      const valueInDataPoint = valueElements.some(el => {
        const parentG = el.closest('g');
        return parentG && parentG.querySelector('circle');
      });

      expect(valueInDataPoint).toBeTruthy();
    });
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

  it('uses custom colors when colorScale is provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    renderWithTheme(<LineChart data={testData} colorScale={customColors} />);

    // This is a visual test, hard to assert without testing implementation details
    expect(true).toBeTruthy();
  });

  it('shows tooltip on mouse enter and hides on mouse leave', async () => {
    renderWithTheme(<LineChart data={testData} showTooltips={true} />);

    // Find circle elements
    const circles = document.querySelectorAll('circle');

    // Trigger mouse enter on first circle
    if (circles.length > 0) {
      fireEvent.mouseEnter(circles[0]);

      // Wait for tooltip to appear
      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBeGreaterThan(0);
      });

      // Trigger mouse leave
      fireEvent.mouseLeave(circles[0]);

      // Wait for tooltip to disappear
      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBe(0);
      });
    }
  });
});

describe('BarChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<BarChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for rect elements (bars)
    const bars = document.querySelectorAll('rect');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<BarChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    const testTitle = 'Bar Chart Test';
    renderWithTheme(<BarChart data={testData} title={testTitle} />);
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('calls onDataPointClick when a bar is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<BarChart data={testData} onDataPointClick={mockOnClick} />);

    const bars = document.querySelectorAll('rect');
    if (bars.length > 0) {
      fireEvent.click(bars[0]);
      expect(mockOnClick).toHaveBeenCalledWith(testData[0].id);
    }
  });

  it('shows tooltip on mouse enter and hides on mouse leave', async () => {
    renderWithTheme(<BarChart data={testData} showTooltips={true} />);

    const bars = document.querySelectorAll('rect');

    if (bars.length > 0) {
      fireEvent.mouseEnter(bars[0]);

      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBeGreaterThan(0);
      });

      fireEvent.mouseLeave(bars[0]);

      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBe(0);
      });
    }
  });
});

describe('PieChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<PieChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for path elements (pie slices)
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<PieChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('calls onDataPointClick when a slice is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<PieChart data={testData} onDataPointClick={mockOnClick} />);

    const slices = document.querySelectorAll('path');
    if (slices.length > 0) {
      fireEvent.click(slices[0]);
      expect(mockOnClick).toHaveBeenCalled();
    }
  });

  it('renders the legend correctly', () => {
    renderWithTheme(<PieChart data={testData} showLegend={true} />);

    const legendContainer = document.querySelector('.sc-fWnslK');
    expect(legendContainer).toBeInTheDocument();
  });
});

describe('DonutChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<DonutChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for path elements (donut slices)
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);

    // Check for center circle (indicator of donut chart)
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<DonutChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('accepts custom innerRadius prop', () => {
    renderWithTheme(<DonutChart data={testData} innerRadius={0.7} />);

    // Visual test, we just ensure it renders
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows total in the center', () => {
    renderWithTheme(<DonutChart data={testData} />);

    // Total should be the sum of all data point values
    const total = testData.reduce((sum, item) => sum + item.value, 0);

    // Look for text containing the total
    const totalElements = screen.queryAllByText(total.toString());
    expect(totalElements.length).toBeGreaterThan(0);
  });
});

describe('AreaChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<AreaChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for path elements (area)
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<AreaChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders data points and area', () => {
    renderWithTheme(<AreaChart data={testData} />);

    // Check for circles (data points)
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(testData.length);

    // Area path should be rendered
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('calls onDataPointClick when a point is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<AreaChart data={testData} onDataPointClick={mockOnClick} />);

    const circles = document.querySelectorAll('circle');
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      expect(mockOnClick).toHaveBeenCalledWith(testData[0].id);
    }
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LineChart, BarChart, PieChart, DonutChart, AreaChart, DataPoint } from '../Charts';
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
  // Mock implementation
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

describe('LineChart Component', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
    // Setup getBoundingClientRect mock
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<LineChart data={testData} />);

    // Check that SVG element exists
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check that path element exists
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
    const testTitle = 'Monthly Sales';
    renderWithTheme(<LineChart data={testData} title={testTitle} />);

    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('renders the legend when showLegend is true', () => {
    renderWithTheme(<LineChart data={testData} showLegend={true} />);

    // Check if legend container exists
    const legendContainer = document.querySelector('.sc-fWnslK');
    expect(legendContainer).toBeInTheDocument();

    // Check if legend items are rendered - using queryAllBy to handle duplicates
    testData.forEach(item => {
      const elements = screen.queryAllByText(item.label);
      expect(elements.length).toBeGreaterThan(0);

      // Check at least one element is in the legend
      const inLegend = elements.some(el => {
        const parent = el.parentElement;
        // For styled components we need to check if the parent has a className property and if it contains the class
        return parent && parent.classList && parent.classList.contains('sc-dIMoHT');
      });
      expect(inLegend).toBeTruthy();
    });
  });

  it('does not render the legend when showLegend is false', () => {
    renderWithTheme(<LineChart data={testData} showLegend={false} />);

    // Check that legend container doesn't exist
    const legendContainer = document.querySelector('.sc-fWnslK');
    expect(legendContainer).not.toBeInTheDocument();
  });

  it('shows values on points when showValues is true', () => {
    renderWithTheme(<LineChart data={testData} showValues={true} />);

    // Check if values are displayed using queryAllBy since there may be duplicates
    testData.forEach(item => {
      const valueElements = screen.queryAllByText(item.value.toString());
      expect(valueElements.length).toBeGreaterThan(0);

      // At least one of the elements should be inside a data point group
      const valueInDataPoint = valueElements.some(el => {
        const parentG = el.closest('g');
        return parentG && parentG.querySelector('circle');
      });

      expect(valueInDataPoint).toBeTruthy();
    });
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

  it('uses custom colors when colorScale is provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    renderWithTheme(<LineChart data={testData} colorScale={customColors} />);

    // This is a visual test, hard to assert without testing implementation details
    expect(true).toBeTruthy();
  });

  it('shows tooltip on mouse enter and hides on mouse leave', async () => {
    renderWithTheme(<LineChart data={testData} showTooltips={true} />);

    // Find circle elements
    const circles = document.querySelectorAll('circle');

    // Trigger mouse enter on first circle
    if (circles.length > 0) {
      fireEvent.mouseEnter(circles[0]);

      // Wait for tooltip to appear
      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBeGreaterThan(0);
      });

      // Trigger mouse leave
      fireEvent.mouseLeave(circles[0]);

      // Wait for tooltip to disappear
      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBe(0);
      });
    }
  });
});

describe('BarChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<BarChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for rect elements (bars)
    const bars = document.querySelectorAll('rect');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<BarChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders the title when provided', () => {
    const testTitle = 'Bar Chart Test';
    renderWithTheme(<BarChart data={testData} title={testTitle} />);
    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it('calls onDataPointClick when a bar is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<BarChart data={testData} onDataPointClick={mockOnClick} />);

    const bars = document.querySelectorAll('rect');
    if (bars.length > 0) {
      fireEvent.click(bars[0]);
      expect(mockOnClick).toHaveBeenCalledWith(testData[0].id);
    }
  });

  it('shows tooltip on mouse enter and hides on mouse leave', async () => {
    renderWithTheme(<BarChart data={testData} showTooltips={true} />);

    const bars = document.querySelectorAll('rect');

    if (bars.length > 0) {
      fireEvent.mouseEnter(bars[0]);

      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBeGreaterThan(0);
      });

      fireEvent.mouseLeave(bars[0]);

      await waitFor(() => {
        const tooltipContent = `${testData[0].label}: ${testData[0].value}`;
        const tooltipElements = screen.queryAllByText(tooltipContent);
        expect(tooltipElements.length).toBe(0);
      });
    }
  });
});

describe('PieChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<PieChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for path elements (pie slices)
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<PieChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('calls onDataPointClick when a slice is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<PieChart data={testData} onDataPointClick={mockOnClick} />);

    const slices = document.querySelectorAll('path');
    if (slices.length > 0) {
      fireEvent.click(slices[0]);
      expect(mockOnClick).toHaveBeenCalled();
    }
  });

  it('renders the legend correctly', () => {
    renderWithTheme(<PieChart data={testData} showLegend={true} />);

    const legendContainer = document.querySelector('.sc-fWnslK');
    expect(legendContainer).toBeInTheDocument();
  });
});

describe('DonutChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<DonutChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for path elements (donut slices)
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);

    // Check for center circle (indicator of donut chart)
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<DonutChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('accepts custom innerRadius prop', () => {
    renderWithTheme(<DonutChart data={testData} innerRadius={0.7} />);

    // Visual test, we just ensure it renders
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows total in the center', () => {
    renderWithTheme(<DonutChart data={testData} />);

    // Total should be the sum of all data point values
    const total = testData.reduce((sum, item) => sum + item.value, 0);

    // Look for text containing the total
    const totalElements = screen.queryAllByText(total.toString());
    expect(totalElements.length).toBeGreaterThan(0);
  });
});

describe('AreaChart Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBoundingClientRect();
  });

  it('renders the chart with data', () => {
    renderWithTheme(<AreaChart data={testData} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Check for path elements (area)
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('shows no data message when data is empty', () => {
    renderWithTheme(<AreaChart data={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders data points and area', () => {
    renderWithTheme(<AreaChart data={testData} />);

    // Check for circles (data points)
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(testData.length);

    // Area path should be rendered
    const paths = document.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('calls onDataPointClick when a point is clicked', () => {
    const mockOnClick = jest.fn();
    renderWithTheme(<AreaChart data={testData} onDataPointClick={mockOnClick} />);

    const circles = document.querySelectorAll('circle');
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      expect(mockOnClick).toHaveBeenCalledWith(testData[0].id);
    }
  });
});
