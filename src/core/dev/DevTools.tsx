import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { DevPerformanceMonitor } from './DevPerformanceMonitor';
import { useMotionPreference } from '../hooks/useAnimation';

// Types
interface DevToolsProps {
  enabled?: boolean;
}

interface TabProps {
  active: boolean;
  onClick: () => void;
}

interface DevToolsState {
  visible: boolean;
  activeTab: string;
  expandedComponents: string[];
  highlightedComponents: boolean;
  recordingPerformance: boolean;
  themeExplorerFilter: string;
}

// Styled Components
const DevToolsContainer = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: ${({ visible }) => (visible ? '0' : '-500px')};
  right: 0;
  width: 400px;
  height: 500px;
  background-color: ${({ theme }) => getBackground(theme, 'paper', '#fff')};
  color: ${({ theme }) => getText(theme, 'primary', '#000')};
  border-top-left-radius: 8px;
  border-left: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
  border-top: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: ${({ theme }) => getColor(theme, 'primary', 'main', '#1976d2')};
  color: ${({ theme }) => getColor(theme, 'primary', 'contrastText', '#fff')};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  font-size: 24px;
  
  &:hover {
    background-color: ${({ theme }) => getColor(theme, 'primary', 'dark', '#1565c0')};
  }
`;

const Header = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme, active }) => active ? getColor(theme, 'primary', 'main', '#1976d2') : getText(theme, 'secondary', '#757575')};
  font-weight: ${({ active }) => active ? 600 : 400};
  border-bottom: 2px solid ${({ theme, active }) => active ? getColor(theme, 'primary', 'main', '#1976d2') : 'transparent'};
  
  &:hover {
    color: ${({ theme }) => getColor(theme, 'primary', 'main', '#1976d2')};
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  
  ${({ theme, variant }) => {
    if (variant === 'primary') {
      return css`
        background-color: ${getColor(theme, 'primary', 'main', '#1976d2')};
        color: ${getColor(theme, 'primary', 'contrastText', '#fff')};
        &:hover {
          background-color: ${getColor(theme, 'primary', 'dark', '#1565c0')};
        }
      `;
    } else if (variant === 'warning') {
      return css`
        background-color: ${getColor(theme, 'error', 'main', '#f44336')};
        color: ${getColor(theme, 'error', 'contrastText', '#fff')};
        &:hover {
          background-color: ${getColor(theme, 'error', 'dark', '#d32f2f')};
        }
      `;
    } else {
      return css`
        background-color: ${getBackground(theme, 'default', '#f5f5f5')};
        color: ${getText(theme, 'primary', '#000')};
        border: 1px solid ${getDivider(theme, '#e0e0e0')};
        &:hover {
          background-color: ${getThemeValue(theme, 'colors.action.hover', 'rgba(0, 0, 0, 0.04)')};
        }
      `;
    }
  }}
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => getBackground(theme, 'default', '#f5f5f5')};
  border: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
  border-radius: 20px;
  transition: .3s;
  
  &:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 2px;
    background-color: ${({ theme }) => getColor(theme, 'text', 'secondary', '#757575')};
    border-radius: 50%;
    transition: .3s;
  }
  
  input:checked + & {
    background-color: ${({ theme }) => getColor(theme, 'primary', 'main', '#1976d2')};
    &:before {
      background-color: white;
      transform: translateX(20px);
    }
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SwitchLabel = styled.span`
  font-size: 13px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
  margin-bottom: 12px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => getColor(theme, 'primary', 'main', '#1976d2')};
  }
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => getBackground(theme, 'default', '#f5f5f5')};
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
`;

const ThemeItem = styled.div`
  margin-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => getDivider(theme, '#e0e0e0')};
  padding-bottom: 8px;
`;

const ThemeProperty = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${({ color }) => color};
  margin-right: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const PropertyName = styled.span`
  font-size: 12px;
  color: ${({ theme }) => getColor(theme, 'text', 'secondary', '#757575')};
  margin-right: 8px;
`;

const PropertyValue = styled.span`
  font-size: 12px;
  color: ${({ theme }) => getColor(theme, 'text', 'primary', '#000')};
  font-family: monospace;
`;

// Helper to safely get color values from theme
function getColorValue(colorObj: any, property: string, fallback = '#ccc'): string {
  if (colorObj && typeof colorObj === 'object' && property in colorObj) {
    return colorObj[property];
  }
  return fallback;
}

// Helper to safely get color from theme
function getColor(theme: any, colorPath: string, property: string, fallback = '#ccc'): string {
  try {
    const color = theme?.colors?.[colorPath];
    if (color && typeof color === 'object' && property in color) {
      return color[property] || fallback;
    }
    return fallback;
  } catch (error) {
    console.warn(`Failed to get color ${property} for path: ${colorPath}`, error);
    return fallback;
  }
}

// Helper to safely get background from theme
function getBackground(theme: any, property: string, fallback = '#fff'): string {
  try {
    return theme?.colors?.background?.[property] || fallback;
  } catch (error) {
    console.warn(`Failed to get background: ${property}`, error);
    return fallback;
  }
}

// Helper to safely get text color from theme
function getText(theme: any, property: string, fallback = '#000'): string {
  try {
    return theme?.colors?.text?.[property] || fallback;
  } catch (error) {
    console.warn(`Failed to get text color: ${property}`, error);
    return fallback;
  }
}

// Helper to safely get divider from theme
function getDivider(theme: any, fallback = '#e0e0e0'): string {
  try {
    return theme?.colors?.divider || fallback;
  } catch (error) {
    console.warn('Failed to get divider color', error);
    return fallback;
  }
}

// Helper to safely get any theme value
function getThemeValue(theme: any, path: string, fallback: any): any {
  try {
    const parts = path.split('.');
    let value: any = theme;
    
    for (const part of parts) {
      if (value === undefined || value === null) return fallback;
      value = value[part];
    }
    
    return value !== undefined && value !== null ? value : fallback;
  } catch (error) {
    console.warn(`Failed to get theme value for path: ${path}`, error);
    return fallback;
  }
}

function isColorObject(value: any): boolean {
  return typeof value === 'object' && value !== null && 
         ('main' in value || 'light' in value || 'dark' in value);
}

// Component
const DevTools: React.FC<DevToolsProps> = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  const [state, setState] = useState<DevToolsState>({
    visible: false,
    activeTab: 'components',
    expandedComponents: [],
    highlightedComponents: false,
    recordingPerformance: false,
    themeExplorerFilter: '',
  });
  
  const theme = useTheme();
  const reduceMotion = useMotionPreference();
  
  // Local storage persistence
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('devTools');
      if (savedState) {
        setState(prevState => ({ ...prevState, ...JSON.parse(savedState) }));
      }
    } catch (e) {
      console.error('Failed to load DevTools state from localStorage', e);
    }
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem('devTools', JSON.stringify({
        visible: state.visible,
        activeTab: state.activeTab,
        expandedComponents: state.expandedComponents,
        highlightedComponents: state.highlightedComponents,
      }));
    } catch (e) {
      console.error('Failed to save DevTools state to localStorage', e);
    }
  }, [state]);
  
  // Add component highlighting
  useEffect(() => {
    if (state.highlightedComponents) {
      const style = document.createElement('style');
      style.id = 'dev-tools-component-highlight';
      style.textContent = `
        [data-component-name]:hover {
          outline: 2px dashed #1976d2 !important;
          outline-offset: 2px !important;
          position: relative !important;
        }
        [data-component-name]:hover::after {
          content: attr(data-component-name);
          position: absolute;
          bottom: 100%;
          left: 0;
          background: #1976d2;
          color: white;
          padding: 2px 4px;
          font-size: 10px;
          border-radius: 2px;
          z-index: 10000;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [state.highlightedComponents]);
  
  const toggleVisibility = () => {
    setState(prevState => ({ ...prevState, visible: !prevState.visible }));
  };
  
  const setActiveTab = (tab: string) => {
    setState(prevState => ({ ...prevState, activeTab: tab }));
  };
  
  const toggleComponentHighlight = () => {
    setState(prevState => ({ ...prevState, highlightedComponents: !prevState.highlightedComponents }));
  };
  
  const togglePerformanceRecording = () => {
    setState(prevState => ({ ...prevState, recordingPerformance: !prevState.recordingPerformance }));
  };
  
  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all local storage?')) {
      localStorage.clear();
      alert('Local storage cleared');
    }
  };
  
  const clearSessionStorage = () => {
    if (window.confirm('Are you sure you want to clear all session storage?')) {
      sessionStorage.clear();
      alert('Session storage cleared');
    }
  };
  
  const resetDevTools = () => {
    if (window.confirm('Reset DevTools to default settings?')) {
      setState({
        visible: true,
        activeTab: 'components',
        expandedComponents: [],
        highlightedComponents: false,
        recordingPerformance: false,
        themeExplorerFilter: '',
      });
    }
  };
  
  const handleThemeExplorerFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prevState => ({ ...prevState, themeExplorerFilter: e.target.value }));
  };
  
  // Render component explorer tab
  const renderComponentsTab = () => (
    <>
      <Section>
        <SectionTitle>Component Inspector</SectionTitle>
        <SwitchContainer>
          <SwitchLabel>Highlight Components</SwitchLabel>
          <Switch>
            <input 
              type="checkbox" 
              checked={state.highlightedComponents} 
              onChange={toggleComponentHighlight} 
            />
            <Slider />
          </Switch>
        </SwitchContainer>
        <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
          When enabled, hover over components to see their names. Add data-component-name attributes to your components for this to work.
        </p>
      </Section>
      
      <Section>
        <SectionTitle>Development Utilities</SectionTitle>
        <Grid>
          <Button onClick={() => console.log(theme)}>Log Theme</Button>
          <Button onClick={() => console.log('Redux Store', window.__REDUX_DEVTOOLS_EXTENSION__ ? 'Available' : 'Not available')}>Check Redux</Button>
          <Button onClick={() => console.log(window.localStorage)}>Log localStorage</Button>
          <Button onClick={() => console.log(window.sessionStorage)}>Log sessionStorage</Button>
        </Grid>
      </Section>
    </>
  );
  
  // Render state management tab
  const renderStateTab = () => (
    <>
      <Section>
        <SectionTitle>Storage Management</SectionTitle>
        <Grid>
          <Button onClick={clearLocalStorage} variant="warning">Clear localStorage</Button>
          <Button onClick={clearSessionStorage} variant="warning">Clear sessionStorage</Button>
        </Grid>
      </Section>
      
      <Section>
        <SectionTitle>Current localStorage Keys</SectionTitle>
        <CodeBlock>
          {Object.keys(localStorage).map(key => (
            <div key={key} style={{ marginBottom: '4px' }}>
              {key}: {localStorage.getItem(key)?.length} chars
            </div>
          ))}
        </CodeBlock>
      </Section>
    </>
  );
  
  // Render performance tab
  const renderPerformanceTab = () => (
    <>
      <Section>
        <SectionTitle>Performance Monitoring</SectionTitle>
        <SwitchContainer>
          <SwitchLabel>Record Performance</SwitchLabel>
          <Switch>
            <input 
              type="checkbox" 
              checked={state.recordingPerformance} 
              onChange={togglePerformanceRecording} 
            />
            <Slider />
          </Switch>
        </SwitchContainer>
        
        {state.recordingPerformance && <DevPerformanceMonitor recordingActive={true} />}
        
        <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
          When enabled, the performance of component renders will be monitored and logged to the console.
        </p>
      </Section>
      
      <Section>
        <SectionTitle>User Preferences</SectionTitle>
        <div style={{ fontSize: '13px', marginBottom: '8px' }}>
          <strong>Reduced Motion:</strong> {reduceMotion ? 'Enabled' : 'Disabled'}
        </div>
        <div style={{ fontSize: '13px' }}>
          <strong>Color Scheme:</strong> {window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}
        </div>
      </Section>
    </>
  );
  
  // Render theme explorer tab
  const renderThemeTab = () => {
    const themeExplorer = (obj: any, path = '', depth = 0) => {
      if (depth > 5) return null; // Prevent infinite recursion
      
      const filteredEntries = Object.entries(obj).filter(([key]) => {
        const fullPath = path ? `${path}.${key}` : key;
        return !state.themeExplorerFilter || fullPath.toLowerCase().includes(state.themeExplorerFilter.toLowerCase());
      });
      
      return filteredEntries.map(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          if (isColorObject(value)) {
            return (
              <ThemeItem key={fullPath}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>{fullPath}</div>
                {Object.entries(value).map(([colorKey, colorValue]) => (
                  <ThemeProperty key={`${fullPath}.${colorKey}`}>
                    <ColorSwatch color={colorValue as string} />
                    <PropertyName>{colorKey}:</PropertyName>
                    <PropertyValue>{colorValue as string}</PropertyValue>
                  </ThemeProperty>
                ))}
              </ThemeItem>
            );
          } else {
            return (
              <div key={fullPath} style={{ marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>{fullPath}</div>
                <div style={{ paddingLeft: '12px' }}>
                  {themeExplorer(value, fullPath, depth + 1)}
                </div>
              </div>
            );
          }
        } else if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'))) {
          return (
            <ThemeProperty key={fullPath}>
              <ColorSwatch color={value} />
              <PropertyName>{fullPath}:</PropertyName>
              <PropertyValue>{value}</PropertyValue>
            </ThemeProperty>
          );
        } else {
          return (
            <ThemeProperty key={fullPath}>
              <PropertyName>{fullPath}:</PropertyName>
              <PropertyValue>{String(value)}</PropertyValue>
            </ThemeProperty>
          );
        }
      });
    };
    
    return (
      <>
        <Section>
          <SectionTitle>Theme Explorer</SectionTitle>
          <SearchInput
            type="text"
            placeholder="Filter theme properties..."
            value={state.themeExplorerFilter}
            onChange={handleThemeExplorerFilterChange}
          />
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {themeExplorer(theme)}
          </div>
        </Section>
      </>
    );
  };
  
  // Render settings tab
  const renderSettingsTab = () => (
    <>
      <Section>
        <SectionTitle>DevTools Settings</SectionTitle>
        <Button 
          onClick={resetDevTools} 
          variant="warning" 
          style={{ marginBottom: '12px', width: '100%' }}
        >
          Reset DevTools Settings
        </Button>
        
        <div style={{ fontSize: '12px', marginBottom: '16px' }}>
          <strong>Version:</strong> 1.0.0
        </div>
        
        <div style={{ fontSize: '12px' }}>
          <p>DevTools provides runtime debugging and inspection tools for your application.</p>
          <p>Available in development mode only.</p>
        </div>
      </Section>
    </>
  );
  
  // If not enabled, don't render anything
  if (!enabled) return null;
  
  return (
    <>
      <ToggleButton onClick={toggleVisibility}>
        {state.visible ? '×' : '⚙️'}
      </ToggleButton>
      
      <DevToolsContainer visible={state.visible}>
        <Header>
          <Title>Developer Tools</Title>
          <Button onClick={toggleVisibility}>Close</Button>
        </Header>
        
        <TabContainer>
          <Tab 
            active={state.activeTab === 'components'} 
            onClick={() => setActiveTab('components')}
          >
            Components
          </Tab>
          <Tab 
            active={state.activeTab === 'state'} 
            onClick={() => setActiveTab('state')}
          >
            State
          </Tab>
          <Tab 
            active={state.activeTab === 'performance'} 
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </Tab>
          <Tab 
            active={state.activeTab === 'theme'} 
            onClick={() => setActiveTab('theme')}
          >
            Theme
          </Tab>
          <Tab 
            active={state.activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Tab>
        </TabContainer>
        
        <Content>
          {state.activeTab === 'components' && renderComponentsTab()}
          {state.activeTab === 'state' && renderStateTab()}
          {state.activeTab === 'performance' && renderPerformanceTab()}
          {state.activeTab === 'theme' && renderThemeTab()}
          {state.activeTab === 'settings' && renderSettingsTab()}
        </Content>
      </DevToolsContainer>
    </>
  );
};

export default DevTools; 