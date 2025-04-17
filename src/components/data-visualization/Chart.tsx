import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Theme styles interface
interface ThemeStyles {
  background: string;
  text: string;
  border: string;
  primary: string;
  foreground: string;
}

// Theme styles creation function
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
  background: themeContext.getColor('background'),
  text: themeContext.getColor('text'),
  border: themeContext.getColor('border'),
  primary: themeContext.getColor('primary'),
  foreground: themeContext.getColor('foreground'),
});

// Types
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

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
}

// Styled components
const ChartContainer = styled.div<{ width?: string; height?: string; $themeStyles: ThemeStyles }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  background-color: ${props => props.$themeStyles.background};
  border-radius: 4px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: ${props => props.$themeStyles.text};
  text-align: center;
`;

const ChartCanvas = styled.svg`
  width: 100%;
  height: calc(100% - 20px);
`;

const BarRect = styled.rect<{ active?: boolean; $themeStyles: ThemeStyles }>`
  cursor: pointer;
  transition: opacity 0.2s ease;
  stroke-width: ${props => (props.active ? 2 : 1)};
  stroke: ${props => (props.active ? props.$themeStyles.primary : props.$themeStyles.border)};

  &:hover {
    opacity: 0.8;
  }
`;

const LinePoint = styled.circle<{ active?: boolean; $themeStyles: ThemeStyles }>`
  cursor: pointer;
  transition: all 0.2s ease;
  stroke-width: ${props => (props.active ? 3 : 2)};
  stroke: ${props => (props.active ? props.$themeStyles.primary : props.$themeStyles.border)};

  &:hover {
    r: ${props => parseInt(props.r?.toString() || '0') + 2};
  }
`;

const LinePath = styled.path`
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const PieSlice = styled.path<{ active?: boolean; $themeStyles: ThemeStyles }>`
  cursor: pointer;
  transition: all 0.2s ease;
  stroke-width: ${props => (props.active ? 2 : 1)};
  stroke: ${props => props.$themeStyles.background};

  &:hover {
    opacity: 0.8;
    transform: translateX(5px) translateY(5px);
  }
`;

const AxisLine = styled.line<{ $themeStyles: ThemeStyles }>`
  stroke: ${props => props.$themeStyles.border};
  stroke-width: 1;
`;

const AxisLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  fill: ${props => props.$themeStyles.text};
  text-anchor: middle;
`;

const ValueLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  fill: ${props => props.$themeStyles.text};
  text-anchor: middle;
  pointer-events: none;
`;

const Tooltip = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  background-color: ${props => props.$themeStyles.foreground};
  color: ${props => props.$themeStyles.text};
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 100;
  max-width: 200px;
  white-space: nowrap;
`;

const Legend = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  bottom: 30px;
  right: 30px;
  background-color: ${props => props.$themeStyles.foreground};
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 50;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  margin-right: 5px;
  border-radius: 2px;
`;

// Helper functions
const getDefaultColors = (): string[] => [
  '#3366CC',
  '#DC3912',
  '#FF9900',
  '#109618',
  '#990099',
  '#0099C6',
  '#DD4477',
  '#66AA00',
  '#B82E2E',
  '#316395',
];

/**
 * Bar Chart component for visualizing comparative data
 */
export const BarChart: React.FC<ChartProps> = ({
  data,
  width = '100%',
  height = '400px',
  title,
  showLegend = true,
  showTooltips = true,
  showValues = true,
  colorScale = getDefaultColors(),
  onDataPointClick,
  maxValue,
  style,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);
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
  const themeStyles = createThemeStyles(themeContext);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
      >
        <p>No data to display</p>
      </ChartContainer>
    );
  }

  // Sort data by value
  const sortedData = [...data].sort((a, b) => a.value - b.value);

  // Determine chart dimensions
  const chartWidth = 800;
  const chartHeight = 500;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const barWidth = (innerWidth / data.length) * 0.8;
  const barGap = (innerWidth / data.length) * 0.2;
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

  return (
    <ChartContainer
      width={width}
      height={height}
      ref={containerRef}
      style={style}
      $themeStyles={themeStyles}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}

      <ChartCanvas viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
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

      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          $themeStyles={themeStyles}
        >
          {tooltip.content}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend $themeStyles={themeStyles}>
          {data.map((point, i) => (
            <LegendItem
              key={`legend-${i}`}
              onClick={() => handlePointClick(point.id)}
              style={{ cursor: 'pointer' }}
            >
              <LegendColor color={point.color || colorScale[i % colorScale.length]} />
              <span>{point.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
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
  colorScale = getDefaultColors(),
  onDataPointClick,
  maxValue,
  style,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);
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
  const themeStyles = createThemeStyles(themeContext);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
      >
        <p>No data to display</p>
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

  return (
    <ChartContainer
      width={width}
      height={height}
      ref={containerRef}
      style={style}
      $themeStyles={themeStyles}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}

      <ChartCanvas viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
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
        <LinePath d={generateLinePath()} stroke={colorScale[0]} />

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

      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          $themeStyles={themeStyles}
        >
          {tooltip.content}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend $themeStyles={themeStyles}>
          {data.map((point, i) => (
            <LegendItem
              key={`legend-${i}`}
              onClick={() => handlePointClick(point.id)}
              style={{ cursor: 'pointer' }}
            >
              <LegendColor color={point.color || colorScale[i % colorScale.length]} />
              <span>{point.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
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
  colorScale = getDefaultColors(),
  onDataPointClick,
  style,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [activeSlice, setActiveSlice] = useState<string | null>(null);
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
  const themeStyles = createThemeStyles(themeContext);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
      >
        <p>No data to display</p>
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

  return (
    <ChartContainer
      width={width}
      height={height}
      ref={containerRef}
      style={style}
      $themeStyles={themeStyles}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}

      <ChartCanvas viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
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

            {/* Value label inside slice if large enough */}
            {showValues && slice.percentage > 5 && (
              <ValueLabel x={slice.labelX} y={slice.labelY} $themeStyles={themeStyles}>
                {slice.percentage.toFixed(0)}%
              </ValueLabel>
            )}

            {/* Percentage label outside for smaller slices */}
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

      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
          $themeStyles={themeStyles}
        >
          {tooltip.content}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend $themeStyles={themeStyles}>
          {data.map((point, i) => (
            <LegendItem
              key={`legend-${i}`}
              onClick={() => handleSliceClick(point.id)}
              style={{ cursor: 'pointer' }}
            >
              <LegendColor color={point.color || colorScale[i % colorScale.length]} />
              <span>
                {point.label} ({((point.value / total) * 100).toFixed(1)}%)
              </span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * DonutChart - A variation of PieChart with a hollow center
 */
export const DonutChart: React.FC<ChartProps & { innerRadius?: number }> = props => {
  const { innerRadius = 0.6, ...otherProps } = props;

  // This implementation leverages the PieChart with a white circle in the center
  return (
    <ChartContainer
      width={props.width}
      height={props.height}
      ref={React.useRef<HTMLDivElement>(null)}
      style={props.style}
    >
      {props.title && <Title>{props.title}</Title>}

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
          stroke={props.themeStyles?.background}
          strokeWidth="40"
        />
      </svg>
    </ChartContainer>
  );
};
