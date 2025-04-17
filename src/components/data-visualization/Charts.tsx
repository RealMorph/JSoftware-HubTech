import React, { useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Data types
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  foregroundColor: string;
  axisColor: string;
  gridColor: string;
  fontSize: string;
  labelFontSize: string;
  shadow: string;
}

// Props interfaces
export interface ChartProps {
  data: DataPoint[];
  width?: string;
  height?: string;
  title?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
  showValues?: boolean;
  colorScale?: string[];
  // eslint-disable-next-line no-unused-vars
  onDataPointClick?: (_pointId: string) => void;
  maxValue?: number;
  style?: React.CSSProperties;
}

// Styled components
const ChartContainer = styled.div<{ width: string; height: string; $themeStyles: ThemeStyles }>`
  width: ${props => props.width};
  height: ${props => props.height};
  position: relative;
  background-color: ${props => props.$themeStyles.backgroundColor};
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: ${props => props.$themeStyles.shadow};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: ${props => props.$themeStyles.textColor};
  font-weight: 600;
`;

const NoDataMessage = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${props => props.$themeStyles.fontSize};
  color: ${props => props.$themeStyles.textSecondaryColor};
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

const Tooltip = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  background-color: ${props => props.$themeStyles.foregroundColor};
  color: ${props => props.$themeStyles.textColor};
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-size: ${props => props.$themeStyles.labelFontSize};
  pointer-events: none;
  z-index: 10;
  box-shadow: ${props => props.$themeStyles.shadow};
  transform: translate(-50%, -100%);
  white-space: nowrap;
`;

// Function to create ThemeStyles from DirectThemeContextType
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    textSecondaryColor: getColor('text.secondary', '#666666'),
    foregroundColor: getColor('foreground', '#ffffff'),
    axisColor: getColor('border', '#cccccc'),
    gridColor: getColor('border.light', '#f0f0f0'),
    fontSize: getTypography('fontSize.sm', '0.875rem') as string,
    labelFontSize: getTypography('fontSize.xs', '0.75rem') as string,
    shadow: getShadow('sm', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'),
  };
}

/**
 * BarChart Component
 */
export const BarChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '300px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = false,
  colorScale,
  onDataPointClick,
  style,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: '',
  });

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Define callback functions outside of conditionals
  const handleBarClick = useCallback(
    (pointId: string) => {
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick]
  );

  const handleBarMouseEnter = useCallback(
    (event: React.MouseEvent, bar: { label: string; value: number; x: number; y: number }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: bar.x,
            y: bar.y,
            text: `${bar.label}: ${bar.value}`,
          });
        }
      }
    },
    [showTooltips]
  );

  const handleBarMouseLeave = useCallback(() => {
    if (showTooltips) {
      setTooltip(prev => ({ ...prev, show: false }));
    }
  }, [showTooltips]);

  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: data.length }, (_, i) => {
    const hue = (i * 360) / data.length;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate chart dimensions
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const innerWidth = chartWidth - MARGIN.left - MARGIN.right;
  const innerHeight = chartHeight - MARGIN.top - MARGIN.bottom;

  // Create scales
  const barWidth = innerWidth / data.length / 2;
  const xScale = (i: number) => MARGIN.left + (i * innerWidth) / data.length + barWidth / 2;
  const yScale = (value: number) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => (d.value < 0 ? d.value : 0)));
    return MARGIN.top + innerHeight - ((value - minValue) * innerHeight) / (maxValue - minValue);
  };

  return (
    <ChartContainer
      width={width}
      height={height}
      $themeStyles={themeStyles}
      style={style}
      ref={chartRef}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}
      <svg width="100%" height="100%" overflow="visible">
        {/* X and Y Axis */}
        <line
          x1={MARGIN.left}
          y1={MARGIN.top + innerHeight}
          x2={MARGIN.left + innerWidth}
          y2={MARGIN.top + innerHeight}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />
        <line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={MARGIN.top + innerHeight}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={`x-label-${i}`}
            x={xScale(i)}
            y={MARGIN.top + innerHeight + 20}
            fontSize={themeStyles.labelFontSize}
            fill={themeStyles.textSecondaryColor}
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}

        {/* Y Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const maxValue = Math.max(...data.map(d => d.value));
          const minValue = Math.min(...data.map(d => (d.value < 0 ? d.value : 0)));
          const value = minValue + (maxValue - minValue) * ratio;
          const y = yScale(value);
          return (
            <React.Fragment key={`y-label-${ratio}`}>
              <text
                x={MARGIN.left - 10}
                y={y + 4}
                fontSize={themeStyles.labelFontSize}
                fill={themeStyles.textSecondaryColor}
                textAnchor="end"
              >
                {value.toFixed(0)}
              </text>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={MARGIN.left + innerWidth}
                y2={y}
                stroke={themeStyles.gridColor}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </React.Fragment>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = innerHeight - (yScale(d.value) - MARGIN.top);
          const x = xScale(i) - barWidth / 2;
          const y = yScale(d.value);
          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={d.color || colors[i % colors.length]}
                stroke={themeStyles.backgroundColor}
                strokeWidth="1"
                rx="2"
                cursor="pointer"
                onClick={() => handleBarClick(d.id)}
                onMouseEnter={e =>
                  handleBarMouseEnter(e, {
                    label: d.label,
                    value: d.value,
                    x: xScale(i),
                    y,
                  })
                }
                onMouseLeave={handleBarMouseLeave}
              />
              {showValues && (
                <text
                  x={xScale(i)}
                  y={y - 10}
                  fontSize={themeStyles.labelFontSize}
                  fill={themeStyles.textColor}
                  textAnchor="middle"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <Tooltip
          $themeStyles={themeStyles}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 10}px`,
          }}
        >
          {tooltip.text}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((d, i) => (
            <LegendItem key={d.id}>
              <LegendColor color={d.color || colors[i % colors.length]} />
              <span style={{ color: themeStyles.textSecondaryColor }}>{d.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * LineChart Component
 */
export const LineChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '300px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = false,
  colorScale,
  onDataPointClick,
  style,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: '',
  });

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Define all callback functions outside conditionals to adhere to React Hooks rules
  const handlePointClick = useCallback(
    (pointId: string) => {
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick]
  );

  const handlePointMouseEnter = useCallback(
    (event: React.MouseEvent, point: { label: string; value: number; x: number; y: number }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: point.x,
            y: point.y,
            text: `${point.label}: ${point.value}`,
          });
        }
      }
    },
    [showTooltips]
  );

  const handlePointMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);

  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: data.length }, (_, i) => {
    const hue = (i * 360) / data.length;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate chart dimensions
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const innerWidth = chartWidth - MARGIN.left - MARGIN.right;
  const innerHeight = chartHeight - MARGIN.top - MARGIN.bottom;

  // Create scales
  const xScale = (i: number) => MARGIN.left + (i * innerWidth) / (data.length - 1);
  const yScale = (value: number) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => (d.value < 0 ? d.value : 0)));
    return MARGIN.top + innerHeight - ((value - minValue) * innerHeight) / (maxValue - minValue);
  };

  // Generate points for the line path
  const points = data.map((d, i) => ({
    id: d.id,
    label: d.label,
    value: d.value,
    x: xScale(i),
    y: yScale(d.value),
    color: d.color || colors[i % colors.length],
  }));

  // Create line path
  const linePath = points
    .map((point, i) => (i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`))
    .join(' ');

  return (
    <ChartContainer
      width={width}
      height={height}
      $themeStyles={themeStyles}
      style={style}
      ref={chartRef}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}
      <svg width="100%" height="100%" overflow="visible">
        {/* X and Y Axis */}
        <line
          x1={MARGIN.left}
          y1={MARGIN.top + innerHeight}
          x2={MARGIN.left + innerWidth}
          y2={MARGIN.top + innerHeight}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />
        <line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={MARGIN.top + innerHeight}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={`x-label-${i}`}
            x={xScale(i)}
            y={MARGIN.top + innerHeight + 20}
            fontSize={themeStyles.labelFontSize}
            fill={themeStyles.textSecondaryColor}
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}

        {/* Y Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const maxValue = Math.max(...data.map(d => d.value));
          const minValue = Math.min(...data.map(d => (d.value < 0 ? d.value : 0)));
          const value = minValue + (maxValue - minValue) * ratio;
          const y = yScale(value);
          return (
            <React.Fragment key={`y-label-${ratio}`}>
              <text
                x={MARGIN.left - 10}
                y={y + 4}
                fontSize={themeStyles.labelFontSize}
                fill={themeStyles.textSecondaryColor}
                textAnchor="end"
              >
                {value.toFixed(0)}
              </text>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={MARGIN.left + innerWidth}
                y2={y}
                stroke={themeStyles.gridColor}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </React.Fragment>
          );
        })}

        {/* Line Path */}
        <path d={linePath} fill="none" stroke={colors[0]} strokeWidth="2" />

        {/* Data Points */}
        {points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              fill={point.color}
              stroke={themeStyles.backgroundColor}
              strokeWidth="2"
              cursor="pointer"
              onClick={() => handlePointClick(point.id)}
              onMouseEnter={e => handlePointMouseEnter(e, point)}
              onMouseLeave={handlePointMouseLeave}
            />
            {showValues && (
              <text
                x={point.x}
                y={point.y - 10}
                fontSize={themeStyles.labelFontSize}
                fill={themeStyles.textColor}
                textAnchor="middle"
              >
                {point.value}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <Tooltip
          $themeStyles={themeStyles}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 10}px`,
          }}
        >
          {tooltip.text}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((d, i) => (
            <LegendItem key={d.id}>
              <LegendColor color={d.color || colors[i % colors.length]} />
              <span style={{ color: themeStyles.textSecondaryColor }}>{d.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * PieChart Component
 */
export const PieChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '300px',
  title,
  showLegend = true,
  showTooltips = true,
  colorScale,
  onDataPointClick,
  style,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: '',
  });

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Define all callback functions outside conditionals to adhere to React Hooks rules
  const handleSliceClick = useCallback(
    (pointId: string) => {
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick]
  );

  const handleSliceMouseEnter = useCallback(
    (event: React.MouseEvent, slice: { label: string; value: number; percentage: number }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            text: `${slice.label}: ${slice.value} (${(slice.percentage * 100).toFixed(1)}%)`,
          });
        }
      }
    },
    [showTooltips]
  );

  const handleSliceMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);

  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: data.length }, (_, i) => {
    const hue = (i * 360) / data.length;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate pie dimensions
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const radius = Math.min(chartWidth, chartHeight) / 2.5;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Calculate pie slices
  let startAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = item.value / totalValue;
    const angle = percentage * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const midAngle = startAngle + angle / 2;
    const labelX = centerX + radius * 0.7 * Math.cos(midAngle);
    const labelY = centerY + radius * 0.7 * Math.sin(midAngle);

    const path = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const slice = {
      path,
      color: item.color || colors[index % colors.length],
      percentage,
      label: item.label,
      value: item.value,
      midAngle,
      labelX,
      labelY,
      id: item.id,
    };

    startAngle = endAngle;
    return slice;
  });

  return (
    <ChartContainer
      width={width}
      height={height}
      $themeStyles={themeStyles}
      style={style}
      ref={chartRef}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Pie Slices */}
        {slices.map((slice, index) => (
          <path
            key={`slice-${index}`}
            d={slice.path}
            fill={slice.color}
            stroke={themeStyles.backgroundColor}
            strokeWidth="1"
            cursor="pointer"
            onClick={() => handleSliceClick(slice.id)}
            onMouseEnter={e =>
              handleSliceMouseEnter(e, {
                label: slice.label,
                value: slice.value,
                percentage: slice.percentage,
              })
            }
            onMouseLeave={handleSliceMouseLeave}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <Tooltip
          $themeStyles={themeStyles}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 40}px`,
          }}
        >
          {tooltip.text}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((d, i) => (
            <LegendItem key={d.id}>
              <LegendColor color={d.color || colors[i % colors.length]} />
              <span style={{ color: themeStyles.textSecondaryColor }}>{d.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * DonutChart Component
 */
export const DonutChart: React.FC<ChartProps & { innerRadius?: number }> = ({
  data,
  width = '100%',
  height = '300px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = false,
  colorScale,
  onDataPointClick,
  style,
  innerRadius = 0.6,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: '',
  });

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Define all callback functions outside conditionals to adhere to React Hooks rules
  const handleSliceClick = useCallback(
    (pointId: string) => {
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick]
  );

  const handleSliceMouseEnter = useCallback(
    (event: React.MouseEvent, slice: { label: string; value: number; percentage: number }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            text: `${slice.label}: ${slice.value} (${(slice.percentage * 100).toFixed(1)}%)`,
          });
        }
      }
    },
    [showTooltips]
  );

  const handleSliceMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);

  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: data.length }, (_, i) => {
    const hue = (i * 360) / data.length;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate dimensions
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const outerRadius = Math.min(chartWidth, chartHeight) / 2.5;
  const donutInnerRadius = outerRadius * innerRadius;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate donut slices
  let startAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);

    const innerX1 = centerX + donutInnerRadius * Math.cos(startAngle);
    const innerY1 = centerY + donutInnerRadius * Math.sin(startAngle);
    const innerX2 = centerX + donutInnerRadius * Math.cos(endAngle);
    const innerY2 = centerY + donutInnerRadius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    // Path for donut slice (outer arc + inner arc + close)
    const path = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${innerX2} ${innerY2}`,
      `A ${donutInnerRadius} ${donutInnerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
      'Z',
    ].join(' ');

    const midAngle = startAngle + angle / 2;
    const labelRadius = (outerRadius + donutInnerRadius) / 2;
    const labelX = centerX + labelRadius * Math.cos(midAngle);
    const labelY = centerY + labelRadius * Math.sin(midAngle);

    const slice = {
      path,
      color: item.color || colors[index % colors.length],
      percentage,
      label: item.label,
      value: item.value,
      midAngle,
      labelX,
      labelY,
      id: item.id,
    };

    startAngle = endAngle;
    return slice;
  });

  return (
    <ChartContainer
      width={width}
      height={height}
      $themeStyles={themeStyles}
      style={style}
      ref={chartRef}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Donut Slices */}
        {slices.map((slice, index) => (
          <path
            key={`slice-${index}`}
            d={slice.path}
            fill={slice.color}
            stroke={themeStyles.backgroundColor}
            strokeWidth="1"
            cursor="pointer"
            onClick={() => handleSliceClick(slice.id)}
            onMouseEnter={e =>
              handleSliceMouseEnter(e, {
                label: slice.label,
                value: slice.value,
                percentage: slice.percentage,
              })
            }
            onMouseLeave={handleSliceMouseLeave}
          />
        ))}

        {/* Center circle with total */}
        <circle
          cx={centerX}
          cy={centerY}
          r={donutInnerRadius * 0.8}
          fill={themeStyles.backgroundColor}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />

        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          fontSize={themeStyles.fontSize}
          fill={themeStyles.textColor}
          fontWeight="bold"
        >
          Total
        </text>

        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          fontSize="18px"
          fill={themeStyles.textColor}
          fontWeight="bold"
        >
          {total}
        </text>

        {/* Value labels on slices */}
        {showValues &&
          slices.map(
            (slice, index) =>
              slice.percentage > 0.05 && (
                <text
                  key={`label-${index}`}
                  x={slice.labelX}
                  y={slice.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={themeStyles.textColor}
                  fontSize={themeStyles.labelFontSize}
                  fontWeight="bold"
                >
                  {(slice.percentage * 100).toFixed(0)}%
                </text>
              )
          )}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <Tooltip
          $themeStyles={themeStyles}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 40}px`,
          }}
        >
          {tooltip.text}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((d, i) => (
            <LegendItem key={d.id}>
              <LegendColor color={d.color || colors[i % colors.length]} />
              <span style={{ color: themeStyles.textSecondaryColor }}>{d.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * AreaChart Component
 */
export const AreaChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '300px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = false,
  colorScale,
  onDataPointClick,
  style,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: '',
  });

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Define all callback functions outside conditionals to adhere to React Hooks rules
  const handlePointClick = useCallback(
    (pointId: string) => {
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick]
  );

  const handlePointMouseEnter = useCallback(
    (event: React.MouseEvent, point: { label: string; value: number; x: number; y: number }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: point.x,
            y: point.y,
            text: `${point.label}: ${point.value}`,
          });
        }
      }
    },
    [showTooltips]
  );

  const handlePointMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);

  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: data.length }, (_, i) => {
    const hue = (i * 360) / data.length;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate chart dimensions
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const innerWidth = chartWidth - MARGIN.left - MARGIN.right;
  const innerHeight = chartHeight - MARGIN.top - MARGIN.bottom;

  // Create scales
  const xScale = (i: number) => MARGIN.left + (i * innerWidth) / (data.length - 1);
  const yScale = (value: number) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => (d.value < 0 ? d.value : 0)));
    return MARGIN.top + innerHeight - ((value - minValue) * innerHeight) / (maxValue - minValue);
  };

  // Generate points for the line path
  const points = data.map((d, i) => ({
    id: d.id,
    label: d.label,
    value: d.value,
    x: xScale(i),
    y: yScale(d.value),
    color: d.color || colors[i % colors.length],
  }));

  // Create line path
  const linePath = points
    .map((point, i) => (i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`))
    .join(' ');

  // Create area path (line + bottom border + back to start)
  const areaPath = [
    linePath,
    `L ${points[points.length - 1].x},${MARGIN.top + innerHeight}`,
    `L ${points[0].x},${MARGIN.top + innerHeight}`,
    'Z',
  ].join(' ');

  return (
    <ChartContainer
      width={width}
      height={height}
      $themeStyles={themeStyles}
      style={style}
      ref={chartRef}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}
      <svg width="100%" height="100%" overflow="visible">
        {/* X and Y Axis */}
        <line
          x1={MARGIN.left}
          y1={MARGIN.top + innerHeight}
          x2={MARGIN.left + innerWidth}
          y2={MARGIN.top + innerHeight}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />
        <line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={MARGIN.top + innerHeight}
          stroke={themeStyles.axisColor}
          strokeWidth="1"
        />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const y = MARGIN.top + innerHeight - innerHeight * ratio;
          return (
            <line
              key={`grid-${ratio}`}
              x1={MARGIN.left}
              y1={y}
              x2={MARGIN.left + innerWidth}
              y2={y}
              stroke={themeStyles.gridColor}
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={`x-label-${i}`}
            x={xScale(i)}
            y={MARGIN.top + innerHeight + 20}
            fontSize={themeStyles.labelFontSize}
            fill={themeStyles.textSecondaryColor}
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}

        {/* Y Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const maxValue = Math.max(...data.map(d => d.value));
          const minValue = Math.min(...data.map(d => (d.value < 0 ? d.value : 0)));
          const value = minValue + (maxValue - minValue) * ratio;
          const y = yScale(value);
          return (
            <text
              key={`y-label-${ratio}`}
              x={MARGIN.left - 10}
              y={y + 4}
              fontSize={themeStyles.labelFontSize}
              fill={themeStyles.textSecondaryColor}
              textAnchor="end"
            >
              {value.toFixed(0)}
            </text>
          );
        })}

        {/* Area Path */}
        <path
          d={areaPath}
          fill={`${colors[0]}33`} // 20% opacity
          stroke="none"
        />

        {/* Line Path */}
        <path
          d={linePath}
          fill="none"
          stroke={colors[0]}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data Points */}
        {points.map((point, i) => (
          <g key={`point-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              fill={themeStyles.backgroundColor}
              stroke={point.color}
              strokeWidth="2"
              cursor="pointer"
              onClick={() => handlePointClick(point.id)}
              onMouseEnter={e => handlePointMouseEnter(e, point)}
              onMouseLeave={handlePointMouseLeave}
            />
            {showValues && (
              <text
                x={point.x}
                y={point.y - 10}
                fontSize={themeStyles.labelFontSize}
                fill={themeStyles.textColor}
                textAnchor="middle"
              >
                {point.value}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <Tooltip
          $themeStyles={themeStyles}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 10}px`,
          }}
        >
          {tooltip.text}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend>
          <LegendItem>
            <LegendColor color={colors[0]} />
            <span style={{ color: themeStyles.textSecondaryColor }}>Data Series</span>
          </LegendItem>
        </Legend>
      )}
    </ChartContainer>
  );
};
