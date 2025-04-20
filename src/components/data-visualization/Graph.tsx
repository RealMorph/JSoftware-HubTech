import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import type { ThemeConfig } from '../../core/theme/consolidated-types';
import { themeDefaults } from '../../core/theme/theme-defaults';

// Define theme style interface
interface ThemeStyles {
  colors: {
    primary: string;
    secondary: string;
    info: string;
    text: {
      primary: string;
      secondary: string;
    };
    surface: string;
    background: string;
    node: {
      default: string;
      hover: string;
      active: string;
      text: string;
    };
    edge: {
      default: string;
      hover: string;
      active: string;
      text: string;
    };
  };
  typography: {
    fontFamily: string | number;
    fontSize: {
      sm: string | number;
      md: string | number;
      lg: string | number;
    };
    fontWeight: {
      normal: string | number;
      medium: string | number;
      bold: string | number;
    };
    lineHeight: {
      tight: string | number;
      normal: string | number;
      relaxed: string | number;
    };
  };
  spacing: {
    xs: string | number;
    sm: string | number;
    md: string | number;
    lg: string | number;
    xl: string | number;
  };
  borderRadius: {
    sm: string | number;
    md: string | number;
    lg: string | number;
  };
  shadows: {
    md: string | number;
    lg: string | number;
  };
  animation: {
    duration: {
      short: string | number;
      medium: string | number;
      long: string | number;
    };
    easing: {
      easeInOut: string | number;
      easeOut: string | number;
      easeIn: string | number;
    };
  };
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(theme: ReturnType<typeof useDirectTheme>): ThemeStyles {
  if (!theme) {
    // Create a default theme style that matches the ThemeStyles interface
    return {
      colors: {
        primary: '#000',
        secondary: '#666',
        info: '#0088cc',
        text: {
          primary: '#000',
          secondary: '#666'
        },
        surface: '#fff',
        background: '#f5f5f5',
        node: {
          default: '#007AFF',
          hover: '#5AC8FA',
          active: '#5856D6',
          text: '#FFFFFF',
        },
        edge: {
          default: '#C7C7CC',
          hover: '#5AC8FA',
          active: '#5856D6',
          text: '#3C3C43',
        },
      },
      typography: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: {
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          bold: 700,
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.625,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
      shadows: {
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        duration: {
          short: '150ms',
          medium: '300ms',
          long: '500ms',
        },
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        },
      },
    };
  }

  return {
    colors: {
      primary: theme.getColor('colors.primary'),
      secondary: theme.getColor('colors.secondary'),
      info: theme.getColor('colors.info'),
      text: {
        primary: theme.getColor('colors.text.primary'),
        secondary: theme.getColor('colors.text.secondary')
      },
      surface: theme.getColor('colors.surface'),
      background: theme.getColor('colors.background'),
      node: {
        default: theme.getColor('colors.primary'),
        hover: theme.getColor('colors.primary.hover'),
        active: theme.getColor('colors.primary.active'),
        text: theme.getColor('colors.text.primary'),
      },
      edge: {
        default: theme.getColor('colors.border'),
        hover: theme.getColor('colors.primary.hover'),
        active: theme.getColor('colors.primary.active'),
        text: theme.getColor('colors.text.secondary'),
      },
    },
    typography: {
      fontFamily: theme.getTypography('fontFamily.base'),
      fontSize: {
        sm: theme.getTypography('fontSize.sm'),
        md: theme.getTypography('fontSize.md'),
        lg: theme.getTypography('fontSize.lg'),
      },
      fontWeight: {
        normal: theme.getTypography('fontWeight.normal'),
        medium: theme.getTypography('fontWeight.medium'),
        bold: theme.getTypography('fontWeight.bold'),
      },
      lineHeight: {
        tight: theme.getTypography('lineHeight.tight'),
        normal: theme.getTypography('lineHeight.normal'),
        relaxed: theme.getTypography('lineHeight.relaxed'),
      },
    },
    spacing: {
      xs: theme.getSpacing('xs'),
      sm: theme.getSpacing('sm'),
      md: theme.getSpacing('md'),
      lg: theme.getSpacing('lg'),
      xl: theme.getSpacing('xl'),
    },
    borderRadius: {
      sm: theme.getBorderRadius('sm'),
      md: theme.getBorderRadius('md'),
      lg: theme.getBorderRadius('lg'),
    },
    shadows: {
      md: theme.getShadow('md'),
      lg: theme.getShadow('lg'),
    },
    animation: {
      duration: {
        short: '150ms',
        medium: '300ms',
        long: '500ms',
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
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
    decay?: number;
    centerForce?: number;
  };
}

const GraphWrapper = styled.div<{ width?: string | number; height?: string | number }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '500px'};
`;

const GraphContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: ${props => props.$themeStyles.colors.surface};
  border: 1px solid ${props => props.$themeStyles.colors.edge.default};
  border-radius: ${props => props.$themeStyles.borderRadius.lg};
  box-shadow: ${props => props.$themeStyles.shadows.md};
  padding: ${props => props.$themeStyles.spacing.md};
  position: relative;
  overflow: hidden;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.colors.text.primary};
  font-size: ${props => props.$themeStyles.typography.fontSize.lg};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.bold};
  margin-bottom: ${props => props.$themeStyles.spacing.sm};
`;

const GraphCanvas = styled.svg`
  display: block;
  width: 100%;
  height: calc(100% - 30px);
  min-height: 400px;
  background: white;
`;

const Edge = styled.line<{ isActive: boolean; $themeStyles: ThemeStyles }>`
  stroke: ${props => props.isActive ? props.$themeStyles.colors.edge.active : props.$themeStyles.colors.edge.default};
  stroke-width: 2;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};

  &:hover {
    stroke: ${props => props.$themeStyles.colors.edge.hover};
    stroke-width: 3;
  }
`;

const EdgePath = styled.path<{ active: boolean; weight: number; $themeStyles: ThemeStyles }>`
  stroke: ${props => props.active ? props.$themeStyles.colors.edge.active : props.$themeStyles.colors.edge.default};
  stroke-width: ${props => props.weight};
  fill: none;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};

  &:hover {
    stroke: ${props => props.$themeStyles.colors.edge.hover};
  }
`;

const NodeCircle = styled.circle<{ isActive: boolean; $themeStyles: ThemeStyles }>`
  fill: ${props => props.isActive ? props.$themeStyles.colors.node.active : props.$themeStyles.colors.node.default};
  stroke: #ffffff;
  stroke-width: 2;
  cursor: pointer;
  transition: all ${props => props.$themeStyles.animation.duration.short} ${props => props.$themeStyles.animation.easing.easeInOut};

  &:hover {
    fill: ${props => props.$themeStyles.colors.node.hover};
    stroke-width: 3;
  }
`;

const NodeLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-family: ${props => props.$themeStyles.typography.fontFamily};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  fill: ${props => props.$themeStyles.colors.node.text};
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
  user-select: none;
`;

const EdgeLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-family: ${props => props.$themeStyles.typography.fontFamily};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  fill: ${props => props.$themeStyles.colors.edge.text};
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
  user-select: none;
`;

const Tooltip = styled.div<{ x: number; y: number; $themeStyles: ThemeStyles }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -100%);
  background: ${props => props.$themeStyles.colors.surface};
  color: ${props => props.$themeStyles.colors.text.primary};
  padding: ${props => props.$themeStyles.spacing.xs} ${props => props.$themeStyles.spacing.sm};
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  font-size: ${props => props.$themeStyles.typography.fontSize.sm};
  box-shadow: ${props => props.$themeStyles.shadows.md};
  pointer-events: none;
  z-index: 1000;
`;

const Legend = styled.div<{ $themeStyles: ThemeStyles }>`
  position: absolute;
  top: 30px;
  right: 30px;
  background-color: ${props => props.$themeStyles.colors.surface};
  padding: 10px;
  border-radius: ${props => props.$themeStyles.borderRadius.sm};
  box-shadow: ${props => props.$themeStyles.shadows.md};
  z-index: 50;
`;

const LegendItem = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
  color: ${props => props.$themeStyles.colors.text.primary};
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
  gravity: 0.01,        // Reduced gravity to prevent overcrowding
  repulsion: 100,       // Increased repulsion to keep nodes apart
  linkDistance: 120,    // Keep link distance the same
  linkStrength: 0.1,    // Reduced link strength for more natural movement
  friction: 0.9,        // Reduced friction to allow more movement
  decay: 0.95,          // Lower decay to maintain some energy
  centerForce: 0.03,    // Reduced center force
};

// Helper functions
const getDefaultColors = (theme: ReturnType<typeof useDirectTheme>): string[] => {
  if (!theme) {
    return ['#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759', '#5AC8FA'];
  }

  return [
    theme.getColor('colors.primary', '#007AFF'),
    theme.getColor('colors.secondary', '#5856D6'),
    theme.getColor('colors.info', '#5AC8FA'),
    theme.getColor('colors.success', '#34C759'),
    theme.getColor('colors.warning', '#FF9500'),
    theme.getColor('colors.error', '#FF2D55'),
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
  style = {},
  physics = DEFAULT_PHYSICS,
}) => {
  const theme = useDirectTheme();
  const themeStyles = React.useMemo(() => createThemeStyles(theme), [theme]);
  const defaultColors = React.useMemo(() => getDefaultColors(theme), [theme]);
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

  // Update the useEffect for dimensions and simulation
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        });
      }
    };

    // Initial update
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []); // Remove dimensions dependency to prevent re-initialization

  // Separate effect for simulation
  useEffect(() => {
    if (!data || !data.nodes || !data.edges || !dimensions.width || !dimensions.height) return;

    // Initialize nodes with circular layout
    const width = dimensions.width;
    const height = dimensions.height;
    const nodes: SimulationNode[] = data.nodes.map((node, index) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) / 4;
      return {
        ...node,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
        radius: node.radius || 20,
      };
    });

    const edges: SimulationEdge[] = data.edges.map(edge => ({
      ...edge,
      sourceNode: nodes.find(n => n.id === edge.source),
      targetNode: nodes.find(n => n.id === edge.target),
    }));

    setSimulationNodes(nodes);
    setSimulationEdges(edges);

    // Start simulation with a guaranteed minimum runtime
    let startTime = Date.now();
    let frame: number;

    const simulate = () => {
      const elapsedTime = Date.now() - startTime;
      const minSimulationTime = 5000; // Increase to 5 seconds for better stability

      let totalMovement = 0;

      // Apply forces and update positions
      simulationNodes.forEach(node => {
        if (isDragging && node.id === draggedNode) return;

        // Reset forces
        node.vx = node.vx || 0;
        node.vy = node.vy || 0;

        // Calculate forces
        let fx = 0;
        let fy = 0;

        // Center force (pulls nodes toward center)
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        fx += (centerX - node.x) * physics.centerForce!;
        fy += (centerY - node.y) * physics.centerForce!;

        // Repulsion force (nodes repel each other)
        simulationNodes.forEach(otherNode => {
          if (node.id === otherNode.id) return;

          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Avoid division by zero and limit max force
          const force = Math.min(physics.repulsion! / (distance * distance), 10);
          
          fx += dx * force / distance;
          fy += dy * force / distance;
        });

        // Link forces (edges pull connected nodes together)
        simulationEdges.forEach(edge => {
          if (edge.source === node.id && edge.targetNode) {
            const targetNode = edge.targetNode;
            const dx = node.x - targetNode.x;
            const dy = node.y - targetNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Distance from ideal length (based on linkDistance)
            const displacement = distance - physics.linkDistance!;
            const strength = -displacement * physics.linkStrength! / distance;
            
            fx += dx * strength;
            fy += dy * strength;
          } else if (edge.target === node.id && edge.sourceNode) {
            const sourceNode = edge.sourceNode;
            const dx = node.x - sourceNode.x;
            const dy = node.y - sourceNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Distance from ideal length (based on linkDistance)
            const displacement = distance - physics.linkDistance!;
            const strength = -displacement * physics.linkStrength! / distance;
            
            fx += dx * strength;
            fy += dy * strength;
          }
        });

        // Gravity force (pulls nodes toward center)
        fx += -node.x * physics.gravity!;
        fy += -node.y * physics.gravity!;

        // Apply accumulated forces to velocity
        node.vx += fx;
        node.vy += fy;

        // Update position
        const oldX = node.x;
        const oldY = node.y;
        
        // Apply velocity with damping
        node.vx *= physics.friction! * physics.decay!;
        node.vy *= physics.friction! * physics.decay!;
        
        node.x += node.vx;
        node.y += node.vy;

        // Calculate movement
        const dx = node.x - oldX;
        const dy = node.y - oldY;
        totalMovement += Math.sqrt(dx * dx + dy * dy);

        // Constrain to bounds
        const padding = node.radius || 20;
        node.x = Math.max(padding, Math.min(width - padding, node.x));
        node.y = Math.max(padding, Math.min(height - padding, node.y));
      });

      // Update state
      setSimulationNodes([...simulationNodes]);
      setSimulationEdges([...simulationEdges]);

      // Continue simulation if not stable or minimum time not reached
      if (elapsedTime < minSimulationTime || totalMovement > 0.1) {
        frame = requestAnimationFrame(simulate);
      }
    };

    frame = requestAnimationFrame(simulate);

    // Cleanup
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [data, dimensions.width, dimensions.height, physics, isDragging, draggedNode]);

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
      <GraphWrapper width={width} height={height} style={style}>
        <GraphContainer ref={containerRef} $themeStyles={themeStyles}>
          <p>No data to display</p>
        </GraphContainer>
      </GraphWrapper>
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

  // Update edge label rendering to handle optional chaining
  const renderEdgeLabel = (edge: SimulationEdge) => {
    if (!edge.sourceNode || !edge.targetNode || !edge.label || !showLabels) {
      return null;
    }

    const x = (edge.sourceNode.x + edge.targetNode.x) / 2;
    const y = (edge.sourceNode.y + edge.targetNode.y) / 2 - 5;

    return (
      <EdgeLabel x={x} y={y} $themeStyles={themeStyles}>
        {edge.label}
      </EdgeLabel>
    );
  };

  return (
    <GraphWrapper width={width} height={height} style={style}>
      <GraphContainer ref={containerRef} $themeStyles={themeStyles}>
        {title && <Title $themeStyles={themeStyles}>{title}</Title>}
        
        <GraphCanvas
          ref={svgRef}
          viewBox={`0 0 ${dimensions.width || 800} ${dimensions.height || 600}`}
          preserveAspectRatio="xMidYMid meet"
          width="100%"
          height="100%"
        >
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={themeStyles.colors.edge.default} />
            </marker>
          </defs>
          
          {simulationEdges.map(edge => {
            if (!edge.sourceNode || !edge.targetNode) return null;
            
            return (
              <g key={edge.id}>
                {directed ? (
                  <EdgePath
                    d={generateDirectedEdgePath(edge)}
                    active={activeEdge === edge.id}
                    weight={edge.weight || 2}
                    $themeStyles={themeStyles}
                    onClick={() => handleEdgeClick(edge.id)}
                    onMouseOver={e => handleMouseOver(`${edge.label || edge.id}`, e)}
                    onMouseOut={handleMouseOut}
                    markerEnd="url(#arrowhead)"
                  />
                ) : (
                  <Edge
                    x1={edge.sourceNode.x}
                    y1={edge.sourceNode.y}
                    x2={edge.targetNode.x}
                    y2={edge.targetNode.y}
                    isActive={activeEdge === edge.id}
                    $themeStyles={themeStyles}
                    onClick={() => handleEdgeClick(edge.id)}
                    onMouseOver={e => handleMouseOver(`${edge.label || edge.id}`, e)}
                    onMouseOut={handleMouseOut}
                  />
                )}
                {renderEdgeLabel(edge)}
              </g>
            );
          })}
          
          {simulationNodes.map(node => (
            <g key={node.id}>
              <NodeCircle
                cx={node.x}
                cy={node.y}
                r={node.radius || 20}
                isActive={activeNode === node.id}
                $themeStyles={themeStyles}
                onClick={() => handleNodeClick(node.id)}
                onMouseDown={e => handleNodeMouseDown(node.id, e)}
                onMouseOver={e => handleMouseOver(`${node.label || node.id}`, e)}
                onMouseOut={handleMouseOut}
                style={{
                  fill: getNodeColor(node, colorGroups, defaultColors)
                }}
              />
              {showLabels && (
                <NodeLabel
                  x={node.x}
                  y={node.y + (node.radius || 20) + 12}
                  $themeStyles={themeStyles}
                >
                  {node.label}
                </NodeLabel>
              )}
            </g>
          ))}
        </GraphCanvas>

        {tooltip.visible && (
          <Tooltip x={tooltip.x} y={tooltip.y} $themeStyles={themeStyles}>
            {tooltip.content}
          </Tooltip>
        )}

        {Object.keys(uniqueGroups).length > 0 && (
          <Legend $themeStyles={themeStyles}>
            {Object.entries(uniqueGroups).map(([group, color]) => (
              <LegendItem key={group} $themeStyles={themeStyles}>
                <LegendColor color={color} />
                {group}
              </LegendItem>
            ))}
          </Legend>
        )}
      </GraphContainer>
    </GraphWrapper>
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
