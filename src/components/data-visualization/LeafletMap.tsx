import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in webpack
// @ts-ignore - Adding type ignore for image imports
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-ignore
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

interface MapContainerProps {
  height?: string;
}

const MapContainer = styled.div<MapContainerProps>`
  width: 100%;
  height: ${props => props.height || '400px'};
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const MapControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const MapButton = styled.button`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f8f8f8;
  }
`;

interface MarkerData {
  position: [number, number];
  title: string;
  popup?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  markers?: MarkerData[];
  height?: string;
  onMarkerClick?: (marker: MarkerData) => void;
}

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom,
  markers = [],
  height,
  onMarkerClick,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center and zoom when props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers when they change
  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Add new markers
    if (mapRef.current) {
      markers.forEach(markerData => {
        const marker = L.marker(markerData.position);

        if (markerData.popup) {
          marker.bindPopup(markerData.popup);
        }

        if (markerData.title) {
          marker.bindTooltip(markerData.title);
        }

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(markerData));
        }

        marker.addTo(mapRef.current!);
        markersRef.current.push(marker);
      });
    }
  }, [markers, onMarkerClick]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  };

  return (
    <MapContainer ref={mapContainerRef} height={height}>
      <MapControls>
        <MapButton onClick={handleZoomIn}>+</MapButton>
        <MapButton onClick={handleZoomOut}>-</MapButton>
        <MapButton onClick={handleReset}>Reset</MapButton>
      </MapControls>
    </MapContainer>
  );
};

export default LeafletMap;
