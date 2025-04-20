import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useCrossChartInteraction, BrushSelection } from './CrossChartInteraction';
import { useTheme } from '../../../core/theme/ThemeContext';
import { createThemeStyles } from '../../../core/theme/utils/themeUtils';

/**
 * LinkedBrushing Component
 * 
 * This component adds a brush selection overlay to any chart, enabling linked brushing
 * across multiple visualizations. When a user makes a selection in one chart,
 * it filters data in other charts based on the selection.
 */

interface BrushProps {
  chartId: string;
  width: number;
  height: number;
  xScale?: (value: any) => number;
  yScale?: (value: any) => number;
  onBrushed?: (selection: BrushSelection) => void;
  constrainToX?: boolean;
  constrainToY?: boolean;
}

// Styled components
const BrushOverlay = styled.rect<{ $themeStyles: any }>`
  fill: ${props => props.$themeStyles.colors.chart.brushOverlay};
  cursor: crosshair;
`;

const BrushRect = styled.rect<{ $themeStyles: any; active: boolean }>`
  fill: ${props => props.$themeStyles.colors.chart.brushSelection};
  stroke: ${props => props.$themeStyles.colors.chart.brushBorder};
  stroke-width: 1;
  fill-opacity: ${props => props.active ? 0.3 : 0.1};
  stroke-dasharray: ${props => props.active ? 'none' : '5,5'};
  pointer-events: ${props => props.active ? 'all' : 'none'};
`;

const BrushHandle = styled.rect<{ $themeStyles: any }>`
  fill: ${props => props.$themeStyles.colors.chart.brushHandle};
  stroke: ${props => props.$themeStyles.colors.chart.brushBorder};
  stroke-width: 1;
  cursor: ew-resize;
`;

export const LinkedBrushing: React.FC<BrushProps> = ({
  chartId,
  width,
  height,
  xScale,
  yScale,
  onBrushed,
  constrainToX = false,
  constrainToY = false,
}) => {
  const { setBrush, clearBrush, state } = useCrossChartInteraction();
  const theme = useTheme();
  const themeStyles = createThemeStyles(theme);
  
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Brush state
  const [brushing, setBrushing] = useState(false);
  const [brushStart, setBrushStart] = useState({ x: 0, y: 0 });
  const [brushEnd, setBrushEnd] = useState({ x: 0, y: 0 });
  const [activeBrush, setActiveBrush] = useState(false);
  const [resizing, setResizing] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
  
  // Get existing brush for this chart
  const existingBrush = state.brushes.find(b => b.chartId === chartId);
  
  useEffect(() => {
    if (existingBrush && xScale && yScale) {
      // Convert range values back to pixel coordinates if external brush state changes
      if (existingBrush.range.x) {
        const [startX, endX] = existingBrush.range.x;
        const x1 = xScale(startX);
        const x2 = xScale(endX);
        setBrushStart(prev => ({ ...prev, x: Math.min(x1, x2) }));
        setBrushEnd(prev => ({ ...prev, x: Math.max(x1, x2) }));
      }
      
      if (existingBrush.range.y) {
        const [startY, endY] = existingBrush.range.y;
        const y1 = yScale(startY);
        const y2 = yScale(endY);
        setBrushStart(prev => ({ ...prev, y: Math.min(y1, y2) }));
        setBrushEnd(prev => ({ ...prev, y: Math.max(y1, y2) }));
      }
      
      setActiveBrush(true);
    }
  }, [existingBrush, xScale, yScale]);
  
  // Handle mouse down to start brushing
  const handleMouseDown = (e: React.MouseEvent<SVGRectElement>) => {
    if (resizing) return;
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // If clicking inside an active brush, start dragging instead
      if (activeBrush &&
          x >= Math.min(brushStart.x, brushEnd.x) &&
          x <= Math.max(brushStart.x, brushEnd.x) &&
          y >= Math.min(brushStart.y, brushEnd.y) &&
          y <= Math.max(brushStart.y, brushEnd.y)) {
        // This would be for dragging the brush, which we could implement
        return;
      }
      
      // Otherwise start a new brush
      setBrushStart({ x, y });
      setBrushEnd({ x, y });
      setBrushing(true);
      setActiveBrush(false);
      
      // Add document-level event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };
  
  // Handle mouse move to update brush size
  const handleMouseMove = (e: MouseEvent) => {
    if (!brushing && !resizing) return;
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      let x = Math.max(0, Math.min(width, e.clientX - rect.left));
      let y = Math.max(0, Math.min(height, e.clientY - rect.top));
      
      if (resizing) {
        // Handle resizing the brush
        if (resizing === 'left') {
          setBrushStart(prev => ({ ...prev, x }));
        } else if (resizing === 'right') {
          setBrushEnd(prev => ({ ...prev, x }));
        } else if (resizing === 'top') {
          setBrushStart(prev => ({ ...prev, y }));
        } else if (resizing === 'bottom') {
          setBrushEnd(prev => ({ ...prev, y }));
        }
      } else if (brushing) {
        // Normal brushing - update end coordinates
        if (constrainToX) {
          setBrushEnd(prev => ({ ...prev, x }));
        } else if (constrainToY) {
          setBrushEnd(prev => ({ ...prev, y }));
        } else {
          setBrushEnd({ x, y });
        }
      }
    }
  };
  
  // Handle mouse up to finalize brush
  const handleMouseUp = () => {
    // Remove document-level event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Only set brush if there's an actual area
    if (brushing || resizing) {
      const minX = Math.min(brushStart.x, brushEnd.x);
      const maxX = Math.max(brushStart.x, brushEnd.x);
      const minY = Math.min(brushStart.y, brushEnd.y);
      const maxY = Math.max(brushStart.y, brushEnd.y);
      
      // Only create brush if it has some width/height
      if ((maxX - minX > 5 || maxY - minY > 5) || resizing) {
        setActiveBrush(true);
        
        // Convert pixel coordinates to data values
        let range: BrushSelection['range'] = {};
        
        if (xScale && (!constrainToY || !constrainToX)) {
          // We need to invert the xScale, but our xScale might be a simple function
          // This is a simplified approach assuming linear scales
          // For actual implementation, you'd use the scale's invert method if available
          range.x = [minX, maxX].map(px => {
            // Find x value by iterating through the domain
            // This is a simplified approach
            for (let i = 0; i < width; i += 0.1) {
              if (Math.abs(xScale(i) - px) < 0.5) {
                return i;
              }
            }
            return px / width; // Fallback
          }) as [number, number];
        }
        
        if (yScale && (!constrainToX || !constrainToY)) {
          // Similar simplification for y
          range.y = [minY, maxY].map(px => {
            for (let i = 0; i < height; i += 0.1) {
              if (Math.abs(yScale(i) - px) < 0.5) {
                return i;
              }
            }
            return px / height; // Fallback
          }) as [number, number];
        }
        
        const brushSelection: BrushSelection = {
          chartId,
          range
        };
        
        // Update the cross-chart interaction state
        setBrush(brushSelection);
        
        // Call the callback if provided
        if (onBrushed) {
          onBrushed(brushSelection);
        }
      } else if (!resizing) {
        // Clear brush on tiny selections (clicks)
        setActiveBrush(false);
        clearBrush(chartId);
      }
    }
    
    setBrushing(false);
    setResizing(null);
  };
  
  // Handle resize handle mousedown
  const handleResizeMouseDown = (e: React.MouseEvent, handle: 'left' | 'right' | 'top' | 'bottom') => {
    e.stopPropagation();
    setResizing(handle);
    
    // Add document-level event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Clear brush on double-click
  const handleDoubleClick = () => {
    setActiveBrush(false);
    clearBrush(chartId);
  };
  
  // Calculate brush dimensions
  const brushX = Math.min(brushStart.x, brushEnd.x);
  const brushY = Math.min(brushStart.y, brushEnd.y);
  const brushWidth = Math.abs(brushEnd.x - brushStart.x);
  const brushHeight = Math.abs(brushEnd.y - brushStart.y);
  
  // Only render handles if active and large enough
  const showHandles = activeBrush && (brushWidth > 10 || brushHeight > 10);
  
  // Handle size
  const handleSize = 8;
  
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {/* Transparent overlay to capture mouse events */}
      <BrushOverlay
        x={0}
        y={0}
        width={width}
        height={height}
        $themeStyles={themeStyles}
        style={{ pointerEvents: 'all' }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      />
      
      {/* Brush rectangle */}
      {(brushing || activeBrush) && (
        <BrushRect
          x={brushX}
          y={brushY}
          width={brushWidth}
          height={brushHeight}
          $themeStyles={themeStyles}
          active={activeBrush}
        />
      )}
      
      {/* Resize handles */}
      {showHandles && !constrainToY && (
        <>
          {/* Left handle */}
          <BrushHandle
            x={brushX - handleSize / 2}
            y={brushY + brushHeight / 2 - handleSize / 2}
            width={handleSize}
            height={handleSize}
            $themeStyles={themeStyles}
            style={{ pointerEvents: 'all' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
          />
          
          {/* Right handle */}
          <BrushHandle
            x={brushX + brushWidth - handleSize / 2}
            y={brushY + brushHeight / 2 - handleSize / 2}
            width={handleSize}
            height={handleSize}
            $themeStyles={themeStyles}
            style={{ pointerEvents: 'all' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
          />
        </>
      )}
      
      {/* Vertical resize handles */}
      {showHandles && !constrainToX && (
        <>
          {/* Top handle */}
          <BrushHandle
            x={brushX + brushWidth / 2 - handleSize / 2}
            y={brushY - handleSize / 2}
            width={handleSize}
            height={handleSize}
            $themeStyles={themeStyles}
            style={{ pointerEvents: 'all', cursor: 'ns-resize' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
          />
          
          {/* Bottom handle */}
          <BrushHandle
            x={brushX + brushWidth / 2 - handleSize / 2}
            y={brushY + brushHeight - handleSize / 2}
            width={handleSize}
            height={handleSize}
            $themeStyles={themeStyles}
            style={{ pointerEvents: 'all', cursor: 'ns-resize' }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
          />
        </>
      )}
    </svg>
  );
}; 