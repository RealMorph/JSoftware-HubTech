import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../core/theme/ThemeContext';
import DashboardLayout, { DashboardConfig } from './DashboardLayout';
import { nanoid } from 'nanoid';

// Import various widget components that can be added to the dashboard
import { CorrelationAnalysisDemo } from '../data-visualization/examples/CorrelationAnalysisDemo';

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 24px;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: 24px;
  color: ${props => props.theme.colors.text.primary};
`;

const Description = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  margin-bottom: 32px;
  color: ${props => props.theme.colors.text.secondary};
  max-width: 800px;
  line-height: 1.6;
`;

const DashboardControls = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 16px;
  background-color: ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.contrastText};
  border: none;
  border-radius: ${props => props.theme.borders.radius.small};
  font-size: ${props => props.theme.typography.fontSize.md};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary.dark};
  }
`;

const WidgetButton = styled(Button)`
  background-color: ${props => props.theme.colors.secondary.main};
  color: ${props => props.theme.colors.secondary.contrastText};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary.dark};
  }
`;

const SelectControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid ${props => props.theme.colors.border.main};
  border-radius: ${props => props.theme.borders.radius.small};
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.primary};
  background-color: ${props => props.theme.colors.background.paper};
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.md};
  color: ${props => props.theme.colors.text.primary};
`;

// Sample simple widget components
const SimpleStatsWidget = () => {
  const theme = useTheme();
  
  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: theme.colors.text.primary }}>Key Metrics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ 
          padding: '16px', 
          backgroundColor: theme.colors.success.light, 
          borderRadius: theme.borders.radius.small,
          color: theme.colors.success.dark
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>$24,500</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>+15% vs last month</div>
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: theme.colors.info.light, 
          borderRadius: theme.borders.radius.small,
          color: theme.colors.info.dark
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>Visitors</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>12,846</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>+8% vs last month</div>
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: theme.colors.warning.light, 
          borderRadius: theme.borders.radius.small,
          color: theme.colors.warning.dark
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>Conversion</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>3.2%</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>+0.5% vs last month</div>
        </div>
        <div style={{ 
          padding: '16px', 
          backgroundColor: theme.colors.primary.light, 
          borderRadius: theme.borders.radius.small,
          color: theme.colors.primary.dark
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>428</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>+12% vs last month</div>
        </div>
      </div>
    </div>
  );
};

const RecentActivitiesWidget = () => {
  const theme = useTheme();
  const activities = [
    { id: 1, user: 'John Doe', action: 'Created a new project', time: '10 min ago' },
    { id: 2, user: 'Jane Smith', action: 'Updated account settings', time: '1 hour ago' },
    { id: 3, user: 'Robert Johnson', action: 'Completed task #142', time: '2 hours ago' },
    { id: 4, user: 'Lisa Anderson', action: 'Submitted a new report', time: '4 hours ago' },
    { id: 5, user: 'Michael Chen', action: 'Uploaded new files', time: '5 hours ago' },
  ];
  
  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: theme.colors.text.primary }}>Recent Activities</h3>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        maxHeight: '300px', 
        overflowY: 'auto' 
      }}>
        {activities.map(activity => (
          <div 
            key={activity.id} 
            style={{ 
              padding: '12px', 
              borderRadius: theme.borders.radius.small,
              backgroundColor: theme.colors.background.subtle,
              borderLeft: `4px solid ${theme.colors.primary.main}`
            }}
          >
            <div style={{ fontWeight: 'bold', color: theme.colors.text.primary }}>{activity.user}</div>
            <div style={{ color: theme.colors.text.secondary }}>{activity.action}</div>
            <div style={{ fontSize: '12px', color: theme.colors.text.disabled, marginTop: '4px' }}>{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesWidget = () => {
  const theme = useTheme();
  const [note, setNote] = useState('Add your notes here...');
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '16px', color: theme.colors.text.primary }}>Quick Notes</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{
          flex: 1,
          padding: '12px',
          borderRadius: theme.borders.radius.small,
          border: `1px solid ${theme.colors.border.main}`,
          backgroundColor: theme.colors.background.paper,
          color: theme.colors.text.primary,
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '14px'
        }}
      />
    </div>
  );
};

// Sample tasks widget
const TasksWidget = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review dashboard design', completed: true },
    { id: 2, text: 'Implement responsive layouts', completed: false },
    { id: 3, text: 'Add widget drag-and-drop', completed: false },
    { id: 4, text: 'Create widget templates', completed: false },
    { id: 5, text: 'Test dashboard persistence', completed: false },
  ]);
  
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  return (
    <div>
      <h3 style={{ marginBottom: '16px', color: theme.colors.text.primary }}>Project Tasks</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map(task => (
          <div 
            key={task.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '12px',
              borderRadius: theme.borders.radius.small,
              backgroundColor: theme.colors.background.subtle,
            }}
          >
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)}
              style={{ marginRight: '12px' }}
            />
            <span style={{ 
              color: theme.colors.text.primary,
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.7 : 1
            }}>
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create dashboard template presets
const dashboardTemplates = {
  empty: {
    id: 'empty-dashboard',
    name: 'Empty Dashboard',
    layout: {
      lg: [],
      md: [],
      sm: [],
      xs: []
    },
    items: {}
  },
  analytics: {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    layout: {
      lg: [
        { i: 'stats', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
        { i: 'correlation', x: 0, y: 4, w: 6, h: 8, minW: 4, minH: 6 },
        { i: 'activities', x: 6, y: 4, w: 6, h: 8, minW: 4, minH: 6 }
      ],
      md: [
        { i: 'stats', x: 0, y: 0, w: 10, h: 4 },
        { i: 'correlation', x: 0, y: 4, w: 5, h: 8 },
        { i: 'activities', x: 5, y: 4, w: 5, h: 8 }
      ],
      sm: [
        { i: 'stats', x: 0, y: 0, w: 6, h: 4 },
        { i: 'correlation', x: 0, y: 4, w: 6, h: 8 },
        { i: 'activities', x: 0, y: 12, w: 6, h: 8 }
      ],
      xs: [
        { i: 'stats', x: 0, y: 0, w: 4, h: 6 },
        { i: 'correlation', x: 0, y: 6, w: 4, h: 10 },
        { i: 'activities', x: 0, y: 16, w: 4, h: 8 }
      ]
    },
    items: {
      'stats': {
        id: 'stats',
        title: 'Key Metrics',
        component: <SimpleStatsWidget />,
        minW: 4,
        minH: 3
      },
      'correlation': {
        id: 'correlation',
        title: 'Correlation Analysis',
        component: <CorrelationAnalysisDemo />,
        minW: 4,
        minH: 6
      },
      'activities': {
        id: 'activities',
        title: 'Recent Activities',
        component: <RecentActivitiesWidget />,
        minW: 3,
        minH: 5
      }
    }
  },
  projectManagement: {
    id: 'project-dashboard',
    name: 'Project Dashboard',
    layout: {
      lg: [
        { i: 'tasks', x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 },
        { i: 'notes', x: 6, y: 0, w: 6, h: 6, minW: 3, minH: 4 },
        { i: 'activities', x: 0, y: 6, w: 12, h: 5, minW: 4, minH: 4 }
      ],
      md: [
        { i: 'tasks', x: 0, y: 0, w: 5, h: 6 },
        { i: 'notes', x: 5, y: 0, w: 5, h: 6 },
        { i: 'activities', x: 0, y: 6, w: 10, h: 5 }
      ],
      sm: [
        { i: 'tasks', x: 0, y: 0, w: 6, h: 6 },
        { i: 'notes', x: 0, y: 6, w: 6, h: 6 },
        { i: 'activities', x: 0, y: 12, w: 6, h: 5 }
      ],
      xs: [
        { i: 'tasks', x: 0, y: 0, w: 4, h: 7 },
        { i: 'notes', x: 0, y: 7, w: 4, h: 7 },
        { i: 'activities', x: 0, y: 14, w: 4, h: 7 }
      ]
    },
    items: {
      'tasks': {
        id: 'tasks',
        title: 'Project Tasks',
        component: <TasksWidget />,
        minW: 3,
        minH: 4
      },
      'notes': {
        id: 'notes',
        title: 'Quick Notes',
        component: <NotesWidget />,
        minW: 3,
        minH: 4
      },
      'activities': {
        id: 'activities',
        title: 'Team Activities',
        component: <RecentActivitiesWidget />,
        minW: 4,
        minH: 4
      }
    }
  }
};

// Main demo component
export const DashboardTemplateDemo: React.FC = () => {
  const theme = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState('analytics');
  const [currentConfig, setCurrentConfig] = useState<DashboardConfig>(dashboardTemplates.analytics);
  const [isEditing, setIsEditing] = useState(false);
  
  // Handle template change
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = e.target.value;
    setSelectedTemplate(templateKey);
    setCurrentConfig(dashboardTemplates[templateKey as keyof typeof dashboardTemplates]);
  };
  
  // Add widget to dashboard
  const addStatsWidget = () => {
    // Create new item with unique ID
    const newId = `stats-${nanoid(6)}`;
    
    // Add widget to the current config
    const newConfig = {
      ...currentConfig,
      items: {
        ...currentConfig.items,
        [newId]: {
          id: newId,
          title: 'Key Metrics',
          component: <SimpleStatsWidget />,
          minW: 4,
          minH: 3
        }
      },
      layout: {
        ...currentConfig.layout,
        lg: [
          ...currentConfig.layout.lg,
          { i: newId, x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 }
        ],
        md: currentConfig.layout.md ? [
          ...currentConfig.layout.md,
          { i: newId, x: 0, y: 0, w: 5, h: 4 }
        ] : undefined,
        sm: currentConfig.layout.sm ? [
          ...currentConfig.layout.sm,
          { i: newId, x: 0, y: 0, w: 6, h: 4 }
        ] : undefined,
        xs: currentConfig.layout.xs ? [
          ...currentConfig.layout.xs,
          { i: newId, x: 0, y: 0, w: 4, h: 6 }
        ] : undefined
      }
    };
    
    setCurrentConfig(newConfig);
  };
  
  const addTasksWidget = () => {
    const newId = `tasks-${nanoid(6)}`;
    
    const newConfig = {
      ...currentConfig,
      items: {
        ...currentConfig.items,
        [newId]: {
          id: newId,
          title: 'Project Tasks',
          component: <TasksWidget />,
          minW: 3,
          minH: 4
        }
      },
      layout: {
        ...currentConfig.layout,
        lg: [
          ...currentConfig.layout.lg,
          { i: newId, x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 }
        ],
        md: currentConfig.layout.md ? [
          ...currentConfig.layout.md,
          { i: newId, x: 0, y: 0, w: 5, h: 6 }
        ] : undefined,
        sm: currentConfig.layout.sm ? [
          ...currentConfig.layout.sm,
          { i: newId, x: 0, y: 0, w: 6, h: 6 }
        ] : undefined,
        xs: currentConfig.layout.xs ? [
          ...currentConfig.layout.xs,
          { i: newId, x: 0, y: 0, w: 4, h: 7 }
        ] : undefined
      }
    };
    
    setCurrentConfig(newConfig);
  };
  
  const addNotesWidget = () => {
    const newId = `notes-${nanoid(6)}`;
    
    const newConfig = {
      ...currentConfig,
      items: {
        ...currentConfig.items,
        [newId]: {
          id: newId,
          title: 'Quick Notes',
          component: <NotesWidget />,
          minW: 3,
          minH: 4
        }
      },
      layout: {
        ...currentConfig.layout,
        lg: [
          ...currentConfig.layout.lg,
          { i: newId, x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 4 }
        ],
        md: currentConfig.layout.md ? [
          ...currentConfig.layout.md,
          { i: newId, x: 0, y: 0, w: 5, h: 6 }
        ] : undefined,
        sm: currentConfig.layout.sm ? [
          ...currentConfig.layout.sm,
          { i: newId, x: 0, y: 0, w: 6, h: 6 }
        ] : undefined,
        xs: currentConfig.layout.xs ? [
          ...currentConfig.layout.xs,
          { i: newId, x: 0, y: 0, w: 4, h: 7 }
        ] : undefined
      }
    };
    
    setCurrentConfig(newConfig);
  };
  
  const addCorrelationWidget = () => {
    const newId = `correlation-${nanoid(6)}`;
    
    const newConfig = {
      ...currentConfig,
      items: {
        ...currentConfig.items,
        [newId]: {
          id: newId,
          title: 'Correlation Analysis',
          component: <CorrelationAnalysisDemo />,
          minW: 4,
          minH: 6
        }
      },
      layout: {
        ...currentConfig.layout,
        lg: [
          ...currentConfig.layout.lg,
          { i: newId, x: 0, y: 0, w: 6, h: 8, minW: 4, minH: 6 }
        ],
        md: currentConfig.layout.md ? [
          ...currentConfig.layout.md,
          { i: newId, x: 0, y: 0, w: 5, h: 8 }
        ] : undefined,
        sm: currentConfig.layout.sm ? [
          ...currentConfig.layout.sm,
          { i: newId, x: 0, y: 0, w: 6, h: 8 }
        ] : undefined,
        xs: currentConfig.layout.xs ? [
          ...currentConfig.layout.xs,
          { i: newId, x: 0, y: 0, w: 4, h: 10 }
        ] : undefined
      }
    };
    
    setCurrentConfig(newConfig);
  };
  
  // Toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  
  // Save configuration handler
  const handleSaveConfig = (config: DashboardConfig) => {
    setCurrentConfig(config);
    // In a real application, you might want to save this to the server or localStorage
    console.log('Dashboard configuration saved:', config);
  };
  
  return (
    <DemoContainer>
      <Title>Dashboard Templates</Title>
      <Description>
        This demo showcases customizable dashboard templates with drag-and-drop functionality, 
        responsive layouts, and widget configuration. You can start with a template, add widgets, 
        and arrange them according to your needs. The dashboard configuration is persistent and can be saved.
      </Description>
      
      <DashboardControls>
        <SelectControl>
          <Label htmlFor="template-select">Template:</Label>
          <Select 
            id="template-select"
            value={selectedTemplate} 
            onChange={handleTemplateChange}
          >
            <option value="empty">Empty Dashboard</option>
            <option value="analytics">Analytics Dashboard</option>
            <option value="projectManagement">Project Management</option>
          </Select>
        </SelectControl>
        
        <Button onClick={toggleEditing}>
          {isEditing ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        </Button>
      </DashboardControls>
      
      {isEditing && (
        <DashboardControls>
          <WidgetButton onClick={addStatsWidget}>Add Stats Widget</WidgetButton>
          <WidgetButton onClick={addTasksWidget}>Add Tasks Widget</WidgetButton>
          <WidgetButton onClick={addNotesWidget}>Add Notes Widget</WidgetButton>
          <WidgetButton onClick={addCorrelationWidget}>Add Correlation Widget</WidgetButton>
        </DashboardControls>
      )}
      
      <DashboardLayout 
        initialConfig={currentConfig}
        onSaveConfig={handleSaveConfig}
        editable={isEditing}
      />
    </DemoContainer>
  );
};

export default DashboardTemplateDemo; 