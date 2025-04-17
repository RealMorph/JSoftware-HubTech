import React, { useState } from 'react';
import styled from '@emotion/styled';
import { BarChart, LineChart, PieChart, DonutChart } from './Charts';
import { Graph, OrganizationChart } from './Graph';
import { Map } from './Map';
import LeafletMap from './LeafletMap';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Theme styles interface
interface ThemeStyles {
  colors: {
    text: string;
    border: string;
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      text: themeContext.getColor('text'),
      border: themeContext.getColor('border'),
    },
  };
};

// Styled components
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.$themeStyles.colors.text};
`;

const ComponentContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${props => props.$themeStyles.colors.border};
`;

const ComponentTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 500;
  color: ${props => props.$themeStyles.colors.text};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 24px;
`;

/**
 * Demo component that showcases all data visualization components
 */
export const DataVisualizationDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Sample data for charts
  const barChartData = [
    { id: '1', label: 'Jan', value: 45 },
    { id: '2', label: 'Feb', value: 62 },
    { id: '3', label: 'Mar', value: 58 },
    { id: '4', label: 'Apr', value: 71 },
    { id: '5', label: 'May', value: 89 },
    { id: '6', label: 'Jun', value: 83 },
  ];

  const lineChartData = [
    { id: '1', label: 'Week 1', value: 12 },
    { id: '2', label: 'Week 2', value: 19 },
    { id: '3', label: 'Week 3', value: 15 },
    { id: '4', label: 'Week 4', value: 25 },
    { id: '5', label: 'Week 5', value: 32 },
    { id: '6', label: 'Week 6', value: 28 },
    { id: '7', label: 'Week 7', value: 36 },
  ];

  const pieChartData = [
    { id: '1', label: 'Product A', value: 35 },
    { id: '2', label: 'Product B', value: 25 },
    { id: '3', label: 'Product C', value: 20 },
    { id: '4', label: 'Product D', value: 15 },
    { id: '5', label: 'Other', value: 5 },
  ];

  // Sample data for graph
  const graphData = {
    nodes: [
      { id: 'node1', label: 'User', radius: 25, color: '#3366CC' },
      { id: 'node2', label: 'Profile', radius: 20, color: '#DC3912' },
      { id: 'node3', label: 'Posts', radius: 22, color: '#FF9900' },
      { id: 'node4', label: 'Comments', radius: 18, color: '#109618' },
      { id: 'node5', label: 'Friends', radius: 20, color: '#990099' },
    ],
    edges: [
      { id: 'edge1', source: 'node1', target: 'node2' },
      { id: 'edge2', source: 'node1', target: 'node3' },
      { id: 'edge3', source: 'node1', target: 'node5' },
      { id: 'edge4', source: 'node3', target: 'node4' },
      { id: 'edge5', source: 'node2', target: 'node5' },
    ],
  };

  // Sample data for organization chart
  const orgChartRoot = {
    id: 'ceo',
    label: 'CEO',
    radius: 30,
    color: '#3366CC',
  };

  const orgChartChildren = {
    ceo: ['cto', 'cfo', 'coo'],
    cto: ['dev1', 'dev2'],
    cfo: ['finance'],
    coo: ['hr', 'marketing'],
    dev1: [],
    dev2: [],
    finance: [],
    hr: [],
    marketing: [],
  };

  // Sample data for map
  const mapData = {
    center: [40, -95] as [number, number], // United States center
    zoom: 2.5,
    points: [
      { id: 'p1', label: 'New York', latitude: 40.7128, longitude: -74.006, value: 80 },
      { id: 'p2', label: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, value: 65 },
      { id: 'p3', label: 'Chicago', latitude: 41.8781, longitude: -87.6298, value: 50 },
      { id: 'p4', label: 'Houston', latitude: 29.7604, longitude: -95.3698, value: 55 },
      { id: 'p5', label: 'Phoenix', latitude: 33.4484, longitude: -112.074, value: 40 },
    ],
    paths: [
      {
        id: 'path1',
        points: [
          ['p1', 'p3'],
          ['p3', 'p5'],
          ['p5', 'p2'],
        ],
        color: '#3366CC',
        label: 'Route 1',
      },
      {
        id: 'path2',
        points: [
          ['p1', 'p4'],
          ['p4', 'p2'],
        ],
        color: '#DC3912',
        label: 'Route 2',
        dashed: true,
      },
    ],
  };

  // State for tracking selections
  const [selectedDataPoint, setSelectedDataPoint] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedMapPoint, setSelectedMapPoint] = useState<string | null>(null);

  // Handlers
  const handleDataPointClick = (pointId: string) => {
    setSelectedDataPoint(selectedDataPoint === pointId ? null : pointId);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleMapPointClick = (pointId: string) => {
    setSelectedMapPoint(selectedMapPoint === pointId ? null : pointId);
  };

  return (
    <DemoContainer>
      <SectionTitle $themeStyles={themeStyles}>Data Visualization Components</SectionTitle>

      <SectionContainer>
        <SectionTitle $themeStyles={themeStyles}>Chart Components</SectionTitle>
        <GridContainer>
          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Bar Chart</ComponentTitle>
            <BarChart
              data={barChartData}
              title="Monthly Revenue"
              onDataPointClick={handleDataPointClick}
            />
            {selectedDataPoint && (
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                Selected: {barChartData.find(d => d.id === selectedDataPoint)?.label}
              </div>
            )}
          </ComponentContainer>

          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Line Chart</ComponentTitle>
            <LineChart
              data={lineChartData}
              title="Weekly Metrics"
              onDataPointClick={handleDataPointClick}
            />
          </ComponentContainer>

          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Pie Chart</ComponentTitle>
            <PieChart
              data={pieChartData}
              title="Product Distribution"
              onDataPointClick={handleDataPointClick}
            />
          </ComponentContainer>

          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Donut Chart</ComponentTitle>
            <DonutChart
              data={pieChartData}
              title="Revenue Sources"
              innerRadius={0.6}
              onDataPointClick={handleDataPointClick}
            />
          </ComponentContainer>
        </GridContainer>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle $themeStyles={themeStyles}>Graph Components</SectionTitle>
        <GridContainer>
          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Network Graph</ComponentTitle>
            <Graph data={graphData} width="100%" height="400px" onNodeClick={handleNodeClick} />
            {selectedNode && (
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                Selected: {graphData.nodes.find(n => n.id === selectedNode)?.label}
              </div>
            )}
          </ComponentContainer>

          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Organization Chart</ComponentTitle>
            <OrganizationChart
              root={orgChartRoot}
              children={orgChartChildren}
              width="100%"
              height="400px"
              onNodeClick={handleNodeClick}
            />
          </ComponentContainer>
        </GridContainer>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle $themeStyles={themeStyles}>Map Components</SectionTitle>
        <GridContainer>
          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Bubble Map</ComponentTitle>
            <Map
              data={mapData}
              width="100%"
              height="400px"
              title="US Major Cities"
              onPointClick={handleMapPointClick}
            />
            {selectedMapPoint && (
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                Selected: {mapData.points.find(p => p.id === selectedMapPoint)?.label}
              </div>
            )}
          </ComponentContainer>

          <ComponentContainer $themeStyles={themeStyles}>
            <ComponentTitle $themeStyles={themeStyles}>Leaflet Map</ComponentTitle>
            <LeafletMap center={[51.505, -0.09]} zoom={13} markers={[]} height="400px" />
          </ComponentContainer>
        </GridContainer>
      </SectionContainer>
    </DemoContainer>
  );
};
