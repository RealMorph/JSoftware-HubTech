import React, { useState, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { BarChart, LineChart, PieChart } from '../Charts';
import { CrossChartInteractionProvider, useCrossChartInteraction, LinkedBrushing, ChartContextMenu } from '../interactions';
import { useTheme } from '../../../core/theme/ThemeContext';
import { createThemeStyles } from '../../../core/theme/utils/themeUtils';
import { filterTransientProps } from '../../../core/styled-components/transient-props';

/**
 * Advanced Interactivity Demo
 * 
 * This component demonstrates the visualization features for advanced interactivity:
 * - Cross-filtering between charts
 * - Linked brushing across visualizations
 * - Selection and highlighting
 * - Custom context menus for data points
 */

// Sample Data
const salesData = [
  { id: '1', label: 'Jan', value: 45 },
  { id: '2', label: 'Feb', value: 62 },
  { id: '3', label: 'Mar', value: 58 },
  { id: '4', label: 'Apr', value: 71 },
  { id: '5', label: 'May', value: 89 },
  { id: '6', label: 'Jun', value: 83 },
  { id: '7', label: 'Jul', value: 76 },
  { id: '8', label: 'Aug', value: 91 },
  { id: '9', label: 'Sep', value: 67 },
  { id: '10', label: 'Oct', value: 74 },
  { id: '11', label: 'Nov', value: 65 },
  { id: '12', label: 'Dec', value: 92 },
];

const categoryData = [
  { id: 'cat1', label: 'Electronics', value: 35 },
  { id: 'cat2', label: 'Clothing', value: 28 },
  { id: 'cat3', label: 'Home', value: 17 },
  { id: 'cat4', label: 'Sports', value: 12 },
  { id: 'cat5', label: 'Books', value: 8 },
];

const scatterData = [
  { id: 'p1', label: 'Product 1', x: 35, y: 45, category: 'Electronics' },
  { id: 'p2', label: 'Product 2', x: 28, y: 32, category: 'Electronics' },
  { id: 'p3', label: 'Product 3', x: 42, y: 35, category: 'Electronics' },
  { id: 'p4', label: 'Product 4', x: 15, y: 22, category: 'Clothing' },
  { id: 'p5', label: 'Product 5', x: 22, y: 18, category: 'Clothing' },
  { id: 'p6', label: 'Product 6', x: 25, y: 25, category: 'Clothing' },
  { id: 'p7', label: 'Product 7', x: 10, y: 12, category: 'Home' },
  { id: 'p8', label: 'Product 8', x: 15, y: 18, category: 'Home' },
  { id: 'p9', label: 'Product 9', x: 8, y: 10, category: 'Sports' },
  { id: 'p10', label: 'Product 10', x: 12, y: 9, category: 'Sports' },
  { id: 'p11', label: 'Product 11', x: 5, y: 8, category: 'Books' },
  { id: 'p12', label: 'Product 12', x: 8, y: 5, category: 'Books' },
];

// Create filtered base components
const FilteredButton = filterTransientProps(styled.button``);
const FilteredDiv = filterTransientProps(styled.div``);

// Styled components with filtered transient props
const DemoContainer = styled(FilteredDiv)<{ $themeStyles: any }>`
  padding: 24px;
  background-color: ${props => props.$themeStyles.colors.background.default};
  border-radius: ${props => props.$themeStyles.borders.radius.large};
  margin-bottom: 24px;
`;

const Title = styled(FilteredDiv)<{ $themeStyles: any }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.xl};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.semibold};
  color: ${props => props.$themeStyles.colors.text.primary};
  margin-bottom: 16px;
`;

const Description = styled(FilteredDiv)<{ $themeStyles: any }>`
  font-size: ${props => props.$themeStyles.typography.fontSize.md};
  color: ${props => props.$themeStyles.colors.text.secondary};
  margin-bottom: 24px;
  line-height: 1.5;
`;

const ChartsGrid = styled(FilteredDiv)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
`;

const ChartContainer = styled(FilteredDiv)<{ $themeStyles: any }>`
  position: relative;
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: 16px;
  box-shadow: ${props => props.$themeStyles.shadows.card};
  overflow: hidden;
  height: 300px;
`;

const InfoPanel = styled(FilteredDiv)<{ $themeStyles: any }>`
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: 16px;
  margin-bottom: 24px;
`;

const ControlsContainer = styled(FilteredDiv)`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const ButtonGroup = styled(FilteredDiv)<{ $themeStyles: any }>`
  display: flex;
  gap: 8px;
  background-color: ${props => props.$themeStyles.colors.background.subtle};
  padding: 4px;
  border-radius: ${props => props.$themeStyles.borders.radius.small};
`;

const Button = styled(FilteredButton)<{ $themeStyles: any, $active?: boolean }>`
  padding: 8px 12px;
  border: none;
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  background-color: ${props => props.$active 
    ? props.$themeStyles.colors.primary.main 
    : props.$themeStyles.colors.background.paper};
  color: ${props => props.$active 
    ? props.$themeStyles.colors.primary.contrastText 
    : props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active 
      ? props.$themeStyles.colors.primary.main 
      : props.$themeStyles.colors.hover.light};
  }
`;

// Control panel component to manage interaction mode
const InteractionControls = () => {
  const { state, setInteractionMode, resetAll } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  return (
    <ControlsContainer>
      <ButtonGroup $themeStyles={themeStyles}>
        <Button 
          $themeStyles={themeStyles} 
          $active={state.interactionMode === 'filter'}
          onClick={() => setInteractionMode('filter')}
        >
          Filter Mode
        </Button>
        <Button 
          $themeStyles={themeStyles} 
          $active={state.interactionMode === 'highlight'}
          onClick={() => setInteractionMode('highlight')}
        >
          Highlight Mode
        </Button>
        <Button 
          $themeStyles={themeStyles} 
          $active={state.interactionMode === 'details'}
          onClick={() => setInteractionMode('details')}
        >
          Details Mode
        </Button>
      </ButtonGroup>
      
      <Button 
        $themeStyles={themeStyles}
        onClick={resetAll}
      >
        Reset All
      </Button>
    </ControlsContainer>
  );
};

// Enhanced Bar Chart with interaction capabilities
const InteractiveBarChart = ({ data, chartId }: { data: any[]; chartId: string }) => {
  const { state, selectData, highlightData, showContextMenu } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  
  React.useEffect(() => {
    if (chartRef.current) {
      const { width, height } = chartRef.current.getBoundingClientRect();
      setChartDimensions({ width, height });
    }
  }, []);
  
  // Filter data based on other chart selections
  const filteredData = useMemo(() => {
    const relevantSelections = state.selections.filter(s => s.chartId !== chartId);
    
    if (relevantSelections.length === 0) {
      return data;
    }
    
    return data.filter(item => {
      return relevantSelections.every(selection => {
        return selection.pointIds.includes(item.id);
      });
    });
  }, [state.selections, chartId, data]);
  
  // Handle data point click
  const handleDataPointClick = (pointId: string) => {
    const point = data.find(item => item.id === pointId);
    if (!point) return;
    
    if (state.interactionMode === 'filter') {
      selectData({
        chartId,
        pointIds: [pointId],
      });
    } else if (state.interactionMode === 'highlight') {
      highlightData({
        chartId,
        pointIds: [pointId],
      });
    } else if (state.interactionMode === 'details') {
      // Get point details for context menu
      const pointData = data.find(item => item.id === pointId);
      
      if (chartRef.current && pointData) {
        const rect = chartRef.current.getBoundingClientRect();
        
        // Calculate position (this is approximate, would need to be adjusted for actual chart)
        const pointIndex = data.findIndex(item => item.id === pointId);
        const barWidth = (rect.width - 100) / data.length;
        const x = rect.left + 50 + pointIndex * barWidth + barWidth / 2;
        const y = rect.top + 100; // Approximate position
        
        showContextMenu({
          chartId,
          pointId,
          position: { x, y },
          data: pointData,
        });
      }
    }
  };
  
  // Define context menu options for bar chart
  const menuGroups = useMemo(() => [
    {
      title: 'Data Options',
      options: [
        {
          id: 'details',
          label: 'View Details',
          action: () => {
            console.log('View details for:', state.contextMenu?.pointId);
          },
        },
        {
          id: 'filter',
          label: 'Filter By This Month',
          action: () => {
            if (state.contextMenu?.pointId) {
              selectData({
                chartId,
                pointIds: [state.contextMenu.pointId],
              });
            }
          },
        },
        {
          id: 'highlight',
          label: 'Highlight This Month',
          action: () => {
            if (state.contextMenu?.pointId) {
              highlightData({
                chartId,
                pointIds: [state.contextMenu.pointId],
              });
            }
          },
        },
      ],
    },
    {
      title: 'Export Options',
      options: [
        {
          id: 'export-png',
          label: 'Export as PNG',
          action: () => {
            console.log('Export as PNG');
          },
        },
        {
          id: 'export-csv',
          label: 'Export Data as CSV',
          action: () => {
            console.log('Export as CSV');
          },
        },
      ],
    },
  ], [state.contextMenu, chartId, selectData, highlightData]);
  
  return (
    <ChartContainer ref={chartRef} $themeStyles={themeStyles}>
      <BarChart
        data={filteredData}
        title="Monthly Sales"
        onDataPointClick={handleDataPointClick}
        showLegend={true}
        showTooltips={true}
      />
      
      <LinkedBrushing 
        chartId={chartId}
        width={chartDimensions.width}
        height={chartDimensions.height}
        constrainToX={true}
      />
      
      <ChartContextMenu 
        chartId={chartId}
        menuGroups={menuGroups}
      />
    </ChartContainer>
  );
};

// Enhanced Pie Chart with interaction capabilities
const InteractivePieChart = ({ data, chartId }: { data: any[]; chartId: string }) => {
  const { state, selectData, highlightData, showContextMenu } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  // Filter data based on other chart selections
  const filteredData = useMemo(() => {
    const relevantSelections = state.selections.filter(s => s.chartId !== chartId);
    
    if (relevantSelections.length === 0) {
      return data;
    }
    
    return data.filter(item => {
      return relevantSelections.every(selection => {
        return selection.pointIds.includes(item.id);
      });
    });
  }, [state.selections, chartId, data]);
  
  // Handle data point click
  const handleDataPointClick = (pointId: string) => {
    const point = data.find(item => item.id === pointId);
    if (!point) return;
    
    if (state.interactionMode === 'filter') {
      selectData({
        chartId,
        pointIds: [pointId],
      });
    } else if (state.interactionMode === 'highlight') {
      highlightData({
        chartId,
        pointIds: [pointId],
      });
    } else if (state.interactionMode === 'details') {
      // Show context menu
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        
        // For a pie chart, we'd need a more sophisticated way to determine position
        // This is a simplified approach
        showContextMenu({
          chartId,
          pointId,
          position: { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          },
          data: point,
        });
      }
    }
  };
  
  // Define context menu options for pie chart
  const menuGroups = useMemo(() => [
    {
      title: 'Category Options',
      options: [
        {
          id: 'details',
          label: 'View Category Details',
          action: () => {
            console.log('View details for:', state.contextMenu?.pointId);
          },
        },
        {
          id: 'filter',
          label: 'Filter By This Category',
          action: () => {
            if (state.contextMenu?.pointId) {
              selectData({
                chartId,
                pointIds: [state.contextMenu.pointId],
              });
            }
          },
        },
        {
          id: 'highlight',
          label: 'Highlight This Category',
          action: () => {
            if (state.contextMenu?.pointId) {
              highlightData({
                chartId,
                pointIds: [state.contextMenu.pointId],
              });
            }
          },
        },
      ],
    },
  ], [state.contextMenu, chartId, selectData, highlightData]);
  
  return (
    <ChartContainer ref={chartRef} $themeStyles={themeStyles}>
      <PieChart
        data={filteredData}
        title="Sales by Category"
        onDataPointClick={handleDataPointClick}
        showLegend={true}
        showTooltips={true}
      />
      
      <ChartContextMenu 
        chartId={chartId}
        menuGroups={menuGroups}
      />
    </ChartContainer>
  );
};

// Info panel showing current interactions
const InteractionInfoPanel = () => {
  const { state } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  return (
    <InfoPanel $themeStyles={themeStyles}>
      <h3>Current Interaction State</h3>
      <p><strong>Mode:</strong> {state.interactionMode}</p>
      <p><strong>Selections:</strong> {state.selections.length > 0 
        ? state.selections.map(s => `${s.chartId}: ${s.pointIds.join(', ')}`).join(' | ')
        : 'None'}
      </p>
      <p><strong>Highlights:</strong> {state.highlights.length > 0
        ? state.highlights.map(h => `${h.chartId}: ${h.pointIds.join(', ')}`).join(' | ')
        : 'None'}
      </p>
      <p><strong>Brushes:</strong> {state.brushes.length > 0
        ? state.brushes.map(b => b.chartId).join(', ')
        : 'None'}
      </p>
    </InfoPanel>
  );
};

// Simple scatter plot component for the demo
const ScatterPlot = ({ 
  data, 
  width = '100%', 
  height = '100%', 
  xLabel = 'X',
  yLabel = 'Y',
  title,
  onPointClick,
  highlightedPoints = [] as string[]
}) => {
  const theme = useTheme();
  const themeStyles = useMemo(() => {
    const baseStyles = createThemeStyles(theme);
    // Add custom chart values
    return {
      ...baseStyles,
      colors: {
        ...baseStyles.colors,
        chart: {
          axis: '#888888',
          grid: '#eeeeee',
          tooltip: 'rgba(0, 0, 0, 0.7)',
          point: {
            default: baseStyles.colors.primary.main,
            hover: baseStyles.colors.primary.light,
            active: baseStyles.colors.primary.dark,
          }
        }
      }
    };
  }, [theme]);
  
  // Calculate dimensions and margins
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const plotWidth = 800;
  const plotHeight = 400;
  const innerWidth = plotWidth - margin.left - margin.right;
  const innerHeight = plotHeight - margin.top - margin.bottom;
  
  // Find min/max values for axes
  const xMin = Math.min(...data.map(d => d.x));
  const xMax = Math.max(...data.map(d => d.x));
  const yMin = Math.min(...data.map(d => d.y));
  const yMax = Math.max(...data.map(d => d.y));
  
  // Scale functions
  const xScale = (value) => {
    return margin.left + ((value - xMin) / (xMax - xMin)) * innerWidth;
  };
  
  const yScale = (value) => {
    return margin.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;
  };
  
  // Get category colors
  const categories = [...new Set(data.map(d => d.category))];
  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    categories.forEach((category, i) => {
      if (typeof category === 'string') {
        const hue = (i * 360) / categories.length;
        colors[category] = `hsl(${hue}, 70%, 50%)`;
      }
    });
    return colors;
  }, [categories]);
  
  // Get highlighted points
  const activeHighlights = useMemo(() => {
    const allHighlights = highlightedPoints;
    return allHighlights;
  }, [highlightedPoints]);
  
  return (
    <div style={{ width, height, position: 'relative' }}>
      <svg width={plotWidth} height={plotHeight}>
        {/* Title */}
        {title && (
          <text
            x={plotWidth / 2}
            y={margin.top / 2}
            fontSize={16}
            fontWeight={600}
            textAnchor="middle"
          >
            {title}
          </text>
        )}
        
        {/* X-axis */}
        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={margin.left + innerWidth}
          y2={margin.top + innerHeight}
          stroke={themeStyles.colors.chart.axis}
          strokeWidth={1}
        />
        <text
          x={margin.left + innerWidth / 2}
          y={plotHeight - 10}
          fontSize={14}
          textAnchor="middle"
        >
          {xLabel}
        </text>
        
        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerHeight}
          stroke={themeStyles.colors.chart.axis}
          strokeWidth={1}
        />
        <text
          x={20}
          y={margin.top + innerHeight / 2}
          fontSize={14}
          textAnchor="middle"
          transform={`rotate(-90, 20, ${margin.top + innerHeight / 2})`}
        >
          {yLabel}
        </text>
        
        {/* X-axis ticks */}
        {[xMin, (xMin + xMax) / 2, xMax].map((tick, i) => (
          <g key={`x-tick-${i}`}>
            <line
              x1={xScale(tick)}
              y1={margin.top + innerHeight}
              x2={xScale(tick)}
              y2={margin.top + innerHeight + 5}
              stroke={themeStyles.colors.chart.axis}
              strokeWidth={1}
            />
            <text
              x={xScale(tick)}
              y={margin.top + innerHeight + 20}
              fontSize={12}
              textAnchor="middle"
            >
              {tick.toFixed(0)}
            </text>
          </g>
        ))}
        
        {/* Y-axis ticks */}
        {[yMin, (yMin + yMax) / 2, yMax].map((tick, i) => (
          <g key={`y-tick-${i}`}>
            <line
              x1={margin.left - 5}
              y1={yScale(tick)}
              x2={margin.left}
              y2={yScale(tick)}
              stroke={themeStyles.colors.chart.axis}
              strokeWidth={1}
            />
            <text
              x={margin.left - 10}
              y={yScale(tick) + 4}
              fontSize={12}
              textAnchor="end"
            >
              {tick.toFixed(0)}
            </text>
          </g>
        ))}
        
        {/* Grid lines */}
        {[xMin, (xMin + xMax) / 2, xMax].map((tick, i) => (
          <line
            key={`x-grid-${i}`}
            x1={xScale(tick)}
            y1={margin.top}
            x2={xScale(tick)}
            y2={margin.top + innerHeight}
            stroke={themeStyles.colors.chart.grid}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}
        
        {[yMin, (yMin + yMax) / 2, yMax].map((tick, i) => (
          <line
            key={`y-grid-${i}`}
            x1={margin.left}
            y1={yScale(tick)}
            x2={margin.left + innerWidth}
            y2={yScale(tick)}
            stroke={themeStyles.colors.chart.grid}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}
        
        {/* Data points */}
        {data.map((point, i) => {
          const isHighlighted = Array.isArray(activeHighlights) && 
            point.id !== undefined && 
            activeHighlights.includes(point.id as string);
          return (
            <g key={`point-${i}`}>
              <circle
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={isHighlighted ? 8 : 6}
                fill={categoryColors[point.category] || themeStyles.colors.chart.point.default}
                stroke={isHighlighted ? themeStyles.colors.chart.point.active : "white"}
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={activeHighlights.length > 0 ? (isHighlighted ? 1 : 0.4) : 0.8}
                cursor="pointer"
                onClick={() => onPointClick(point.id)}
              />
              {isHighlighted && (
                <text
                  x={xScale(point.x)}
                  y={yScale(point.y) - 12}
                  fontSize={12}
                  textAnchor="middle"
                  fontWeight={500}
                >
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform={`translate(${margin.left + innerWidth - 120}, ${margin.top + 20})`}>
          {categories.map((category, i) => (
            <g key={`legend-${i}`} transform={`translate(0, ${i * 20})`}>
              <circle
                cx={0}
                cy={0}
                r={6}
                fill={categoryColors[category]}
              />
              <text
                x={10}
                y={4}
                fontSize={12}
              >
                {category}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

// Interactive Scatter plot with cross-chart interaction
const InteractiveScatterPlot = ({ data, chartId }: { data: any[]; chartId: string }) => {
  const { state, selectData, highlightData, showContextMenu } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  const chartRef = React.useRef<HTMLDivElement>(null);
  
  // Filter data based on other chart selections
  const filteredData = useMemo(() => {
    const relevantSelections = state.selections.filter(s => s.chartId !== chartId);
    
    if (relevantSelections.length === 0) {
      return data;
    }
    
    return data.filter(item => {
      return relevantSelections.every(selection => {
        // If selection is from category chart, filter by category
        if (selection.chartId === 'category-chart') {
          const categoryItem = categoryData.find(c => c.id === selection.pointIds[0]);
          return item.category === categoryItem?.label;
        }
        return selection.pointIds.includes(item.id);
      });
    });
  }, [state.selections, chartId, data]);
  
  // Get highlighted points
  const activeHighlights = useMemo(() => {
    const allHighlights = state.highlights.map(h => h.pointIds).flat() as string[];
    return allHighlights;
  }, [state.highlights]);
  
  // Handle data point click
  const handleDataPointClick = (pointId: string) => {
    const point = data.find(item => item.id === pointId);
    if (!point) return;
    
    if (state.interactionMode === 'filter') {
      selectData({
        chartId,
        pointIds: [pointId],
      });
    } else if (state.interactionMode === 'highlight') {
      highlightData({
        chartId,
        pointIds: [pointId],
      });
    } else if (state.interactionMode === 'details') {
      // Show context menu
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        showContextMenu({
          chartId,
          pointId,
          position: { 
            x: rect.left + rect.width / 2, 
            y: rect.top + rect.height / 2 
          },
          data: point,
        });
      }
    }
  };
  
  // Define context menu options for scatter plot
  const menuGroups = useMemo(() => [
    {
      title: 'Product Options',
      options: [
        {
          id: 'details',
          label: 'View Product Details',
          action: () => {
            console.log('View details for:', state.contextMenu?.pointId);
          },
        },
        {
          id: 'filter',
          label: 'Filter By This Product',
          action: () => {
            if (state.contextMenu?.pointId) {
              selectData({
                chartId,
                pointIds: [state.contextMenu.pointId],
              });
            }
          },
        },
        {
          id: 'filter-category',
          label: 'Filter By Product Category',
          action: () => {
            if (state.contextMenu?.pointId) {
              const point = data.find(item => item.id === state.contextMenu?.pointId);
              if (point) {
                const categoryPoint = categoryData.find(c => c.label === point.category);
                if (categoryPoint) {
                  selectData({
                    chartId: 'category-chart',
                    pointIds: [categoryPoint.id],
                  });
                }
              }
            }
          },
        },
      ],
    },
  ], [state.contextMenu, chartId, selectData, data]);
  
  return (
    <ChartContainer ref={chartRef} $themeStyles={themeStyles}>
      <ScatterPlot
        data={filteredData}
        title="Product Performance"
        xLabel="Price Index"
        yLabel="Satisfaction Score"
        onPointClick={handleDataPointClick}
        highlightedPoints={activeHighlights}
      />
      
      <ChartContextMenu 
        chartId={chartId}
        menuGroups={menuGroups}
      />
    </ChartContainer>
  );
};

// Main demo component
export const AdvancedInteractivityDemo: React.FC = () => {
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  return (
    <CrossChartInteractionProvider>
      <DemoContainer $themeStyles={themeStyles}>
        <Title $themeStyles={themeStyles}>Advanced Visualization Interactivity</Title>
        <Description $themeStyles={themeStyles}>
          This demo showcases advanced interactivity features between multiple charts.
          Use the controls below to switch between interaction modes and observe how
          selections in one chart affect the data displayed in others.
        </Description>
        
        <InteractionControls />
        
        <InteractionInfoPanel />
        
        <ChartsGrid>
          <InteractiveBarChart data={salesData} chartId="sales-chart" />
          <InteractivePieChart data={categoryData} chartId="category-chart" />
          <InteractiveScatterPlot data={scatterData} chartId="scatter-chart" />
        </ChartsGrid>
      </DemoContainer>
    </CrossChartInteractionProvider>
  );
}; 