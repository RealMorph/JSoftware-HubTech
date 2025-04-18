import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DirectThemeProvider } from '../../../core/theme/DirectThemeProvider';
import { BarChart, LineChart, PieChart, DonutChart } from '../Chart';
import { defaultTheme } from '../../../core/theme/theme-persistence';
import { ThemeConfig } from '../../../core/theme/consolidated-types';

// Mock data for testing
const mockData = [
  { id: '1', label: 'A', value: 10 },
  { id: '2', label: 'B', value: 20 },
  { id: '3', label: 'C', value: 15 },
];

// Test wrapper with theme provider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <DirectThemeProvider initialTheme={defaultTheme}>
      {component}
    </DirectThemeProvider>
  );
};

describe('Chart Components', () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  describe('BarChart', () => {
    it('renders without crashing', () => {
      renderWithTheme(<BarChart data={mockData} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('displays title when provided', () => {
      const title = 'Bar Chart Title';
      renderWithTheme(<BarChart data={mockData} title={title} />);
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('shows empty state when no data provided', () => {
      renderWithTheme(<BarChart data={[]} />);
      expect(screen.getByText('No data to display')).toBeInTheDocument();
    });

    it('renders legend items correctly', () => {
      renderWithTheme(<BarChart data={mockData} showLegend={true} />);
      mockData.forEach(item => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      });
    });

    it('handles click events on bars', () => {
      const onDataPointClick = jest.fn();
      renderWithTheme(
        <BarChart data={mockData} onDataPointClick={onDataPointClick} />
      );
      
      const bars = screen.getAllByRole('presentation');
      fireEvent.click(bars[0]);
      expect(onDataPointClick).toHaveBeenCalledWith(mockData[0].id);
    });

    it('shows tooltip on hover', async () => {
      renderWithTheme(<BarChart data={mockData} showTooltips={true} />);
      const bars = screen.getAllByRole('presentation');
      
      fireEvent.mouseOver(bars[0]);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent(mockData[0].label);
    });

    it('applies different variants correctly', () => {
      const { rerender } = render(
        <DirectThemeProvider initialTheme={defaultTheme}>
          <BarChart data={mockData} variant="outlined" />
        </DirectThemeProvider>
      );
      expect(screen.getByRole('img')).toHaveStyle({ border: expect.any(String) });

      rerender(
        <DirectThemeProvider initialTheme={defaultTheme}>
          <BarChart data={mockData} variant="filled" />
        </DirectThemeProvider>
      );
      expect(screen.getByRole('img')).toHaveStyle({ boxShadow: expect.any(String) });
    });

    it('handles responsive prop correctly', () => {
      renderWithTheme(<BarChart data={mockData} responsive={true} />);
      expect(screen.getByRole('img').parentElement).toHaveStyle({
        width: '100%',
        position: 'relative',
      });
    });

    it('applies size variations correctly', () => {
      const { rerender } = render(
        <DirectThemeProvider initialTheme={defaultTheme}>
          <BarChart data={mockData} size="small" />
        </DirectThemeProvider>
      );
      const chart = screen.getByRole('img');
      expect(chart).toHaveStyle({ padding: expect.stringContaining('sm') });

      rerender(
        <DirectThemeProvider initialTheme={defaultTheme}>
          <BarChart data={mockData} size="large" />
        </DirectThemeProvider>
      );
      expect(chart).toHaveStyle({ padding: expect.stringContaining('xl') });
    });
  });

  describe('LineChart', () => {
    it('renders without crashing', () => {
      renderWithTheme(<LineChart data={mockData} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders data points correctly', () => {
      renderWithTheme(<LineChart data={mockData} />);
      const points = screen.getAllByRole('presentation');
      expect(points).toHaveLength(mockData.length);
    });

    it('shows values when showValues is true', () => {
      renderWithTheme(<LineChart data={mockData} showValues={true} />);
      mockData.forEach(item => {
        expect(screen.getByText(item.value.toString())).toBeInTheDocument();
      });
    });
  });

  describe('PieChart', () => {
    it('renders without crashing', () => {
      renderWithTheme(<PieChart data={mockData} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders correct number of slices', () => {
      renderWithTheme(<PieChart data={mockData} />);
      const slices = screen.getAllByRole('presentation');
      expect(slices).toHaveLength(mockData.length);
    });

    it('shows percentages in legend', () => {
      renderWithTheme(<PieChart data={mockData} showLegend={true} />);
      const total = mockData.reduce((sum, item) => sum + item.value, 0);
      mockData.forEach(item => {
        const percentage = ((item.value / total) * 100).toFixed(1);
        expect(screen.getByText(new RegExp(`${percentage}%`))).toBeInTheDocument();
      });
    });
  });

  describe('DonutChart', () => {
    it('renders without crashing', () => {
      renderWithTheme(<DonutChart data={mockData} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('applies correct inner radius', () => {
      const innerRadius = 0.8;
      renderWithTheme(<DonutChart data={mockData} innerRadius={innerRadius} />);
      const circle = screen.getByRole('presentation');
      expect(circle).toHaveAttribute('r', String(innerRadius * 50));
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      const ariaLabel = 'Chart Description';
      renderWithTheme(
        <BarChart 
          data={mockData} 
          ariaLabel={ariaLabel}
          ariaDescribedBy="chart-desc"
        />
      );
      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-label', ariaLabel);
      expect(chart).toHaveAttribute('aria-describedby', 'chart-desc');
    });

    it('supports keyboard navigation in legend', () => {
      renderWithTheme(<BarChart data={mockData} showLegend={true} />);
      const legendItems = screen.getAllByRole('listitem');
      expect(legendItems[0]).toHaveAttribute('tabIndex', '0');
      
      fireEvent.keyPress(legendItems[0], { key: 'Enter' });
      // Verify that the item is interactive
      expect(legendItems[0]).toHaveStyle({ cursor: 'pointer' });
    });

    it('announces tooltip content to screen readers', async () => {
      renderWithTheme(<BarChart data={mockData} showTooltips={true} />);
      const bars = screen.getAllByRole('presentation');
      
      fireEvent.mouseOver(bars[0]);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Theme Integration', () => {
    const mockTheme: ThemeConfig = {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        background: '#f5f5f5',
        surface: '#ffffff'
      },
      transitions: {
        ...defaultTheme.transitions,
        duration: {
          fast: '100ms',
          normal: '200ms',
          slow: '300ms'
        }
      },
      typography: {
        ...defaultTheme.typography
      }
    };

    it('uses theme background colors', () => {
      render(
        <DirectThemeProvider initialTheme={mockTheme}>
          <BarChart data={mockData} />
        </DirectThemeProvider>
      );
      expect(screen.getByRole('img')).toHaveStyle({ 
        backgroundColor: mockTheme.colors.surface 
      });
    });

    it('applies theme transitions', () => {
      render(
        <DirectThemeProvider initialTheme={mockTheme}>
          <BarChart data={mockData} />
        </DirectThemeProvider>
      );
      expect(screen.getByRole('img')).toHaveStyle({ 
        transition: expect.stringContaining(mockTheme.transitions.duration.normal)
      });
    });

    it('uses theme typography', () => {
      render(
        <DirectThemeProvider initialTheme={mockTheme}>
          <BarChart data={mockData} title="Test" />
        </DirectThemeProvider>
      );
      const title = screen.getByText('Test');
      expect(title).toHaveStyle({
        fontFamily: mockTheme.typography.fontFamily.base
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts to container size', () => {
      renderWithTheme(
        <BarChart 
          data={mockData} 
          responsive={true}
          aspectRatio={16/9}
        />
      );
      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveStyle({
        paddingBottom: `${(9/16) * 100}%`,
      });
    });

    it('maintains minimum height', () => {
      const minHeight = '300px';
      renderWithTheme(
        <BarChart 
          data={mockData} 
          responsive={true}
          minHeight={minHeight}
        />
      );
      const container = screen.getByRole('img').parentElement;
      expect(container).toHaveStyle({ minHeight });
    });
  });
}); 