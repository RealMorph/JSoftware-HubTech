import React from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Types for map components
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  value?: number;
}

export interface Region {
  id: string;
  name: string;
  path: string;
  value?: number;
}

// SimpleMap props
export interface SimpleMapProps {
  locations: Location[];
  onLocationClick?: (locationId: string) => void;
  selectedLocationId?: string;
  width?: string;
  height?: string;
  zoom?: number;
  center?: { latitude: number; longitude: number };
}

// ChoroplethMap props
export interface ChoroplethMapProps {
  regions: Region[];
  onRegionClick?: (regionId: string) => void;
  selectedRegionId?: string;
  width?: string;
  height?: string;
  colorScale?: (value: number) => string;
}

// Styled components
const MapContainer = styled.div<{width?: string; height?: string}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background-color: ${props =>
    getThemeValue(props.theme as ThemeConfig, 'colors.background')
  };
`;

const Canvas = styled.svg`
  width: 100%;
  height: 100%;
`;

const LocationMarker = styled.circle<{selected?: boolean}>`
  fill: ${props => 
    props.selected 
      ? getThemeValue(props.theme as ThemeConfig, 'colors.primary')
      : getThemeValue(props.theme as ThemeConfig, 'colors.secondary')
  };
  stroke: ${props => 
    props.selected 
      ? getThemeValue(props.theme as ThemeConfig, 'colors.primaryDark')
      : getThemeValue(props.theme as ThemeConfig, 'colors.secondaryDark')
  };
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    fill: ${props => 
      getThemeValue(props.theme as ThemeConfig, 'colors.primaryLight')
    };
    stroke: ${props => 
      getThemeValue(props.theme as ThemeConfig, 'colors.primaryDark')
    };
  }
`;

const LocationLabel = styled.text`
  font-size: 10px;
  fill: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.text')
  };
  pointer-events: none;
  user-select: none;
  text-anchor: middle;
  dominant-baseline: middle;
  transform: translateY(-14px);
`;

const RegionPath = styled.path<{selected?: boolean; fill?: string}>`
  fill: ${props => 
    props.fill || (props.selected 
      ? getThemeValue(props.theme as ThemeConfig, 'colors.primary')
      : getThemeValue(props.theme as ThemeConfig, 'colors.secondaryLight')
    )
  };
  stroke: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.border')
  };
  stroke-width: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    fill: ${props => 
      props.fill 
        ? `${props.fill}cc` /* Add transparency to the custom color */
        : getThemeValue(props.theme as ThemeConfig, 'colors.primaryLight')
    };
    stroke: ${props => 
      getThemeValue(props.theme as ThemeConfig, 'colors.primaryDark')
    };
  }
`;

// Helper for simple map projection (Mercator)
const useMapProjection = (
  locations: Location[], 
  zoom = 1, 
  center?: { latitude: number; longitude: number }
) => {
  // If no center is provided, calculate center from the locations
  const mapCenter = center || {
    latitude: locations.reduce((sum, loc) => sum + loc.latitude, 0) / Math.max(locations.length, 1),
    longitude: locations.reduce((sum, loc) => sum + loc.longitude, 0) / Math.max(locations.length, 1)
  };
  
  // Simple Mercator projection
  const projectedLocations = locations.map(location => {
    // Convert lat/long to x/y coordinates (simplified Mercator)
    const x = (location.longitude - mapCenter.longitude) * zoom * 100 + 400; // 400 is middle of 800px width
    const y = 300 - (location.latitude - mapCenter.latitude) * zoom * 100; // 300 is middle of 600px height
    
    return {
      ...location,
      x,
      y
    };
  });
  
  return projectedLocations;
};

// Default color scale for choropleth maps
const defaultColorScale = (value: number) => {
  // Generate a color from blue to red based on value (0-100)
  const normalizedValue = Math.min(Math.max(value, 0), 100) / 100;
  const r = Math.round(normalizedValue * 255);
  const b = Math.round((1 - normalizedValue) * 255);
  return `rgb(${r}, 100, ${b})`;
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
  center
}) => {
  const projectedLocations = useMapProjection(locations, zoom, center);
  
  return (
    <MapContainer width={width} height={height}>
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
              r={location.value ? 5 + (location.value / 20) : 8}
              selected={location.id === selectedLocationId}
            />
            <LocationLabel x={location.x} y={location.y}>
              {location.name}
            </LocationLabel>
          </g>
        ))}
      </Canvas>
    </MapContainer>
  );
};

/**
 * Choropleth Map component for visualizing regions with color coding
 */
export const ChoroplethMap: React.FC<ChoroplethMapProps> = ({
  regions,
  onRegionClick,
  selectedRegionId,
  width,
  height,
  colorScale = defaultColorScale
}) => {
  return (
    <MapContainer width={width} height={height}>
      <Canvas viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {/* Draw regions */}
        {regions.map(region => (
          <g key={region.id} onClick={() => onRegionClick?.(region.id)}>
            <RegionPath
              d={region.path}
              selected={region.id === selectedRegionId}
              fill={region.value !== undefined ? colorScale(region.value) : undefined}
            />
            {/* Region label - centered on the region path */}
            <LocationLabel
              x="400"
              y="300"
              style={{
                transform: 'translate(-50%, -50%)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {region.name}
            </LocationLabel>
          </g>
        ))}
      </Canvas>
    </MapContainer>
  );
}; 