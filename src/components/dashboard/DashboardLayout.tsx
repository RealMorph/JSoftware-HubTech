import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../core/theme/ThemeContext';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { nanoid } from 'nanoid';

// Width provider enhances the ResponsiveGridLayout with width detection
const ResponsiveGridLayout = WidthProvider(Responsive);

// Types for dashboard items and layout
export interface DashboardItem {
  id: string;
  component: React.ReactNode;
  title: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface DashboardLayout {
  lg: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  }>;
  md?: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  sm?: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  xs?: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}

// Dashboard configuration interface
export interface DashboardConfig {
  id: string;
  name: string;
  layout: DashboardLayout;
  items: Record<string, DashboardItem>;
}

interface DashboardProps {
  initialConfig?: DashboardConfig;
  onSaveConfig?: (config: DashboardConfig) => void;
  onLayoutChange?: (layout: DashboardLayout) => void;
  editable?: boolean;
  className?: string;
}

// Styled components for dashboard
const DashboardContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const WidgetContainer = styled.div<{ $isEditing: boolean }>`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borders.radius.medium};
  box-shadow: ${props => props.theme.shadows.card};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: box-shadow 0.2s ease-in-out;
  
  ${props => props.$isEditing && `
    box-shadow: ${props.theme.shadows.elevated};
    cursor: move;
  `}
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${props => props.theme.colors.background.subtle};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const WidgetTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const WidgetContent = styled.div`
  flex: 1;
  padding: 16px;
  overflow: auto;
`;

const WidgetControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const DashboardControls = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  gap: 8px;
`;

const DashboardButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  border: none;
  border-radius: ${props => props.theme.borders.radius.small};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.action.disabled};
    color: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
  }
`;

// Define the breakpoints for responsive layout
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
const cols = { lg: 12, md: 10, sm: 6, xs: 4 };
const rowHeight = 100;

// Generate a default layout when none is provided
const generateDefaultLayout = (): DashboardLayout => {
  return {
    lg: [],
    md: [],
    sm: [],
    xs: []
  };
};

// Dashboard implementation
export const DashboardLayout: React.FC<DashboardProps> = ({
  initialConfig,
  onSaveConfig,
  onLayoutChange,
  editable = false,
  className
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(editable);
  const [currentConfig, setCurrentConfig] = useState<DashboardConfig>(() => {
    if (initialConfig) {
      return initialConfig;
    }
    
    const defaultConfig: DashboardConfig = {
      id: nanoid(),
      name: 'New Dashboard',
      layout: generateDefaultLayout(),
      items: {}
    };
    
    return defaultConfig;
  });
  
  // Load saved configuration from localStorage on component mount
  useEffect(() => {
    if (!initialConfig) {
      const savedConfig = localStorage.getItem(`dashboard_${currentConfig.id}`);
      if (savedConfig) {
        try {
          setCurrentConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.error('Failed to load dashboard configuration:', error);
        }
      }
    }
  }, [initialConfig, currentConfig.id]);
  
  // Handle layout changes from the grid layout
  const handleLayoutChange = (layout: any, layouts: any) => {
    const newConfig = {
      ...currentConfig,
      layout: layouts
    };
    
    setCurrentConfig(newConfig);
    
    if (onLayoutChange) {
      onLayoutChange(layouts);
    }
  };
  
  // Save the current configuration
  const handleSaveConfig = () => {
    // Save to localStorage as a backup
    localStorage.setItem(`dashboard_${currentConfig.id}`, JSON.stringify(currentConfig));
    
    if (onSaveConfig) {
      onSaveConfig(currentConfig);
    }
    
    setIsEditing(false);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Remove a widget from the dashboard
  const removeWidget = (widgetId: string) => {
    // Create a copy of the current items and remove the specified widget
    const newItems = { ...currentConfig.items };
    delete newItems[widgetId];
    
    // Remove the widget from all layouts
    const newLayout: DashboardLayout = {
      lg: currentConfig.layout.lg.filter(item => item.i !== widgetId),
      md: currentConfig.layout.md?.filter(item => item.i !== widgetId) || [],
      sm: currentConfig.layout.sm?.filter(item => item.i !== widgetId) || [],
      xs: currentConfig.layout.xs?.filter(item => item.i !== widgetId) || []
    };
    
    setCurrentConfig({
      ...currentConfig,
      items: newItems,
      layout: newLayout
    });
  };
  
  // Add a new widget to the dashboard
  const addWidget = (item: Omit<DashboardItem, 'id'>) => {
    const newId = nanoid();
    
    // Create a copy of the current items and add the new widget
    const newItems = {
      ...currentConfig.items,
      [newId]: {
        ...item,
        id: newId
      }
    };
    
    // Find a suitable position for the new widget (simple placement at the end)
    const lastWidgetY = currentConfig.layout.lg.reduce(
      (maxY, widget) => Math.max(maxY, widget.y + widget.h),
      0
    );
    
    // Add the widget to all layouts
    const newLayout: DashboardLayout = {
      lg: [
        ...currentConfig.layout.lg,
        {
          i: newId,
          x: 0,
          y: lastWidgetY,
          w: 6,
          h: 4,
          minW: item.minW || 2,
          minH: item.minH || 2,
          maxW: item.maxW || 12,
          maxH: item.maxH || 12
        }
      ],
      md: currentConfig.layout.md ? [
        ...currentConfig.layout.md,
        { i: newId, x: 0, y: lastWidgetY, w: 5, h: 4 }
      ] : undefined,
      sm: currentConfig.layout.sm ? [
        ...currentConfig.layout.sm,
        { i: newId, x: 0, y: lastWidgetY, w: 3, h: 4 }
      ] : undefined,
      xs: currentConfig.layout.xs ? [
        ...currentConfig.layout.xs,
        { i: newId, x: 0, y: lastWidgetY, w: 4, h: 4 }
      ] : undefined
    };
    
    setCurrentConfig({
      ...currentConfig,
      items: newItems,
      layout: newLayout
    });
  };
  
  return (
    <DashboardContainer className={className}>
      {isEditing && (
        <DashboardControls>
          <DashboardButton onClick={handleSaveConfig}>
            <span>Save Layout</span>
          </DashboardButton>
          <DashboardButton onClick={toggleEditMode}>
            <span>Finish Editing</span>
          </DashboardButton>
        </DashboardControls>
      )}
      
      {!isEditing && editable && (
        <DashboardControls>
          <DashboardButton onClick={toggleEditMode}>
            <span>Edit Dashboard</span>
          </DashboardButton>
        </DashboardControls>
      )}
      
      <ResponsiveGridLayout
        className="layout"
        layouts={currentConfig.layout}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        margin={[16, 16]}
        containerPadding={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".widget-header"
        useCSSTransforms
      >
        {Object.entries(currentConfig.items).map(([id, item]) => (
          <div key={id}>
            <WidgetContainer $isEditing={isEditing}>
              <WidgetHeader className="widget-header">
                <WidgetTitle>{item.title}</WidgetTitle>
                {isEditing && (
                  <WidgetControls>
                    <ControlButton
                      onClick={() => removeWidget(id)}
                      title="Remove widget"
                    >
                      ×
                    </ControlButton>
                  </WidgetControls>
                )}
              </WidgetHeader>
              <WidgetContent>
                {item.component}
              </WidgetContent>
            </WidgetContainer>
          </div>
        ))}
      </ResponsiveGridLayout>
    </DashboardContainer>
  );
};

export default DashboardLayout; 