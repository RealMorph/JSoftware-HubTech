import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { saveAs } from 'file-saver';

// Data types
export interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
  annotation?: string;
  annotationTitle?: string;
  annotationColor?: string;
  annotationIcon?: string; // Can be used for different annotation types
}

// After DataPoint interface, add HierarchicalDataPoint interface
export interface HierarchicalDataPoint extends DataPoint {
  children?: HierarchicalDataPoint[];
  parentId?: string;
}

// Define MultilevelDataset interface for DonutChart
export interface MultilevelDataset {
  id: string;
  label: string;
  data: DataPoint[];
  radius?: number;
  innerRadius?: number;
  color?: string;
  showLabels?: boolean;
  // Add slices property to fix TypeScript error
  slices?: Array<{
    path: string;
    color: string;
    percentage: number;
    value: number;
    label: string;
    id: string;
    datasetId: string;
    datasetLabel: string;
    midAngle: number;
    labelX: number;
    labelY: number;
    showLabel: boolean;
  }>;
}

// Threshold indicator for metrics
export interface ThresholdIndicator {
  value: number;
  label?: string;
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  showLabel?: boolean;
}

// Additional interface for trendline and forecast configuration
export interface TrendlineOptions {
  color?: string;
  strokeWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  showConfidenceInterval?: boolean;
  confidenceLevel?: number; // e.g., 0.95 for 95% confidence
}

export interface ForecastOptions {
  periods?: number;
  color?: string;
  lineStyle?: 'dashed' | 'dotted';
  areaOpacity?: number;
  showConfidenceInterval?: boolean;
  confidenceLevel?: number; // e.g., 0.95 for 95% confidence
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
  thresholds?: ThresholdIndicator[];
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

// Export menu styled component
const ExportMenu = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
`;

const ExportButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.foregroundColor || '#f0f0f0'};
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 5px;
  color: ${props => props.$themeStyles.textColor};

  &:hover {
    background-color: ${props => props.$themeStyles.textSecondaryColor || '#e0e0e0'};
    color: ${props => props.$themeStyles.backgroundColor};
  }
`;

// Add new annotation components after existing styled components
const AnnotationMarker = styled.circle<{ $themeStyles: ThemeStyles; $color?: string }>`
  cursor: pointer;
  fill: ${props => props.$color || props.$themeStyles.textColor};
  stroke: ${props => props.$themeStyles.backgroundColor};
  stroke-width: 1.5;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  pointer-events: bounding-box;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const AnnotationContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  background-color: ${props => props.$themeStyles.foregroundColor};
  color: ${props => props.$themeStyles.textColor};
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: ${props => props.$themeStyles.shadow};
  max-width: 250px;
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
`;

const AnnotationTitle = styled.div<{ $themeStyles: ThemeStyles; $color?: string }>`
  font-weight: bold;
  margin-bottom: 4px;
  color: ${props => props.$color || props.$themeStyles.textColor};
  font-size: ${props => props.$themeStyles.fontSize};
`;

const AnnotationText = styled.div<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.labelFontSize};
  line-height: 1.4;
`;

// Add new time range selector components after the annotation components
const RangeSelector = styled.div<{ $themeStyles: ThemeStyles }>`
  position: relative;
  height: 30px;
  width: 100%;
  margin-top: 10px;
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: 4px;
  border: 1px solid ${props => props.$themeStyles.axisColor};
`;

const RangeTrack = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  height: 6px;
  background-color: ${props => props.$themeStyles.gridColor};
  border-radius: 3px;
`;

const RangeSelection = styled.div<{ $themeStyles: ThemeStyles; $left: number; $width: number }>`
  position: absolute;
  top: 12px;
  left: ${props => props.$left}%;
  width: ${props => props.$width}%;
  height: 6px;
  background-color: ${props => props.$themeStyles.foregroundColor};
  border-radius: 3px;
`;

const RangeHandle = styled.div<{ $themeStyles: ThemeStyles; $left: number; $isStart?: boolean; $isEnd?: boolean }>`
  position: absolute;
  top: 6px;
  left: ${props => props.$left}%;
  width: 16px;
  height: 16px;
  background-color: ${props => props.$themeStyles.foregroundColor};
  border: 2px solid ${props => props.$themeStyles.axisColor};
  border-radius: 50%;
  cursor: ew-resize;
  transform: translateX(-50%);
  z-index: 5;
  
  &:hover {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.2);
  }
`;

const RangeLabel = styled.div<{ $themeStyles: ThemeStyles; $left: number }>`
  position: absolute;
  top: -20px;
  left: ${props => props.$left}%;
  transform: translateX(-50%);
  font-size: ${props => props.$themeStyles.labelFontSize};
  color: ${props => props.$themeStyles.textSecondaryColor};
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

// Utility functions for chart exports
const exportToSVG = (chartRef: React.RefObject<HTMLDivElement>, filename: string = 'chart.svg') => {
  if (!chartRef.current) return;
  
  const svgElement = chartRef.current.querySelector('svg');
  if (!svgElement) return;
  
  // Clone the SVG to avoid modifying the displayed one
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Set proper attributes for a standalone SVG
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('version', '1.1');
  
  // Convert to string
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  
  saveAs(blob, filename);
};

const exportToPNG = async (chartRef: React.RefObject<HTMLDivElement>, filename: string = 'chart.png') => {
  if (!chartRef.current) return;
  
  const svgElement = chartRef.current.querySelector('svg');
  if (!svgElement) return;
  
  // Clone the SVG
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  
  // Set proper attributes
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  
  // Get the SVG dimensions
  const svgWidth = svgElement.clientWidth;
  const svgHeight = svgElement.clientHeight;
  
  // Create a canvas
  const canvas = document.createElement('canvas');
  canvas.width = svgWidth * 2; // Higher resolution
  canvas.height = svgHeight * 2;
  
  // Convert SVG to data URL
  const svgData = new XMLSerializer().serializeToString(clonedSvg);
  const svgURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  
  // Create Image and draw on canvas when loaded
  const image = new Image();
  image.src = svgURL;
  
  await new Promise<void>((resolve) => {
    image.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      }
      resolve();
    };
  });
  
  // Convert canvas to blob and save
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, filename);
    }
  }, 'image/png');
};

const exportToCSV = (data: Array<{ label: string; value: number; id?: string; color?: string }>, filename: string = 'chart-data.csv') => {
  // Create CSV content
  const header = 'Label,Value\n';
  const rows = data.map(item => `"${item.label}",${item.value}`).join('\n');
  const csvContent = header + rows;
  
  // Create blob and save
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, filename);
};

// Linear regression calculation to determine trendline
const calculateLinearRegression = (data: DataPoint[]) => {
  const n = data.length;
  
  if (n <= 1) return { slope: 0, intercept: 0, r2: 0 };
  
  // Convert labels to numeric if they're dates or non-numeric
  const xValues = data.map((_, i) => i);
  const yValues = data.map(d => d.value);
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yValues[i];
    sumXY += xValues[i] * yValues[i];
    sumXX += xValues[i] * xValues[i];
    sumYY += yValues[i] * yValues[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  let totalVariation = 0;
  let explainedVariation = 0;
  
  for (let i = 0; i < n; i++) {
    totalVariation += Math.pow(yValues[i] - yMean, 2);
    explainedVariation += Math.pow((slope * xValues[i] + intercept) - yMean, 2);
  }
  
  const r2 = explainedVariation / totalVariation;
  
  return { slope, intercept, r2 };
};

// Generate forecast data based on trendline
const generateForecastData = (
  data: DataPoint[], 
  regression: { slope: number; intercept: number }, 
  periods: number
): DataPoint[] => {
  if (periods <= 0) return [];
  
  const lastIndex = data.length - 1;
  const { slope, intercept } = regression;
  
  return Array.from({ length: periods }, (_, i) => {
    const forecastIndex = lastIndex + 1 + i;
    const forecastValue = slope * forecastIndex + intercept;
    return {
      id: `forecast-${i + 1}`,
      label: `Forecast ${i + 1}`,
      value: forecastValue > 0 ? forecastValue : 0, // Ensure non-negative values as appropriate
    };
  });
};

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
  showValues = false,
  colorScale = ['#4FC3F7', '#7986CB', '#4DB6AC', '#FFF176', '#FFB74D', '#F06292'],
  onDataPointClick,
  style,
  thresholds,
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
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const renderThresholds = () => {
    if (!thresholds || thresholds.length === 0) return null;
    
    return thresholds.map((threshold, index) => {
      const thresholdPosition = yScale(threshold.value);
      
      return (
        <g key={`threshold-${index}`}>
          <line
            x1={MARGIN.left}
            y1={thresholdPosition}
            x2={chartWidth - MARGIN.right}
            y2={thresholdPosition}
            stroke={threshold.color || '#FF5722'}
            strokeWidth={1.5}
            strokeDasharray={
              threshold.lineStyle === 'dashed' ? '5,5' : 
              threshold.lineStyle === 'dotted' ? '2,2' : 
              undefined
            }
          />
          {threshold.showLabel && threshold.label && (
            <text
              x={chartWidth - MARGIN.right + 5}
              y={thresholdPosition + 4}
              fontSize={themeStyles.labelFontSize}
              fill={threshold.color || '#FF5722'}
            >
              {threshold.label}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <ChartContainer 
      width={width} 
      height={height} 
      $themeStyles={themeStyles}
      style={style}
      ref={chartRef}
      data-testid="bar-chart"
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}

      {/* Export controls */}
      <ExportMenu>
        <ExportButton onClick={() => setShowExportMenu(!showExportMenu)} $themeStyles={themeStyles}>
          Export
        </ExportButton>
        {showExportMenu && (
          <>
            <ExportButton onClick={() => exportToPNG(chartRef)} $themeStyles={themeStyles}>PNG</ExportButton>
            <ExportButton onClick={() => exportToSVG(chartRef)} $themeStyles={themeStyles}>SVG</ExportButton>
            <ExportButton onClick={() => exportToCSV(data)} $themeStyles={themeStyles}>CSV</ExportButton>
          </>
        )}
      </ExportMenu>

      <svg width="100%" height={showLegend ? "85%" : "100%"}>
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

      {/* Render threshold indicators */}
      {renderThresholds()}
    </ChartContainer>
  );
};

/**
 * LineChart Component
 */
export const LineChart: React.FC<ChartProps & { 
  showTrendline?: boolean;
  trendlineOptions?: TrendlineOptions;
  showForecast?: boolean;
  forecastOptions?: ForecastOptions;
  showAnnotations?: boolean;
  enableRangeSelector?: boolean;
}> = ({
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
  showTrendline = false,
  trendlineOptions = {
    color: '#FF5722',
    strokeWidth: 2,
    lineStyle: 'dashed',
    showConfidenceInterval: false,
    confidenceLevel: 0.95
  },
  showForecast = false,
  forecastOptions = {
    periods: 3,
    color: '#9C27B0',
    lineStyle: 'dashed',
    areaOpacity: 0.1,
    showConfidenceInterval: false,
    confidenceLevel: 0.8
  },
  showAnnotations = true,
  enableRangeSelector = false
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
  
  // State for annotations
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [annotationPosition, setAnnotationPosition] = useState({ x: 0, y: 0 });
  
  // State for range selector
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(100);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  
  // State to store export menu visibility
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Add exportChart functions
  const handleExportSVG = useCallback(() => {
    exportToSVG(chartRef, 'line-chart.svg');
  }, []);

  const handleExportPNG = useCallback(() => {
    exportToPNG(chartRef, 'line-chart.png');
  }, []);

  const handleExportCSV = useCallback(() => {
    exportToCSV(data, 'line-chart-data.csv');
  }, [data]);

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Handle range selector drag events
  const handleRangeHandleMouseDown = useCallback((e: React.MouseEvent, handle: 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(handle);
  }, []);
  
  const handleRangeMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const rangeRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rangeRect.left;
    const percentage = Math.max(0, Math.min(100, (x / rangeRect.width) * 100));
    
    if (isDragging === 'start') {
      // Ensure start doesn't exceed end - min gap
      setRangeStart(Math.min(percentage, rangeEnd - 5));
    } else if (isDragging === 'end') {
      // Ensure end doesn't go below start + min gap
      setRangeEnd(Math.max(percentage, rangeStart + 5));
    }
  }, [isDragging, rangeStart, rangeEnd]);
  
  const handleRangeMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);
  
  // Add event listeners for drag end
  useEffect(() => {
    if (isDragging) {
      const handleMouseUp = () => setIsDragging(null);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging]);

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
    (event: React.MouseEvent, point: { 
      id: string;
      label: string; 
      value: number; 
      x: number; 
      y: number;
      annotation?: string;
      annotationTitle?: string;
    }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          // If point has annotation, show it in tooltip
          const tooltipText = point.annotation 
            ? `${point.label}: ${point.value}`
            : `${point.label}: ${point.value}`;
            
          setTooltip({
            show: true,
            x: point.x,
            y: point.y,
            text: tooltipText,
          });
        }
      }
    },
    [showTooltips]
  );

  const handlePointMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);
  
  // Handle annotation marker interactions
  const handleAnnotationClick = useCallback((event: React.MouseEvent, pointId: string, x: number, y: number) => {
    event.stopPropagation();
    setSelectedAnnotation(selectedAnnotation === pointId ? null : pointId);
    setAnnotationPosition({ x, y });
  }, [selectedAnnotation]);
  
  // Close annotation when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSelectedAnnotation(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Filter data based on range selector
  const getVisibleData = () => {
    if (!enableRangeSelector || data.length <= 2) return data;
    
    const startIndex = Math.floor((rangeStart / 100) * (data.length - 1));
    const endIndex = Math.ceil((rangeEnd / 100) * (data.length - 1));
    
    // Ensure we have at least 2 points
    if (endIndex - startIndex < 1) {
      return data.slice(startIndex, startIndex + 2);
    }
    
    return data.slice(startIndex, endIndex + 1);
  };
  
  const visibleData = getVisibleData();

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

  // Calculate trendline data
  const regression = calculateLinearRegression(visibleData);
  
  // Generate forecast data
  const forecastData = showForecast ? 
    generateForecastData(visibleData, regression, forecastOptions.periods || 3) : 
    [];
  
  // Create scales
  const xScale = (i: number) => MARGIN.left + (i * innerWidth) / (visibleData.length - 1 + (showForecast ? forecastData.length : 0));
  const yScale = (value: number) => {
    const allValues = [...visibleData.map(d => d.value), ...(showForecast ? forecastData.map(d => d.value) : [])];
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues.map(v => (v < 0 ? v : 0)));
    return MARGIN.top + innerHeight - ((value - minValue) * innerHeight) / (maxValue - minValue);
  };

  // Generate points for the line path
  const points = visibleData.map((d, i) => ({
    id: d.id,
    label: d.label,
    value: d.value,
    x: xScale(i),
    y: yScale(d.value),
    color: d.color || colors[i % colors.length],
    isForecast: false,
    annotation: d.annotation,
    annotationTitle: d.annotationTitle || d.label,
    annotationColor: d.annotationColor || d.color || colors[i % colors.length],
    annotationIcon: d.annotationIcon
  }));

  // Generate points for forecast
  const forecastPoints = forecastData.map((d, i) => ({
    id: d.id,
    label: d.label,
    value: d.value,
    x: xScale(visibleData.length + i),
    y: yScale(d.value),
    color: forecastOptions.color || '#9C27B0',
    isForecast: true
  }));

  // Combine actual and forecast points
  const allPoints = [...points, ...forecastPoints];

  // Create line path for actual data
  const linePath = points
    .map((point, i) => (i === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`))
    .join(' ');

  // Create line path for trendline
  const trendlinePath = showTrendline ? 
    points.map((_, i) => {
      const value = regression.slope * i + regression.intercept;
      const x = xScale(i);
      const y = yScale(value);
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    }).join(' ') : '';

  // Create line path for forecast
  const forecastPath = showForecast && forecastPoints.length > 0 ? 
    [
      `M ${points[points.length - 1].x},${points[points.length - 1].y}`,
      ...forecastPoints.map((point) => `L ${point.x},${point.y}`)
    ].join(' ') : '';

  // Create area path for forecast (for confidence interval visualization)
  const forecastAreaPath = showForecast && forecastPoints.length > 0 ? 
    [
      `M ${points[points.length - 1].x},${points[points.length - 1].y}`,
      ...forecastPoints.map((point) => `L ${point.x},${point.y}`),
      `L ${forecastPoints[forecastPoints.length - 1].x},${yScale(0)}`,
      `L ${points[points.length - 1].x},${yScale(0)}`,
      'Z'
    ].join(' ') : '';

  // Determine dash array for different line styles
  const getDashArray = (style: 'solid' | 'dashed' | 'dotted') => {
    switch (style) {
      case 'dashed': return '5,5';
      case 'dotted': return '1,3';
      default: return 'none';
    }
  };
  
  // Get currently selected annotation data
  const selectedAnnotationData = selectedAnnotation 
    ? points.find(point => point.id === selectedAnnotation)
    : null;
    
  // Get range labels for selector
  const getStartRangeLabel = () => {
    if (data.length <= 1) return '';
    const index = Math.floor((rangeStart / 100) * (data.length - 1));
    return data[index]?.label || '';
  };
  
  const getEndRangeLabel = () => {
    if (data.length <= 1) return '';
    const index = Math.ceil((rangeEnd / 100) * (data.length - 1));
    return data[Math.min(index, data.length - 1)]?.label || '';
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
      
      {/* Export Menu */}
      <ExportMenu>
        <ExportButton onClick={() => setShowExportMenu(!showExportMenu)} $themeStyles={themeStyles}>
          Export
        </ExportButton>
        {showExportMenu && (
          <>
            <ExportButton onClick={handleExportSVG} $themeStyles={themeStyles}>SVG</ExportButton>
            <ExportButton onClick={handleExportPNG} $themeStyles={themeStyles}>PNG</ExportButton>
            <ExportButton onClick={handleExportCSV} $themeStyles={themeStyles}>CSV</ExportButton>
          </>
        )}
      </ExportMenu>
      
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
        {visibleData.map((d, i) => (
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
        
        {/* Forecast X Axis Labels */}
        {showForecast && forecastPoints.map((point, i) => (
          <text
            key={`x-forecast-label-${i}`}
            x={point.x}
            y={MARGIN.top + innerHeight + 20}
            fontSize={themeStyles.labelFontSize}
            fill={themeStyles.textSecondaryColor}
            textAnchor="middle"
            fontStyle="italic"
          >
            F{i+1}
          </text>
        ))}

        {/* Y Axis Labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
          const allValues = [...visibleData.map(d => d.value), ...(showForecast ? forecastData.map(d => d.value) : [])];
          const maxValue = Math.max(...allValues);
          const minValue = Math.min(...allValues.map(v => (v < 0 ? v : 0)));
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

        {/* Forecast Area */}
        {showForecast && (
          <path
            d={forecastAreaPath}
            fill={forecastOptions.color || '#9C27B0'}
            fillOpacity={forecastOptions.areaOpacity || 0.1}
            stroke="none"
          />
        )}

        {/* Line Path */}
        <path 
          d={linePath} 
          fill="none" 
          stroke={colors[0]} 
          strokeWidth="2" 
        />
        
        {/* Trendline */}
        {showTrendline && (
          <path
            d={trendlinePath}
            fill="none"
            stroke={trendlineOptions.color || '#FF5722'}
            strokeWidth={trendlineOptions.strokeWidth || 2}
            strokeDasharray={getDashArray(trendlineOptions.lineStyle as 'solid' | 'dashed' | 'dotted')}
          />
        )}
        
        {/* Forecast Line */}
        {showForecast && (
          <path
            d={forecastPath}
            fill="none"
            stroke={forecastOptions.color || '#9C27B0'}
            strokeWidth="2"
            strokeDasharray={getDashArray(forecastOptions.lineStyle as 'solid' | 'dashed' | 'dotted')}
          />
        )}

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
            
            {/* Annotation markers */}
            {showAnnotations && point.annotation && (
              <g onClick={(e) => e.stopPropagation()}>
                <AnnotationMarker
                  cx={point.x}
                  cy={point.y - 15}
                  r={selectedAnnotation === point.id ? 8 : 6}
                  $themeStyles={themeStyles}
                  $color={point.annotationColor}
                  onClick={(e) => handleAnnotationClick(e, point.id, point.x, point.y - 25)}
                />
                {/* Icon or text inside marker */}
                <text
                  x={point.x}
                  y={point.y - 13}
                  fontSize="9px"
                  fill={themeStyles.backgroundColor}
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {point.annotationIcon || 'i'}
                </text>
              </g>
            )}
          </g>
        ))}
          
        {/* Forecast Data Points */}
        {showForecast && forecastPoints.map((point, i) => (
          <g key={`forecast-point-${i}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r={5}
              fill={point.color}
              stroke={themeStyles.backgroundColor}
              strokeWidth="2"
              cursor="pointer"
              strokeDasharray="2,2"
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
                fontStyle="italic"
              >
                {point.value.toFixed(1)}
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Time Range Selector */}
      {enableRangeSelector && data.length > 2 && (
        <RangeSelector 
          $themeStyles={themeStyles}
          onMouseMove={handleRangeMouseMove}
          onMouseUp={handleRangeMouseUp}
          onMouseLeave={handleRangeMouseUp}
        >
          <RangeTrack $themeStyles={themeStyles} />
          <RangeSelection 
            $themeStyles={themeStyles} 
            $left={rangeStart} 
            $width={rangeEnd - rangeStart} 
          />
          <RangeHandle 
            $themeStyles={themeStyles} 
            $left={rangeStart} 
            $isStart={true}
            onMouseDown={(e) => handleRangeHandleMouseDown(e, 'start')}
          />
          <RangeHandle 
            $themeStyles={themeStyles} 
            $left={rangeEnd} 
            $isEnd={true}
            onMouseDown={(e) => handleRangeHandleMouseDown(e, 'end')}
          />
          <RangeLabel $themeStyles={themeStyles} $left={rangeStart}>
            {getStartRangeLabel()}
          </RangeLabel>
          <RangeLabel $themeStyles={themeStyles} $left={rangeEnd}>
            {getEndRangeLabel()}
          </RangeLabel>
        </RangeSelector>
      )}
      
      {/* Tooltip */}
      {tooltip.show && !selectedAnnotation && (
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
      
      {/* Annotation display */}
      {selectedAnnotation && selectedAnnotationData && (
        <AnnotationContainer
          $themeStyles={themeStyles}
          style={{
            left: `${annotationPosition.x}px`,
            top: `${annotationPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)',
            opacity: selectedAnnotation ? 1 : 0
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <AnnotationTitle 
            $themeStyles={themeStyles}
            $color={selectedAnnotationData.annotationColor}
          >
            {selectedAnnotationData.annotationTitle}
          </AnnotationTitle>
          <AnnotationText $themeStyles={themeStyles}>
            {selectedAnnotationData.annotation}
          </AnnotationText>
        </AnnotationContainer>
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
          {showTrendline && (
            <LegendItem key="trendline">
              <LegendColor color={trendlineOptions.color || '#FF5722'} />
              <span style={{ color: themeStyles.textSecondaryColor }}>Trendline</span>
            </LegendItem>
          )}
          {showForecast && (
            <LegendItem key="forecast">
              <LegendColor color={forecastOptions.color || '#9C27B0'} />
              <span style={{ color: themeStyles.textSecondaryColor }}>Forecast</span>
            </LegendItem>
          )}
        </Legend>
      )}
    </ChartContainer>
  );
};

/**
 * PieChart Component
 */
export const PieChart: React.FC<ChartProps & {
  hierarchicalData?: HierarchicalDataPoint[];
  enableDrillDown?: boolean;
  maxLevels?: number;
}> = ({
  data,
  width = '100%',
  height = '300px',
  title,
  showLegend = true,
  showTooltips = true,
  colorScale,
  onDataPointClick,
  style,
  hierarchicalData,
  enableDrillDown = false,
  maxLevels = 3
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
  
  // State for tracking drill-down navigation
  const [currentLevel, setCurrentLevel] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<DataPoint[]>(data);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{id: string, label: string}>>([]);
  const [animating, setAnimating] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  
  // For export functionality
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const handleExportSVG = useCallback(() => {
    exportToSVG(chartRef, 'pie-chart.svg');
  }, []);

  const handleExportPNG = useCallback(() => {
    exportToPNG(chartRef, 'pie-chart.png');
  }, []);

  const handleExportCSV = useCallback(() => {
    exportToCSV(currentData, 'pie-chart-data.csv');
  }, [currentData]);

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Update current data when hierarchical data or level changes
  useEffect(() => {
    if (enableDrillDown && hierarchicalData) {
      if (currentLevel.length === 0) {
        // At root level
        setCurrentData(hierarchicalData);
        setBreadcrumbs([]);
      } else {
        // Navigate to selected level
        let currentHierarchy = [...hierarchicalData];
        const newBreadcrumbs: Array<{id: string, label: string}> = [];
        
        for (const levelId of currentLevel) {
          const levelItem = currentHierarchy.find(item => item.id === levelId);
          if (levelItem) {
            newBreadcrumbs.push({ id: levelItem.id, label: levelItem.label });
            if (levelItem.children) {
              currentHierarchy = levelItem.children;
            } else {
              break;
            }
          }
        }
        
        setCurrentData(currentHierarchy);
        setBreadcrumbs(newBreadcrumbs);
      }
    } else {
      setCurrentData(data);
    }
  }, [data, hierarchicalData, currentLevel, enableDrillDown]);

  // Handle drill down on slice click
  const handleSliceClick = useCallback(
    (pointId: string) => {
      if (enableDrillDown && hierarchicalData) {
        // Find if clicked slice has children
        let canDrillDown = false;
        let currentHierarchy = hierarchicalData;
        
        // Navigate to current level first
        for (const levelId of currentLevel) {
          const levelItem = currentHierarchy.find(item => item.id === levelId);
          if (levelItem && levelItem.children) {
            currentHierarchy = levelItem.children;
          }
        }
        
        // Find clicked item in current level
        const clickedItem = currentHierarchy.find(item => item.id === pointId);
        if (clickedItem && clickedItem.children && clickedItem.children.length > 0) {
          canDrillDown = true;
          
          // Start animation
          setSelectedSlice(pointId);
          setAnimating(true);
          
          // After animation completes, update level
          setTimeout(() => {
            setCurrentLevel([...currentLevel, pointId]);
            setAnimating(false);
            setSelectedSlice(null);
          }, 500);
        }
      }
      
      // Still call the original onDataPointClick handler
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick, currentLevel, enableDrillDown, hierarchicalData]
  );
  
  // Navigate back up one level
  const handleNavigateUp = useCallback(() => {
    if (currentLevel.length > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentLevel(currentLevel.slice(0, -1));
        setAnimating(false);
      }, 300);
    }
  }, [currentLevel]);
  
  // Navigate to specific breadcrumb level
  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index < currentLevel.length) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentLevel(currentLevel.slice(0, index + 1));
        setAnimating(false);
      }, 300);
    }
  }, [currentLevel]);

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

  if (!currentData || currentData.length === 0) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: currentData.length }, (_, i) => {
    const hue = (i * 360) / currentData.length;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate pie dimensions
  const totalValue = currentData.reduce((sum, item) => sum + item.value, 0);
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const radius = Math.min(chartWidth, chartHeight) / 2.5;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  
  // Breadcrumb styles
  const BreadcrumbNav = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 5px;
    font-size: ${themeStyles.labelFontSize};
  `;
  
  const BreadcrumbItem = styled.span`
    cursor: pointer;
    color: ${themeStyles.textSecondaryColor};
    &:hover {
      text-decoration: underline;
    }
  `;
  
  const BreadcrumbSeparator = styled.span`
    margin: 0 5px;
    color: ${themeStyles.textSecondaryColor};
  `;
  
  // Calculate pie slices
  let startAngle = 0;
  const slices = currentData.map((item, index) => {
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

    // For animation
    const isSelected = item.id === selectedSlice;
    const selectedRadius = isSelected ? radius * 1.1 : radius;
    
    // Calculate paths for normal and selected states
    const normalPath = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    
    const selectedPath = [
      `M ${centerX} ${centerY}`,
      `L ${centerX + selectedRadius * Math.cos(startAngle)} ${centerY + selectedRadius * Math.sin(startAngle)}`,
      `A ${selectedRadius} ${selectedRadius} 0 ${largeArcFlag} 1 ${centerX + selectedRadius * Math.cos(endAngle)} ${centerY + selectedRadius * Math.sin(endAngle)}`,
      'Z',
    ].join(' ');

    const slice = {
      path: isSelected ? selectedPath : normalPath,
      color: item.color || colors[index % colors.length],
      percentage,
      label: item.label,
      value: item.value,
      midAngle,
      labelX,
      labelY,
      id: item.id,
      startAngle,
      endAngle,
      // For drill-down visual cue
      hasDrillDown: enableDrillDown && hierarchicalData && 
        currentData.find(d => d.id === item.id && 
          ((d as HierarchicalDataPoint).children && (d as HierarchicalDataPoint).children!.length > 0)) !== undefined
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
      
      {/* Export Menu */}
      <ExportMenu>
        <ExportButton onClick={() => setShowExportMenu(!showExportMenu)} $themeStyles={themeStyles}>
          Export
        </ExportButton>
        {showExportMenu && (
          <>
            <ExportButton onClick={handleExportSVG} $themeStyles={themeStyles}>SVG</ExportButton>
            <ExportButton onClick={handleExportPNG} $themeStyles={themeStyles}>PNG</ExportButton>
            <ExportButton onClick={handleExportCSV} $themeStyles={themeStyles}>CSV</ExportButton>
          </>
        )}
      </ExportMenu>
      
      {/* Breadcrumb Navigation */}
      {enableDrillDown && breadcrumbs.length > 0 && (
        <BreadcrumbNav>
          <BreadcrumbItem onClick={() => setCurrentLevel([])}>Home</BreadcrumbItem>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
              <BreadcrumbItem onClick={() => handleBreadcrumbClick(index)}>
                {crumb.label}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbNav>
      )}
      
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Back button for drill-down */}
        {enableDrillDown && currentLevel.length > 0 && (
          <g 
            transform={`translate(20, 20)`} 
            cursor="pointer" 
            onClick={handleNavigateUp}
          >
            <circle
              r={15}
              fill={themeStyles.foregroundColor}
              stroke={themeStyles.axisColor}
              strokeWidth="1"
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fontSize={themeStyles.fontSize}
              fill={themeStyles.textColor}
            >
              ↩
            </text>
          </g>
        )}
        
        {/* Pie Slices with drill-down indicators */}
        {slices.map((slice, index) => (
          <g key={`slice-${index}`} className={animating ? 'animating' : ''}>
            <path
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
              style={{
                transition: 'all 0.3s ease-in-out'
              }}
            />
            
            {/* Drill-down indicator */}
            {slice.hasDrillDown && (
              <circle
                cx={centerX + (radius * 0.8) * Math.cos(slice.midAngle)}
                cy={centerY + (radius * 0.8) * Math.sin(slice.midAngle)}
                r={5}
                fill={themeStyles.backgroundColor}
                stroke={slice.color}
                strokeWidth="1"
              />
            )}
            
            {/* Value labels if they fit */}
            {slice.percentage > 0.05 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                fontSize={themeStyles.labelFontSize}
                fill={themeStyles.textColor}
                textAnchor="middle"
                style={{
                  pointerEvents: 'none'
                }}
              >
                {slice.label}
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
            top: `${tooltip.y - 40}px`,
          }}
        >
          {tooltip.text}
        </Tooltip>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend>
          {currentData.map((d, i) => (
            <LegendItem 
              key={d.id}
              onClick={() => enableDrillDown && handleSliceClick(d.id)}
              style={{ cursor: enableDrillDown ? 'pointer' : 'default' }}
            >
              <LegendColor color={d.color || colors[i % colors.length]} />
              <span style={{ color: themeStyles.textSecondaryColor }}>
                {d.label}
                {enableDrillDown && hierarchicalData && 
                  currentData.find(item => item.id === d.id && 
                    ((item as HierarchicalDataPoint).children && (item as HierarchicalDataPoint).children!.length > 0)) && ' →'}
              </span>
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
export const DonutChart: React.FC<ChartProps & { 
  innerRadius?: number;
  multilevelData?: MultilevelDataset[];
  showMultilevel?: boolean;
}> = ({
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
  // New props
  multilevelData = [] as MultilevelDataset[],
  showMultilevel = false
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
    datasetLabel?: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: '',
  });
  
  // Add export menu
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const handleExportSVG = useCallback(() => {
    exportToSVG(chartRef, 'donut-chart.svg');
  }, []);

  const handleExportPNG = useCallback(() => {
    exportToPNG(chartRef, 'donut-chart.png');
  }, []);

  const handleExportCSV = useCallback(() => {
    // Export all datasets for multilevel charts
    if (showMultilevel && (multilevelData as MultilevelDataset[]).length > 0) {
      const combinedData = (multilevelData as MultilevelDataset[]).flatMap(dataset => 
        dataset.data.map(d => ({
          ...d,
          dataset: dataset.label
        }))
      );
      exportToCSV(combinedData, 'multilevel-chart-data.csv');
    } else {
      exportToCSV(data, 'donut-chart-data.csv');
    }
  }, [data, showMultilevel, multilevelData]);

  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Handle actions
  const handleSliceClick = useCallback(
    (pointId: string, datasetId?: string) => {
      if (onDataPointClick) {
        onDataPointClick(pointId);
      }
    },
    [onDataPointClick]
  );

  const handleSliceMouseEnter = useCallback(
    (event: React.MouseEvent, slice: { 
      label: string; 
      value: number; 
      percentage: number; 
      datasetLabel?: string;
    }) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          const tooltipText = slice.datasetLabel 
            ? `${slice.datasetLabel} - ${slice.label}: ${slice.value} (${(slice.percentage * 100).toFixed(1)}%)`
            : `${slice.label}: ${slice.value} (${(slice.percentage * 100).toFixed(1)}%)`;
            
          setTooltip({
            show: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            text: tooltipText,
            datasetLabel: slice.datasetLabel
          });
        }
      }
    },
    [showTooltips]
  );

  const handleSliceMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);

  // Basic validation
  if (showMultilevel && (!multilevelData || (multilevelData as MultilevelDataset[]).length === 0)) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No multilevel data provided</NoDataMessage>
      </ChartContainer>
    );
  }

  if (!showMultilevel && (!data || data.length === 0)) {
    return (
      <ChartContainer width={width} height={height} $themeStyles={themeStyles} style={style}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Use themeContext directly here instead of passing themeStyles to getDefaultColors
  const defaultColors = Array.from({ length: 10 }, (_, i) => {
    const hue = (i * 360) / 10;
    return themeContext.getColor(`color.${hue}`, `hsl(${hue}, 100%, 50%)`);
  });
  const colors = colorScale || defaultColors;

  // Calculate pie dimensions
  const chartWidth = chartRef.current?.clientWidth || 500;
  const chartHeight = chartRef.current?.clientHeight || 300;
  const radius = Math.min(chartWidth, chartHeight) / 2.5;
  const centerX = chartWidth / 2;
  const centerY = chartHeight / 2;
  
  // Create a consistent color mapping for categories across datasets
  const createCategoryColorMap = () => {
    if (!showMultilevel || (multilevelData as MultilevelDataset[]).length === 0) return {};
    
    const allCategories = new Set<string>();
    (multilevelData as MultilevelDataset[]).forEach(dataset => {
      dataset.data.forEach(item => {
        allCategories.add(item.label);
      });
    });
    
    const categoryColors: Record<string, string> = {};
    Array.from(allCategories).forEach((category, index) => {
      categoryColors[category] = colors[index % colors.length];
    });
    
    return categoryColors;
  };
  
  const categoryColorMap = createCategoryColorMap();
  
  // Create slices for standard donut chart
  const createStandardSlices = () => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    return data.map((item, index) => {
      const percentage = item.value / totalValue;
      const angle = percentage * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // Calculate outer points
      const outerX1 = centerX + radius * Math.cos(startAngle);
      const outerY1 = centerY + radius * Math.sin(startAngle);
      const outerX2 = centerX + radius * Math.cos(endAngle);
      const outerY2 = centerY + radius * Math.sin(endAngle);
      
      // Calculate inner points
      const donutInnerRadius = radius * innerRadius;
      const innerX1 = centerX + donutInnerRadius * Math.cos(startAngle);
      const innerY1 = centerY + donutInnerRadius * Math.sin(startAngle);
      const innerX2 = centerX + donutInnerRadius * Math.cos(endAngle);
      const innerY2 = centerY + donutInnerRadius * Math.sin(endAngle);
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      // Create SVG path
      const path = [
        `M ${innerX1} ${innerY1}`,
        `L ${outerX1} ${outerY1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`,
        `L ${innerX2} ${innerY2}`,
        `A ${donutInnerRadius} ${donutInnerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
        'Z',
      ].join(' ');
      
      // Calculate midpoint for labels
      const midAngle = startAngle + angle / 2;
      const labelRadius = (radius + donutInnerRadius) / 2;
      const labelX = centerX + labelRadius * Math.cos(midAngle);
      const labelY = centerY + labelRadius * Math.sin(midAngle);
      
      const slice = {
        path,
        color: item.color || colors[index % colors.length],
        percentage,
        value: item.value,
        label: item.label,
        id: item.id,
        midAngle,
        labelX,
        labelY,
      };
      
      startAngle = endAngle;
      return slice;
    });
  };
  
  // Create slices for multilevel donut chart
  const createMultilevelSlices = () => {
    return (multilevelData as MultilevelDataset[]).map((dataset, datasetIndex) => {
      const totalValue = dataset.data.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      const datasetRadius = radius * (dataset.radius || (1 - (datasetIndex * 0.2)));
      const datasetInnerRadius = dataset.innerRadius !== undefined 
        ? datasetRadius * dataset.innerRadius 
        : datasetRadius - (radius * 0.15);
      
      const slices = dataset.data.map((item, itemIndex) => {
        const percentage = item.value / totalValue;
        const angle = percentage * 2 * Math.PI;
        const endAngle = startAngle + angle;
        
        // Calculate outer points
        const outerX1 = centerX + datasetRadius * Math.cos(startAngle);
        const outerY1 = centerY + datasetRadius * Math.sin(startAngle);
        const outerX2 = centerX + datasetRadius * Math.cos(endAngle);
        const outerY2 = centerY + datasetRadius * Math.sin(endAngle);
        
        // Calculate inner points
        const innerX1 = centerX + datasetInnerRadius * Math.cos(startAngle);
        const innerY1 = centerY + datasetInnerRadius * Math.sin(startAngle);
        const innerX2 = centerX + datasetInnerRadius * Math.cos(endAngle);
        const innerY2 = centerY + datasetInnerRadius * Math.sin(endAngle);
        
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        
        // Create SVG path
        const path = [
          `M ${innerX1} ${innerY1}`,
          `L ${outerX1} ${outerY1}`,
          `A ${datasetRadius} ${datasetRadius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2}`,
          `L ${innerX2} ${innerY2}`,
          `A ${datasetInnerRadius} ${datasetInnerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
          'Z',
        ].join(' ');
        
        // Calculate midpoint for labels
        const midAngle = startAngle + angle / 2;
        const labelRadius = (datasetRadius + datasetInnerRadius) / 2;
        const labelX = centerX + labelRadius * Math.cos(midAngle);
        const labelY = centerY + labelRadius * Math.sin(midAngle);
        
        const slice = {
          path,
          // Use consistent colors for the same categories across datasets
          color: item.color || categoryColorMap[item.label] || colors[itemIndex % colors.length],
          percentage,
          value: item.value,
          label: item.label,
          id: item.id,
          datasetId: dataset.id,
          datasetLabel: dataset.label,
          midAngle,
          labelX,
          labelY,
          showLabel: dataset.showLabels !== false && percentage > 0.05
        };
        
        startAngle = endAngle;
        return slice;
      });
      
      return {
        id: dataset.id,
        label: dataset.label,
        slices,
        radius: datasetRadius,
        innerRadius: datasetInnerRadius,
        color: dataset.color
      };
    });
  };
  
  const standardSlices = !showMultilevel ? createStandardSlices() : [];
  const multilevelSlices = showMultilevel ? createMultilevelSlices() : [];
  
  // For center text in donut chart
  const getCenterText = () => {
    if (showMultilevel) {
      return 'Comparison';
    }
    
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    return totalValue.toString();
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
      
      {/* Export Menu */}
      <ExportMenu>
        <ExportButton onClick={() => setShowExportMenu(!showExportMenu)} $themeStyles={themeStyles}>
          Export
        </ExportButton>
        {showExportMenu && (
          <>
            <ExportButton onClick={handleExportSVG} $themeStyles={themeStyles}>SVG</ExportButton>
            <ExportButton onClick={handleExportPNG} $themeStyles={themeStyles}>PNG</ExportButton>
            <ExportButton onClick={handleExportCSV} $themeStyles={themeStyles}>CSV</ExportButton>
          </>
        )}
      </ExportMenu>
      
      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Standard Donut Chart */}
        {!showMultilevel && standardSlices.map((slice, index) => (
          <g key={`slice-${index}`}>
            <path
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
            {showValues && slice.percentage > 0.05 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                fontSize={themeStyles.labelFontSize}
                fill={themeStyles.textColor}
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {slice.label}
              </text>
            )}
          </g>
        ))}
        
        {/* Multilevel Donut Chart */}
        {showMultilevel && (multilevelData as MultilevelDataset[]).map((dataset) => (
          <g key={`dataset-${dataset.id}`}>
            {dataset.slices && dataset.slices.map((slice, sliceIndex) => (
              <g key={`dataset-${dataset.id}-slice-${sliceIndex}`}>
                <path
                  d={slice.path}
                  fill={slice.color}
                  stroke={themeStyles.backgroundColor}
                  strokeWidth="1"
                  cursor="pointer"
                  onClick={() => handleSliceClick(slice.id, dataset.id)}
                  onMouseEnter={e =>
                    handleSliceMouseEnter(e, {
                      label: slice.label,
                      value: slice.value,
                      percentage: slice.percentage,
                      datasetLabel: dataset.label,
                    })
                  }
                  onMouseLeave={handleSliceMouseLeave}
                />
                {showValues && slice.showLabel && (
                  <text
                    x={slice.labelX}
                    y={slice.labelY}
                    fontSize={themeStyles.labelFontSize}
                    fill={themeStyles.textColor}
                    textAnchor="middle"
                    style={{ pointerEvents: 'none' }}
                  >
                    {slice.label}
                  </text>
                )}
              </g>
            ))}
            
            {/* Dataset ring label */}
            <text
              x={centerX}
              y={centerY - (dataset.radius || 0) - 10}
              fontSize={themeStyles.fontSize}
              fill={dataset.color || themeStyles.textColor}
              textAnchor="middle"
              fontWeight="bold"
            >
              {dataset.label}
            </text>
          </g>
        ))}
        
        {/* Center text for donut chart */}
        <text
          x={centerX}
          y={centerY}
          fontSize={themeStyles.fontSize}
          fontWeight="bold"
          fill={themeStyles.textColor}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {getCenterText()}
        </text>
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
      {showLegend && !showMultilevel && (
        <Legend>
          {data.map((d, i) => (
            <LegendItem key={d.id}>
              <LegendColor color={d.color || colors[i % colors.length]} />
              <span style={{ color: themeStyles.textSecondaryColor }}>{d.label}</span>
            </LegendItem>
          ))}
        </Legend>
      )}
      
      {/* Multilevel Legend */}
      {showLegend && showMultilevel && (
        <div>
          {/* Dataset Rings Legend */}
          <Legend style={{ marginBottom: '8px' }}>
            {(multilevelData as MultilevelDataset[]).map((dataset) => (
              <LegendItem key={dataset.id}>
                <LegendColor color={dataset.color || themeStyles.foregroundColor} />
                <span style={{ 
                  color: themeStyles.textColor,
                  fontWeight: 'bold'
                }}>
                  {dataset.label}
                </span>
              </LegendItem>
            ))}
          </Legend>
          
          {/* Categories Legend */}
          <Legend>
            {Object.entries(categoryColorMap).map(([category, color]) => (
              <LegendItem key={category}>
                <LegendColor color={color} />
                <span style={{ color: themeStyles.textSecondaryColor }}>{category}</span>
              </LegendItem>
            ))}
          </Legend>
        </div>
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
