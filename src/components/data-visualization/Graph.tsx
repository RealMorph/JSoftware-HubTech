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
    shadowColor: getShadow('sm', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'),
  };
}

// Types
export interface GraphNode {
  id: string;
  label: string;
  radius?: number;
  color?: string;
  group?: string;
  data?: any;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight?: number;
  color?: string;
  directed?: boolean;
  data?: any;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphProps {
  data: GraphData;
  width?: string;
  height?: string;
  title?: string;
  directed?: boolean;
  weighted?: boolean;
  showLabels?: boolean;
  showTooltips?: boolean;
  colorGroups?: Record<string, string>;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  style?: React.CSSProperties;
  physics?: {
    gravity?: number;
    repulsion?: number;
    linkDistance?: number;
    linkStrength?: number;
    friction?: number;
  };
}

// Styled components
const GraphContainer = styled.div<{ width?: string; height?: string; $themeStyles: ThemeStyles }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '500px'};
  position: relative;
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: 4px;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0 0 15px 0;
  font-size: 16px;
  color: ${props => props.$themeStyles.textColor};
  text-align: center;
`;

const GraphCanvas = styled.svg`
  width: 100%;
  height: calc(100% - 20px);
  user-select: none;
`;

const Edge = styled.line<{ active?: boolean; weight?: number; $themeStyles: ThemeStyles }>`
  stroke-width: ${props => (props.weight ? Math.min(Math.max(props.weight, 1), 5) : 1)};
  stroke-opacity: 0.8;
  transition: all 0.2s ease;

  &:hover {
    stroke-opacity: 1;
    stroke-width: ${props => {
      const width = props.weight ? Math.min(Math.max(props.weight, 1), 5) : 1;
      return width + 1;
    }};
    cursor: pointer;
  }
`;

const EdgePath = styled.path<{ active?: boolean; weight?: number; $themeStyles: ThemeStyles }>`
  stroke-width: ${props => (props.weight ? Math.min(Math.max(props.weight, 1), 5) : 1)};
  stroke-opacity: 0.8;
  fill: none;
  transition: all 0.2s ease;

  &:hover {
    stroke-opacity: 1;
    stroke-width: ${props => {
      const width = props.weight ? Math.min(Math.max(props.weight, 1), 5) : 1;
      return width + 1;
    }};
    cursor: pointer;
  }
`;

const Node = styled.circle<{ active?: boolean; $themeStyles: ThemeStyles }>`
  stroke-width: ${props => (props.active ? 3 : 1)};
  stroke: ${props =>
    props.active ? props.$themeStyles.primaryColor : props.$themeStyles.borderColor};
  transition: all 0.2s ease;

  &:hover {
    stroke-width: 3;
    cursor: pointer;
  }
`;

const NodeLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  fill: ${props => props.$themeStyles.textColor};
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  user-select: none;
`;

const EdgeLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 10px;
  fill: ${props => props.$themeStyles.textColor};
  text-anchor: middle;
  dominant-baseline: middle;
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
  top: 30px;
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
  border-radius: 50%;
`;

// Helper types for simulation
interface Vector {
  x: number;
  y: number;
}

interface SimulationNode extends GraphNode, Vector {
  vx: number;
  vy: number;
}

interface SimulationEdge extends GraphEdge {
  sourceNode?: SimulationNode;
  targetNode?: SimulationNode;
}

// Default physics parameters
const DEFAULT_PHYSICS = {
  gravity: 0.1,
  repulsion: 100,
  linkDistance: 100,
  linkStrength: 0.5,
  friction: 0.9,
};

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

const getNodeColor = (
  node: GraphNode,
  colorGroups: Record<string, string>,
  defaultColors: string[]
): string => {
  if (node.color) {
    return node.color;
  }

  if (node.group && colorGroups && colorGroups[node.group]) {
    return colorGroups[node.group];
  }

  if (node.group) {
    // Hash the group name to get a consistent color index
    const hash = Array.from(node.group).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
      0
    );
    const colorIndex = Math.abs(hash) % defaultColors.length;
    return defaultColors[colorIndex];
  }

  return defaultColors[0];
};

/**
 * Graph component for visualizing network data
 */
export const Graph: React.FC<GraphProps> = ({
  data,
  width = '100%',
  height = '500px',
  title,
  directed = false,
  weighted = false,
  showLabels = true,
  showTooltips = true,
  colorGroups = {},
  onNodeClick,
  onEdgeClick,
  style,
  physics = DEFAULT_PHYSICS,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const defaultColors = getDefaultColors(themeContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
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

  // Simulation state
  const [simulationNodes, setSimulationNodes] = useState<SimulationNode[]>([]);
  const [simulationEdges, setSimulationEdges] = useState<SimulationEdge[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Graph dimension state
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Initialize simulation
  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    // Convert data to simulation format
    const width = dimensions.width || 800;
    const height = dimensions.height || 600;

    // Initialize nodes with random positions
    const nodes: SimulationNode[] = data.nodes.map(node => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: node.radius || 10,
    }));

    // Initialize edges with references to nodes
    const edges: SimulationEdge[] = data.edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      return {
        ...edge,
        sourceNode,
        targetNode,
      };
    });

    setSimulationNodes(nodes);
    setSimulationEdges(edges);

    // Start simulation
    if (!isDragging) {
      startSimulation();
    }

    return () => {
      // Cancel animation on cleanup
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, dimensions]);

  // Handle dimension changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Simulation algorithm based on force-directed layout
  const runSimulation = () => {
    // Apply forces to nodes
    simulationNodes.forEach(node => {
      // Reset forces
      node.vx *= physics.friction!;
      node.vy *= physics.friction!;

      // Apply repulsive forces between nodes
      simulationNodes.forEach(otherNode => {
        if (node.id === otherNode.id) return;

        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = physics.repulsion! / (distance * distance);

        node.vx += (dx / distance) * force;
        node.vy += (dy / distance) * force;
      });

      // Apply gravity force to center
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.vx += dx * physics.gravity!;
      node.vy += dy * physics.gravity!;
    });

    // Apply spring forces for edges
    simulationEdges.forEach(edge => {
      if (!edge.sourceNode || !edge.targetNode) return;

      const dx = edge.targetNode.x - edge.sourceNode.x;
      const dy = edge.targetNode.y - edge.sourceNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      // Calculate force based on difference from ideal link distance
      const displacement = physics.linkDistance! - distance;
      const force = (displacement * physics.linkStrength!) / distance;

      // Apply force along the edge
      const fx = dx * force;
      const fy = dy * force;

      if (!isDragging || edge.sourceNode.id !== draggedNode) {
        edge.sourceNode.vx -= fx;
        edge.sourceNode.vy -= fy;
      }

      if (!isDragging || edge.targetNode.id !== draggedNode) {
        edge.targetNode.vx += fx;
        edge.targetNode.vy += fy;
      }
    });

    // Update positions
    simulationNodes.forEach(node => {
      if (isDragging && node.id === draggedNode) return;

      node.x += node.vx;
      node.y += node.vy;

      // Constrain nodes to container
      const padding = node.radius || 10;
      node.x = Math.max(padding, Math.min(dimensions.width - padding, node.x));
      node.y = Math.max(padding, Math.min(dimensions.height - padding, node.y));
    });

    // Update state to trigger re-render
    setSimulationNodes([...simulationNodes]);
    setSimulationEdges([...simulationEdges]);

    // Continue simulation
    animationRef.current = requestAnimationFrame(runSimulation);
  };

  // Start simulation
  const startSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(runSimulation);
  };

  // Handle mouse interactions
  const handleNodeMouseDown = (nodeId: string, event: React.MouseEvent) => {
    setIsDragging(true);
    setDraggedNode(nodeId);

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && draggedNode === nodeId) {
        const node = simulationNodes.find(n => n.id === nodeId);
        if (node) {
          const svg = svgRef.current;
          if (svg) {
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

            node.x = svgPoint.x;
            node.y = svgPoint.y;
            setSimulationNodes([...simulationNodes]);
            setSimulationEdges([...simulationEdges]);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedNode(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Restart simulation if it was stopped
      startSimulation();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    if (!isDragging) {
      setActiveNode(activeNode === nodeId ? null : nodeId);
      if (onNodeClick) {
        onNodeClick(nodeId);
      }
    }
  };

  // Handle edge click
  const handleEdgeClick = (edgeId: string) => {
    setActiveEdge(activeEdge === edgeId ? null : edgeId);
    if (onEdgeClick) {
      onEdgeClick(edgeId);
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

  // Empty data handling
  if (!data || !data.nodes || !data.nodes.length) {
    return (
      <GraphContainer
        width={width}
        height={height}
        ref={containerRef}
        style={style}
        $themeStyles={themeStyles}
      >
        <p>No data to display</p>
      </GraphContainer>
    );
  }

  // Generate unique groups for legend
  const uniqueGroups: Record<string, string> = {};
  simulationNodes.forEach(node => {
    if (node.group && !uniqueGroups[node.group]) {
      uniqueGroups[node.group] = getNodeColor(node, colorGroups, defaultColors);
    }
  });

  // Generate path for directed edges
  const generateDirectedEdgePath = (edge: SimulationEdge): string => {
    if (!edge.sourceNode || !edge.targetNode) return '';

    const sourceX = edge.sourceNode.x;
    const sourceY = edge.sourceNode.y;
    const targetX = edge.targetNode.x;
    const targetY = edge.targetNode.y;

    // Calculate length and direction
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const sourceRadius = edge.sourceNode.radius || 10;
    const targetRadius = edge.targetNode.radius || 10;

    // Adjust start and end points to account for node radius
    const startX = sourceX + (dx / length) * sourceRadius;
    const startY = sourceY + (dy / length) * sourceRadius;
    const endX = targetX - (dx / length) * (targetRadius + 5); // +5 for arrowhead
    const endY = targetY - (dy / length) * (targetRadius + 5);

    // Control points for curve (optional)
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const offset = 0; // Can be adjusted for curved edges

    // Calculate perpendicular offset for control point
    const perpX = (-dy / length) * offset;
    const perpY = (dx / length) * offset;
    const controlX = midX + perpX;
    const controlY = midY + perpY;

    // Generate path
    if (offset !== 0) {
      return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    } else {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
  };

  // Generate arrowhead for directed edges
  const generateArrowhead = (edge: SimulationEdge): { d: string; transform: string } => {
    if (!edge.sourceNode || !edge.targetNode) return { d: '', transform: '' };

    const sourceX = edge.sourceNode.x;
    const sourceY = edge.sourceNode.y;
    const targetX = edge.targetNode.x;
    const targetY = edge.targetNode.y;

    // Calculate angle
    const angle = (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;

    // Calculate position
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const targetRadius = edge.targetNode.radius || 10;
    const arrowX = targetX - (dx / length) * targetRadius;
    const arrowY = targetY - (dy / length) * targetRadius;

    // Arrow path
    const arrowPath = 'M -6 -4 L 0 0 L -6 4 Z';
    const arrowTransform = `translate(${arrowX}, ${arrowY}) rotate(${angle})`;

    return { d: arrowPath, transform: arrowTransform };
  };

  return (
    <GraphContainer width={width} height={height} style={style} $themeStyles={themeStyles}>
      {title && <Title $themeStyles={themeStyles}>{title}</Title>}

      <GraphCanvas
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Render edges */}
        {simulationEdges.map(edge => {
          const isActive = activeEdge === edge.id;

          if (directed && edge.sourceNode && edge.targetNode) {
            const sourceX = edge.sourceNode.x;
            const sourceY = edge.sourceNode.y;
            const targetX = edge.targetNode.x;
            const targetY = edge.targetNode.y;

            const pathString = generateDirectedEdgePath(edge);
            const arrowhead = generateArrowhead(edge);

            return (
              <g key={edge.id}>
                <EdgePath
                  d={pathString}
                  stroke={edge.color || '#999'}
                  active={isActive}
                  weight={edge.weight || 1}
                  $themeStyles={themeStyles}
                  onClick={() => handleEdgeClick(edge.id)}
                  onMouseOver={e => handleMouseOver(`${edge.label || edge.id}`, e)}
                  onMouseOut={handleMouseOut}
                />
                {edge.label && showLabels && (
                  <EdgeLabel
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 - 10}
                    $themeStyles={themeStyles}
                  >
                    {edge.label}
                  </EdgeLabel>
                )}
                {/* Arrow for directed graph */}
                <path d={arrowhead.d} fill={edge.color || '#999'} transform={arrowhead.transform} />
              </g>
            );
          }

          return edge.sourceNode && edge.targetNode ? (
            <g key={edge.id}>
              <Edge
                x1={edge.sourceNode.x}
                y1={edge.sourceNode.y}
                x2={edge.targetNode.x}
                y2={edge.targetNode.y}
                stroke={edge.color || '#999'}
                active={isActive}
                weight={edge.weight || 1}
                $themeStyles={themeStyles}
                onClick={() => handleEdgeClick(edge.id)}
                onMouseOver={e => handleMouseOver(`${edge.label || edge.id}`, e)}
                onMouseOut={handleMouseOut}
              />
              {edge.label && showLabels && (
                <EdgeLabel
                  x={(edge.sourceNode.x + edge.targetNode.x) / 2}
                  y={(edge.sourceNode.y + edge.targetNode.y) / 2 - 5}
                  $themeStyles={themeStyles}
                >
                  {edge.label}
                </EdgeLabel>
              )}
            </g>
          ) : null;
        })}

        {/* Render nodes */}
        {simulationNodes.map(node => {
          const isActive = activeNode === node.id;
          const color = getNodeColor(node, colorGroups, defaultColors);
          const radius = node.radius || 10;

          return (
            <g key={node.id}>
              <Node
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={color}
                active={isActive}
                $themeStyles={themeStyles}
                onMouseDown={e => handleNodeMouseDown(node.id, e)}
                onClick={() => handleNodeClick(node.id)}
                onMouseOver={e => handleMouseOver(`${node.label || node.id}`, e)}
                onMouseOut={handleMouseOut}
              />
              {showLabels && (
                <NodeLabel x={node.x} y={node.y + radius + 12} $themeStyles={themeStyles}>
                  {node.label}
                </NodeLabel>
              )}
            </g>
          );
        })}
      </GraphCanvas>

      {tooltip.visible && (
        <Tooltip
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
          $themeStyles={themeStyles}
        >
          {tooltip.content}
        </Tooltip>
      )}

      {/* Render legend for node groups */}
      {Object.keys(uniqueGroups).length > 0 && (
        <Legend $themeStyles={themeStyles}>
          {Object.entries(uniqueGroups).map(([group, color]) => (
            <LegendItem key={group} $themeStyles={themeStyles}>
              <LegendColor color={color as string} />
              {group}
            </LegendItem>
          ))}
        </Legend>
      )}
    </GraphContainer>
  );
};

/**
 * OrganizationChart - A specialized graph for hierarchical structures
 */
export const OrganizationChart: React.FC<
  Omit<GraphProps, 'data'> & {
    root: GraphNode;
    children: Record<string, string[]>;
    layout?: 'vertical' | 'horizontal';
  }
> = ({ root, children, layout = 'vertical', ...props }) => {
  // Convert hierarchy data to graph data
  const convertToGraph = (): GraphData => {
    const nodes: GraphNode[] = [root];
    const edges: GraphEdge[] = [];

    // Function to recursively add nodes and edges
    const addChildrenToGraph = (parentId: string) => {
      const childIds = children[parentId] || [];

      childIds.forEach(childId => {
        // Find existing node or add a new one
        const existingNode = nodes.find(n => n.id === childId);

        if (!existingNode) {
          nodes.push({
            id: childId,
            label: childId,
          });
        }

        // Add edge
        edges.push({
          id: `${parentId}-${childId}`,
          source: parentId,
          target: childId,
          directed: true,
        });

        // Process this node's children
        addChildrenToGraph(childId);
      });
    };

    // Start with the root's children
    addChildrenToGraph(root.id);

    return { nodes, edges };
  };

  const graphData = convertToGraph();

  // Customize physics for hierarchical layout
  const hierarchyPhysics = {
    ...DEFAULT_PHYSICS,
    gravity: layout === 'vertical' ? 0.05 : 0.05,
    repulsion: 150,
    linkDistance: 100,
    linkStrength: 0.7,
    friction: 0.9,
  };

  return <Graph data={graphData} directed={true} physics={hierarchyPhysics} {...props} />;
};
