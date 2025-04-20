import React, { useMemo, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../core/theme/ThemeContext';

// Interface for data points
export interface ScatterPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  category?: string;
  // Add additional properties for dimensionality reduction
  originalDimensions?: number[];
}

// Interface for cluster data
interface Cluster {
  id: string;
  x: number; 
  y: number;
  count: number;
  points: ScatterPoint[];
  color?: string;
}

// Props interface
export interface ScatterChartProps {
  data: ScatterPoint[];
  width?: string;
  height?: string;
  title?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  showLegend?: boolean;
  showTooltips?: boolean;
  colorScale?: string[];
  sizeScale?: [number, number];
  onPointClick?: (pointId: string) => void;
  style?: React.CSSProperties;
  showRegressionLine?: boolean;
  showQuadrants?: boolean;
  quadrantLabels?: string[];
  // Add new props for clustering and dimensionality reduction
  enableClustering?: boolean;
  clusterThreshold?: number;
  clusterRadius?: number;
  dimensionReductionMethod?: 'none' | 'pca' | 'tsne';
  dimensionReductionSettings?: {
    perplexity?: number;
    iterations?: number;
  };
  dimensions?: number;
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
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
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

const AxisLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  fill: ${props => props.$themeStyles.textSecondaryColor};
  font-size: ${props => props.$themeStyles.labelFontSize};
  text-anchor: middle;
`;

const ClusterCircle = styled.circle`
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ClusterCounter = styled.text<{ $themeStyles: ThemeStyles }>`
  fill: ${props => props.$themeStyles.foregroundColor};
  font-size: ${props => props.$themeStyles.labelFontSize};
  text-anchor: middle;
  dominant-baseline: middle;
  font-weight: bold;
  pointer-events: none;
`;

const DimensionControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: center;
`;

const ControlButton = styled.button<{ $themeStyles: ThemeStyles; $active?: boolean }>`
  background-color: ${props => props.$active ? props.$themeStyles.primary : props.$themeStyles.foregroundColor};
  color: ${props => props.$active ? 'white' : props.$themeStyles.textColor};
  border: 1px solid ${props => props.$themeStyles.axisColor};
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: ${props => props.$themeStyles.labelFontSize};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.$active ? props.$themeStyles.primary : props.$themeStyles.highlight};
  }
`;

// Function to create ThemeStyles from ThemeContext
function createThemeStyles(theme: ReturnType<typeof useTheme>): ThemeStyles {
  return {
    backgroundColor: theme.colors.background,
    textColor: theme.colors.text.primary,
    textSecondaryColor: theme.colors.text.secondary,
    foregroundColor: theme.colors.surface,
    axisColor: theme.colors.border,
    gridColor: theme.colors.hover.background,
    fontSize: theme.typography.fontSize.sm,
    labelFontSize: theme.typography.fontSize.xs,
    shadow: theme.shadows.sm,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.info,
    highlight: theme.colors.hover.background
  };
}

// Calculate linear regression
function calculateRegressionLine(data: ScatterPoint[]): { slope: number; intercept: number } {
  // Need at least 2 points for a line
  if (data.length < 2) {
    return { slope: 0, intercept: 0 };
  }

  // Calculate means
  const n = data.length;
  const sumX = data.reduce((acc, point) => acc + point.x, 0);
  const sumY = data.reduce((acc, point) => acc + point.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  // Calculate slope
  const numerator = data.reduce((acc, point) => acc + (point.x - meanX) * (point.y - meanY), 0);
  const denominator = data.reduce((acc, point) => acc + Math.pow(point.x - meanX, 2), 0);
  
  // Avoid division by zero
  const slope = denominator === 0 ? 0 : numerator / denominator;
  
  // Calculate intercept (y = mx + b => b = y - mx)
  const intercept = meanY - slope * meanX;

  return { slope, intercept };
}

// Function to perform simple clustering of points
function clusterPoints(
  data: ScatterPoint[], 
  xScale: (value: number) => number, 
  yScale: (value: number) => number, 
  radius: number
): Cluster[] {
  if (!data || data.length === 0) return [];
  
  const clusters: Cluster[] = [];
  const assignedPoints = new Set<string>();
  
  // Iterate through all points
  for (const point of data) {
    // Skip if already assigned to a cluster
    if (assignedPoints.has(point.id)) continue;
    
    // Calculate pixel coordinates
    const pixelX = xScale(point.x);
    const pixelY = yScale(point.y);
    
    // Find nearby points within the radius
    const nearbyPoints = data.filter(p => {
      if (assignedPoints.has(p.id)) return false;
      
      const pX = xScale(p.x);
      const pY = yScale(p.y);
      const distance = Math.sqrt(Math.pow(pixelX - pX, 2) + Math.pow(pixelY - pY, 2));
      
      return distance <= radius;
    });
    
    // If there are nearby points, create a cluster
    if (nearbyPoints.length > 1) {
      // Calculate average position
      const sumX = nearbyPoints.reduce((sum, p) => sum + p.x, 0);
      const sumY = nearbyPoints.reduce((sum, p) => sum + p.y, 0);
      const avgX = sumX / nearbyPoints.length;
      const avgY = sumY / nearbyPoints.length;
      
      // Get majority category for color
      const categories: Record<string, number> = {};
      nearbyPoints.forEach(p => {
        if (p.category) {
          categories[p.category] = (categories[p.category] || 0) + 1;
        }
      });
      
      let dominantCategory = '';
      let maxCount = 0;
      
      Object.entries(categories).forEach(([category, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantCategory = category;
        }
      });
      
      // Create cluster
      const cluster: Cluster = {
        id: `cluster-${clusters.length}`,
        x: avgX,
        y: avgY,
        count: nearbyPoints.length,
        points: nearbyPoints,
        color: nearbyPoints[0].color
      };
      
      clusters.push(cluster);
      
      // Mark points as assigned
      nearbyPoints.forEach(p => assignedPoints.add(p.id));
    }
  }
  
  // Add remaining unclustered points
  for (const point of data) {
    if (!assignedPoints.has(point.id)) {
      clusters.push({
        id: `point-${point.id}`,
        x: point.x,
        y: point.y,
        count: 1,
        points: [point],
        color: point.color
      });
      
      assignedPoints.add(point.id);
    }
  }
  
  return clusters;
}

// Simple PCA implementation for 2D projection
function performPCA(data: ScatterPoint[], dimensions: number = 2): ScatterPoint[] {
  if (!data || data.length === 0 || !data[0].originalDimensions) {
    return data;
  }
  
  // This is a very simplified PCA implementation
  // For a real application, you would use a proper PCA library
  
  // 1. Center the data (mean = 0)
  const originalDims = data[0].originalDimensions.length;
  const means = new Array(originalDims).fill(0);
  
  // Calculate means
  data.forEach(point => {
    if (point.originalDimensions) {
      point.originalDimensions.forEach((val, i) => {
        means[i] += val;
      });
    }
  });
  
  means.forEach((_, i) => {
    means[i] /= data.length;
  });
  
  // Center data
  const centeredData = data.map(point => {
    if (!point.originalDimensions) return point;
    
    return {
      ...point,
      centeredDimensions: point.originalDimensions.map((val, i) => val - means[i])
    };
  });
  
  // 2. For simplicity, we'll just use the first two dimensions as projection
  // In a real implementation, you'd calculate the covariance matrix and eigenvectors
  
  return centeredData.map(point => {
    if (!point.centeredDimensions) return point;
    
    // Project to 2D - in a real implementation this would use eigenvectors
    return {
      ...point,
      x: point.centeredDimensions[0],
      y: dimensions > 1 ? point.centeredDimensions[1] : 0
    };
  });
}

/**
 * ScatterChart Component for visualizing relationships between two variables
 */
export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  width = '100%',
  height = '400px',
  title,
  xAxisTitle = 'X Axis',
  yAxisTitle = 'Y Axis',
  xMin,
  xMax,
  yMin,
  yMax,
  showLegend = true,
  showTooltips = true,
  colorScale,
  sizeScale = [4, 20],
  onPointClick,
  style,
  showRegressionLine = false,
  showQuadrants = false,
  quadrantLabels = ['Q1', 'Q2', 'Q3', 'Q4'],
  // New props
  enableClustering = false,
  clusterThreshold = 10, // Min points before clustering activates
  clusterRadius = 30,     // Pixel radius for clustering
  dimensionReductionMethod = 'none',
  dimensionReductionSettings = { perplexity: 30, iterations: 1000 },
  dimensions = 2
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
  
  // State for dimension reduction method
  const [currentDimMethod, setCurrentDimMethod] = useState(dimensionReductionMethod);

  const theme = useTheme();
  const themeStyles = useMemo(() => createThemeStyles(theme), [theme]);

  // Apply dimensionality reduction if needed
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let processed = [...data];
    
    // Apply dimension reduction if selected
    if (currentDimMethod === 'pca' && data[0]?.originalDimensions) {
      processed = performPCA(data, dimensions);
    }
    // Implementation of t-SNE would go here
    // This would require a dedicated library
    
    return processed;
  }, [data, currentDimMethod, dimensions]);

  // Extract categories for legend
  const categories = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    const uniqueCategories = new Set<string>();
    processedData.forEach(point => {
      if (point.category) {
        uniqueCategories.add(point.category);
      }
    });
    
    return Array.from(uniqueCategories);
  }, [processedData]);

  // Define callback functions
  const handlePointClick = useCallback(
    (pointId: string) => {
      if (onPointClick) {
        onPointClick(pointId);
      }
    },
    [onPointClick]
  );
  
  const handlePointMouseEnter = useCallback(
    (event: React.MouseEvent, point: ScatterPoint) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            text: `${point.label}: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})${point.category ? ` - ${point.category}` : ''}`,
          });
        }
      }
    },
    [showTooltips]
  );
  
  const handleClusterMouseEnter = useCallback(
    (event: React.MouseEvent, cluster: Cluster) => {
      if (showTooltips) {
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltip({
            show: true,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            text: `Cluster: ${cluster.count} points - (${cluster.x.toFixed(1)}, ${cluster.y.toFixed(1)})`,
          });
        }
      }
    },
    [showTooltips]
  );

  const handlePointMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, show: false }));
  }, []);

  // Return no data message if no data available
  if (!processedData || processedData.length === 0) {
    return (
      <ChartContainer
        ref={chartRef}
        width={width}
        height={height}
        style={style}
        $themeStyles={themeStyles}
      >
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <NoDataMessage $themeStyles={themeStyles}>No data to display</NoDataMessage>
      </ChartContainer>
    );
  }

  // Calculate domain for x and y axis
  const xDomain = [
    xMin !== undefined ? xMin : Math.min(...processedData.map(point => point.x)),
    xMax !== undefined ? xMax : Math.max(...processedData.map(point => point.x)),
  ];

  const yDomain = [
    yMin !== undefined ? yMin : Math.min(...processedData.map(point => point.y)),
    yMax !== undefined ? yMax : Math.max(...processedData.map(point => point.y)),
  ];

  // Calculate chart dimensions
  const MARGIN = { top: 40, right: 40, bottom: 50, left: 60 };
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 500;
  const innerWidth = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  // Scale functions to convert data values to pixel positions
  const xScale = (value: number) => MARGIN.left + ((value - xDomain[0]) * innerWidth) / (xDomain[1] - xDomain[0]);
  const yScale = (value: number) => MARGIN.top + innerHeight - ((value - yDomain[0]) * innerHeight) / (yDomain[1] - yDomain[0]);

  // Calculate the midpoints for the quadrants
  const midX = (xDomain[0] + xDomain[1]) / 2;
  const midY = (yDomain[0] + yDomain[1]) / 2;

  // Get the default color for points
  const getDefaultColors = () => {
    if (colorScale && colorScale.length > 0) {
      return colorScale;
    }
    
    return [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.error,
      theme.colors.info
    ];
  };

  // Function to determine point size
  const getPointSize = (size?: number) => {
    const [minSize, maxSize] = sizeScale;
    
    if (size === undefined) {
      return minSize;
    }
    
    // Map size to the size scale
    const sizeValues = processedData.map(p => p.size || 1);
    const minSizeValue = Math.min(...sizeValues);
    const maxSizeValue = Math.max(...sizeValues);
    
    if (minSizeValue === maxSizeValue) {
      return (minSize + maxSize) / 2;
    }
    
    const sizeRange = maxSizeValue - minSizeValue;
    const normalizedSize = (size - minSizeValue) / sizeRange;
    
    return minSize + normalizedSize * (maxSize - minSize);
  };

  // Function to determine point color
  const getPointColor = (point: ScatterPoint, index: number) => {
    if (point.color) {
      return point.color;
    }
    
    const colors = getDefaultColors();
    
    if (point.category) {
      const categoryIndex = categories.indexOf(point.category);
      if (categoryIndex >= 0) {
        return colors[categoryIndex % colors.length];
      }
    }
    
    return colors[index % colors.length];
  };
  
  // Determine if we should cluster based on data density
  const shouldCluster = enableClustering && processedData.length > clusterThreshold;
  
  // Create clusters if needed
  const clusters = shouldCluster 
    ? clusterPoints(processedData, xScale, yScale, clusterRadius) 
    : [];

  // Calculate regression line
  const regression = calculateRegressionLine(processedData);
  
  return (
    <ChartContainer
      ref={chartRef}
      width={width}
      height={height}
      style={style}
      $themeStyles={themeStyles}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}
      
      {/* Dimension reduction controls if needed */}
      {data[0]?.originalDimensions && (
        <DimensionControls>
          <ControlButton 
            $themeStyles={themeStyles} 
            $active={currentDimMethod === 'none'}
            onClick={() => setCurrentDimMethod('none')}
          >
            Raw Data
          </ControlButton>
          <ControlButton 
            $themeStyles={themeStyles} 
            $active={currentDimMethod === 'pca'}
            onClick={() => setCurrentDimMethod('pca')}
          >
            PCA
          </ControlButton>
          <ControlButton 
            $themeStyles={themeStyles} 
            $active={currentDimMethod === 'tsne'}
            onClick={() => setCurrentDimMethod('tsne')}
          >
            t-SNE
          </ControlButton>
        </DimensionControls>
      )}

      <svg width="100%" height="calc(100% - 60px)" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}>
        {/* Background grid */}
        <g>
          {/* Horizontal grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = MARGIN.top + (innerHeight * i) / 4;
            return (
              <line
                key={`h-grid-${i}`}
                x1={MARGIN.left}
                y1={y}
                x2={MARGIN.left + innerWidth}
                y2={y}
                stroke={themeStyles.gridColor}
                strokeWidth="1"
              />
            );
          })}

          {/* Vertical grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const x = MARGIN.left + (innerWidth * i) / 4;
            return (
              <line
                key={`v-grid-${i}`}
                x1={x}
                y1={MARGIN.top}
                x2={x}
                y2={MARGIN.top + innerHeight}
                stroke={themeStyles.gridColor}
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Axes */}
        <g>
          {/* X-axis */}
          <line
            x1={MARGIN.left}
            y1={MARGIN.top + innerHeight}
            x2={MARGIN.left + innerWidth}
            y2={MARGIN.top + innerHeight}
            stroke={themeStyles.axisColor}
            strokeWidth="2"
          />

          {/* Y-axis */}
          <line
            x1={MARGIN.left}
            y1={MARGIN.top}
            x2={MARGIN.left}
            y2={MARGIN.top + innerHeight}
            stroke={themeStyles.axisColor}
            strokeWidth="2"
          />

          {/* X-axis ticks and labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const x = MARGIN.left + (innerWidth * i) / 4;
            const value = xDomain[0] + ((xDomain[1] - xDomain[0]) * i) / 4;
            return (
              <g key={`x-tick-${i}`}>
                <line
                  x1={x}
                  y1={MARGIN.top + innerHeight}
                  x2={x}
                  y2={MARGIN.top + innerHeight + 5}
                  stroke={themeStyles.axisColor}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={MARGIN.top + innerHeight + 20}
                  fill={themeStyles.textSecondaryColor}
                  fontSize={themeStyles.labelFontSize}
                  textAnchor="middle"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Y-axis ticks and labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = MARGIN.top + (innerHeight * i) / 4;
            const value = yDomain[1] - ((yDomain[1] - yDomain[0]) * i) / 4;
            return (
              <g key={`y-tick-${i}`}>
                <line
                  x1={MARGIN.left - 5}
                  y1={y}
                  x2={MARGIN.left}
                  y2={y}
                  stroke={themeStyles.axisColor}
                  strokeWidth="2"
                />
                <text
                  x={MARGIN.left - 10}
                  y={y}
                  fill={themeStyles.textSecondaryColor}
                  fontSize={themeStyles.labelFontSize}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Axis titles */}
          <AxisLabel
            x={MARGIN.left + innerWidth / 2}
            y={MARGIN.top + innerHeight + 40}
            $themeStyles={themeStyles}
          >
            {xAxisTitle}
          </AxisLabel>
          <AxisLabel
            x={MARGIN.left - 40}
            y={MARGIN.top + innerHeight / 2}
            $themeStyles={themeStyles}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${MARGIN.left - 40}px ${MARGIN.top + innerHeight / 2}px` }}
          >
            {yAxisTitle}
          </AxisLabel>
        </g>

        {/* Quadrants if enabled */}
        {showQuadrants && (
          <g>
            {/* Vertical divider */}
            <line
              x1={xScale(midX)}
              y1={MARGIN.top}
              x2={xScale(midX)}
              y2={MARGIN.top + innerHeight}
              stroke={themeStyles.axisColor}
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Horizontal divider */}
            <line
              x1={MARGIN.left}
              y1={yScale(midY)}
              x2={MARGIN.left + innerWidth}
              y2={yScale(midY)}
              stroke={themeStyles.axisColor}
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Quadrant labels */}
            <text
              x={xScale(midX) + innerWidth / 4}
              y={yScale(midY) - innerHeight / 4}
              fill={themeStyles.textSecondaryColor}
              fontSize={themeStyles.fontSize}
              textAnchor="middle"
            >
              {quadrantLabels[0]}
            </text>
            <text
              x={xScale(midX) - innerWidth / 4}
              y={yScale(midY) - innerHeight / 4}
              fill={themeStyles.textSecondaryColor}
              fontSize={themeStyles.fontSize}
              textAnchor="middle"
            >
              {quadrantLabels[1]}
            </text>
            <text
              x={xScale(midX) - innerWidth / 4}
              y={yScale(midY) + innerHeight / 4}
              fill={themeStyles.textSecondaryColor}
              fontSize={themeStyles.fontSize}
              textAnchor="middle"
            >
              {quadrantLabels[2]}
            </text>
            <text
              x={xScale(midX) + innerWidth / 4}
              y={yScale(midY) + innerHeight / 4}
              fill={themeStyles.textSecondaryColor}
              fontSize={themeStyles.fontSize}
              textAnchor="middle"
            >
              {quadrantLabels[3]}
            </text>
          </g>
        )}

        {/* Regression line if enabled */}
        {showRegressionLine && (
          <line
            x1={xScale(xDomain[0])}
            y1={yScale(regression.slope * xDomain[0] + regression.intercept)}
            x2={xScale(xDomain[1])}
            y2={yScale(regression.slope * xDomain[1] + regression.intercept)}
            stroke={themeStyles.accent}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Data points or clusters */}
        <g>
          {shouldCluster ? (
            // Render clusters
            clusters.map((cluster, i) => (
              <g key={`cluster-${i}`}>
                <ClusterCircle
                  cx={xScale(cluster.x)}
                  cy={yScale(cluster.y)}
                  r={Math.max(10, Math.min(30, 10 + cluster.count))}
                  fill={cluster.color || getPointColor(cluster.points[0], i)}
                  stroke={themeStyles.foregroundColor}
                  strokeWidth="1"
                  onClick={() => cluster.points.forEach(p => handlePointClick(p.id))}
                  onMouseEnter={e => handleClusterMouseEnter(e, cluster)}
                  onMouseLeave={handlePointMouseLeave}
                />
                {cluster.count > 1 && (
                  <ClusterCounter
                    x={xScale(cluster.x)}
                    y={yScale(cluster.y)}
                    $themeStyles={themeStyles}
                  >
                    {cluster.count}
                  </ClusterCounter>
                )}
              </g>
            ))
          ) : (
            // Render individual points
            processedData.map((point, i) => (
              <circle
                key={`point-${point.id}`}
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={getPointSize(point.size)}
                fill={getPointColor(point, i)}
                stroke={themeStyles.foregroundColor}
                strokeWidth="1"
                opacity="0.7"
                cursor="pointer"
                onClick={() => handlePointClick(point.id)}
                onMouseEnter={e => handlePointMouseEnter(e, point)}
                onMouseLeave={handlePointMouseLeave}
              />
            ))
          )}
        </g>
      </svg>

      {/* Legend */}
      {showLegend && categories.length > 0 && (
        <Legend>
          {categories.map((category, i) => (
            <LegendItem key={`legend-${i}`}>
              <LegendColor color={getDefaultColors()[i % getDefaultColors().length]} />
              <span>{category}</span>
            </LegendItem>
          ))}
          
          {/* Show regression line in legend if enabled */}
          {showRegressionLine && (
            <LegendItem>
              <svg width="20" height="12">
                <line
                  x1="0"
                  y1="6"
                  x2="20"
                  y2="6"
                  stroke={themeStyles.accent}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
              <span>Regression Line</span>
            </LegendItem>
          )}
        </Legend>
      )}

      {/* Tooltip */}
      {tooltip.show && (
        <Tooltip
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
          $themeStyles={themeStyles}
        >
          {tooltip.text}
        </Tooltip>
      )}
    </ChartContainer>
  );
}; 