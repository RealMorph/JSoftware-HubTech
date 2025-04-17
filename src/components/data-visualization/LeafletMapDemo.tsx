import React, { useState } from 'react';
import styled from '@emotion/styled';
import LeafletMap from './LeafletMap';

// Define locally to match the interface in LeafletMap
interface MarkerData {
  position: [number, number];
  title: string;
  popup?: string;
}

const DemoContainer = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const MarkerInfo = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border-left: 4px solid #3388ff;
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #3388ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #2377ee;
  }
`;

const LeafletMapDemo: React.FC = () => {
  // New York City coordinates
  const initialCenter: [number, number] = [40.7128, -74.006];
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(12);

  const [selectedMarker, setSelectedMarker] = useState<{
    title: string;
    position: [number, number];
  } | null>(null);

  // Sample markers for famous locations in NYC
  const markers = [
    {
      position: [40.7484, -73.9857] as [number, number],
      title: 'Empire State Building',
      popup: 'A 102-story Art Deco skyscraper in Midtown Manhattan.',
    },
    {
      position: [40.7128, -74.006] as [number, number],
      title: 'World Trade Center',
      popup: 'The main building of the rebuilt World Trade Center complex in Lower Manhattan.',
    },
    {
      position: [40.7812, -73.9665] as [number, number],
      title: 'Central Park',
      popup: 'An urban park in Manhattan, New York City.',
    },
    {
      position: [40.7614, -73.9776] as [number, number],
      title: 'Times Square',
      popup: 'A major commercial intersection, tourist destination, and entertainment center.',
    },
  ];

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker({
      title: marker.title,
      position: marker.position,
    });

    // Center the map on the clicked marker
    setCenter(marker.position);
  };

  const handleResetView = () => {
    setCenter(initialCenter);
    setZoom(12);
    setSelectedMarker(null);
  };

  return (
    <DemoContainer>
      <Title>Interactive Map Component</Title>

      <ControlPanel>
        <Button onClick={handleResetView}>Reset View</Button>
        <Button onClick={() => setZoom(zoom + 1)}>Zoom In</Button>
        <Button onClick={() => setZoom(Math.max(3, zoom - 1))}>Zoom Out</Button>
      </ControlPanel>

      <LeafletMap
        center={center}
        zoom={zoom}
        markers={markers}
        height="500px"
        onMarkerClick={handleMarkerClick}
      />

      {selectedMarker && (
        <MarkerInfo>
          <h3>{selectedMarker.title}</h3>
          <p>Latitude: {selectedMarker.position[0].toFixed(4)}</p>
          <p>Longitude: {selectedMarker.position[1].toFixed(4)}</p>
        </MarkerInfo>
      )}
    </DemoContainer>
  );
};

export default LeafletMapDemo;
