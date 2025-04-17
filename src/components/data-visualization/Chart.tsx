import React, { useState, ElementType, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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
const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
  colors: {
    primary: {
      main: theme.getColor('primary.main'),
      light: theme.getColor('primary.light'),
      dark: theme.getColor('primary.dark'),
    },
    secondary: {
      main: theme.getColor('secondary.main'),
      light: theme.getColor('secondary.light'),
    },
    text: {
      primary: theme.getColor('text.primary'),
      secondary: theme.getColor('text.secondary'),
    },
    background: {
      paper: theme.getColor('background.paper'),
      default: theme.getColor('background.default'),
    },
    chart: {
      axis: theme.getColor('border'),
      grid: theme.getColor('border.light'),
      tooltip: theme.getColor('background.paper'),
      bar: {
        default: theme.getColor('primary.main'),
        hover: theme.getColor('primary.light'),
        active: theme.getColor('primary.dark'),
      },
      line: {
        default: theme.getColor('primary.main'),
        hover: theme.getColor('primary.light'),
        active: theme.getColor('primary.dark'),
      },
      point: {
        default: theme.getColor('primary.main'),
        hover: theme.getColor('primary.light'),
        active: theme.getColor('primary.dark'),
      },
      pie: {
        default: theme.getColor('primary.main'),
        hover: theme.getColor('primary.light'),
        active: theme.getColor('primary.dark'),
      },
    },
  },
  typography: {
    fontFamily: theme.getTypography('fontFamily') as string,
    fontSize: {
      small: theme.getTypography('fontSize.small').toString(),
      medium: theme.getTypography('fontSize.medium').toString(),
      large: theme.getTypography('fontSize.large').toString(),
    },
    fontWeight: {
      regular: Number(theme.getTypography('fontWeight.regular')),
      medium: Number(theme.getTypography('fontWeight.medium')),
      bold: Number(theme.getTypography('fontWeight.bold')),
    },
    lineHeight: {
      small: Number(theme.getTypography('lineHeight.small')),
      medium: Number(theme.getTypography('lineHeight.medium')),
      large: Number(theme.getTypography('lineHeight.large')),
    },
  },
  spacing: {
    xs: theme.getSpacing('4'),
    sm: theme.getSpacing('8'),
    md: theme.getSpacing('16'),
    lg: theme.getSpacing('24'),
    xl: theme.getSpacing('32'),
  },
  borders: {
    radius: {
      small: theme.getColor('border.radius.small', '4px'),
      medium: theme.getColor('border.radius.medium', '8px'),
      large: theme.getColor('border.radius.large', '12px'),
    },
    width: {
      thin: theme.getColor('border.width.thin', '1px'),
      medium: theme.getColor('border.width.medium', '2px'),
      thick: theme.getColor('border.width.thick', '3px'),
    },
  },
  shadows: {
    tooltip: theme.getColor('shadow.medium', '0 2px 4px rgba(0,0,0,0.2)'),
    legend: theme.getColor('shadow.small', '0 1px 2px rgba(0,0,0,0.1)'),
  },
  animation: {
    duration: {
      short: theme.getColor('animation.duration.short', '150ms'),
      medium: theme.getColor('animation.duration.medium', '300ms'),
      long: theme.getColor('animation.duration.long', '500ms'),
    },
    easing: {
      easeInOut: theme.getColor('animation.easing.easeInOut', 'cubic-bezier(0.4, 0, 0.2, 1)'),
      easeOut: theme.getColor('animation.easing.easeOut', 'cubic-bezier(0.0, 0, 0.2, 1)'),
      easeIn: theme.getColor('animation.easing.easeIn', 'cubic-bezier(0.4, 0, 1, 1)'),
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
const getDefaultColors = (theme: ReturnType<typeof useDirectTheme>): string[] => [
  theme.getColor('primary.main'),
  theme.getColor('secondary.main'),
  theme.getColor('error.main'),
  theme.getColor('warning.main'),
  theme.getColor('success.main'),
  theme.getColor('info.main'),
  theme.getColor('primary.light'),
  theme.getColor('secondary.light'),
  theme.getColor('error.light'),
  theme.getColor('warning.light'),
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
  colorScale = getDefaultColors(useDirectTheme()),
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

  const themeContext = useDirectTheme();
  const themeStyles = useMemo(() => createThemeStyles(themeContext), [themeContext]);

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
            const color = point.color || colorScale[i % colorScale.length];
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
                color={point.color || colorScale[i % colorScale.length]} 
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

/**
 * Line Chart component for visualizing data trends over a series
 */
export const LineChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '400px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = false,
  colorScale = getDefaultColors(useDirectTheme()),
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

  const themeContext = useDirectTheme();
  const themeStyles = useMemo(() => createThemeStyles(themeContext), [themeContext]);

  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
    setMounted(true);
  }, [animateOnMount]);

  // Handle empty data
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

  // Determine chart dimensions
  const chartWidth = 800;
  const chartHeight = 500;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const maxDataValue = maxValue || Math.max(...data.map(d => d.value));

  // Handle click on a data point
  const handlePointClick = (pointId: string) => {
    setActivePoint(activePoint === pointId ? null : pointId);
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

  // Generate line path
  const generateLinePath = (): string => {
    const points = data.map((point, i) => {
      const x = padding.left + (i * innerWidth) / (data.length - 1);
      const y = padding.top + innerHeight - (point.value / maxDataValue) * innerHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

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

      <ChartCanvas viewBox={`0 0 ${chartWidth} ${chartHeight}`} $themeStyles={themeStyles}>
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

        {/* X-axis labels */}
        {data.map((point, i) => {
          const x = padding.left + (i * innerWidth) / (data.length - 1);

          return (
            <AxisLabel
              key={`x-label-${i}`}
              x={x}
              y={chartHeight - padding.bottom + 20}
              $themeStyles={themeStyles}
            >
              {point.label}
            </AxisLabel>
          );
        })}

        {/* Line */}
        <LinePath d={generateLinePath()} stroke={colorScale[0]} $themeStyles={themeStyles} />

        {/* Data points */}
        {data.map((point, i) => {
          const isActive = activePoint === point.id;
          const color = point.color || colorScale[i % colorScale.length];
          const x = padding.left + (i * innerWidth) / (data.length - 1);
          const y = padding.top + innerHeight - (point.value / maxDataValue) * innerHeight;

          return (
            <g key={`point-${i}`}>
              <LinePoint
                cx={x}
                cy={y}
                r={5}
                fill={color}
                active={isActive}
                onClick={() => handlePointClick(point.id)}
                onMouseOver={e => handleMouseOver(`${point.label}: ${point.value}`, e)}
                onMouseOut={handleMouseOut}
                $themeStyles={themeStyles}
              />

              {showValues && (
                <ValueLabel x={x} y={y - 15} $themeStyles={themeStyles}>
                  {point.value}
                </ValueLabel>
              )}
            </g>
          );
        })}
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
                color={point.color || colorScale[i % colorScale.length]} 
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

/**
 * Pie Chart component for visualizing proportional data
 */
export const PieChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '400px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = true,
  colorScale = getDefaultColors(useDirectTheme()),
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

  const themeContext = useDirectTheme();
  const themeStyles = useMemo(() => createThemeStyles(themeContext), [themeContext]);

  // Mount animation
  React.useEffect(() => {
    if (animateOnMount) {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
    setMounted(true);
  }, [animateOnMount]);

  // Handle empty data
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

  // Calculate total for percentages
  const total = data.reduce((sum, point) => sum + point.value, 0);

  // Determine chart dimensions
  const chartWidth = 800;
  const chartHeight = 500;
  const radius = Math.min(chartWidth, chartHeight) / 3;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Handle click on a slice
  const handleSliceClick = (pointId: string) => {
    setActiveSlice(activeSlice === pointId ? null : pointId);
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

  // Generate pie slices
  const generatePieSlices = () => {
    let startAngle = 0;

    return data.map((point, i) => {
      const isActive = activeSlice === point.id;
      const color = point.color || colorScale[i % colorScale.length];
      const percentage = (point.value / total) * 100;
      const angle = (percentage / 100) * 2 * Math.PI;
      const endAngle = startAngle + angle;

      // Calculate path for slice
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      // Use the larger arc (> 180 degrees) if needed
      const largeArcFlag = angle > Math.PI ? 1 : 0;

      // Create SVG path
      const path = `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      // Calculate label position
      const labelAngle = startAngle + angle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);

      // Calculate outer point for percentage label
      const percentLabelRadius = radius * 1.2;
      const percentX = centerX + percentLabelRadius * Math.cos(labelAngle);
      const percentY = centerY + percentLabelRadius * Math.sin(labelAngle);

      // Move slice outward if active
      const transform = isActive
        ? `translate(${Math.cos(labelAngle) * 10} ${Math.sin(labelAngle) * 10})`
        : '';

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
      };

      // Update start angle for next slice
      startAngle = endAngle;

      return slice;
    });
  };

  const slices = generatePieSlices();

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

      <ChartCanvas viewBox={`0 0 ${chartWidth} ${chartHeight}`} $themeStyles={themeStyles}>
        {/* Pie slices */}
        {slices.map((slice, i) => (
          <g key={`slice-${i}`} transform={slice.transform}>
            <PieSlice
              d={slice.path}
              fill={slice.color}
              active={slice.isActive}
              onClick={() => handleSliceClick(slice.id)}
              onMouseOver={e =>
                handleMouseOver(
                  `${slice.label}: ${slice.value} (${slice.percentage.toFixed(1)}%)`,
                  e
                )
              }
              onMouseOut={handleMouseOut}
              $themeStyles={themeStyles}
            />

            {/* Value labels */}
            {showValues && slice.percentage > 5 && (
              <ValueLabel x={slice.labelX} y={slice.labelY} $themeStyles={themeStyles}>
                {slice.percentage.toFixed(0)}%
              </ValueLabel>
            )}

            {/* Percentage labels */}
            {showValues && slice.percentage <= 5 && (
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
          {data.map((point, i) => (
            <LegendItem
              key={`legend-${i}`}
              onClick={() => handleSliceClick(point.id)}
              style={{ cursor: 'pointer' }}
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
                color={point.color || colorScale[i % colorScale.length]} 
                $themeStyles={themeStyles}
                aria-hidden="true"
              />
              <span>
                {point.label} ({((point.value / total) * 100).toFixed(1)}%)
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
  const themeContext = useDirectTheme();
  const themeStyles = useMemo(() => createThemeStyles(themeContext), [themeContext]);

  return (
    <ChartContainer
      width={props.width}
      height={props.height}
      ref={React.useRef<HTMLDivElement>(null)}
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

      <PieChart {...otherProps} />

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
