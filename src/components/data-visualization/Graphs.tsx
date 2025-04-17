import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  foregroundColor: string;
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
    foregroundColor: getColor('foreground', '#ffffff'),
    primaryColor: getColor('primary', '#3366CC'),
    primaryDarkColor: getColor('primaryDark', '#1a56cc'),
    primaryLightColor: getColor('primaryLight', '#6699ff'),
    secondaryColor: getColor('secondary', '#DC3912'),
    secondaryDarkColor: getColor('secondaryDark', '#b02e0e'),
    secondaryLightColor: getColor('secondaryLight', '#e46e54'),
    borderColor: getColor('border', '#e0e0e0'),
  };
}

// Types for graph components
export interface Node {
  id: string;
  label: string;
  size?: number;
  x?: number;
  y?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  width?: number;
}

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

// NetworkGraph props
export interface NetworkGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string;
  width?: string;
  height?: string;
}

// TreeGraph props
export interface TreeGraphProps {
  data: TreeNode;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string;
  width?: string;
  height?: string;
  direction?: 'horizontal' | 'vertical';
}

// Styled components
const GraphContainer = styled.div<{ width?: string; height?: string; $themeStyles: ThemeStyles }>`
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

const NodeCircle = styled.circle<{ selected?: boolean; $themeStyles: ThemeStyles }>`
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

const NodeLabel = styled.text<{ $themeStyles: ThemeStyles }>`
  font-size: 12px;
  fill: ${props => props.$themeStyles.textColor};
  pointer-events: none;
  user-select: none;
  text-anchor: middle;
  dominant-baseline: middle;
`;

const EdgeLine = styled.line<{ $themeStyles: ThemeStyles }>`
  stroke: ${props => props.$themeStyles.borderColor};
  stroke-width: 1.5;
`;

const TreeNodeRect = styled.rect<{ selected?: boolean; $themeStyles: ThemeStyles }>`
  fill: ${props =>
    props.selected ? props.$themeStyles.primaryColor : props.$themeStyles.secondaryLightColor};
  stroke: ${props =>
    props.selected ? props.$themeStyles.primaryDarkColor : props.$themeStyles.secondaryDarkColor};
  stroke-width: 1;
  rx: 4;
  ry: 4;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    fill: ${props => props.$themeStyles.primaryLightColor};
    stroke: ${props => props.$themeStyles.primaryDarkColor};
  }
`;

const TreeEdgePath = styled.path<{ $themeStyles: ThemeStyles }>`
  fill: none;
  stroke: ${props => props.$themeStyles.borderColor};
  stroke-width: 1.5;
`;

// Simple force-directed layout algorithm (for demo purposes)
const useForceLayout = (nodes: Node[], edges: Edge[]) => {
  const width = 800;
  const height = 600;

  // Initialize positions randomly if not set
  const positionedNodes = nodes.map(node => ({
    ...node,
    x: node.x ?? Math.random() * width * 0.8 + width * 0.1,
    y: node.y ?? Math.random() * height * 0.8 + height * 0.1,
  }));

  return {
    nodes: positionedNodes,
    edges,
  };
};

// Simple tree layout algorithm (for demo purposes)
const useTreeLayout = (rootNode: TreeNode, direction: 'horizontal' | 'vertical' = 'vertical') => {
  const width = 800;
  const height = 600;
  const nodeWidth = 120;
  const nodeHeight = 40;
  const levelGap = direction === 'horizontal' ? 150 : 80;
  const siblingGap = direction === 'horizontal' ? 60 : 150;

  // Calculate tree depth and width
  const getTreeDimensions = (node: TreeNode): { depth: number; width: number } => {
    if (!node.children || node.children.length === 0) {
      return { depth: 0, width: 1 };
    }

    const childDimensions: { depth: number; width: number }[] =
      node.children.map(getTreeDimensions);
    const maxDepth: number = Math.max(...childDimensions.map(d => d.depth)) + 1;
    const totalWidth: number = childDimensions.reduce((sum: number, d) => sum + d.width, 0);

    return { depth: maxDepth, width: totalWidth };
  };

  const dimensions = getTreeDimensions(rootNode);

  // Position nodes in tree
  const positionNodes = (
    node: TreeNode,
    level: number,
    startPos: number,
    width: number
  ): (TreeNode & { x: number; y: number })[] => {
    const nodePos =
      direction === 'horizontal'
        ? {
            x: level * levelGap + nodeWidth / 2,
            y: startPos + width / 2,
          }
        : {
            x: startPos + width / 2,
            y: level * levelGap + nodeHeight / 2,
          };

    const positionedNode = {
      ...node,
      x: nodePos.x,
      y: nodePos.y,
    };

    if (!node.children || node.children.length === 0) {
      return [positionedNode];
    }

    const childDimensions = node.children.map(getTreeDimensions);
    const totalWidth = childDimensions.reduce((sum, d) => sum + d.width, 0);

    const childNodes: (TreeNode & { x: number; y: number })[] = [];
    let currentPos = startPos;

    for (let i = 0; i < node.children.length; i++) {
      const childWidth = (childDimensions[i].width / totalWidth) * width;
      const childPositionedNodes = positionNodes(
        node.children[i],
        level + 1,
        currentPos,
        childWidth
      );

      childNodes.push(...childPositionedNodes);
      currentPos += childWidth;
    }

    return [positionedNode, ...childNodes];
  };

  const treeWidth = direction === 'horizontal' ? height : width;
  const positionedNodes = positionNodes(rootNode, 0, 0, treeWidth);

  // Create edges between nodes
  const edges = positionedNodes
    .filter(node => node.id !== rootNode.id)
    .map(node => {
      const parentId = findParentId(rootNode, node.id);
      return {
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
      };
    });

  // Helper function to find parent id
  function findParentId(node: TreeNode, targetId: string): string {
    if (!node.children) return '';

    // Check direct children
    for (const child of node.children) {
      if (child.id === targetId) {
        return node.id;
      }

      // Check descendants
      const parentId = findParentId(child, targetId);
      if (parentId) {
        return parentId;
      }
    }

    return '';
  }

  return {
    nodes: positionedNodes,
    edges,
    nodeWidth,
    nodeHeight,
  };
};

// Generate path for tree edges
const generateTreePath = (
  source: { x: number; y: number },
  target: { x: number; y: number },
  direction: 'horizontal' | 'vertical' = 'vertical'
) => {
  if (direction === 'horizontal') {
    const midX = (source.x + target.x) / 2;
    return `M ${source.x} ${source.y} 
            C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;
  } else {
    const midY = (source.y + target.y) / 2;
    return `M ${source.x} ${source.y} 
            C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${target.y}`;
  }
};

/**
 * Network Graph component for visualizing node-edge networks
 */
export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
  width,
  height,
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const layout = useForceLayout(nodes, edges);

  return (
    <GraphContainer width={width} height={height} $themeStyles={themeStyles}>
      <Canvas viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {/* Render edges */}
        {layout.edges.map(edge => {
          const sourceNode = layout.nodes.find(n => n.id === edge.source);
          const targetNode = layout.nodes.find(n => n.id === edge.target);

          if (!sourceNode || !targetNode) return null;

          return (
            <EdgeLine
              key={edge.id}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              strokeWidth={edge.width || 1.5}
              $themeStyles={themeStyles}
            />
          );
        })}

        {/* Render nodes */}
        {layout.nodes.map(node => (
          <g key={node.id} onClick={() => onNodeClick?.(node.id)}>
            <NodeCircle
              cx={node.x}
              cy={node.y}
              r={node.size || 20}
              selected={node.id === selectedNodeId}
              $themeStyles={themeStyles}
            />
            <NodeLabel x={node.x} y={node.y} $themeStyles={themeStyles}>
              {node.label}
            </NodeLabel>
          </g>
        ))}
      </Canvas>
    </GraphContainer>
  );
};

/**
 * Tree Graph component for visualizing hierarchical data
 */
export const TreeGraph: React.FC<TreeGraphProps> = ({
  data,
  onNodeClick,
  selectedNodeId,
  width,
  height,
  direction = 'vertical',
}) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);
  const layout = useTreeLayout(data, direction);

  return (
    <GraphContainer width={width} height={height} $themeStyles={themeStyles}>
      <Canvas viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
        {/* Render edges */}
        {layout.edges.map(edge => {
          const sourceNode = layout.nodes.find(n => n.id === edge.source);
          const targetNode = layout.nodes.find(n => n.id === edge.target);

          if (!sourceNode || !targetNode) return null;

          return (
            <TreeEdgePath
              key={edge.id}
              d={generateTreePath(sourceNode, targetNode, direction)}
              $themeStyles={themeStyles}
            />
          );
        })}

        {/* Render nodes */}
        {layout.nodes.map(node => {
          const nodeWidthHalf = layout.nodeWidth / 2;
          const nodeHeightHalf = layout.nodeHeight / 2;

          return (
            <g key={node.id} onClick={() => onNodeClick?.(node.id)}>
              <TreeNodeRect
                x={node.x - nodeWidthHalf}
                y={node.y - nodeHeightHalf}
                width={layout.nodeWidth}
                height={layout.nodeHeight}
                selected={node.id === selectedNodeId}
                $themeStyles={themeStyles}
              />
              <NodeLabel x={node.x} y={node.y} $themeStyles={themeStyles}>
                {node.label}
              </NodeLabel>
            </g>
          );
        })}
      </Canvas>
    </GraphContainer>
  );
};
