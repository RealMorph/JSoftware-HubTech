import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Graph, GraphData, OrganizationChart } from './Graph';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme styles interface for consistent theming
interface ThemeStyles {
  colors: {
    background: string;
    border: string;
    text: string;
    primary: string;
    secondary: string;
  };
  spacing: {
    small: string | number;
    medium: string | number;
    large: string | number;
  };
  typography: {
    heading: {
      fontSize: string | number;
      fontWeight: string | number;
    };
    subheading: {
      fontSize: string | number;
      fontWeight: string | number;
    };
    body: {
      fontSize: string | number;
    };
  };
  borderRadius: string | number;
  shadows: {
    card: string;
  };
}

function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getSpacing, getBorderRadius, getShadow } = themeContext;
  
  return {
    colors: {
      background: getColor('background.default', '#ffffff'),
      border: getColor('border', '#e0e0e0'),
      text: getColor('text.primary', '#333333'),
      primary: getColor('primary.main', '#3f51b5'),
      secondary: getColor('secondary.main', '#f50057'),
    },
    spacing: {
      small: getSpacing('sm', '0.5rem'),
      medium: getSpacing('md', '1rem'),
      large: getSpacing('lg', '2rem'),
    },
    typography: {
      heading: {
        fontSize: getTypography('fontSize.xl', '1.5rem'),
        fontWeight: getTypography('fontWeight.bold', '700'),
      },
      subheading: {
        fontSize: getTypography('fontSize.lg', '1.25rem'),
        fontWeight: getTypography('fontWeight.semibold', '600'),
      },
      body: {
        fontSize: getTypography('fontSize.md', '1rem'),
      },
    },
    borderRadius: getBorderRadius('md', '0.375rem'),
    shadows: {
      card: getShadow('md', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'),
    },
  };
}

const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.$themeStyles.spacing.large};
`;

const DemoTitle = styled.h1<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.heading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.heading.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
  color: ${props => props.$themeStyles.colors.text};
`;

const DemoDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.body.fontSize};
  margin-bottom: ${props => props.$themeStyles.spacing.large};
  color: ${props => props.$themeStyles.colors.text};
  line-height: 1.6;
`;

const Section = styled.section<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.large};
  padding: ${props => props.$themeStyles.spacing.medium};
  background-color: ${props => props.$themeStyles.colors.background};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => props.$themeStyles.shadows.card};
  border: 1px solid ${props => props.$themeStyles.colors.border};
`;

const SectionTitle = styled.h2<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.subheading.fontSize};
  font-weight: ${props => props.$themeStyles.typography.subheading.fontWeight};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
  color: ${props => props.$themeStyles.colors.text};
`;

const SectionDescription = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.typography.body.fontSize};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
  color: ${props => props.$themeStyles.colors.text};
`;

const ControlPanel = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$themeStyles.spacing.small};
  margin-bottom: ${props => props.$themeStyles.spacing.medium};
`;

const Control = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-right: ${props => props.$themeStyles.spacing.medium};
`;

const Label = styled.label<{ $themeStyles: ThemeStyles }>`
  margin-right: ${props => props.$themeStyles.spacing.small};
  font-size: ${props => props.$themeStyles.typography.body.fontSize};
`;

const Button = styled.button<{ $themeStyles: ThemeStyles; $primary?: boolean }>`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$primary ? props.$themeStyles.colors.primary : props.$themeStyles.colors.background};
  color: ${props => props.$primary ? '#ffffff' : props.$themeStyles.colors.text};
  border: 1px solid ${props => props.$primary ? props.$themeStyles.colors.primary : props.$themeStyles.colors.border};
  border-radius: ${props => props.$themeStyles.borderRadius};
  font-size: ${props => props.$themeStyles.typography.body.fontSize};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.$primary 
      ? props.$themeStyles.colors.primary + 'dd' 
      : props.$themeStyles.colors.border + '50'};
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const ResultDisplay = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${props => props.$themeStyles.spacing.medium};
  background-color: #f5f5f5;
  border-radius: ${props => props.$themeStyles.borderRadius};
  font-family: monospace;
  margin-top: ${props => props.$themeStyles.spacing.medium};
`;

// Sample data for different types of graphs
const sampleNetworkData: GraphData = {
  nodes: [
    { id: '1', label: 'User 1', group: 'user' },
    { id: '2', label: 'User 2', group: 'user' },
    { id: '3', label: 'User 3', group: 'user' },
    { id: '4', label: 'User 4', group: 'user' },
    { id: '5', label: 'Post 1', group: 'post' },
    { id: '6', label: 'Post 2', group: 'post' },
    { id: '7', label: 'Post 3', group: 'post' },
    { id: '8', label: 'Comment 1', group: 'comment' },
    { id: '9', label: 'Comment 2', group: 'comment' },
    { id: '10', label: 'Comment 3', group: 'comment' },
  ],
  edges: [
    { id: 'e1', source: '1', target: '5', label: 'Created' },
    { id: 'e2', source: '1', target: '8', label: 'Wrote' },
    { id: 'e3', source: '2', target: '6', label: 'Created' },
    { id: 'e4', source: '2', target: '9', label: 'Wrote' },
    { id: 'e5', source: '3', target: '7', label: 'Created' },
    { id: 'e6', source: '3', target: '10', label: 'Wrote' },
    { id: 'e7', source: '4', target: '5', label: 'Liked' },
    { id: 'e8', source: '4', target: '6', label: 'Liked' },
    { id: 'e9', source: '4', target: '7', label: 'Liked' },
    { id: 'e10', source: '8', target: '5', label: 'On' },
    { id: 'e11', source: '9', target: '6', label: 'On' },
    { id: 'e12', source: '10', target: '7', label: 'On' },
  ],
};

const hierarchyData = {
  root: { id: 'CEO', label: 'CEO', group: 'executive' },
  children: {
    'CEO': ['CTO', 'CFO', 'COO'],
    'CTO': ['DevManager', 'QAManager'],
    'DevManager': ['Dev1', 'Dev2', 'Dev3'],
    'QAManager': ['QA1', 'QA2'],
    'CFO': ['Finance1', 'Finance2'],
    'COO': ['Operations1', 'Operations2'],
  }
};

const customGraphData: GraphData = {
  nodes: [
    { id: 'A', label: 'Node A', group: 'group1' },
    { id: 'B', label: 'Node B', group: 'group1' },
    { id: 'C', label: 'Node C', group: 'group2' },
    { id: 'D', label: 'Node D', group: 'group2' },
    { id: 'E', label: 'Node E', group: 'group3' },
    { id: 'F', label: 'Node F', group: 'group3' },
  ],
  edges: [
    { id: 'e1', source: 'A', target: 'B', weight: 5 },
    { id: 'e2', source: 'A', target: 'C', weight: 3 },
    { id: 'e3', source: 'B', target: 'D', weight: 4 },
    { id: 'e4', source: 'C', target: 'E', weight: 2 },
    { id: 'e5', source: 'D', target: 'F', weight: 5 },
    { id: 'e6', source: 'E', target: 'F', weight: 1 },
  ],
};

const GraphDemo: React.FC = () => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [directed, setDirected] = useState(true);
  const [weighted, setWeighted] = useState(true);
  
  // Define group colors for different node types
  const networkColors = {
    user: '#00C853',   // Brighter green
    post: '#2979FF',   // Brighter blue
    comment: '#FFA000', // Brighter amber
  };
  
  const hierarchyColors = {
    executive: '#673AB7',
    undefined: '#9C27B0',
  };
  
  const customColors = {
    group1: '#E91E63',
    group2: '#00BCD4',
    group3: '#FF9800',
  };
  
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };
  
  const handleEdgeClick = (edgeId: string) => {
    setSelectedEdgeId(edgeId);
  };
  
  return (
    <DemoContainer $themeStyles={themeStyles}>
      <DemoTitle $themeStyles={themeStyles}>Graph Visualization Demo</DemoTitle>
      <DemoDescription $themeStyles={themeStyles}>
        This demo showcases different types of graph visualizations that can be created using the Graph component.
        The component supports various graph types, directed and undirected edges, node grouping, and interactive features.
      </DemoDescription>
      
      <ControlPanel $themeStyles={themeStyles}>
        <Control $themeStyles={themeStyles}>
          <Label $themeStyles={themeStyles}>
            <input
              type="checkbox"
              checked={showLabels}
              onChange={() => setShowLabels(!showLabels)}
            />
            Show Labels
          </Label>
        </Control>
        <Control $themeStyles={themeStyles}>
          <Label $themeStyles={themeStyles}>
            <input
              type="checkbox"
              checked={showTooltips}
              onChange={() => setShowTooltips(!showTooltips)}
            />
            Show Tooltips
          </Label>
        </Control>
        <Control $themeStyles={themeStyles}>
          <Label $themeStyles={themeStyles}>
            <input
              type="checkbox"
              checked={directed}
              onChange={() => setDirected(!directed)}
            />
            Directed Edges
          </Label>
        </Control>
        <Control $themeStyles={themeStyles}>
          <Label $themeStyles={themeStyles}>
            <input
              type="checkbox"
              checked={weighted}
              onChange={() => setWeighted(!weighted)}
            />
            Weighted Edges
          </Label>
        </Control>
      </ControlPanel>
      
      {(selectedNodeId || selectedEdgeId) && (
        <ResultDisplay $themeStyles={themeStyles}>
          {selectedNodeId && <div>Selected Node: {selectedNodeId}</div>}
          {selectedEdgeId && <div>Selected Edge: {selectedEdgeId}</div>}
          <Button 
            $themeStyles={themeStyles} 
            onClick={() => {
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
          >
            Clear Selection
          </Button>
        </ResultDisplay>
      )}
      
      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Network Graph</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
          A social network style graph showing connections between users, posts, and comments.
          Different node colors represent different entity types.
        </SectionDescription>
        <Graph
          data={sampleNetworkData}
          width="100%"
          height="400px"
          directed={directed}
          weighted={weighted}
          showLabels={showLabels}
          showTooltips={showTooltips}
          colorGroups={networkColors}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          physics={{
            gravity: 0.01,
            repulsion: 150,
            linkDistance: 100,
            linkStrength: 0.1,
            friction: 0.9,
            decay: 0.95,
            centerForce: 0.03,
          }}
        />
      </Section>
      
      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Organization Chart</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
          A hierarchical organization chart showing reporting structure within a company.
        </SectionDescription>
        <OrganizationChart
          root={hierarchyData.root}
          children={hierarchyData.children}
          width="100%"
          height="500px"
          layout="vertical"
          showLabels={showLabels}
          showTooltips={showTooltips}
          colorGroups={hierarchyColors}
          onNodeClick={handleNodeClick}
        />
      </Section>
      
      <Section $themeStyles={themeStyles}>
        <SectionTitle $themeStyles={themeStyles}>Custom Graph</SectionTitle>
        <SectionDescription $themeStyles={themeStyles}>
          A custom graph with weighted edges and custom node grouping.
          Edge thickness represents the weight of the connection.
        </SectionDescription>
        <Graph
          data={customGraphData}
          width="100%"
          height="400px"
          directed={directed}
          weighted={weighted}
          showLabels={showLabels}
          showTooltips={showTooltips}
          colorGroups={customColors}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          physics={{
            gravity: 0.01,
            repulsion: 150,
            linkDistance: 120,
            linkStrength: 0.1,
            friction: 0.9,
            decay: 0.95,
            centerForce: 0.03,
          }}
        />
      </Section>
    </DemoContainer>
  );
};

export default GraphDemo; 