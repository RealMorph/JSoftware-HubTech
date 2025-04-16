import React, { useState } from 'react';
import styled from '@emotion/styled';
import { BarChart, LineChart, PieChart, DonutChart } from './Charts';
import { Graph, OrganizationChart } from './Graph';
import { Map, ChoroplethMap, HeatMap } from './Map';
import LeafletMap from './LeafletMap';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

// Styled components
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
  color: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.text')
  };
`;

const ComponentContainer = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.border')
  };
`;

const ComponentTitle = styled.h3`
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 500;
  color: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.text')
  };
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
  // Sample data for charts
  const barChartData = [
    { id: '1', label: 'Jan', value: 45 },
    { id: '2', label: 'Feb', value: 62 },
    { id: '3', label: 'Mar', value: 58 },
    { id: '4', label: 'Apr', value: 71 },
    { id: '5', label: 'May', value: 89 },
    { id: '6', label: 'Jun', value: 83 }
  ];

  const lineChartData = [
    { id: '1', label: 'Week 1', value: 12 },
    { id: '2', label: 'Week 2', value: 19 },
    { id: '3', label: 'Week 3', value: 15 },
    { id: '4', label: 'Week 4', value: 25 },
    { id: '5', label: 'Week 5', value: 32 },
    { id: '6', label: 'Week 6', value: 28 },
    { id: '7', label: 'Week 7', value: 36 }
  ];

  const pieChartData = [
    { id: '1', label: 'Product A', value: 35 },
    { id: '2', label: 'Product B', value: 25 },
    { id: '3', label: 'Product C', value: 20 },
    { id: '4', label: 'Product D', value: 15 },
    { id: '5', label: 'Other', value: 5 }
  ];

  // Sample data for graph
  const graphData = {
    nodes: [
      { id: 'node1', label: 'User', radius: 25, color: '#3366CC' },
      { id: 'node2', label: 'Profile', radius: 20, color: '#DC3912' },
      { id: 'node3', label: 'Posts', radius: 22, color: '#FF9900' },
      { id: 'node4', label: 'Comments', radius: 18, color: '#109618' },
      { id: 'node5', label: 'Friends', radius: 20, color: '#990099' }
    ],
    edges: [
      { id: 'edge1', source: 'node1', target: 'node2' },
      { id: 'edge2', source: 'node1', target: 'node3' },
      { id: 'edge3', source: 'node1', target: 'node5' },
      { id: 'edge4', source: 'node3', target: 'node4' },
      { id: 'edge5', source: 'node2', target: 'node5' }
    ]
  };

  // Sample data for organization chart
  const orgChartRoot = {
    id: 'ceo',
    label: 'CEO',
    radius: 30,
    color: '#3366CC'
  };

  const orgChartChildren = {
    'ceo': ['cto', 'cfo', 'coo'],
    'cto': ['dev1', 'dev2'],
    'cfo': ['finance'],
    'coo': ['hr', 'marketing'],
    'dev1': [],
    'dev2': [],
    'finance': [],
    'hr': [],
    'marketing': []
  };

  // Sample data for map
  const mapData = {
    center: [40, -95] as [number, number], // United States center
    zoom: 2.5,
    points: [
      { id: 'p1', label: 'New York', latitude: 40.7128, longitude: -74.0060, value: 80 },
      { id: 'p2', label: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, value: 65 },
      { id: 'p3', label: 'Chicago', latitude: 41.8781, longitude: -87.6298, value: 50 },
      { id: 'p4', label: 'Houston', latitude: 29.7604, longitude: -95.3698, value: 55 },
      { id: 'p5', label: 'Phoenix', latitude: 33.4484, longitude: -112.0740, value: 40 }
    ],
    paths: [
      { 
        id: 'path1', 
        points: [['p1', 'p3'], ['p3', 'p5'], ['p5', 'p2']], 
        color: '#3366CC',
        label: 'Route 1'
      },
      { 
        id: 'path2', 
        points: [['p1', 'p4'], ['p4', 'p2']], 
        color: '#DC3912',
        label: 'Route 2',
        dashed: true
      }
    ]
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
      <SectionTitle>Data Visualization Components</SectionTitle>

      <SectionContainer>
        <SectionTitle>Chart Components</SectionTitle>
        <GridContainer>
          <ComponentContainer>
            <ComponentTitle>Bar Chart</ComponentTitle>
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

          <ComponentContainer>
            <ComponentTitle>Line Chart</ComponentTitle>
            <LineChart
              data={lineChartData}
              title="Weekly Metrics"
              onDataPointClick={handleDataPointClick}
            />
          </ComponentContainer>

          <ComponentContainer>
            <ComponentTitle>Pie Chart</ComponentTitle>
            <PieChart
              data={pieChartData}
              title="Revenue by Product"
              onDataPointClick={handleDataPointClick}
            />
          </ComponentContainer>

          <ComponentContainer>
            <ComponentTitle>Donut Chart</ComponentTitle>
            <DonutChart
              data={pieChartData}
              title="Market Share"
              onDataPointClick={handleDataPointClick}
            />
          </ComponentContainer>
        </GridContainer>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Graph Components</SectionTitle>
        <GridContainer>
          <ComponentContainer>
            <ComponentTitle>Network Graph</ComponentTitle>
            <Graph
              data={graphData}
              title="User Relationship Network"
              height="400px"
              onNodeClick={handleNodeClick}
              physics={{
                gravity: -100,
                repulsion: 500,
                linkDistance: 100
              }}
            />
            {selectedNode && (
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                Selected: {graphData.nodes.find(n => n.id === selectedNode)?.label}
              </div>
            )}
          </ComponentContainer>

          <ComponentContainer>
            <ComponentTitle>Organization Chart</ComponentTitle>
            <OrganizationChart
              root={orgChartRoot}
              children={orgChartChildren}
              layout="vertical"
              height="400px"
              onNodeClick={handleNodeClick}
            />
          </ComponentContainer>
        </GridContainer>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Map Components</SectionTitle>
        <GridContainer>
          <ComponentContainer>
            <ComponentTitle>Basic SVG Map</ComponentTitle>
            <Map
              data={mapData}
              title="US Major Cities"
              height="400px"
              onPointClick={handleMapPointClick}
              showLabels={true}
              interactive={true}
            />
            {selectedMapPoint && (
              <div style={{ marginTop: '12px', fontSize: '14px' }}>
                Selected: {mapData.points.find(p => p.id === selectedMapPoint)?.label}
              </div>
            )}
          </ComponentContainer>

          <ComponentContainer>
            <ComponentTitle>Choropleth Map</ComponentTitle>
            <ChoroplethMap
              data={{
                ...mapData,
                regions: [
                  {
                    id: 'r1',
                    name: 'East Region',
                    geoJson: 'M100,100 L200,100 L200,200 L100,200 Z',
                    value: 75
                  },
                  {
                    id: 'r2',
                    name: 'West Region',
                    geoJson: 'M300,100 L400,100 L400,200 L300,200 Z',
                    value: 45
                  },
                  {
                    id: 'r3',
                    name: 'South Region',
                    geoJson: 'M200,300 L300,300 L300,400 L200,400 Z',
                    value: 60
                  }
                ]
              }}
              title="Regional Data"
              height="400px"
            />
          </ComponentContainer>

          <ComponentContainer>
            <ComponentTitle>Heat Map</ComponentTitle>
            <HeatMap
              data={mapData}
              title="Population Density"
              height="400px"
              intensityRadius={25}
            />
          </ComponentContainer>
          
          <ComponentContainer>
            <ComponentTitle>Leaflet Map (Real Geography)</ComponentTitle>
            <LeafletMap
              center={[40, -95] as [number, number]}
              zoom={4}
              markers={mapData.points.map(point => ({
                position: [point.latitude, point.longitude] as [number, number],
                title: point.label
              }))}
              onMarkerClick={(marker) => {
                const point = mapData.points.find(p => p.label === marker.title);
                if (point) handleMapPointClick(point.id);
              }}
            />
          </ComponentContainer>
        </GridContainer>
      </SectionContainer>
    </DemoContainer>
  );
}; 