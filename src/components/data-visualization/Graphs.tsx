import React from 'react';
import styled from '@emotion/styled';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

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
const GraphContainer = styled.div<{width?: string; height?: string}>`
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

const NodeCircle = styled.circle<{selected?: boolean}>`
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

const NodeLabel = styled.text`
  font-size: 12px;
  fill: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.text')
  };
  pointer-events: none;
  user-select: none;
  text-anchor: middle;
  dominant-baseline: middle;
`;

const EdgeLine = styled.line`
  stroke: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.border')
  };
  stroke-width: 1.5;
`;

const TreeNodeRect = styled.rect<{selected?: boolean}>`
  fill: ${props => 
    props.selected 
      ? getThemeValue(props.theme as ThemeConfig, 'colors.primary')
      : getThemeValue(props.theme as ThemeConfig, 'colors.secondaryLight')
  };
  stroke: ${props => 
    props.selected 
      ? getThemeValue(props.theme as ThemeConfig, 'colors.primaryDark')
      : getThemeValue(props.theme as ThemeConfig, 'colors.secondaryDark')
  };
  stroke-width: 1;
  rx: 4;
  ry: 4;
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

const TreeEdgePath = styled.path`
  fill: none;
  stroke: ${props => 
    getThemeValue(props.theme as ThemeConfig, 'colors.border')
  };
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
    y: node.y ?? Math.random() * height * 0.8 + height * 0.1
  }));
  
  return {
    nodes: positionedNodes,
    edges
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
    
    const childDimensions: { depth: number; width: number }[] = node.children.map(getTreeDimensions);
    const maxDepth: number = Math.max(...childDimensions.map((d) => d.depth)) + 1;
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
    const nodePos = direction === 'horizontal' 
      ? { 
          x: level * levelGap + nodeWidth / 2,
          y: startPos + width / 2
        }
      : {
          x: startPos + width / 2,
          y: level * levelGap + nodeHeight / 2
        };
    
    const positionedNode = {
      ...node,
      x: nodePos.x,
      y: nodePos.y
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
        target: node.id
      };
    });
    
  // Helper function to find parent id
  function findParentId(node: TreeNode, targetId: string): string {
    if (!node.children) return '';
    
    for (const child of node.children) {
      if (child.id === targetId) return node.id;
      
      const foundId = findParentId(child, targetId);
      if (foundId) return foundId;
    }
    
    return '';
  }
  
  return {
    nodes: positionedNodes,
    edges,
    nodeWidth,
    nodeHeight
  };
};

// Generate path for tree edge
const generateTreePath = (
  source: { x: number; y: number }, 
  target: { x: number; y: number }, 
  direction: 'horizontal' | 'vertical' = 'vertical'
) => {
  if (direction === 'horizontal') {
    const midX = (source.x + target.x) / 2;
    return `M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`;
  } else {
    const midY = (source.y + target.y) / 2;
    return `M${source.x},${source.y} C${source.x},${midY} ${target.x},${midY} ${target.x},${target.y}`;
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
  height
}) => {
  const layout = useForceLayout(nodes, edges);
  
  return (
    <GraphContainer width={width} height={height}>
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
            />
            <NodeLabel x={node.x} y={node.y}>
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
  direction = 'vertical'
}) => {
  const layout = useTreeLayout(data, direction);
  
  return (
    <GraphContainer width={width} height={height}>
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
              />
              <NodeLabel x={node.x} y={node.y}>
                {node.label}
              </NodeLabel>
            </g>
          );
        })}
      </Canvas>
    </GraphContainer>
  );
}; 