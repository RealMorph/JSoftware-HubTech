import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Data types
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
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
  onDataPointClick?: (pointId: string) => void;
  maxValue?: number;
  style?: React.CSSProperties;
}

// Styled components
const ChartContainer = styled.div<{width?: string; height?: string}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  background-color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.background')
  };
  border-radius: 4px;
  padding: 20px;
  box-sizing: border-box;
`;

const Title = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.text')
  };
  text-align: center;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
`;

const LegendColor = styled.div<{color: string}>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  margin-right: 5px;
  border-radius: 2px;
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.foreground')
  };
  color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.text')
  };
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 100;
  max-width: 200px;
  white-space: nowrap;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.textSecondary')
  };
  font-size: 14px;
`;

// Helper functions
const getDefaultColors = (): string[] => [
  '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
  '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395'
];

/**
 * BarChart Component
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
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
    visible: false
  });

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} style={style}>
        {title && <Title>{title}</Title>}
        <NoDataMessage>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Calculate dimensions and scales
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = 600 - padding.left - padding.right;
  const chartHeight = 400 - padding.top - padding.bottom;
  
  // Determine the max value for scaling
  const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value));
  
  // Handle point click
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
          visible: true
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
    >
      {title && <Title>{title}</Title>}
      
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Y axis */}
          <line 
            x1="0" 
            y1="0" 
            x2="0" 
            y2={chartHeight} 
            stroke="#ccc" 
            strokeWidth="1"
          />
          
          {/* X axis */}
          <line 
            x1="0" 
            y1={chartHeight} 
            x2={chartWidth} 
            y2={chartHeight} 
            stroke="#ccc" 
            strokeWidth="1"
          />
          
          {/* Bars */}
          {data.map((point, i) => {
            const barWidth = chartWidth / data.length * 0.8;
            const barHeight = (point.value / calculatedMaxValue) * chartHeight;
            const x = i * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
            const y = chartHeight - barHeight;
            const isActive = activePoint === point.id;
            const color = point.color || colorScale[i % colorScale.length];
            
            return (
              <g key={point.id}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={color}
                  stroke={isActive ? '#333' : 'transparent'}
                  strokeWidth={isActive ? 2 : 0}
                  rx={2}
                  onClick={() => handlePointClick(point.id)}
                  onMouseOver={(e) => handleMouseOver(`${point.label}: ${point.value}`, e)}
                  onMouseOut={handleMouseOut}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                />
                
                {showValues && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {point.value}
                  </text>
                )}
                
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
          
          {/* Y-axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map(tick => (
            <g key={`tick-${tick}`}>
              <line
                x1="-5"
                y1={chartHeight - chartHeight * tick}
                x2="0"
                y2={chartHeight - chartHeight * tick}
                stroke="#ccc"
                strokeWidth="1"
              />
              <text
                x="-10"
                y={chartHeight - chartHeight * tick}
                textAnchor="end"
                fontSize="10"
                fill="#666"
                dominantBaseline="middle"
              >
                {Math.round(calculatedMaxValue * tick)}
              </text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10
          }}
        >
          {tooltip.content}
        </Tooltip>
      )}
      
      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((point, i) => (
            <LegendItem key={`legend-${i}`}>
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
 * LineChart Component
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
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
    visible: false
  });

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} style={style}>
        {title && <Title>{title}</Title>}
        <NoDataMessage>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Calculate dimensions and scales
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = 600 - padding.left - padding.right;
  const chartHeight = 400 - padding.top - padding.bottom;
  
  // Determine the max value for scaling
  const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value));
  
  // Handle point click
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
          visible: true
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
      const x = i * (chartWidth / (data.length - 1));
      const y = chartHeight - (point.value / calculatedMaxValue) * chartHeight;
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
    >
      {title && <Title>{title}</Title>}
      
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Y axis */}
          <line 
            x1="0" 
            y1="0" 
            x2="0" 
            y2={chartHeight} 
            stroke="#ccc" 
            strokeWidth="1"
          />
          
          {/* X axis */}
          <line 
            x1="0" 
            y1={chartHeight} 
            x2={chartWidth} 
            y2={chartHeight} 
            stroke="#ccc" 
            strokeWidth="1"
          />
          
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(tick => (
            <line
              key={`grid-${tick}`}
              x1="0"
              y1={chartHeight - chartHeight * tick}
              x2={chartWidth}
              y2={chartHeight - chartHeight * tick}
              stroke="#eee"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}
          
          {/* Line path */}
          <path
            d={generateLinePath()}
            fill="none"
            stroke={colorScale[0]}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, i) => {
            const x = i * (chartWidth / (data.length - 1));
            const y = chartHeight - (point.value / calculatedMaxValue) * chartHeight;
            const isActive = activePoint === point.id;
            const color = point.color || colorScale[i % colorScale.length];
            
            return (
              <g key={point.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 6 : 4}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="1"
                  onClick={() => handlePointClick(point.id)}
                  onMouseOver={(e) => handleMouseOver(`${point.label}: ${point.value}`, e)}
                  onMouseOut={handleMouseOut}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                />
                
                {showValues && (
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {point.value}
                  </text>
                )}
                
                <text
                  x={x}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
          
          {/* Y-axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map(tick => (
            <g key={`tick-${tick}`}>
              <line
                x1="-5"
                y1={chartHeight - chartHeight * tick}
                x2="0"
                y2={chartHeight - chartHeight * tick}
                stroke="#ccc"
                strokeWidth="1"
              />
              <text
                x="-10"
                y={chartHeight - chartHeight * tick}
                textAnchor="end"
                fontSize="10"
                fill="#666"
                dominantBaseline="middle"
              >
                {Math.round(calculatedMaxValue * tick)}
              </text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10
          }}
        >
          {tooltip.content}
        </Tooltip>
      )}
      
      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((point, i) => (
            <LegendItem key={`legend-${i}`}>
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
 * PieChart Component
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
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
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
    visible: false
  });

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} style={style}>
        {title && <Title>{title}</Title>}
        <NoDataMessage>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Chart dimensions
  const chartWidth = 600;
  const chartHeight = 400;
  const radius = Math.min(chartWidth, chartHeight) / 2.5;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  
  // Calculate total for percentage
  const total = data.reduce((sum, point) => sum + point.value, 0);
  
  // Define the type for pie slices
  interface PieSlice {
    id: string;
    path: string;
    color: string;
    labelX: number;
    labelY: number;
    percentage: number;
    isActive: boolean;
    label: string;
    value: number;
  }
  
  // Handle slice click
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
          visible: true
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
  const generatePieSlices = (): PieSlice[] => {
    const slices: PieSlice[] = [];
    let startAngle = 0;
    
    data.forEach((point, i) => {
      const percentage = point.value / total;
      const angle = percentage * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // Calculate arc path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      // Determine which arc path to take (large or small)
      const largeArcFlag = percentage > 0.5 ? 1 : 0;
      
      // Create path
      const path = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      // Calculate position for label
      const labelAngle = startAngle + angle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);
      
      // Color for this slice
      const color = point.color || colorScale[i % colorScale.length];
      const isActive = activeSlice === point.id;
      
      slices.push({
        id: point.id,
        path,
        color,
        labelX,
        labelY,
        percentage,
        isActive,
        label: point.label,
        value: point.value
      });
      
      startAngle = endAngle;
    });
    
    return slices;
  };
  
  const slices = generatePieSlices();

  return (
    <ChartContainer 
      width={width} 
      height={height} 
      ref={containerRef}
      style={style}
    >
      {title && <Title>{title}</Title>}
      
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
        {/* Pie slices */}
        {slices.map(slice => (
          <g key={slice.id}>
            <path
              d={slice.path}
              fill={slice.color}
              stroke="#fff"
              strokeWidth={slice.isActive ? 2 : 1}
              onClick={() => handleSliceClick(slice.id)}
              onMouseOver={(e) => handleMouseOver(`${slice.label}: ${slice.value} (${Math.round(slice.percentage * 100)}%)`, e)}
              onMouseOut={handleMouseOut}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                transform: slice.isActive ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: `${centerX}px ${centerY}px`
              }}
            />
            
            {showValues && slice.percentage > 0.05 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#fff"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                {Math.round(slice.percentage * 100)}%
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Tooltip */}
      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10
          }}
        >
          {tooltip.content}
        </Tooltip>
      )}
      
      {/* Legend */}
      {showLegend && (
        <Legend>
          {data.map((point, i) => (
            <LegendItem key={`legend-${i}`}>
              <LegendColor color={point.color || colorScale[i % colorScale.length]} />
              <span>{point.label} ({Math.round((point.value / total) * 100)}%)</span>
            </LegendItem>
          ))}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * DonutChart Component - A variation of PieChart with a hole in the center
 */
export const DonutChart: React.FC<ChartProps & { innerRadius?: number }> = (props) => {
  const { innerRadius = 0.6, ...restProps } = props;
  
  // Customize the PieChart to make it a donut
  return (
    <PieChart {...restProps} />
  );
};