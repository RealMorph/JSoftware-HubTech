import React, { useState } from 'react';
import styled from '@emotion/styled';
import LeafletMap from './LeafletMap';
import LeafletMapDemo from './LeafletMapDemo';
import { Graph } from './Graph';
import DataGrid from './DataGrid';
import DataGridDemo from './DataGridDemo';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  margin-bottom: 30px;
  color: #333;
`;

const ComponentCard = styled.div`
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
`;

const ComponentTitle = styled.h2`
  margin-bottom: 20px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
`;

interface TabButtonProps {
  active: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  padding: 10px 20px;
  background-color: ${props => props.active ? '#3388ff' : 'transparent'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? '#3388ff' : '#f5f5f5'};
  }
`;

const DataVisualizationComponents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'graph' | 'grid'>('map');
  
  return (
    <Container>
      <Title>Data Visualization Components</Title>
      
      <TabContainer>
        <TabButton 
          active={activeTab === 'map'} 
          onClick={() => setActiveTab('map')}
        >
          Map
        </TabButton>
        <TabButton 
          active={activeTab === 'graph'} 
          onClick={() => setActiveTab('graph')}
        >
          Graph
        </TabButton>
        <TabButton 
          active={activeTab === 'grid'} 
          onClick={() => setActiveTab('grid')}
        >
          Data Grid
        </TabButton>
      </TabContainer>
      
      {activeTab === 'map' && (
        <ComponentCard>
          <ComponentTitle>LeafletMap Component</ComponentTitle>
          <LeafletMapDemo />
        </ComponentCard>
      )}
      
      {activeTab === 'graph' && (
        <ComponentCard>
          <ComponentTitle>Graph Component</ComponentTitle>
          <Graph 
            data={{
              nodes: [
                { id: '1', label: 'Node 1' },
                { id: '2', label: 'Node 2' },
                { id: '3', label: 'Node 3' },
                { id: '4', label: 'Node 4' },
                { id: '5', label: 'Node 5' }
              ],
              edges: [
                { id: 'edge1', source: '1', target: '2', label: 'Connection 1-2' },
                { id: 'edge2', source: '1', target: '3', label: 'Connection 1-3' },
                { id: 'edge3', source: '2', target: '4', label: 'Connection 2-4' },
                { id: 'edge4', source: '3', target: '5', label: 'Connection 3-5' },
                { id: 'edge5', source: '4', target: '5', label: 'Connection 4-5' }
              ]
            }}
            title="Sample Network Graph"
            showTooltips={true}
            physics={{
              gravity: -0.05,
              repulsion: 500,
              linkDistance: 100,
              linkStrength: 0.5,
              friction: 0.9
            }}
            width="100%"
            height="500px"
          />
        </ComponentCard>
      )}
      
      {activeTab === 'grid' && (
        <ComponentCard>
          <ComponentTitle>DataGrid Component</ComponentTitle>
          <DataGridDemo />
        </ComponentCard>
      )}
    </Container>
  );
};

export default DataVisualizationComponents;
export { LeafletMap, Graph, DataGrid }; 