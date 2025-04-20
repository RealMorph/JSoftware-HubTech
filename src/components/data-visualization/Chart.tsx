import React, { useState, ElementType, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  primaryColor: string;
  primaryHoverColor: string;
  textColor: string;
  textSecondaryColor: string;
  surfaceColor: string;
  borderColor: string;
  hoverBackgroundColor: string;
  spacing: {
    xs: string;
    sm: string;
    md: string;
  };
  borderRadius: {
    sm: string;
    md: string;
  };
    fontSize: {
    xs: string;
    sm: string;
    lg: string;
    };
    fontWeight: {
    semibold: string;
  };
  shadows: {
    sm: string;
  };
  transitions: {
    normal: string;
  };
  // New chart-specific properties
  chart: {
    axis: {
      color: string;
      width: string;
    };
    grid: {
      color: string;
      width: string;
      dashArray: string;
    };
    tooltip: {
      backgroundColor: string;
      textColor: string;
      borderColor: string;
      shadow: string;
    };
    bar: {
      defaultColor: string;
      hoverColor: string;
      activeColor: string;
    };
    line: {
      width: string;
      color: string;
      hoverColor: string;
    };
    point: {
      size: string;
      hoverSize: string;
      borderWidth: string;
      backgroundColor: string;
      borderColor: string;
    };
    legend: {
      borderColor: string;
      itemHoverColor: string;
      textColor: string;
    };
  };
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getBorderRadius, getShadow, getSpacing, getTransition } = themeContext;

  const primaryColor = getColor('primary', '#3366CC');
  const primaryHoverColor = getColor('primary.hover', '#254e9c');
  const borderColor = getColor('border', '#e0e0e0');
  const textColor = getColor('text.primary', '#333333');
  const textSecondaryColor = getColor('text.secondary', '#666666');
  const backgroundColor = getColor('background', '#ffffff');
  const hoverBackgroundColor = getColor('hover.background', '#f5f5f5');
  const shadowSm = getShadow('sm', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)');

  return {
    backgroundColor,
    primaryColor,
    primaryHoverColor,
    textColor,
    textSecondaryColor,
    surfaceColor: getColor('surface', '#ffffff'),
    borderColor,
    hoverBackgroundColor,
    spacing: {
      xs: getSpacing('xs', '0.25rem'),
      sm: getSpacing('sm', '0.5rem'),
      md: getSpacing('md', '1rem'),
    },
    borderRadius: {
      sm: getBorderRadius('sm', '0.25rem'),
      md: getBorderRadius('md', '0.5rem'),
    },
    fontSize: {
      xs: getTypography('fontSize.xs', '0.75rem') as string,
      sm: getTypography('fontSize.sm', '0.875rem') as string,
      lg: getTypography('fontSize.lg', '1.125rem') as string,
    },
    fontWeight: {
      semibold: getTypography('fontWeight.semibold', '600') as string,
    },
    shadows: {
      sm: shadowSm,
    },
    transitions: {
      normal: getTransition('normal', '0.2s'),
    },
    // Initialize chart-specific theme properties
    chart: {
      axis: {
        color: getColor('chart.axis.color', borderColor),
        width: getColor('chart.axis.width', '1px'),
      },
      grid: {
        color: getColor('chart.grid.color', hoverBackgroundColor),
        width: getColor('chart.grid.width', '1px'),
        dashArray: getColor('chart.grid.dashArray', '2,2'),
      },
      tooltip: {
        backgroundColor: getColor('chart.tooltip.backgroundColor', backgroundColor),
        textColor: getColor('chart.tooltip.textColor', textColor),
        borderColor: getColor('chart.tooltip.borderColor', borderColor),
        shadow: shadowSm,
      },
      bar: {
        defaultColor: getColor('chart.bar.defaultColor', primaryColor),
        hoverColor: getColor('chart.bar.hoverColor', primaryHoverColor),
        activeColor: getColor('chart.bar.activeColor', primaryHoverColor),
      },
      line: {
        width: getColor('chart.line.width', '2px'),
        color: getColor('chart.line.color', primaryColor),
        hoverColor: getColor('chart.line.hoverColor', primaryHoverColor),
      },
      point: {
        size: getColor('chart.point.size', '4px'),
        hoverSize: getColor('chart.point.hoverSize', '6px'),
        borderWidth: getColor('chart.point.borderWidth', '2px'),
        backgroundColor: getColor('chart.point.backgroundColor', '#ffffff'),
        borderColor: getColor('chart.point.borderColor', primaryColor),
      },
      legend: {
        borderColor: getColor('chart.legend.borderColor', borderColor),
        itemHoverColor: getColor('chart.legend.itemHoverColor', hoverBackgroundColor),
        textColor: getColor('chart.legend.textColor', textColor),
      },
    },
  };
}

// Types for chart data and props
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

// Add interfaces for annotations
interface Annotation {
  pointIndex: number;
  text: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  color?: string;
}

// Extended chart props with responsive and accessibility features
export interface ChartProps {
  data: DataPoint[];
  width?: string;
  height?: string;
  title?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
  showValues?: boolean;
  colorScale?: string[];
  onDataPointClick?: (pointId: string) => void;
  maxValue?: number;
  style?: React.CSSProperties;
  // New responsive props
  responsive?: boolean;
  minHeight?: string;
  aspectRatio?: number;
  // New accessibility props
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  // New theme props
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  // New interaction props
  interactive?: boolean;
  highlightOnHover?: boolean;
  animateOnMount?: boolean;
}

// Extended props for styled components
interface ChartContainerProps {
  width?: string;
  height?: string;
  $themeStyles: ThemeStyles;
}

interface ChartCanvasProps {
  viewBox: string;
}

interface LegendItemProps {
  onClick?: () => void;
  style?: React.CSSProperties;
  $themeStyles: ThemeStyles;
}

interface LegendColorProps {
  color: string;
}

interface ActiveElementProps {
  active?: boolean;
  $themeStyles: ThemeStyles;
}

// Chart dimension constants
const DEFAULT_CHART_WIDTH = 800;
const DEFAULT_CHART_HEIGHT = 500;
const DEFAULT_CHART_PADDING = {
  top: 40,
  right: 40,
  bottom: 60,
  left: 60,
};

// Responsive container component
const ChartContainer = styled.div<ChartContainerProps>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: ${props => props.$themeStyles.borderRadius.md};
  padding: ${props => props.$themeStyles.spacing.md};
  box-shadow: ${props => props.$themeStyles.shadows.sm};
  overflow: hidden;
`;

// Chart canvas with SVG
const ChartCanvas = styled.svg<ChartCanvasProps>`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

// Chart title component
const ChartTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0 0 ${props => props.$themeStyles.spacing.sm};
  font-size: ${props => props.$themeStyles.fontSize.lg};
  font-weight: ${props => props.$themeStyles.fontWeight.semibold};
  color: ${props => props.$themeStyles.textColor};
  text-align: center;
`;

// Base axis line
const AxisLine = styled.line<{ $themeStyles: ThemeStyles }>`
  stroke: ${props => props.$themeStyles.chart.axis.color};
  stroke-width: ${props => props.$themeStyles.chart.axis.width};
`;

// Base grid line with lighter color
const GridLine = styled.line<{ $themeStyles: ThemeStyles }>`
  stroke: ${props => props.$themeStyles.chart.grid.color};
  stroke-width: ${props => props.$themeStyles.chart.grid.width};
  stroke-dasharray: ${props => props.$themeStyles.chart.grid.dashArray};
`;

// Bar component with interactive state
const Bar = styled.rect<ActiveElementProps>`
  fill: ${props => props.active 
    ? props.$themeStyles.chart.bar.activeColor 
    : props.$themeStyles.chart.bar.defaultColor};
  transition: fill ${props => props.$themeStyles.transitions.normal} ease-in-out;
  cursor: pointer;

  &:hover {
    fill: ${props => props.$themeStyles.chart.bar.hoverColor};
    filter: brightness(1.1);
  }
`;

// Line for line charts
const Line = styled.path<ActiveElementProps>`
  stroke: ${props => props.active 
    ? props.$themeStyles.chart.line.hoverColor 
    : props.$themeStyles.chart.line.color};
  stroke-width: ${props => props.$themeStyles.chart.line.width};
  fill: none;
  transition: stroke ${props => props.$themeStyles.transitions.normal} ease-in-out;
`;

// Data point for line charts
const Point = styled.circle<ActiveElementProps>`
  fill: ${props => props.active 
    ? props.$themeStyles.chart.line.hoverColor 
    : props.$themeStyles.chart.point.backgroundColor};
  stroke: ${props => props.$themeStyles.chart.point.borderColor};
  stroke-width: ${props => props.$themeStyles.chart.point.borderWidth};
  cursor: pointer;
  transition: fill ${props => props.$themeStyles.transitions.normal} ease-in-out,
              r ${props => props.$themeStyles.transitions.normal} ease-in-out;

  &:hover {
    fill: ${props => props.$themeStyles.chart.line.hoverColor};
    r: ${props => props.$themeStyles.chart.point.hoverSize};
  }
`;

// Value label for data points
const ValueLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  fill: ${props => props.$themeStyles.textColor};
  font-size: ${props => props.$themeStyles.fontSize.xs};
  text-anchor: middle;
  user-select: none;
`;

// Axis label
const AxisLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  fill: ${props => props.$themeStyles.textSecondaryColor};
  font-size: ${props => props.$themeStyles.fontSize.xs};
  user-select: none;
`;

// Legend container
const LegendContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${props => props.$themeStyles.spacing.sm};
  margin-top: ${props => props.$themeStyles.spacing.sm};
  padding-top: ${props => props.$themeStyles.spacing.xs};
  border-top: 1px solid ${props => props.$themeStyles.chart.legend.borderColor};
`;

// Legend item with interactive state
const LegendItem = styled.div<LegendItemProps>`
  display: flex;
  align-items: center;
  gap: ${props => props.$themeStyles.spacing.xs};
  padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  cursor: ${props => props.onClick ? 'pointer' : 'default'};

  &:hover {
    background-color: ${props => props.onClick ? props.$themeStyles.chart.legend.itemHoverColor : 'transparent'};
  }
`;

// Legend color swatch
const LegendColor = styled.div<LegendColorProps & { $themeStyles: ThemeStyles }>`
  width: 12px;
  height: 12px;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  background-color: ${props => props.color};
`;

// Tooltip component
const Tooltip = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  z-index: 10;
  background-color: ${props => props.$themeStyles.chart.tooltip.backgroundColor};
  color: ${props => props.$themeStyles.chart.tooltip.textColor};
  padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  box-shadow: ${props => props.$themeStyles.chart.tooltip.shadow};
  pointer-events: none;
  font-size: ${props => props.$themeStyles.fontSize.xs};
  white-space: nowrap;
  transition: opacity 0.2s ease-in-out;
`;

// No data message
const NoDataMessage = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.$themeStyles.textSecondaryColor};
  font-size: ${props => props.$themeStyles.fontSize.lg};
`;

// Default color scheme
const getDefaultColors = (theme: ReturnType<typeof useDirectTheme>): string[] => [
  theme.getColor('primary', '#3366CC'),
  theme.getColor('secondary', '#DC3912'),
  theme.getColor('success', '#109618'),
  theme.getColor('warning', '#FF9900'),
  theme.getColor('error', '#B82E2E'),
  theme.getColor('info', '#0099C6')
];

// Add LegendText component
const LegendText = styled.span<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSize.sm};
  color: ${props => props.$themeStyles.textColor};
`;

// Bar chart implementation
export const BarChart: React.FC<ChartProps> = ({
  data,
  width,
  height,
  title,
  showLegend = true,
  showTooltips = true,
  showValues = true,
  colorScale,
  onDataPointClick,
  maxValue,
  style,
  // New props
  responsive = true,
  minHeight = '250px',
  aspectRatio = 4/3,
  ariaLabel,
  ariaDescribedBy,
  role = 'img',
  variant = 'default',
  interactive = true,
  highlightOnHover = true,
  animateOnMount = true,
}) => {
  // Use theme directly
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  
  // Component state
  const [activeBarId, setActiveBarId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });

  // Chart dimensions
  const chartRef = React.useRef<HTMLDivElement>(null);
  const padding = { ...DEFAULT_CHART_PADDING };
  const innerWidth = DEFAULT_CHART_WIDTH - padding.left - padding.right;
  const innerHeight = DEFAULT_CHART_HEIGHT - padding.top - padding.bottom;

  // Colors for the chart
  const colors = useMemo(() => {
    if (colorScale && colorScale.length > 0) {
      return colorScale;
    }
    return getDefaultColors(theme);
  }, [colorScale, theme]);

  // Calculate max value based on data or provided max
  const calculatedMaxValue = useMemo(() => {
    if (maxValue !== undefined) return maxValue;
    if (!data || data.length === 0) return 100;
    return Math.max(...data.map(item => item.value)) * 1.1; // 10% padding
  }, [data, maxValue]);

  // Calculate bar width and spacing
  const barWidth = useMemo(() => {
    const totalBars = data.length;
    const availableWidth = innerWidth;
    const barGap = availableWidth * 0.1 / Math.max(totalBars - 1, 1);
    return (availableWidth - barGap * (totalBars - 1)) / totalBars;
  }, [data.length, innerWidth]);

  // Event handlers for interaction
  const handleBarClick = useCallback((id: string) => {
    if (onDataPointClick && interactive) {
      onDataPointClick(id);
    }
  }, [onDataPointClick, interactive]);

  const handleBarMouseEnter = useCallback((event: React.MouseEvent, item: DataPoint) => {
    if (showTooltips && interactive) {
      const rect = chartRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          content: `${item.label}: ${item.value}`,
        });
      }
      if (highlightOnHover) {
        setActiveBarId(item.id);
    }
    }
  }, [showTooltips, interactive, highlightOnHover]);

  const handleBarMouseLeave = useCallback(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    if (highlightOnHover) {
      setActiveBarId(null);
    }
  }, [highlightOnHover]);

  // Show no data message if no data available
  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} style={style} $themeStyles={themeStyles}>
        {title && <ChartTitle $themeStyles={themeStyles}>{title}</ChartTitle>}
        <NoDataMessage $themeStyles={themeStyles}>No data available</NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      ref={chartRef}
      width={width}
      height={height}
      style={style}
      aria-label={ariaLabel || title || 'Bar chart'}
      aria-describedby={ariaDescribedBy}
      role={role}
      $themeStyles={themeStyles}
    >
      {title && <ChartTitle $themeStyles={themeStyles}>{title}</ChartTitle>}

      <ChartCanvas 
        viewBox={`0 0 ${DEFAULT_CHART_WIDTH} ${DEFAULT_CHART_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = padding.top + innerHeight - (i * innerHeight / 5);
          return (
            <GridLine
              key={`grid-${i}`}
          x1={padding.left}
              y1={y}
              x2={padding.left + innerWidth}
              y2={y}
          $themeStyles={themeStyles}
        />
          );
        })}

        {/* X and Y axis */}
        <AxisLine
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={padding.left + innerWidth}
          y2={padding.top + innerHeight}
          $themeStyles={themeStyles}
        />
              <AxisLine
          x1={padding.left}
          y1={padding.top}
                x2={padding.left}
          y2={padding.top + innerHeight}
                $themeStyles={themeStyles}
              />
        
        {/* Y-axis labels */}
        {Array.from({ length: 6 }).map((_, i) => {
          const value = calculatedMaxValue * i / 5;
          const y = padding.top + innerHeight - (i * innerHeight / 5);
          return (
              <AxisLabel
              key={`y-label-${i}`}
              x={padding.left - 10}
              y={y}
                textAnchor="end"
              dominantBaseline="middle"
                $themeStyles={themeStyles}
              >
              {value.toFixed(0)}
              </AxisLabel>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / calculatedMaxValue) * innerHeight;
          const x = padding.left + index * (barWidth + (innerWidth * 0.1 / Math.max(data.length - 1, 1)));
          const y = padding.top + innerHeight - barHeight;

            return (
            <g key={item.id}>
              <Bar
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                active={item.id === activeBarId}
                onClick={() => handleBarClick(item.id)}
                onMouseEnter={(e) => handleBarMouseEnter(e, item)}
                onMouseLeave={handleBarMouseLeave}
                fill={item.color || colors[index % colors.length]}
                  $themeStyles={themeStyles}
                />

                {/* X-axis labels */}
                <AxisLabel
                  x={x + barWidth / 2}
                y={padding.top + innerHeight + 20}
                textAnchor="middle"
                  $themeStyles={themeStyles}
                >
                {item.label}
                </AxisLabel>

                {/* Value labels */}
                {showValues && (
                <ValueLabel
                  x={x + barWidth / 2}
                  y={y - 10}
                  $themeStyles={themeStyles}
                >
                  {item.value}
                  </ValueLabel>
                )}
              </g>
            );
          })}
      </ChartCanvas>

      {/* Legend */}
      {showLegend && (
        <LegendContainer $themeStyles={themeStyles}>
          {data.map((item, index) => (
            <LegendItem
              key={item.id}
              onClick={interactive ? () => handleBarClick(item.id) : undefined}
              $themeStyles={themeStyles}
            >
              <LegendColor color={item.color || colors[index % colors.length]} $themeStyles={themeStyles} />
              <LegendText $themeStyles={themeStyles}>{item.label}</LegendText>
            </LegendItem>
          ))}
        </LegendContainer>
      )}
      
      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 30}px`, // Offset above cursor
          }}
          $themeStyles={themeStyles}
        >
          {tooltip.content}
        </Tooltip>
      )}
    </ChartContainer>
  );
};

// ... other chart implementations (PieChart, LineChart, etc.)
