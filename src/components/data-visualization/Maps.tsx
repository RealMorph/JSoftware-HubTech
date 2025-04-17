import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  primaryColor: string;
  primaryDarkColor: string;
  primaryLightColor: string;
  secondaryColor: string;
  secondaryDarkColor: string;
  secondaryLightColor: string;
  borderColor: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    textSecondaryColor: getColor('text.secondary', '#666666'),
    primaryColor: getColor('primary', '#3366CC'),
    primaryDarkColor: getColor('primaryDark', '#1a56cc'),
    primaryLightColor: getColor('primaryLight', '#6699ff'),
    secondaryColor: getColor('secondary', '#DC3912'),
    secondaryDarkColor: getColor('secondaryDark', '#b02e0e'),
    secondaryLightColor: getColor('secondaryLight', '#e46e54'),
    borderColor: getColor('border', '#e0e0e0'),
  };
}

// Types for map components
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  value?: number;
}

export interface SimpleMapProps {
  locations: Location[];
  // eslint-disable-next-line no-unused-vars
  onLocationClick?: (id: string) => void;
  selectedLocationId?: string;
  width?: string;
  height?: string;
  zoom?: number;
  center?: [number, number]; // [latitude, longitude]
}

// Styled components
const MapContainer = styled.div<{ width?: string; height?: string; $themeStyles: ThemeStyles }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background-color: ${props => props.$themeStyles.backgroundColor};
`;

const Canvas = styled.svg`
  width: 100%;
  height: 100%;
`;

const LocationMarker = styled.circle<{ selected?: boolean; $themeStyles: ThemeStyles }>`
  fill: ${props =>
    props.selected ? props.$themeStyles.primaryColor : props.$themeStyles.secondaryColor};
  stroke: ${props =>
    props.selected ? props.$themeStyles.primaryDarkColor : props.$themeStyles.secondaryDarkColor};
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    fill: ${props => props.$themeStyles.primaryLightColor};
    stroke: ${props => props.$themeStyles.primaryDarkColor};
  }
`;

const LocationLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  fill: ${props => props.$themeStyles.textColor};
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  user-select: none;
  transform: translateY(20px);
`;

// Simple map projection function for demo
const useMapProjection = (
  locations: Location[],
  zoom: number = 1,
  center: [number, number] = [0, 0]
) => {
  const width = 800;
  const height = 600;

  // Very simple Mercator-like projection for demo purposes
  const projectedLocations = locations.map(location => {
    const x = (location.longitude - center[1]) * zoom * 2 + width / 2;
    const y = (center[0] - location.latitude) * zoom * 2 + height / 2;

    return {
      ...location,
      x,
      y,
    };
  });

  return projectedLocations;
};

/**
 * Simple Map component for visualizing locations on a map
 */
export const SimpleMap: React.FC<SimpleMapProps> = ({
  locations,
  onLocationClick,
  selectedLocationId,
  width,
  height,
  zoom = 1,
  center = [0, 0],
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const projectedLocations = useMapProjection(locations, zoom, center);

  return (
    <MapContainer width={width} height={height} $themeStyles={themeStyles}>
      <Canvas viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {/* Draw a simple background - this could be replaced with actual country/region borders */}
        <rect x="0" y="0" width="800" height="600" fill="#f0f0f0" />

        {/* Draw grid lines */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`vgrid-${i}`}
            x1={i * 100}
            y1="0"
            x2={i * 100}
            y2="600"
            stroke="#ccc"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line
            key={`hgrid-${i}`}
            x1="0"
            y1={i * 100}
            x2="800"
            y2={i * 100}
            stroke="#ccc"
            strokeWidth="1"
          />
        ))}

        {/* Draw markers for each location */}
        {projectedLocations.map(location => (
          <g key={location.id} onClick={() => onLocationClick?.(location.id)}>
            <LocationMarker
              cx={location.x}
              cy={location.y}
              r={location.value ? 5 + location.value / 20 : 8}
              selected={location.id === selectedLocationId}
              $themeStyles={themeStyles}
            />
            <LocationLabel x={location.x} y={location.y} $themeStyles={themeStyles}>
              {location.name}
            </LocationLabel>
          </g>
        ))}
      </Canvas>
    </MapContainer>
  );
};
