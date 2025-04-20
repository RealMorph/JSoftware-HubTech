import React, { useState } from 'react';
import styled from 'styled-components';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import DashboardLayout, { DashboardConfig } from './DashboardLayout';
import { nanoid } from 'nanoid';

// Import various widget components that can be added to the dashboard
import { CorrelationAnalysisDemo } from '../data-visualization/examples/CorrelationAnalysisDemo';

// Define theme style interface
interface ThemeStyles {
  fontSizeXl: string;
  fontSizeMd: string;
  textPrimary: string;
  textSecondary: string;
  borderRadiusSmall: string;
  primaryMain: string;
  primaryDark: string;
  primaryLight: string;
  primaryContrastText: string;
  secondaryMain: string;
  secondaryDark: string;
  secondaryContrastText: string;
  successLight: string;
  successDark: string;
  infoLight: string;
  infoDark: string;
  warningLight: string;
  warningDark: string;
  borderMain: string;
  backgroundPaper: string;
  backgroundSubtle: string;
  textDisabled: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getTypography, getBorderRadius } = themeContext;

  return {
    fontSizeXl: getTypography('fontSizes.xl', '1.5rem') as string,
    fontSizeMd: getTypography('fontSizes.medium', '1rem') as string,
    textPrimary: getColor('text.primary', '#333333'),
    textSecondary: getColor('text.secondary', '#666666'),
    textDisabled: getColor('text.disabled', '#999999'),
    borderRadiusSmall: getBorderRadius('sm', '4px'),
    primaryMain: getColor('primary.main', '#1976d2'),
    primaryDark: getColor('primary.dark', '#115293'),
    primaryLight: getColor('primary.light', '#4791db'),
    primaryContrastText: getColor('primary.contrastText', '#ffffff'),
    secondaryMain: getColor('secondary.main', '#dc004e'),
    secondaryDark: getColor('secondary.dark', '#9a0036'),
    secondaryContrastText: getColor('secondary.contrastText', '#ffffff'),
    successLight: getColor('success.light', '#81c784'),
    successDark: getColor('success.dark', '#388e3c'),
    infoLight: getColor('info.light', '#64b5f6'),
    infoDark: getColor('info.dark', '#1976d2'),
    warningLight: getColor('warning.light', '#ffb74d'),
    warningDark: getColor('warning.dark', '#f57c00'),
    borderMain: getColor('border.main', '#e0e0e0'),
    backgroundPaper: getColor('background.paper', '#ffffff'),
    backgroundSubtle: getColor('background.subtle', '#f5f5f5'),
  };
}

// Styled components for the demo
const DemoContainer = styled.div`
  padding: 32px;
  background-color: #f9fafc;
  min-height: calc(100vh - 64px);
`;

const Title = styled.h1<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeXl};
  margin-bottom: 16px;
  color: ${props => props.$themeStyles.textPrimary};
  font-weight: 700;
`;

const Description = styled.p<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeMd};
  margin-bottom: 32px;
  color: ${props => props.$themeStyles.textSecondary};
  max-width: 800px;
  line-height: 1.6;
`;

const DashboardControls = styled.div`
  margin-bottom: 32px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const Button = styled.button<{ $themeStyles: ThemeStyles }>`
  padding: 10px 16px;
  background-color: ${props => props.$themeStyles.primaryMain};
  color: ${props => props.$themeStyles.primaryContrastText};
  border: none;
  border-radius: ${props => props.$themeStyles.borderRadiusSmall};
  font-size: ${props => props.$themeStyles.fontSizeMd};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${props => props.$themeStyles.primaryDark};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const WidgetButton = styled(Button)<{ $themeStyles: ThemeStyles }>`
  background-color: white;
  color: ${props => props.$themeStyles.textPrimary};
  border: 1px solid ${props => props.$themeStyles.borderMain};
  
  &:hover {
    background-color: ${props => props.$themeStyles.backgroundSubtle};
    color: ${props => props.$themeStyles.primaryMain};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const SelectControl = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Select = styled.select<{ $themeStyles: ThemeStyles }>`
  padding: 10px 14px;
  border: 1px solid ${props => props.$themeStyles.borderMain};
  border-radius: ${props => props.$themeStyles.borderRadiusSmall};
  font-size: ${props => props.$themeStyles.fontSizeMd};
  color: ${props => props.$themeStyles.textPrimary};
  background-color: ${props => props.$themeStyles.backgroundPaper};
  cursor: pointer;
  min-width: 180px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$themeStyles.primaryMain};
    box-shadow: 0 0 0 3px ${props => props.$themeStyles.primaryLight};
  }
`;

const Label = styled.label<{ $themeStyles: ThemeStyles }>`
  font-size: ${props => props.$themeStyles.fontSizeMd};
  color: ${props => props.$themeStyles.textPrimary};
  font-weight: 500;
`;

// Sample simple widget components
const SimpleStatsWidget = () => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  
  return (
    <div>
      <h3 style={{ 
        marginBottom: '20px', 
        color: themeStyles.textPrimary,
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          backgroundColor: themeStyles.primaryLight, 
          color: themeStyles.primaryDark,
          width: '24px', 
          height: '24px', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px'
        }}>
          📊
        </span>
        Key Metrics
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '16px' 
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: themeStyles.successLight, 
          borderRadius: themeStyles.borderRadiusSmall,
          color: themeStyles.successDark,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            fontSize: '14px'
          }}>
            💰
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>Revenue</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>$24,500</div>
          <div style={{ 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            padding: '4px 8px',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            <span style={{ fontSize: '12px' }}>↗</span> +15% vs last month
          </div>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: themeStyles.infoLight, 
          borderRadius: themeStyles.borderRadiusSmall,
          color: themeStyles.infoDark,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            fontSize: '14px'
          }}>
            👥
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>Visitors</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>12,846</div>
          <div style={{ 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            padding: '4px 8px',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            <span style={{ fontSize: '12px' }}>↗</span> +8% vs last month
          </div>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: themeStyles.warningLight, 
          borderRadius: themeStyles.borderRadiusSmall,
          color: themeStyles.warningDark,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            fontSize: '14px'
          }}>
            📈
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>Conversion</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>3.2%</div>
          <div style={{ 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            padding: '4px 8px',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            <span style={{ fontSize: '12px' }}>↗</span> +0.5% vs last month
          </div>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e9eeff', 
          borderRadius: themeStyles.borderRadiusSmall,
          color: '#2d4379',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            fontSize: '14px'
          }}>
            📱
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>App Users</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>3,452</div>
          <div style={{ 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            padding: '4px 8px',
            borderRadius: '12px',
            width: 'fit-content'
          }}>
            <span style={{ fontSize: '12px' }}>↗</span> +12% vs last month
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent activities widget
const RecentActivitiesWidget = () => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  
  const activities = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'updated the analytics dashboard design',
      time: '15 minutes ago',
      icon: '🎨',
      iconColor: '#e3f2fd',
      avatar: 'SJ'
    },
    {
      id: 2,
      user: 'Michael Chen',
      action: 'added new chart components to the library',
      time: '2 hours ago',
      icon: '📊',
      iconColor: '#f1f8e9',
      avatar: 'MC'
    },
    {
      id: 3,
      user: 'Alex Rodriguez',
      action: 'fixed responsive layout issues on mobile view',
      time: '5 hours ago',
      icon: '📱',
      iconColor: '#e8eaf6',
      avatar: 'AR'
    },
    {
      id: 4,
      user: 'Lindsay Park',
      action: 'merged pull request for new data visualization features',
      time: 'Yesterday',
      icon: '🔄',
      iconColor: '#fff3e0',
      avatar: 'LP'
    },
    {
      id: 5,
      user: 'Jordan Smith',
      action: 'commented on the widget drag-and-drop implementation',
      time: 'Yesterday',
      icon: '💬',
      iconColor: '#e0f2f1',
      avatar: 'JS'
    }
  ];
  
  // Generate random background color for avatar
  const getAvatarColor = (initials) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffc107', '#ff9800', '#ff5722'
    ];
    
    // Use first character of initials to select a color
    const charCode = initials.charCodeAt(0);
    return colors[charCode % colors.length];
  };
  
  return (
    <div>
      <h3 style={{ 
        marginBottom: '20px', 
        color: themeStyles.textPrimary,
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          backgroundColor: themeStyles.primaryLight, 
          color: themeStyles.primaryDark,
          width: '24px', 
          height: '24px', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px'
        }}>
          ⏱
        </span>
        Recent Activities
      </h3>
      
      <div style={{ 
        backgroundColor: themeStyles.backgroundPaper,
        borderRadius: themeStyles.borderRadiusSmall,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid ' + themeStyles.borderMain
      }}>
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            style={{
              display: 'flex',
              padding: '16px',
              borderBottom: index !== activities.length - 1 ? '1px solid ' + themeStyles.borderMain : 'none',
              transition: 'background-color 0.2s ease',
              gap: '16px',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: getAvatarColor(activity.avatar),
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500',
              fontSize: '14px',
              flexShrink: 0
            }}>
              {activity.avatar}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <div style={{
                  color: themeStyles.textPrimary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {activity.user}
                </div>
                <div style={{
                  color: themeStyles.textSecondary,
                  fontSize: '12px'
                }}>
                  {activity.time}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: activity.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  {activity.icon}
                </div>
                <div style={{
                  color: themeStyles.textSecondary,
                  fontSize: '14px'
                }}>
                  {activity.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '16px',
        textAlign: 'center'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          padding: '8px 16px',
          color: themeStyles.primaryMain,
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          margin: '0 auto'
        }}>
          View All Activities
          <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </div>
    </div>
  );
};

// Notes widget
const NotesWidget = () => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  const [notes, setNotes] = useState([
    { id: 1, text: 'Schedule team meeting to review dashboard requirements', date: 'Oct 25', color: '#e1f5fe' },
    { id: 2, text: 'Research visualization libraries for advanced charts', date: 'Oct 27', color: '#fff8e1' },
    { id: 3, text: 'Implement dark mode for dashboard components', date: 'Oct 30', color: '#f3e5f5' },
  ]);
  
  const [newNote, setNewNote] = useState('');
  
  const addNote = () => {
    if (newNote.trim() === '') return;
    
    const colors = ['#e1f5fe', '#fff8e1', '#f3e5f5', '#e8f5e9', '#e8eaf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    setNotes([
      ...notes, 
      { 
        id: Date.now(), 
        text: newNote.trim(), 
        date: dateStr,
        color: randomColor
      }
    ]);
    setNewNote('');
  };
  
  return (
    <div>
      <h3 style={{ 
        marginBottom: '20px', 
        color: themeStyles.textPrimary,
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          backgroundColor: themeStyles.primaryLight, 
          color: themeStyles.primaryDark,
          width: '24px', 
          height: '24px', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px'
        }}>
          📝
        </span>
        Quick Notes
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gap: '16px', 
        gridTemplateColumns: '1fr 1fr', 
        marginBottom: '16px' 
      }}>
        {notes.map(note => (
          <div 
            key={note.id} 
            style={{ 
              padding: '16px',
              backgroundColor: note.color,
              borderRadius: themeStyles.borderRadiusSmall,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ 
              position: 'absolute',
              top: '10px',
              right: '10px',
              color: 'rgba(0, 0, 0, 0.3)',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {note.date}
            </div>
            
            <p style={{ 
              margin: '0',
              marginTop: '18px',
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: '14px',
              lineHeight: '1.4',
              wordBreak: 'break-word',
              flex: 1
            }}>
              {note.text}
            </p>
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '12px'
            }}>
              <div style={{ 
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                cursor: 'pointer',
                color: 'rgba(0, 0, 0, 0.5)'
              }}>
                ✏️
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <textarea 
          placeholder="Add a new note..." 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{
            padding: '12px',
            borderRadius: themeStyles.borderRadiusSmall,
            border: '1px solid ' + themeStyles.borderMain,
            resize: 'none',
            minHeight: '80px',
            fontSize: '14px',
            color: themeStyles.textPrimary,
            backgroundColor: themeStyles.backgroundPaper,
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        
        <button 
          onClick={addNote}
          disabled={newNote.trim() === ''}
          style={{
            padding: '10px 16px',
            backgroundColor: themeStyles.primaryMain,
            color: themeStyles.primaryContrastText,
            border: 'none',
            borderRadius: themeStyles.borderRadiusSmall,
            cursor: newNote.trim() === '' ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: newNote.trim() === '' ? 0.7 : 1,
            transition: 'all 0.2s ease',
            alignSelf: 'flex-end'
          }}
        >
          Add Note
        </button>
      </div>
    </div>
  );
};

// Sample tasks widget
const TasksWidget = () => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review dashboard design', completed: true, priority: 'high', dueDate: '2023-10-30' },
    { id: 2, text: 'Implement analytics widgets', completed: false, priority: 'high', dueDate: '2023-11-02' },
    { id: 3, text: 'Create responsive layouts', completed: false, priority: 'medium', dueDate: '2023-11-05' },
    { id: 4, text: 'Fix drag and drop on mobile', completed: false, priority: 'low', dueDate: '2023-11-10' },
    { id: 5, text: 'Add widget configuration options', completed: false, priority: 'medium', dueDate: '2023-11-12' },
  ]);
  
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };
  
  // Format the due date
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };
  
  return (
    <div>
      <h3 style={{ 
        marginBottom: '20px', 
        color: themeStyles.textPrimary,
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          backgroundColor: themeStyles.primaryLight, 
          color: themeStyles.primaryDark,
          width: '24px', 
          height: '24px', 
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px'
        }}>
          ✓
        </span>
        Project Tasks
      </h3>
      
      <div style={{ 
        backgroundColor: themeStyles.backgroundPaper,
        borderRadius: themeStyles.borderRadiusSmall,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid ' + themeStyles.borderMain
      }}>
        {tasks.map((task, index) => (
          <div 
            key={task.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: index !== tasks.length - 1 ? '1px solid ' + themeStyles.borderMain : 'none',
              backgroundColor: task.completed ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
              transition: 'background-color 0.2s ease',
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flex: 1
            }}>
              <div 
                onClick={() => toggleTask(task.id)} 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '4px',
                  border: task.completed 
                    ? '1px solid ' + themeStyles.primaryMain
                    : '1px solid ' + themeStyles.borderMain,
                  backgroundColor: task.completed ? themeStyles.primaryMain : 'transparent',
                  marginRight: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                {task.completed && '✓'}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: themeStyles.textPrimary,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  opacity: task.completed ? 0.6 : 1,
                  fontWeight: 500,
                  marginBottom: '4px',
                  fontSize: '14px'
                }}>
                  {task.text}
                </div>
                
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  color: themeStyles.textSecondary
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: getPriorityColor(task.priority)
                    }} />
                    <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '11px' }}>📅</span>
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              cursor: 'pointer',
              color: themeStyles.textSecondary,
              transition: 'all 0.2s ease',
              fontSize: '16px'
            }}>
              ⋮
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: themeStyles.borderRadiusSmall,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: themeStyles.primaryMain,
        fontWeight: 500,
        fontSize: '14px',
        border: '1px dashed ' + themeStyles.borderMain
      }}>
        <span style={{ fontSize: '16px' }}>+</span>
        Add New Task
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
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);
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
      <Title $themeStyles={themeStyles}>Dashboard Templates</Title>
      <Description $themeStyles={themeStyles}>
        Interactive dashboard templates with drag-and-drop functionality, responsive layouts, and customizable widgets.
        Choose a template, add widgets, and arrange them to create your perfect dashboard.
      </Description>
      
      <DashboardControls>
        <SelectControl>
          <Label $themeStyles={themeStyles} htmlFor="template-select">Template</Label>
          <Select 
            $themeStyles={themeStyles}
            id="template-select"
            value={selectedTemplate} 
            onChange={handleTemplateChange}
          >
            <option value="empty">Empty Dashboard</option>
            <option value="analytics">Analytics Dashboard</option>
            <option value="projectManagement">Project Management</option>
          </Select>
        </SelectControl>
        
        <Button $themeStyles={themeStyles} onClick={toggleEditing}>
          <span>{isEditing ? '✓' : '✏️'}</span>
          {isEditing ? 'Save Layout' : 'Edit Dashboard'}
        </Button>
      </DashboardControls>
      
      {isEditing && (
        <DashboardControls>
          <WidgetButton $themeStyles={themeStyles} onClick={addStatsWidget}>
            <span>📊</span> Add Stats Widget
          </WidgetButton>
          <WidgetButton $themeStyles={themeStyles} onClick={addTasksWidget}>
            <span>✓</span> Add Tasks Widget
          </WidgetButton>
          <WidgetButton $themeStyles={themeStyles} onClick={addNotesWidget}>
            <span>📝</span> Add Notes Widget
          </WidgetButton>
          <WidgetButton $themeStyles={themeStyles} onClick={addCorrelationWidget}>
            <span>📈</span> Add Correlation Widget
          </WidgetButton>
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