import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  foregroundColor: string;
  primaryColor: string;
  borderColor: string;
  backgroundHighlightColor: string;
  shadowColor: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    textSecondaryColor: getColor('text.secondary', '#666666'),
    foregroundColor: getColor('foreground', '#ffffff'),
    primaryColor: getColor('primary', '#3366CC'),
    borderColor: getColor('border', '#e0e0e0'),
    backgroundHighlightColor: getColor('backgroundHighlight', '#f5f5f5'),
    shadowColor: getShadow('sm', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'),
  };
}

// Types
export interface GeoPoint {
  id: string;
  label?: string;
  latitude: number;
  longitude: number;
  value?: number;
  color?: string;
  group?: string;
  icon?: string;
  data?: any;
}

export interface GeoPath {
  id: string;
  points: [string, string][] | string[][]; // Allow both tuple format and string array format
  label?: string;
  color?: string;
  width?: number;
  dashed?: boolean;
  data?: any;
}

export interface MapRegion {
  id: string;
  name: string;
  geoJson: any;
  color?: string;
  value?: number;
  data?: any;
}

export interface MapData {
  center?: [number, number]; // [latitude, longitude]
  zoom?: number;
  points?: GeoPoint[];
  paths?: GeoPath[];
  regions?: MapRegion[];
}

export interface MapProps {
  data: MapData;
  width?: string;
  height?: string;
  title?: string;
  showLabels?: boolean;
  showTooltips?: boolean;
  colorScale?: string[];
  mapStyle?: 'light' | 'dark' | 'satellite' | 'outdoor';
  onPointClick?: (pointId: string) => void;
  onRegionClick?: (regionId: string) => void;
  onPathClick?: (pathId: string) => void;
  style?: React.CSSProperties;
  interactive?: boolean;
  heatmap?: boolean;
  legend?: boolean;
}

// Styled components
const MapContainer = styled.div<{ width?: string; height?: string; $themeStyles: ThemeStyles }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '500px'};
  position: relative;
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: 4px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: ${props => props.$themeStyles.textColor};
  text-align: center;
`;

const MapCanvas = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #e5e3df;
`;

// Use SVG for simple maps when needed
const SvgMap = styled.svg`
  width: 100%;
  height: 100%;
  user-select: none;
`;

const MapPoint = styled.circle<{ active?: boolean; $themeStyles: ThemeStyles }>`
  stroke-width: ${props => (props.active ? 3 : 1)};
  stroke: ${props =>
    props.active ? props.$themeStyles.primaryColor : props.$themeStyles.borderColor};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    stroke-width: 3;
    r: ${props => parseInt(props.r?.toString() || '0') + 2};
  }
`;

const MapPath = styled.path<{ active?: boolean; dashed?: boolean; $themeStyles: ThemeStyles }>`
  fill: none;
  stroke-width: ${props => (props.active ? 3 : 2)};
  stroke-dasharray: ${props => (props.dashed ? '5,5' : 'none')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    stroke-width: 4;
  }
`;

const MapRegionPath = styled.path<{ active?: boolean; $themeStyles: ThemeStyles }>`
  stroke-width: 1;
  stroke: ${props => props.$themeStyles.borderColor};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const MapPointLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  fill: ${props => props.$themeStyles.textColor};
  text-anchor: middle;
  pointer-events: none;
  user-select: none;
`;

const Tooltip = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  background-color: ${props => props.$themeStyles.foregroundColor};
  color: ${props => props.$themeStyles.textColor};
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: ${props => props.$themeStyles.shadowColor};
  pointer-events: none;
  z-index: 100;
  max-width: 200px;
  white-space: normal;
`;

const Legend = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  bottom: 30px;
  right: 30px;
  background-color: ${props => props.$themeStyles.foregroundColor};
  padding: 10px;
  border-radius: 4px;
  box-shadow: ${props => props.$themeStyles.shadowColor};
  z-index: 50;
`;

const LegendItem = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
  color: ${props => props.$themeStyles.textColor};
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  margin-right: 5px;
  border-radius: 3px;
`;

const LegendGradient = styled.div`
  width: 150px;
  height: 20px;
  margin: 5px 0;
  border-radius: 3px;
  background: linear-gradient(to right, #3366cc, #dc3912, #ff9900, #109618);
`;

const MapControls = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 50;
`;

const ControlButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.foregroundColor};
  color: ${props => props.$themeStyles.textColor};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  border-radius: 4px;
  padding: 6px 10px;
  margin: 0 5px 5px 0;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.$themeStyles.backgroundHighlightColor};
  }
`;

const FallbackMessage = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${props => props.$themeStyles.textSecondaryColor};
  font-size: 14px;
  text-align: center;
  padding: 20px;
`;

// Helper functions
const getDefaultColors = (themeContext: ReturnType<typeof useDirectTheme>): string[] => {
  const { getColor } = themeContext;

  return [
    getColor('primary', '#3366CC'),
    getColor('secondary', '#DC3912'),
    getColor('warning', '#FF9900'),
    getColor('success', '#109618'),
    getColor('purple', '#990099'),
    getColor('info', '#0099C6'),
    getColor('pink', '#DD4477'),
    getColor('lime', '#66AA00'),
    getColor('error', '#B82E2E'),
    getColor('indigo', '#316395'),
  ];
};

const interpolateColor = (value: number, min: number, max: number, colors: string[]): string => {
  // Normalize value between 0 and 1
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Calculate which segment of the color scale we're in
  const segment = normalizedValue * (colors.length - 1);
  const index = Math.floor(segment);
  const t = segment - index;

  // If we're at the max, return the last color
  if (index >= colors.length - 1) return colors[colors.length - 1];

  // Otherwise, interpolate between two colors
  const color1 = colors[index];
  const color2 = colors[index + 1];

  // Parse the colors
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  // Interpolate
  const r = Math.round(r1 * (1 - t) + r2 * t);
  const g = Math.round(g1 * (1 - t) + g2 * t);
  const b = Math.round(b1 * (1 - t) + b2 * t);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Simple map projection functions
const mercatorProjection = {
  // Convert lat/lng to x/y coordinates
  project: (lat: number, lng: number, width: number, height: number): [number, number] => {
    // Simple Mercator projection
    const x = (lng + 180) * (width / 360);
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = height / 2 - (width * mercN) / (2 * Math.PI);
    return [x, y];
  },

  // Convert x/y to lat/lng
  unproject: (x: number, y: number, width: number, height: number): [number, number] => {
    const lng = (x * 360) / width - 180;
    const mercN = ((height / 2 - y) / width) * (2 * Math.PI);
    const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
    const lat = (latRad * 180) / Math.PI;
    return [lat, lng];
  },
};

/**
 * Map component for geographic visualization
 */
export const Map: React.FC<MapProps> = ({
  data,
  width = '100%',
  height = '500px',
  title,
  showLabels = true,
  showTooltips = true,
  colorScale,
  mapStyle = 'light',
  onPointClick,
  onRegionClick,
  onPathClick,
  style,
  interactive = true,
  heatmap = false,
  legend = true,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const defaultColors = getDefaultColors(themeContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(data.zoom || 1);
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

  // For dragging
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Determine colors to use
  const colors = colorScale || defaultColors;

  // For simplification, center on provided center or default to world center
  const center = data.center || [0, 0];

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Project geographic coordinates to screen coordinates
  const projectPoint = (lat: number, lng: number): [number, number] => {
    const [baseX, baseY] = mercatorProjection.project(
      lat,
      lng,
      dimensions.width,
      dimensions.height
    );

    // Apply pan and zoom
    const x = (baseX - dimensions.width / 2) * zoom + dimensions.width / 2 + pan.x;
    const y = (baseY - dimensions.height / 2) * zoom + dimensions.height / 2 + pan.y;

    return [x, y];
  };

  // Handle point click
  const handlePointClick = (pointId: string) => {
    setActivePointId(activePointId === pointId ? null : pointId);
    if (onPointClick) {
      onPointClick(pointId);
    }
  };

  // Handle path click
  const handlePathClick = (pathId: string) => {
    setActivePathId(activePathId === pathId ? null : pathId);
    if (onPathClick) {
      onPathClick(pathId);
    }
  };

  // Handle region click
  const handleRegionClick = (regionId: string) => {
    setActiveRegionId(activeRegionId === regionId ? null : regionId);
    if (onRegionClick) {
      onRegionClick(regionId);
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

  // Handle map drag
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!interactive) return;

    setIsDragging(true);
    setStartDragPos({
      x: event.clientX,
      y: event.clientY,
    });
    setStartPan({ ...pan });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!interactive || !isDragging) return;

    const dx = event.clientX - startDragPos.x;
    const dy = event.clientY - startDragPos.y;

    setPan({
      x: startPan.x + dx,
      y: startPan.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoomIn = () => {
    if (!interactive) return;
    setZoom(prev => Math.min(prev * 1.5, 10));
  };

  const handleZoomOut = () => {
    if (!interactive) return;
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleReset = () => {
    if (!interactive) return;
    setPan({ x: 0, y: 0 });
    setZoom(data.zoom || 1);
  };

  // Handle wheel zoom
  const handleWheel = (event: React.WheelEvent) => {
    if (!interactive) return;

    // Don't call preventDefault directly, which causes errors with passive event listeners
    // event.preventDefault();

    // Zoom in or out based on wheel direction
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(10, prev * zoomFactor)));
  };

  // Generate a path string for lines connecting points
  const generatePathString = (path: GeoPath): string => {
    if (!data.points) return '';

    const pathPoints: string[] = [];

    path.points.forEach(([sourceId, targetId]) => {
      const sourcePoint = data.points?.find(p => p.id === sourceId);
      const targetPoint = data.points?.find(p => p.id === targetId);

      if (sourcePoint && targetPoint) {
        const [sourceX, sourceY] = projectPoint(sourcePoint.latitude, sourcePoint.longitude);
        const [targetX, targetY] = projectPoint(targetPoint.latitude, targetPoint.longitude);

        pathPoints.push(`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`);
      }
    });

    return pathPoints.join(' ');
  };

  // Handle empty or invalid data
  if (!data || (!data.points && !data.regions)) {
    return (
      <MapContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
      >
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        <MapCanvas ref={canvasRef}>
          <FallbackMessage $themeStyles={themeStyles}>
            No geographic data to display
          </FallbackMessage>
        </MapCanvas>
      </MapContainer>
    );
  }

  // Find min/max values for coloring
  let minValue = Infinity;
  let maxValue = -Infinity;

  // Check points for values
  data.points?.forEach(point => {
    if (point.value !== undefined) {
      minValue = Math.min(minValue, point.value);
      maxValue = Math.max(maxValue, point.value);
    }
  });

  // Check regions for values
  data.regions?.forEach(region => {
    if (region.value !== undefined) {
      minValue = Math.min(minValue, region.value);
      maxValue = Math.max(maxValue, region.value);
    }
  });

  // If no values found, set defaults
  if (minValue === Infinity) minValue = 0;
  if (maxValue === -Infinity) maxValue = 100;

  return (
    <MapContainer
      width={width}
      height={height}
      ref={containerRef}
      style={style}
      $themeStyles={themeStyles}
    >
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}

      <MapCanvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
      >
        <SvgMap>
          {/* Render regions */}
          {data.regions?.map(region => {
            const isActive = activeRegionId === region.id;
            let fillColor = region.color || '#e5e5e5';

            // Apply color based on value if in heatmap mode
            if (heatmap && region.value !== undefined) {
              fillColor = interpolateColor(region.value, minValue, maxValue, colors);
            }

            // Simplified approach - in a real component we'd parse actual GeoJSON
            // This is just for demo purposes
            return (
              <MapRegionPath
                key={`region-${region.id}`}
                d={region.geoJson}
                fill={fillColor}
                fillOpacity={0.7}
                active={isActive}
                $themeStyles={themeStyles}
                onClick={() => handleRegionClick(region.id)}
                onMouseOver={e => handleMouseOver(region.name || region.id, e)}
                onMouseOut={handleMouseOut}
              />
            );
          })}

          {/* Render paths */}
          {data.paths?.map(path => {
            const isActive = activePathId === path.id;
            const pathString = generatePathString(path);

            return (
              <MapPath
                key={`path-${path.id}`}
                d={pathString}
                stroke={path.color || '#666'}
                strokeWidth={path.width || 2}
                active={isActive}
                dashed={path.dashed}
                $themeStyles={themeStyles}
                onClick={() => handlePathClick(path.id)}
                onMouseOver={e => handleMouseOver(path.label || path.id, e)}
                onMouseOut={handleMouseOut}
              />
            );
          })}

          {/* Render points */}
          {data.points?.map(point => {
            const isActive = activePointId === point.id;
            const [x, y] = projectPoint(point.latitude, point.longitude);
            let pointColor = point.color || colors[0];

            // Apply color based on value if in heatmap mode
            if (heatmap && point.value !== undefined) {
              pointColor = interpolateColor(point.value, minValue, maxValue, colors);
            }

            // Skip if point is off-screen (with buffer)
            if (x < -50 || x > dimensions.width + 50 || y < -50 || y > dimensions.height + 50) {
              return null;
            }

            return (
              <g key={`point-${point.id}`}>
                <MapPoint
                  cx={x}
                  cy={y}
                  r={point.value ? Math.min(Math.max((point.value / maxValue) * 15, 5), 20) : 8}
                  fill={pointColor}
                  fillOpacity={0.7}
                  active={isActive}
                  $themeStyles={themeStyles}
                  onClick={() => handlePointClick(point.id)}
                  onMouseOver={e => handleMouseOver(point.label || point.id, e)}
                  onMouseOut={handleMouseOut}
                />

                {showLabels && point.label && (
                  <MapPointLabel x={x} y={y + 20} $themeStyles={themeStyles}>
                    {point.label}
                  </MapPointLabel>
                )}
              </g>
            );
          })}
        </SvgMap>
      </MapCanvas>

      {/* Map controls */}
      {interactive && (
        <MapControls>
          <ControlButton onClick={handleZoomIn} $themeStyles={themeStyles}>
            +
          </ControlButton>
          <ControlButton onClick={handleZoomOut} $themeStyles={themeStyles}>
            −
          </ControlButton>
          <ControlButton onClick={handleReset} $themeStyles={themeStyles}>
            Reset
          </ControlButton>
        </MapControls>
      )}

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

      {/* Legend for heatmap */}
      {legend && heatmap && (
        <Legend $themeStyles={themeStyles}>
          <div>Value Range</div>
          <LegendGradient />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span>{minValue.toFixed(1)}</span>
            <span>{maxValue.toFixed(1)}</span>
          </div>
        </Legend>
      )}
    </MapContainer>
  );
};

/**
 * Choropleth Map - A map that colors regions based on data values
 */
export const ChoroplethMap: React.FC<Omit<MapProps, 'heatmap'>> = props => {
  return <Map {...props} heatmap={true} />;
};

/**
 * HeatMap - A specialized map for showing intensity of point data
 */
export const HeatMap: React.FC<
  Omit<MapProps, 'heatmap'> & {
    intensityRadius?: number;
    blur?: number;
  }
> = ({ intensityRadius, blur, ...props }) => {
  // In a real component, we'd implement an actual heatmap layer
  // For now, we'll just use the base map with heatmap mode enabled
  return <Map {...props} heatmap={true} />;
};

      )}
    </MapContainer>
  );
};

/**
 * Choropleth Map - A map that colors regions based on data values
 */
export const ChoroplethMap: React.FC<Omit<MapProps, 'heatmap'>> = props => {
  return <Map {...props} heatmap={true} />;
};

/**
 * HeatMap - A specialized map for showing intensity of point data
 */
export const HeatMap: React.FC<
  Omit<MapProps, 'heatmap'> & {
    intensityRadius?: number;
    blur?: number;
  }
> = ({ intensityRadius, blur, ...props }) => {
  // In a real component, we'd implement an actual heatmap layer
  // For now, we'll just use the base map with heatmap mode enabled
  return <Map {...props} heatmap={true} />;
};
