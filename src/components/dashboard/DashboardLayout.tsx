import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { nanoid } from 'nanoid';

// Width provider enhances the ResponsiveGridLayout with width detection
const ResponsiveGridLayout = WidthProvider(Responsive);

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  backgroundPaper: string;
  backgroundSubtle: string;
  borderRadius: string;
  shadowCard: string;
  shadowElevated: string;
  textColor: string;
  textSecondaryColor: string;
  textDisabledColor: string;
  borderLight: string;
  primaryMainColor: string;
  primaryDarkColor: string;
  primaryContrastText: string;
  actionDisabledColor: string;
  fontSize: string;
  fontSizeMd: string;
  fontWeightMedium: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getBorderRadius, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    backgroundPaper: getColor('background.paper', '#ffffff'),
    backgroundSubtle: getColor('background.subtle', '#f5f5f5'),
    borderRadius: getBorderRadius('md', '4px'),
    shadowCard: getShadow('md', '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'),
    shadowElevated: getShadow('lg', '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'),
    textColor: getColor('text.primary', '#333333'),
    textSecondaryColor: getColor('text.secondary', '#666666'),
    textDisabledColor: getColor('text.disabled', '#9e9e9e'),
    borderLight: getColor('border.light', '#e0e0e0'),
    primaryMainColor: getColor('primary.main', '#3366CC'),
    primaryDarkColor: getColor('primary.dark', '#254e9c'),
    primaryContrastText: getColor('primary.contrastText', '#ffffff'),
    actionDisabledColor: getColor('action.disabled', '#9e9e9e'),
    fontSize: getTypography('fontSize.sm', '0.875rem') as string,
    fontSizeMd: getTypography('fontSize.md', '1rem') as string,
    fontWeightMedium: getTypography('fontWeight.medium', '500') as string,
  };
}

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

// Styled components
const DashboardContainer = styled.div`
  width: 100%;
`;

const DashboardControls = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const WidgetContainer = styled.div<{ $isEditing: boolean; $themeStyles: ThemeStyles }>`
  height: 100%;
  background-color: ${props => props.$themeStyles.backgroundPaper};
  border-radius: ${props => props.$themeStyles.borderRadius};
  box-shadow: ${props => 
    props.$isEditing 
      ? `0 0 0 2px ${props.$themeStyles.primaryMainColor}, 0 4px 16px rgba(0, 0, 0, 0.1)` 
      : props.$themeStyles.shadowCard
  };
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: ${props => 
      props.$isEditing 
        ? `0 0 0 2px ${props.$themeStyles.primaryMainColor}, 0 8px 24px rgba(0, 0, 0, 0.15)` 
        : props.$themeStyles.shadowElevated
    };
    ${props => props.$isEditing && 'transform: translateY(-2px);'}
  }
`;

const WidgetHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: 16px;
  border-bottom: 1px solid ${props => props.$themeStyles.borderLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.$themeStyles.backgroundSubtle};
`;

const WidgetTitle = styled.h3<{ $themeStyles: ThemeStyles }>`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$themeStyles.textColor};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WidgetContent = styled.div`
  padding: 16px;
  flex: 1;
  overflow: auto;
`;

const WidgetControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button<{ $themeStyles: ThemeStyles }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: rgba(0, 0, 0, 0.04);
  color: ${props => props.$themeStyles.textSecondaryColor};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
    color: ${props => props.$themeStyles.primaryMainColor};
  }
`;

const DashboardButton = styled.button<{ $themeStyles: ThemeStyles; disabled?: boolean }>`
  padding: 10px 16px;
  background-color: ${props => props.disabled ? props.$themeStyles.actionDisabledColor : props.$themeStyles.primaryMainColor};
  color: ${props => props.disabled ? props.$themeStyles.textDisabledColor : props.$themeStyles.primaryContrastText};
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadius};
  font-size: ${props => props.$themeStyles.fontSize};
  font-weight: ${props => props.$themeStyles.fontWeightMedium};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? props.$themeStyles.actionDisabledColor : props.$themeStyles.primaryDarkColor};
    box-shadow: ${props => props.disabled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
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
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
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
      {editable && (
        <DashboardControls>
          <DashboardButton 
            onClick={toggleEditMode} 
            $themeStyles={themeStyles}
          >
            <span>{isEditing ? '✓' : '✏️'}</span>
            {isEditing ? 'Save Layout' : 'Edit Layout'}
          </DashboardButton>
          
          {isEditing && (
            <DashboardButton 
              onClick={handleSaveConfig} 
              $themeStyles={themeStyles}
            >
              <span>💾</span>
              Save Dashboard
            </DashboardButton>
          )}
        </DashboardControls>
      )}
      
      <ResponsiveGridLayout
        className="layout"
        layouts={currentConfig.layout}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-header"
        margin={[20, 20]}
        containerPadding={[0, 0]}
      >
        {Object.entries(currentConfig.items).map(([id, item]) => {
          const typedItem = item as DashboardItem;
          return (
            <div key={id}>
              <WidgetContainer $isEditing={isEditing} $themeStyles={themeStyles}>
                <WidgetHeader className="widget-header" $themeStyles={themeStyles}>
                  <WidgetTitle $themeStyles={themeStyles}>{typedItem.title}</WidgetTitle>
                  {isEditing && (
                    <WidgetControls>
                      <ControlButton 
                        onClick={() => removeWidget(id)} 
                        $themeStyles={themeStyles}
                        title="Remove widget"
                      >
                        ✕
                      </ControlButton>
                    </WidgetControls>
                  )}
                </WidgetHeader>
                <WidgetContent>
                  {typedItem.component}
                </WidgetContent>
              </WidgetContainer>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </DashboardContainer>
  );
};

export default DashboardLayout; 