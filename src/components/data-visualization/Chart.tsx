import React, { useState, ElementType, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../core/theme/ThemeContext';
import { ThemeConfig } from '../../core/theme/consolidated-types';

// Base styled component props interface
interface StyledComponentProps {
  $themeStyles: ThemeStyles;
}

// Theme styles interface
interface ThemeStyles {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      paper: string;
      default: string;
    };
    chart: {
      axis: string;
      grid: string;
      tooltip: string;
      bar: {
        default: string;
        hover: string;
        active: string;
      };
      line: {
        default: string;
        hover: string;
        active: string;
      };
      point: {
        default: string;
        hover: string;
        active: string;
      };
      pie: {
        default: string;
        hover: string;
        active: string;
      };
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      regular: number;
      medium: number;
      bold: number;
    };
    lineHeight: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borders: {
    radius: {
      small: string;
      medium: string;
      large: string;
    };
    width: {
      thin: string;
      medium: string;
      thick: string;
    };
  };
  shadows: {
    tooltip: string;
    legend: string;
  };
  animation: {
    duration: {
      short: string;
      medium: string;
      long: string;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
    };
  };
}

// Theme styles creation function with proper type handling
const createThemeStyles = (theme: ReturnType<typeof useTheme>): ThemeStyles => ({
  colors: {
    primary: {
      main: theme.colors.primary,
      light: theme.colors.primary, // Adjust with proper light variant
      dark: theme.colors.primary,  // Adjust with proper dark variant
    },
    secondary: {
      main: theme.colors.secondary,
      light: theme.colors.secondary, // Adjust with proper light variant
    },
    text: {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
    },
    background: {
      paper: theme.colors.surface,
      default: theme.colors.background,
    },
    chart: {
      axis: theme.colors.border,
      grid: theme.colors.border, // Adjust if there's a light variant
      tooltip: theme.colors.surface,
      bar: {
        default: theme.colors.primary,
        hover: theme.colors.hover.background,
        active: theme.colors.primary, // Adjust with proper active variant
      },
      line: {
        default: theme.colors.primary,
        hover: theme.colors.hover.background,
        active: theme.colors.primary, // Adjust with proper active variant
      },
      point: {
        default: theme.colors.primary,
        hover: theme.colors.hover.background,
        active: theme.colors.primary, // Adjust with proper active variant
      },
      pie: {
        default: theme.colors.primary,
        hover: theme.colors.hover.background,
        active: theme.colors.primary, // Adjust with proper active variant
      },
    },
  },
  typography: {
    fontFamily: theme.typography.fontFamily.base,
    fontSize: {
      small: theme.typography.fontSize.sm,
      medium: theme.typography.fontSize.md,
      large: theme.typography.fontSize.lg,
    },
    fontWeight: {
      regular: theme.typography.fontWeight.normal,
      medium: theme.typography.fontWeight.medium,
      bold: theme.typography.fontWeight.bold,
    },
    lineHeight: {
      small: theme.typography.lineHeight.tight,
      medium: theme.typography.lineHeight.normal,
      large: theme.typography.lineHeight.relaxed,
    },
  },
  spacing: {
    xs: theme.spacing.xs,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
    xl: theme.spacing.xl,
  },
  borders: {
    radius: {
      small: theme.borderRadius.sm,
      medium: theme.borderRadius.md,
      large: theme.borderRadius.lg,
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
    },
  },
  shadows: {
    tooltip: theme.shadows.md,
    legend: theme.shadows.sm,
  },
  animation: {
    duration: {
      short: theme.animation.duration.short,
      medium: theme.animation.duration.standard,
      long: theme.animation.duration.long,
    },
    easing: {
      easeInOut: theme.animation.easing.easeInOut,
      easeOut: theme.animation.easing.easeOut,
      easeIn: theme.animation.easing.easeIn,
    },
  },
});

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
interface ChartContainerProps extends StyledComponentProps {
  width?: string;
  height?: string;
}

interface ChartCanvasProps extends StyledComponentProps {
  viewBox: string;
}

interface LegendItemProps extends StyledComponentProps {
  onClick?: () => void;
  style?: React.CSSProperties;
}

interface LegendColorProps extends StyledComponentProps {
  color: string;
}

interface ActiveElementProps extends StyledComponentProps {
  active?: boolean;
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
const ResponsiveContainer = styled.div<{ aspectRatio?: number }>`
  width: 100%;
  position: relative;
  padding-bottom: ${props => props.aspectRatio ? `${100 / props.aspectRatio}%` : '75%'};

  @media (max-width: 768px) {
    padding-bottom: ${props => props.aspectRatio ? `${120 / props.aspectRatio}%` : '100%'};
  }
`;

// Enhanced ChartContainer with responsive and variant support
const ChartContainer = styled.div<ChartContainerProps & { 
  $variant?: string; 
  $size?: string;
  $interactive?: boolean;
  $animateOnMount?: boolean;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  background-color: ${props => props.$themeStyles.colors.background.paper};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  padding: ${props => props.$size === 'small' 
    ? props.$themeStyles.spacing.sm 
    : props.$size === 'large' 
    ? props.$themeStyles.spacing.xl 
    : props.$themeStyles.spacing.md};
  box-sizing: border-box;
  overflow: hidden;
  font-family: ${props => props.$themeStyles.typography.fontFamily};
  box-shadow: ${props => props.$variant === 'outlined' 
    ? 'none' 
    : props.$themeStyles.shadows.tooltip};
  border: ${props => props.$variant === 'outlined' 
    ? `1px solid ${props.$themeStyles.colors.chart.axis}` 
    : 'none'};
  transition: all ${props => props.$themeStyles.animation.duration.medium} ${props => props.$themeStyles.animation.easing.easeInOut};
  opacity: ${props => props.$animateOnMount ? 1 : 0};
  transform: ${props => props.$animateOnMount ? 'translateY(0)' : 'translateY(20px)'};

  ${props => props.$interactive && `
    &:hover {
      box-shadow: ${props.$themeStyles.shadows.legend};
      transform: translateY(-2px);
    }
  `}

  @media (max-width: 768px) {
    padding: ${props => props.$themeStyles.spacing.sm};
    height: ${props => props.height || '300px'};
  }

  @media (max-width: 480px) {
    padding: ${props => props.$themeStyles.spacing.xs};
    height: ${props => props.height || '250px'};
  }
`;

// Enhanced Title with responsive typography
const Title = styled.h3<StyledComponentProps & { $size?: string }>`
  margin: 0 0 ${props => props.$themeStyles.spacing.sm} 0;
  font-size: ${props => props.$size === 'small' 
    ? props.$themeStyles.typography.fontSize.small 
    : props.$size === 'large' 
    ? props.$themeStyles.typography.fontSize.large 
    : props.$themeStyles.typography.fontSize.medium};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.bold};
  color: ${props => props.$themeStyles.colors.text.primary};
  text-align: center;
  line-height: ${props => props.$themeStyles.typography.lineHeight.large};
  transition: color ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeOut};

  @media (max-width: 768px) {
    font-size: ${props => props.$themeStyles.typography.fontSize.medium};
    margin-bottom: ${props => props.$themeStyles.spacing.xs};
  }
`;

// Base styled components
const ChartCanvas = styled.svg<ChartCanvasProps>`
  width: 100%;
  height: calc(100% - ${props => props.$themeStyles.spacing.lg});
  overflow: visible;
  transition: all ${props => props.$themeStyles.animation.duration.medium} ${props => props.$themeStyles.animation.easing.easeInOut};
`;

// Chart elements
const BarRect = styled.rect<ActiveElementProps>`
  cursor: pointer;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};
  stroke-width: ${props => props.$themeStyles.borders.width[props.active ? 'medium' : 'thin']};
  stroke: ${props => props.active ? props.$themeStyles.colors.chart.bar.active : props.$themeStyles.colors.chart.bar.default};
  fill: ${props => props.active ? props.$themeStyles.colors.chart.bar.active : props.$themeStyles.colors.chart.bar.default};
  transform-origin: bottom;

  &:hover {
    fill: ${props => props.$themeStyles.colors.chart.bar.hover};
    stroke: ${props => props.$themeStyles.colors.chart.bar.hover};
    transform: scaleY(1.02);
    filter: brightness(1.1);
  }

  &:active {
    transform: scaleY(0.98);
  }
`;

const LinePoint = styled.circle<ActiveElementProps>`
  cursor: pointer;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};
  stroke-width: ${props => props.$themeStyles.borders.width[props.active ? 'medium' : 'thin']};
  stroke: ${props => props.active ? props.$themeStyles.colors.chart.point.active : props.$themeStyles.colors.chart.point.default};
  fill: ${props => props.$themeStyles.colors.background.paper};
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));

  &:hover {
    stroke: ${props => props.$themeStyles.colors.chart.point.hover};
    transform: scale(1.2);
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
  }

  &:active {
    transform: scale(0.9);
  }
`;

const LinePath = styled.path<StyledComponentProps>`
  fill: none;
  stroke: ${props => props.$themeStyles.colors.chart.line.default};
  stroke-width: ${props => props.$themeStyles.borders.width.thin};
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));

  &:hover {
    stroke: ${props => props.$themeStyles.colors.chart.line.hover};
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`;

const PieSlice = styled.path<ActiveElementProps>`
  cursor: pointer;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};
  stroke-width: ${props => props.$themeStyles.borders.width[props.active ? 'medium' : 'thin']};
  stroke: ${props => props.$themeStyles.colors.background.paper};
  transform-origin: center;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Axis and labels
const AxisLine = styled.line<StyledComponentProps>`
  stroke: ${props => props.$themeStyles.colors.chart.axis};
  stroke-width: ${props => props.$themeStyles.borders.width.thin};
  shape-rendering: crispEdges;
  transition: stroke ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeOut};
`;

const AxisLabel = styled.text<StyledComponentProps>`
  font-size: ${props => props.$themeStyles.typography.fontSize.small};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.regular};
  fill: ${props => props.$themeStyles.colors.text.secondary};
  text-anchor: middle;
  transition: fill ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeOut};
  user-select: none;
`;

const ValueLabel = styled.text<StyledComponentProps>`
  font-size: ${props => props.$themeStyles.typography.fontSize.small};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  fill: ${props => props.$themeStyles.colors.text.primary};
  text-anchor: middle;
  pointer-events: none;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeOut};
  user-select: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
`;

// UI elements
const Tooltip = styled.div<StyledComponentProps>`
  position: absolute;
  background-color: ${props => props.$themeStyles.colors.chart.tooltip};
  color: ${props => props.$themeStyles.colors.text.primary};
  padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  font-size: ${props => props.$themeStyles.typography.fontSize.small};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  box-shadow: ${props => props.$themeStyles.shadows.tooltip};
  pointer-events: none;
  z-index: 100;
  max-width: 200px;
  white-space: nowrap;
  transform: translate(-50%, -100%);
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeOut};
  opacity: 0.95;
  backdrop-filter: blur(2px);

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px 4px 0;
    border-style: solid;
    border-color: ${props => props.$themeStyles.colors.chart.tooltip} transparent transparent;
  }
`;

const Legend = styled.div<StyledComponentProps>`
  position: absolute;
  bottom: ${props => props.$themeStyles.spacing.lg};
  right: ${props => props.$themeStyles.spacing.lg};
  background-color: ${props => props.$themeStyles.colors.background.paper};
  padding: ${props => props.$themeStyles.spacing.sm};
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  box-shadow: ${props => props.$themeStyles.shadows.legend};
  z-index: 50;
  transition: all ${props => props.$themeStyles.animation.duration.medium} ${props => props.$themeStyles.animation.easing.easeInOut};
  backdrop-filter: blur(4px);

  &:hover {
    box-shadow: ${props => props.$themeStyles.shadows.tooltip};
    transform: translateY(-2px);
  }
`;

const LegendItem = styled.div<LegendItemProps>`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.$themeStyles.spacing.xs};
  font-size: ${props => props.$themeStyles.typography.fontSize.small};
  color: ${props => props.$themeStyles.colors.text.secondary};
  cursor: pointer;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};
  padding: ${props => props.$themeStyles.spacing.xs};
  border-radius: ${props => props.$themeStyles.borders.radius.small};

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${props => props.$themeStyles.colors.text.primary};
    transform: translateX(2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const LegendColor = styled.div<LegendColorProps>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  margin-right: ${props => props.$themeStyles.spacing.xs};
  border-radius: ${props => props.$themeStyles.borders.radius.small};
  transition: transform ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  ${LegendItem}:hover & {
    transform: scale(1.2);
  }
`;

// Helper functions
const getDefaultColors = (theme: ReturnType<typeof useTheme>): string[] => [
  theme.colors.primary,
  theme.colors.secondary,
  theme.colors.success,
  theme.colors.info,
  theme.colors.warning,
  // Add more colors or generate them dynamically if needed
];

/**
 * Bar Chart component for visualizing comparative data
 */
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
  size = 'medium',
  interactive = true,
  highlightOnHover = true,
  animateOnMount = true,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
    visible: boolean;
  }>({
    content: '',
    x: 0,
    y: 0,
    visible: false,
  });

  const theme = useTheme();
  const defaultColorScale = useMemo(() => getDefaultColors(theme), [theme]);
  const finalColorScale = colorScale || defaultColorScale;

  const themeStyles = useMemo(() => createThemeStyles(theme), [theme]);

  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
    setMounted(true);
  }, [animateOnMount]);

  // Handlers with proper types
  const handlePointClick = useCallback((pointId: string) => {
    setActivePoint(activePoint === pointId ? null : pointId);
    if (onDataPointClick) {
      onDataPointClick(pointId);
    }
  }, [activePoint, onDataPointClick]);

  const handleMouseOver = useCallback((content: string, event: React.MouseEvent) => {
    if (showTooltips) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          content,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          visible: true,
        });
      }
    }
  }, [showTooltips]);

  const handleMouseOut = useCallback(() => {
    if (showTooltips) {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [showTooltips]);

  // Empty state handling
  if (!data || data.length === 0) {
    return (
      <ChartContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
        $variant={variant}
        $size={size}
        $interactive={interactive}
        $animateOnMount={mounted}
        role="presentation"
      >
        <Title $themeStyles={themeStyles} $size={size}>No data to display</Title>
      </ChartContainer>
    );
  }

  // Chart dimensions and calculations
  const chartWidth = DEFAULT_CHART_WIDTH;
  const chartHeight = DEFAULT_CHART_HEIGHT;
  const padding = DEFAULT_CHART_PADDING;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const barWidth = (innerWidth / data.length) * 0.8;
  const barGap = (innerWidth / data.length) * 0.2;
  const maxDataValue = maxValue || Math.max(...data.map(d => d.value));

  const chartContent = (
    <ChartContainer
      width={width}
      height={height}
      ref={containerRef}
      style={style}
      $themeStyles={themeStyles}
      $variant={variant}
      $size={size}
      $interactive={interactive}
      $animateOnMount={mounted}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {title && <Title $themeStyles={themeStyles} $size={size}>{title}</Title>}

      <ChartCanvas 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        $themeStyles={themeStyles}
        aria-hidden="true"
      >
        {/* Y-axis */}
        <AxisLine
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          $themeStyles={themeStyles}
        />

        {/* X-axis */}
        <AxisLine
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          $themeStyles={themeStyles}
        />

        {/* Y-axis grid lines and labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const yPos = padding.top + innerHeight - innerHeight * tick;
          const value = Math.round(maxDataValue * tick);

          return (
            <g key={`y-tick-${i}`}>
              <AxisLine
                x1={padding.left - 5}
                y1={yPos}
                x2={padding.left}
                y2={yPos}
                $themeStyles={themeStyles}
              />
              <AxisLabel
                x={padding.left - 20}
                y={yPos + 5}
                textAnchor="end"
                $themeStyles={themeStyles}
              >
                {value}
              </AxisLabel>
              <AxisLine
                x1={padding.left}
                y1={yPos}
                x2={chartWidth - padding.right}
                y2={yPos}
                stroke="#eee"
                $themeStyles={themeStyles}
              />
            </g>
          );
        })}

        {/* Bars */}
        <g>
          {data.map((point, i) => {
            const isActive = activePoint === point.id;
            const color = point.color || finalColorScale[i % finalColorScale.length];
            const x = padding.left + i * (barWidth + barGap);
            const barHeight = (point.value / maxDataValue) * innerHeight;
            const y = chartHeight - padding.bottom - barHeight;

            return (
              <g key={`bar-${i}`}>
                <BarRect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  active={isActive}
                  onClick={() => handlePointClick(point.id)}
                  onMouseOver={e => handleMouseOver(`${point.label}: ${point.value}`, e)}
                  onMouseOut={handleMouseOut}
                  $themeStyles={themeStyles}
                />

                {/* X-axis labels */}
                <AxisLabel
                  x={x + barWidth / 2}
                  y={chartHeight - padding.bottom + 20}
                  $themeStyles={themeStyles}
                >
                  {point.label}
                </AxisLabel>

                {/* Value labels */}
                {showValues && (
                  <ValueLabel x={x + barWidth / 2} y={y - 10} $themeStyles={themeStyles}>
                    {point.value}
                  </ValueLabel>
                )}
              </g>
            );
          })}
        </g>
      </ChartCanvas>

      {/* Enhanced tooltip with ARIA live region */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          $themeStyles={themeStyles}
          role="tooltip"
          aria-live="polite"
        >
          {tooltip.content}
        </Tooltip>
      )}

      {/* Enhanced legend with keyboard navigation */}
      {showLegend && (
        <Legend 
          $themeStyles={themeStyles}
          role="list"
          aria-label="Chart legend"
        >
          {data.map((point, i) => (
            <LegendItem
              key={`legend-${i}`}
              onClick={() => handlePointClick(point.id)}
              style={{ cursor: 'pointer' }}
              $themeStyles={themeStyles}
              role="listitem"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePointClick(point.id);
                }
              }}
            >
              <LegendColor 
                color={point.color || finalColorScale[i % finalColorScale.length]} 
                $themeStyles={themeStyles}
                aria-hidden="true"
              />
              <span>{point.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );

  return responsive ? (
    <ResponsiveContainer aspectRatio={aspectRatio} style={{ minHeight }}>
      {chartContent}
    </ResponsiveContainer>
  ) : chartContent;
};

// Adding utility functions for trendline calculation
const calculateTrendline = (data: DataPoint[]): { slope: number; intercept: number } => {
  const n = data.length;
  
  // Calculate means
  const xMean = (n - 1) / 2; // Using index as x values (0, 1, 2, ...)
  const yMean = data.reduce((sum, point) => sum + point.value, 0) / n;
  
  // Calculate slope
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (data[i].value - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  
  return { slope, intercept };
};

// Add interfaces for drill-down pie chart
interface HierarchicalDataPoint extends DataPoint {
  children?: HierarchicalDataPoint[];
}

// Update ExtendedChartProps to include hierarchical data
interface ExtendedChartProps extends ChartProps {
  showTrendline?: boolean;
  showForecast?: boolean;
  forecastPeriods?: number;
  annotations?: Annotation[];
  timeRangeSelector?: boolean;
  startTimeIndex?: number;
  endTimeIndex?: number;
  onTimeRangeChange?: (start: number, end: number) => void;
  // Hierarchical data properties
  hierarchicalData?: HierarchicalDataPoint[];
  enableDrillDown?: boolean;
  drillDownLevel?: number;
  onDrillDown?: (pointId: string, level: number) => void;
  breadcrumbs?: string[];
  onBreadcrumbClick?: (level: number) => void;
  // Multi-level comparison
  comparisonData?: DataPoint[];
  showComparison?: boolean;
  comparisonLabel?: string;
}

// Update generateTrendlinePoints and generateForecastPoints functions to properly handle their arguments
const generateTrendlinePoints = (
  data: DataPoint[],
  trendline: { slope: number; intercept: number },
  chartDimensions: { innerWidth: number; innerHeight: number; padding: { top: number, right: number, bottom: number, left: number } },
  maxDataValue: number
): string => {
  const { innerWidth, innerHeight, padding } = chartDimensions;
  
  // Calculate trendline points
  const points = [];
  for (let i = 0; i < data.length; i++) {
    const x = padding.left + (i * innerWidth) / (data.length - 1);
    const predictedValue = trendline.slope * i + trendline.intercept;
    const y = padding.top + innerHeight - (predictedValue / maxDataValue) * innerHeight;
    points.push(`${x},${y}`);
  }
  
  return `M ${points.join(' L ')}`;
};

const generateForecastPoints = (
  data: DataPoint[],
  trendline: { slope: number; intercept: number },
  forecastPeriods: number,
  chartDimensions: { innerWidth: number; innerHeight: number; padding: { top: number, right: number, bottom: number, left: number } },
  maxDataValue: number
): string => {
  const { innerWidth, innerHeight, padding } = chartDimensions;
  
  // Start from the last data point
  const lastIndex = data.length - 1;
  const pointWidth = innerWidth / (data.length - 1);
  
  // Calculate forecast points
  const points = [];
  const lastX = padding.left + lastIndex * pointWidth;
  const lastY = padding.top + innerHeight - (data[lastIndex].value / maxDataValue) * innerHeight;
  
  points.push(`${lastX},${lastY}`);
  
  for (let i = 1; i <= forecastPeriods; i++) {
    const index = lastIndex + i;
    const x = padding.left + index * pointWidth;
    const predictedValue = trendline.slope * index + trendline.intercept;
    const y = padding.top + innerHeight - (predictedValue / maxDataValue) * innerHeight;
    points.push(`${x},${y}`);
  }
  
  return `M ${points.join(' L ')}`;
};

// Update PieChart to support hierarchical data and drill-down capabilities
export const PieChart: React.FC<ExtendedChartProps> = ({
  data,
  width = '100%',
  height = '400px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = true,
  colorScale,
  onDataPointClick,
  style,
  // New props
  responsive = true,
  minHeight = '250px',
  aspectRatio = 4/3,
  ariaLabel,
  ariaDescribedBy,
  role = 'img',
  variant = 'default',
  size = 'medium',
  interactive = true,
  highlightOnHover = true,
  animateOnMount = true,
  // Hierarchical data props
  hierarchicalData,
  enableDrillDown = false,
  drillDownLevel = 0,
  onDrillDown,
  breadcrumbs = [],
  onBreadcrumbClick,
  // Multi-level comparison
  comparisonData,
  showComparison = false,
  comparisonLabel = 'Comparison'
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
    visible: boolean;
  }>({
    content: '',
    x: 0,
    y: 0,
    visible: false,
  });
  
  // State for drill-down current data
  const [currentLevelData, setCurrentLevelData] = useState<DataPoint[]>(data);
  
  // Effect to update current level data when hierarchical data or drill-down level changes
  React.useEffect(() => {
    if (enableDrillDown && hierarchicalData) {
      // Navigate to the current level
      let currentData: HierarchicalDataPoint[] = hierarchicalData;
      let currentLevel = 0;
      
      while (currentLevel < drillDownLevel && breadcrumbs && breadcrumbs.length > currentLevel) {
        const parentId = breadcrumbs[currentLevel];
        const parent = currentData.find(item => item.id === parentId);
        
        if (parent && parent.children) {
          currentData = parent.children;
          currentLevel++;
        } else {
          break;
        }
      }
      
      setCurrentLevelData(currentData);
    } else {
      setCurrentLevelData(data);
    }
  }, [hierarchicalData, drillDownLevel, breadcrumbs, enableDrillDown, data]);

  const theme = useTheme();
  const defaultColorScale = useMemo(() => getDefaultColors(theme), [theme]);
  const finalColorScale = colorScale || defaultColorScale;
  const themeStyles = useMemo(() => createThemeStyles(theme), [theme]);

  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
    setMounted(true);
  }, [animateOnMount]);

  // Handle empty data
  if (!currentLevelData || currentLevelData.length === 0) {
    return (
      <ChartContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
        $variant={variant}
        $size={size}
        $interactive={interactive}
        $animateOnMount={mounted}
        role="presentation"
      >
        <Title $themeStyles={themeStyles} $size={size}>No data to display</Title>
      </ChartContainer>
    );
  }

  // Calculate total for percentages
  const total = currentLevelData.reduce((sum, point) => sum + point.value, 0);
  const comparisonTotal = comparisonData ? comparisonData.reduce((sum, point) => sum + point.value, 0) : 0;

  // Determine chart dimensions
  const chartWidth = 800;
  const chartHeight = 500;
  let radius = Math.min(chartWidth, chartHeight) / 3;
  
  // Reduce radius if comparison is active
  if (showComparison && comparisonData) {
    radius = radius * 0.8;
  }
  
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Handle click on a slice
  const handleSliceClick = (pointId: string) => {
    setActiveSlice(activeSlice === pointId ? null : pointId);
    
    if (enableDrillDown && hierarchicalData) {
      // Find the clicked item in the current level data
      const hierarchicalItem = hierarchicalData.find(item => item.id === pointId);
      
      // If it has children, drill down
      if (hierarchicalItem && hierarchicalItem.children && hierarchicalItem.children.length > 0) {
        if (onDrillDown) {
          onDrillDown(pointId, drillDownLevel + 1);
        }
        return;
      }
    }
    
    if (onDataPointClick) {
      onDataPointClick(pointId);
    }
  };

  // Show tooltip
  const handleMouseOver = (content: string, event: React.MouseEvent) => {
    if (showTooltips) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({
          content,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          visible: true,
        });
      }
    }
  };

  // Hide tooltip
  const handleMouseOut = () => {
    if (showTooltips) {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };

  // Handle breadcrumb click for drill-down navigation
  const handleBreadcrumbClick = (level: number) => {
    if (onBreadcrumbClick) {
      onBreadcrumbClick(level);
    }
  };

  // Generate pie slices
  const generatePieSlices = (
    data: DataPoint[], 
    total: number, 
    radius: number,
    startRadiusMultiplier = 1,
    endRadiusMultiplier = 1,
    isComparison = false
  ) => {
    let startAngle = 0;

    return data.map((point, i) => {
      const isActive = activeSlice === point.id;
      const color = point.color || finalColorScale[i % finalColorScale.length];
      const percentage = (point.value / total) * 100;
      const angle = (percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // Calculate inner and outer radius for concentric rings
      const innerRadius = radius * startRadiusMultiplier;
      const outerRadius = radius * endRadiusMultiplier;

      // Calculate path for slice
      const xInner1 = centerX + innerRadius * Math.cos(startAngle);
      const yInner1 = centerY + innerRadius * Math.sin(startAngle);
      const xInner2 = centerX + innerRadius * Math.cos(endAngle);
      const yInner2 = centerY + innerRadius * Math.sin(endAngle);
      
      const xOuter1 = centerX + outerRadius * Math.cos(startAngle);
      const yOuter1 = centerY + outerRadius * Math.sin(startAngle);
      const xOuter2 = centerX + outerRadius * Math.cos(endAngle);
      const yOuter2 = centerY + outerRadius * Math.sin(endAngle);

      // Use the larger arc (> 180 degrees) if needed
      const largeArcFlag = angle > Math.PI ? 1 : 0;

      // Create SVG path for concentric ring slice
      const path = `
        M ${xInner1} ${yInner1}
        L ${xOuter1} ${yOuter1}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${xOuter2} ${yOuter2}
        L ${xInner2} ${yInner2}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${xInner1} ${yInner1}
        Z
      `;

      // Calculate label position
      const labelAngle = startAngle + angle / 2;
      const labelRadius = outerRadius * 0.75;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);

      // Calculate outer point for percentage label
      const percentLabelRadius = outerRadius * 1.1;
      const percentX = centerX + percentLabelRadius * Math.cos(labelAngle);
      const percentY = centerY + percentLabelRadius * Math.sin(labelAngle);

      // Move slice outward if active
      const transform = isActive
        ? `translate(${Math.cos(labelAngle) * 10} ${Math.sin(labelAngle) * 10})`
        : '';
        
      // Check if this item has children for drill-down
      let hasChildren = false;
      if (enableDrillDown && hierarchicalData) {
        const hierarchicalItem = hierarchicalData.find(item => item.id === point.id);
        hasChildren = !!(hierarchicalItem && hierarchicalItem.children && hierarchicalItem.children.length > 0);
      }

      const slice = {
        id: point.id,
        path,
        color,
        labelX,
        labelY,
        percentX,
        percentY,
        percentage,
        transform,
        label: point.label,
        value: point.value,
        isActive,
        hasChildren,
        isComparison
      };

      // Update start angle for next slice
      startAngle = endAngle;

      return slice;
    });
  };

  // Generate slices for primary data
  const slices = generatePieSlices(currentLevelData, total, radius);
  
  // Generate slices for comparison data if available
  const comparisonSlices = showComparison && comparisonData 
    ? generatePieSlices(comparisonData, comparisonTotal, radius, 1.1, 1.3, true) 
    : [];
  
  // Combine all slices
  const allSlices = [...slices, ...comparisonSlices];

  const chartContent = (
    <ChartContainer
      width={width}
      height={height}
      ref={containerRef}
      style={style}
      $themeStyles={themeStyles}
      $variant={variant}
      $size={size}
      $interactive={interactive}
      $animateOnMount={mounted}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {title && <Title $themeStyles={themeStyles} $size={size}>{title}</Title>}
      
      {/* Breadcrumbs for drill-down navigation */}
      {enableDrillDown && breadcrumbs && breadcrumbs.length > 0 && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: themeStyles.spacing.sm,
            fontSize: themeStyles.typography.fontSize.small,
          }}
        >
          <span 
            style={{ cursor: 'pointer', color: themeStyles.colors.text.primary }}
            onClick={() => handleBreadcrumbClick(0)}
          >
            Home
          </span>
          
          {breadcrumbs.map((crumb, index) => {
            // Find the item name from hierarchical data
            let itemName = crumb;
            let currentLevel = hierarchicalData;
            
            for (let i = 0; i <= index; i++) {
              const item = currentLevel?.find(d => d.id === breadcrumbs[i]);
              if (i === index && item) {
                itemName = item.label;
              } else if (item && item.children) {
                currentLevel = item.children;
              }
            }
            
            return (
              <React.Fragment key={`breadcrumb-${index}`}>
                <span style={{ margin: `0 ${themeStyles.spacing.xs}` }}>/</span>
                <span 
                  style={{ 
                    cursor: 'pointer', 
                    color: index === breadcrumbs.length - 1 
                      ? themeStyles.colors.text.secondary 
                      : themeStyles.colors.text.primary 
                  }}
                  onClick={() => handleBreadcrumbClick(index + 1)}
                >
                  {itemName}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <ChartCanvas viewBox={`0 0 ${chartWidth} ${chartHeight}`} $themeStyles={themeStyles}>
        {/* Pie slices */}
        {allSlices.map((slice, i) => (
          <g key={`slice-${i}`} transform={slice.transform}>
            <PieSlice
              d={slice.path}
              fill={slice.color}
              active={slice.isActive}
              onClick={() => handleSliceClick(slice.id)}
              onMouseOver={e => {
                const content = slice.isComparison 
                  ? `${comparisonLabel}: ${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`
                  : `${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)${slice.hasChildren ? ' (Click to drill down)' : ''}`;
                handleMouseOver(content, e);
              }}
              onMouseOut={handleMouseOut}
              $themeStyles={themeStyles}
              style={{ 
                cursor: slice.hasChildren ? 'pointer' : 'default',
                opacity: slice.isComparison ? 0.7 : 1 
              }}
            />

            {/* Value labels */}
            {showValues && slice.percentage > 5 && !slice.isComparison && (
              <ValueLabel x={slice.labelX} y={slice.labelY} $themeStyles={themeStyles}>
                {slice.percentage.toFixed(0)}%
              </ValueLabel>
            )}

            {/* Percentage labels */}
            {showValues && slice.percentage <= 5 && !slice.isComparison && (
              <g>
                <line
                  x1={slice.labelX}
                  y1={slice.labelY}
                  x2={slice.percentX}
                  y2={slice.percentY}
                  stroke="#aaa"
                  strokeWidth="1"
                />
                <ValueLabel x={slice.percentX} y={slice.percentY} $themeStyles={themeStyles}>
                  {slice.percentage.toFixed(1)}%
                </ValueLabel>
              </g>
            )}
            
            {/* Drill-down indicator */}
            {slice.hasChildren && !slice.isComparison && (
              <circle
                cx={slice.labelX + 15}
                cy={slice.labelY}
                r={5}
                fill={themeStyles.colors.background.paper}
                stroke={slice.color}
                strokeWidth="1.5"
              />
            )}
          </g>
        ))}
      </ChartCanvas>

      {/* Enhanced tooltip with ARIA live region */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          $themeStyles={themeStyles}
          role="tooltip"
          aria-live="polite"
        >
          {tooltip.content}
        </Tooltip>
      )}

      {/* Enhanced legend with keyboard navigation */}
      {showLegend && (
        <Legend 
          $themeStyles={themeStyles}
          role="list"
          aria-label="Chart legend"
        >
          {/* Primary data legend */}
          {currentLevelData.map((point, i) => {
            // Check if this item has children for drill-down
            let hasChildren = false;
            if (enableDrillDown && hierarchicalData) {
              const hierarchicalItem = hierarchicalData.find(item => item.id === point.id);
              hasChildren = !!(hierarchicalItem && hierarchicalItem.children && hierarchicalItem.children.length > 0);
            }
            
            return (
              <LegendItem
                key={`legend-${i}`}
                onClick={() => handleSliceClick(point.id)}
                style={{ cursor: hasChildren ? 'pointer' : 'default' }}
                $themeStyles={themeStyles}
                role="listitem"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSliceClick(point.id);
                  }
                }}
              >
                <LegendColor 
                  color={point.color || finalColorScale[i % finalColorScale.length]} 
                  $themeStyles={themeStyles}
                  aria-hidden="true"
                />
                <span>
                  {point.label} ({((point.value / total) * 100).toFixed(1)}%)
                  {hasChildren && <span style={{ marginLeft: '5px', fontSize: '0.8em' }}>▶</span>}
                </span>
              </LegendItem>
            );
          })}
          
          {/* Comparison data legend separator */}
          {showComparison && comparisonData && comparisonData.length > 0 && (
            <div 
              style={{ 
                height: '1px', 
                background: themeStyles.colors.chart.axis, 
                margin: `${themeStyles.spacing.xs} 0`,
                opacity: 0.5 
              }} 
            />
          )}
          
          {/* Comparison data legend */}
          {showComparison && comparisonData && comparisonData.map((point, i) => (
            <LegendItem
              key={`comparison-legend-${i}`}
              style={{ cursor: 'default', opacity: 0.7 }}
              $themeStyles={themeStyles}
              role="listitem"
            >
              <LegendColor 
                color={point.color || finalColorScale[i % finalColorScale.length]} 
                $themeStyles={themeStyles}
                aria-hidden="true"
              />
              <span>
                {comparisonLabel}: {point.label} ({((point.value / comparisonTotal) * 100).toFixed(1)}%)
              </span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );

  return responsive ? (
    <ResponsiveContainer aspectRatio={aspectRatio} style={{ minHeight }}>
      {chartContent}
    </ResponsiveContainer>
  ) : chartContent;
};

/**
 * DonutChart - A variation of PieChart with a hollow center
 */
export const DonutChart: React.FC<ChartProps & { innerRadius?: number }> = props => {
  const { innerRadius = 0.6, ...otherProps } = props;
  const theme = useTheme();
  const defaultColorScale = useMemo(() => getDefaultColors(theme), [theme]);
  const themeStyles = useMemo(() => createThemeStyles(theme), [theme]);
  
  return (
    <ChartContainer
      width={props.width}
      height={props.height}
      style={props.style}
      $themeStyles={themeStyles}
      $variant="outlined"
      $size="medium"
      $interactive={true}
      $animateOnMount={true}
    >
      {props.title && <Title $themeStyles={themeStyles} $size="medium">
        {props.title}
      </Title>}

      <PieChart {...otherProps} data={props.data.map((item, index) => ({
        ...item,
        color: item.color || (props.colorScale ? props.colorScale[index % props.colorScale.length] : defaultColorScale[index % defaultColorScale.length]),
      }))} />

      {/* Add a circle to create the donut hole */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
        width="60%"
        height="60%"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={innerRadius * 50}
          fill="none"
          stroke={themeStyles.colors.background.paper}
          strokeWidth="40"
        />
      </svg>
    </ChartContainer>
  );
};
