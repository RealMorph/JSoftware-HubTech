import React, { createContext, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ComponentInspector } from './ComponentInspector';
import { DevPerformanceMonitor } from './DevPerformanceMonitor';
import CodeGen from './CodeGen';

// Development features that can be enabled/disabled
export type DevFeature = 
  | 'componentInspection' 
  | 'performanceMonitoring' 
  | 'codeGeneration'
  | 'debugLogging';

// Configuration options for developer tools
interface DevToolsConfig {
  // Visual debugging
  componentHighlighting: boolean;
  gridOverlay: boolean;
  
  // Performance monitoring
  performanceMonitoring: boolean;
  
  // State inspection
  stateInspector: boolean;
  
  // Network monitoring
  networkMonitoring: boolean;
  
  // Additional settings
  logRenders: boolean;
  showBreakpoints: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

interface DevToolsContextType {
  isEnabled: boolean;
  toggleDevTools: () => void;
  config: DevToolsConfig;
  updateConfig: (updatedConfig: Partial<DevToolsConfig>) => void;
  highlightedComponent: string | null;
  setHighlightedComponent: (componentName: string | null) => void;
}

// Default configuration
const defaultConfig: DevToolsConfig = {
  componentHighlighting: false,
  gridOverlay: false,
  performanceMonitoring: false,
  stateInspector: false,
  networkMonitoring: false,
  logRenders: false,
  showBreakpoints: false,
  logLevel: 'info'
};

// Create context with default value
const DevToolsContext = createContext<DevToolsContextType>({
  isEnabled: false,
  toggleDevTools: () => {},
  config: defaultConfig,
  updateConfig: () => {},
  highlightedComponent: null,
  setHighlightedComponent: () => {},
});

// Local storage keys
const DEV_TOOLS_ENABLED_KEY = 'devtools_enabled';
const DEV_TOOLS_CONFIG_KEY = 'devtools_config';

interface DevToolsProviderProps {
  children: React.ReactNode;
  defaultEnabled?: boolean;
}

export const DevToolsProvider: React.FC<DevToolsProviderProps> = ({
  children,
  defaultEnabled = false,
}) => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Initialize state from local storage if available
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (!isDevelopment) return false;
    
    const storedValue = localStorage.getItem(DEV_TOOLS_ENABLED_KEY);
    return storedValue ? JSON.parse(storedValue) : defaultEnabled;
  });
  
  const [config, setConfig] = useState<DevToolsConfig>(() => {
    if (!isDevelopment) return defaultConfig;
    
    const storedConfig = localStorage.getItem(DEV_TOOLS_CONFIG_KEY);
    return storedConfig ? { ...defaultConfig, ...JSON.parse(storedConfig) } : defaultConfig;
  });
  
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);
  
  // Setup keyboard shortcut for toggling dev tools
  useEffect(() => {
    if (!isDevelopment) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Alt+D as the toggle shortcut
      if (e.altKey && e.key === 'd') {
        toggleDevTools();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);
  
  // Persist state changes to localStorage
  useEffect(() => {
    if (!isDevelopment) return;
    
    localStorage.setItem(DEV_TOOLS_ENABLED_KEY, JSON.stringify(isEnabled));
  }, [isEnabled]);
  
  useEffect(() => {
    if (!isDevelopment) return;
    
    localStorage.setItem(DEV_TOOLS_CONFIG_KEY, JSON.stringify(config));
  }, [config]);
  
  // Toggle dev tools on/off
  const toggleDevTools = () => {
    setIsEnabled(prev => !prev);
  };
  
  // Update configuration
  const updateConfig = (updatedConfig: Partial<DevToolsConfig>) => {
    setConfig(prev => ({ ...prev, ...updatedConfig }));
  };
  
  // Create value object
  const value: DevToolsContextType = {
    isEnabled: isDevelopment && isEnabled,
    toggleDevTools,
    config,
    updateConfig,
    highlightedComponent,
    setHighlightedComponent,
  };
  
  return (
    <DevToolsContext.Provider value={value}>
      {children}
      {isEnabled && isDevelopment && (
        <>
          {config.componentHighlighting && <ComponentInspector />}
          {config.performanceMonitoring && <DevPerformanceMonitor />}
          <DevToolsPanel />
        </>
      )}
    </DevToolsContext.Provider>
  );
};

// Custom hook for accessing dev tools
export const useDevTools = (): DevToolsContextType => {
  const context = useContext(DevToolsContext);
  if (context === undefined) {
    throw new Error('useDevTools must be used within a DevToolsProvider');
  }
  return context;
};

// Component for the dev tools panel
const DevToolsPanel: React.FC = () => {
  const { isEnabled, config, updateConfig, toggleDevTools } = useDevTools();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isEnabled) return null;
  
  // Toggle a feature in the configuration
  const toggleFeature = (feature: keyof DevToolsConfig) => {
    if (typeof config[feature] === 'boolean') {
      updateConfig({ [feature]: !config[feature] });
    }
  };
  
  // Update log level
  const setLogLevel = (level: 'debug' | 'info' | 'warn' | 'error') => {
    updateConfig({ logLevel: level });
  };
  
  return (
    <>
      {/* Floating button to open panel */}
      <DevToolsButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '🛠️'}
      </DevToolsButton>
      
      {isOpen && (
        <DevToolsPanelContainer>
          <DevToolsHeader>
            Developer Tools
            <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
          </DevToolsHeader>
          
          <DevToolsContent>
            <DevToolsSection>
              <DevToolsSectionTitle>General</DevToolsSectionTitle>
              <ToggleButton 
                active={isEnabled} 
                onClick={toggleDevTools}
              >
                {isEnabled ? 'Disable Dev Tools' : 'Enable Dev Tools'}
              </ToggleButton>
            </DevToolsSection>
            
            <DevToolsSection>
              <DevToolsSectionTitle>Features</DevToolsSectionTitle>
              
              <FeatureToggle 
                active={config.componentHighlighting} 
                onClick={() => toggleFeature('componentHighlighting')}
              >
                Component Inspector
                <Shortcut>Alt+Shift+I</Shortcut>
              </FeatureToggle>
              
              <FeatureToggle 
                active={config.performanceMonitoring} 
                onClick={() => toggleFeature('performanceMonitoring')}
              >
                Performance Monitor
                <Shortcut>Alt+Shift+P</Shortcut>
              </FeatureToggle>
              
              <FeatureToggle 
                active={config.stateInspector} 
                onClick={() => toggleFeature('stateInspector')}
              >
                State Inspector
                <Shortcut>Alt+Shift+S</Shortcut>
              </FeatureToggle>
              
              <FeatureToggle 
                active={config.networkMonitoring} 
                onClick={() => toggleFeature('networkMonitoring')}
              >
                Network Monitor
              </FeatureToggle>
              
              <FeatureToggle 
                active={config.logRenders} 
                onClick={() => toggleFeature('logRenders')}
              >
                Log Component Renders
              </FeatureToggle>
            </DevToolsSection>
            
            <DevToolsSection>
              <DevToolsSectionTitle>Log Level</DevToolsSectionTitle>
              <RadioGroup>
                {(['debug', 'info', 'warn', 'error'] as const).map(level => (
                  <RadioItem key={level}>
                    <RadioInput
                      type="radio"
                      name="logLevel"
                      checked={config.logLevel === level}
                      onChange={() => setLogLevel(level)}
                    />
                    <RadioLabel>{level.toUpperCase()}</RadioLabel>
                  </RadioItem>
                ))}
              </RadioGroup>
            </DevToolsSection>
          </DevToolsContent>
        </DevToolsPanelContainer>
      )}
    </>
  );
};

// Styles for the dev tools panel
const DevToolsButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4285f4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 9999;
`;

const DevToolsPanelContainer = styled.div`
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 300px;
  height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
`;

const DevToolsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #4285f4;
  color: white;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
`;

const DevToolsContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
`;

const DevToolsSection = styled.div`
  margin-bottom: 16px;
`;

const DevToolsSectionTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #5f6368;
`;

interface ToggleButtonProps {
  active: boolean;
}

const ToggleButton = styled.button<ToggleButtonProps>`
  width: 100%;
  padding: 8px 12px;
  background-color: ${(props: ToggleButtonProps) => props.active ? '#e8f0fe' : 'white'};
  color: #4285f4;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: ${(props: ToggleButtonProps) => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: #e8f0fe;
  }
`;

interface FeatureToggleProps {
  active: boolean;
}

const FeatureToggle = styled.div<FeatureToggleProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: ${(props: FeatureToggleProps) => props.active ? '#e8f0fe' : 'white'};
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  color: #3c4043;
  
  &:hover {
    background-color: #e8f0fe;
  }
`;

const Shortcut = styled.span`
  font-size: 10px;
  color: #5f6368;
  background-color: #f1f3f4;
  padding: 2px 4px;
  border-radius: 4px;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const RadioItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  margin-bottom: 8px;
`;

const RadioInput = styled.input`
  margin-right: 4px;
`;

const RadioLabel = styled.label`
  font-size: 12px;
  color: #3c4858;
`;

// Higher-order component for making components visible to DevTools
export const withDevTools = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.FC<P> => {
  const name = componentName || Component.displayName || Component.name || 'AnonymousComponent';
  
  const WrappedComponent: React.FC<P> = (props) => {
    const { isEnabled, config, highlightedComponent, setHighlightedComponent } = useDevTools();
    
    // Only add DevTools functionality in development mode
    if (!isEnabled || process.env.NODE_ENV !== 'development') {
      return <Component {...props} />;
    }
    
    const isHighlighted = highlightedComponent === name;
    
    const handleMouseEnter = () => {
      if (config.componentHighlighting) {
        setHighlightedComponent(name);
      }
    };
    
    const handleMouseLeave = () => {
      if (config.componentHighlighting) {
        setHighlightedComponent(null);
      }
    };
    
    return (
      <div
        data-devtools-component={name}
        style={{
          position: 'relative',
          outline: isHighlighted ? '2px solid #61dafb' : 'none',
          boxShadow: isHighlighted ? '0 0 10px rgba(97, 218, 251, 0.5)' : 'none',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isHighlighted && (
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '0',
              background: '#61dafb',
              color: '#000',
              padding: '2px 6px',
              fontSize: '10px',
              borderRadius: '3px',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {name}
          </div>
        )}
        <Component {...props} />
      </div>
    );
  };
  
  WrappedComponent.displayName = `withDevTools(${name})`;
  
  return WrappedComponent;
};

// Hook for measuring performance of components
export const useDevPerformance = (componentName: string) => {
  const { isEnabled, config } = useDevTools();
  
  useEffect(() => {
    if (!isEnabled || !config.performanceMonitoring) {
      return;
    }
    
    // Only run in browser environment with Performance API support
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }
    
    const startMarkName = `Component:${componentName}:start`;
    const endMarkName = `Component:${componentName}:end`;
    const measureName = `Component:${componentName}`;
    
    // Mark the start of the render
    performance.mark(startMarkName);
    
    return () => {
      // Mark the end of the render and measure
      performance.mark(endMarkName);
      try {
        performance.measure(measureName, startMarkName, endMarkName);
        
        // Clean up marks
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
      } catch (error) {
        console.error(`Error measuring performance for ${componentName}:`, error);
      }
    };
  }, []);
};

export default DevToolsProvider; 