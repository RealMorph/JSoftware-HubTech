import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useDevTools } from './DevToolsProvider';

/**
 * Component tree node type
 */
export interface ComponentNode {
  id: string;
  name: string;
  depth: number;
  children: ComponentNode[];
  props: Record<string, any>;
  state: Record<string, any>;
  renderCount: number;
  lastRenderTime: number;
  renderDuration: number;
  domNode?: HTMLElement | null;
}

/**
 * Properties for ComponentInspector
 */
interface ComponentInspectorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * ComponentInspector component
 * 
 * A tool for inspecting component hierarchies and their props/state in real-time
 */
export const ComponentInspector: React.FC<ComponentInspectorProps> = ({ 
  position = 'bottom-right' 
}) => {
  const { config, isEnabled } = useDevTools();
  const [isExpanded, setIsExpanded] = useState(false);
  const [componentTree, setComponentTree] = useState<ComponentNode[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentNode | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [inspectMode, setInspectMode] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const inspectorPanelRef = useRef<HTMLDivElement | null>(null);
  
  // Position styles for the inspector panel
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
  };

  // Check if component inspection is enabled
  const inspectionEnabled = config.componentHighlighting;
  
  // Toggle inspection mode
  const toggleInspection = () => {
    setInspectMode(prev => !prev);
    if (!inspectMode) {
      setSelectedComponent(null);
      setHighlightedElement(null);
    }
  };
  
  // Load component tree from window.__DEV_COMPONENTS__
  useEffect(() => {
    if (!isExpanded) return;
    
    // Build tree from registered components
    const buildComponentTree = () => {
      const tree: ComponentNode[] = [];
      
      if (window.__DEV_COMPONENTS__) {
        Object.entries(window.__DEV_COMPONENTS__).forEach(([name, component]) => {
          if (component && component.__DEBUG_INFO__) {
            const { props, state, renderCount, lastRenderTime, renderDuration, domRef } = component.__DEBUG_INFO__;
            
            tree.push({
              id: name + '_' + lastRenderTime,
              name,
              depth: 0, // Will calculate later
              children: [],
              props: props || {},
              state: state || {},
              renderCount: renderCount || 0,
              lastRenderTime: lastRenderTime || 0,
              renderDuration: renderDuration || 0,
              domNode: domRef ? domRef.current : null,
            });
          }
        });
      }
      
      // Sort by render time to approximate hierarchy
      return tree.sort((a, b) => a.lastRenderTime - b.lastRenderTime);
    };
    
    const intervalId = setInterval(() => {
      setComponentTree(buildComponentTree());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isExpanded]);
  
  // Create overlay for element highlighting
  useEffect(() => {
    if (!highlightedElement) return;
    
    const rect = highlightedElement.getBoundingClientRect();
    if (overlayRef.current) {
      Object.assign(overlayRef.current.style, {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'block',
      });
    }
    
    return () => {
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
      }
    };
  }, [highlightedElement]);
  
  // Handle inspect mode
  useEffect(() => {
    if (!inspectMode) return;
    
    const handleMouseOver = (event: MouseEvent) => {
      event.stopPropagation();
      setHighlightedElement(event.target as HTMLElement);
    };
    
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Find component for this element
      const element = event.target as HTMLElement;
      const matchingComponent = findComponentForElement(element);
      
      if (matchingComponent) {
        setSelectedComponent(matchingComponent);
      }
      
      setInspectMode(false);
    };
    
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [inspectMode, componentTree]);
  
  // Find which component a DOM element belongs to
  const findComponentForElement = (element: HTMLElement): ComponentNode | null => {
    for (const component of componentTree) {
      if (component.domNode && component.domNode.contains(element)) {
        return component;
      }
    }
    return null;
  };
  
  // Get React component info from DOM element
  const getComponentInfo = (element: HTMLElement): ComponentInfo => {
    // This is a simplified approach - the actual implementation
    // would use React DevTools APIs or custom instrumentation
    
    // Try to get React fiber node
    const fiberKey = Object.keys(element).find(
      key => key.startsWith('__reactFiber$') || 
             key.startsWith('__reactInternalInstance$')
    );
    
    const propsKey = Object.keys(element).find(
      key => key.startsWith('__reactProps$')
    );
    
    if (!fiberKey) {
      return {
        name: 'Unknown',
        type: 'DOM Element',
        props: {},
        state: null,
        elementType: element.tagName.toLowerCase()
      };
    }
    
    // @ts-ignore - accessing React fiber internals
    const fiber = element[fiberKey];
    // @ts-ignore - accessing React props internals
    const props = propsKey ? element[propsKey] : {};
    
    // Get component name
    let name = 'Unknown';
    let elementType = element.tagName.toLowerCase();
    let componentType = 'Unknown';
    
    if (fiber) {
      if (fiber.type) {
        if (typeof fiber.type === 'string') {
          // This is a DOM element
          name = fiber.type;
          elementType = fiber.type;
          componentType = 'DOM Element';
        } else if (fiber.type.displayName) {
          // React component with displayName
          name = fiber.type.displayName;
          componentType = 'Component';
        } else if (fiber.type.name) {
          // React component without displayName
          name = fiber.type.name;
          componentType = 'Component';
        } else {
          // Function component without name
          name = 'Anonymous Component';
          componentType = 'Component';
        }
      }
    }
    
    // Get state if available
    let state: any = null;
    if (fiber && fiber.memoizedState) {
      try {
        // This only works for class components
        if (fiber.stateNode && fiber.stateNode.state) {
          state = fiber.stateNode.state;
        } else if (Array.isArray(fiber.memoizedState)) {
          // For hooks, simplified representation
          state = 'Has useState/useReducer hooks';
        } else {
          state = fiber.memoizedState;
        }
      } catch (e) {
        state = 'Error accessing state';
      }
    }
    
    return {
      name,
      type: componentType,
      props,
      state,
      elementType
    };
  };
  
  // Handle click on an element during inspection
  const handleInspectClick = (e: MouseEvent) => {
    if (!inspectMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Skip our own inspector elements
    if (
      overlayRef.current?.contains(target) ||
      inspectorPanelRef.current?.contains(target)
    ) {
      return;
    }
    
    setSelectedComponent(findComponentForElement(target));
  };
  
  // Track mouse movements to highlight elements
  const handleMouseMove = (e: MouseEvent) => {
    if (!inspectMode) return;
    
    const target = e.target as HTMLElement;
    
    // Skip our own inspector elements
    if (
      overlayRef.current?.contains(target) ||
      inspectorPanelRef.current?.contains(target)
    ) {
      return;
    }
    
    const rect = target.getBoundingClientRect();
    const overlay = overlayRef.current;
    
    if (overlay) {
      overlay.style.display = 'block';
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    }
  };
  
  // Clear highlight when mouse leaves an element
  const handleMouseLeave = () => {
    if (!inspectMode) return;
    
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.display = 'none';
    }
  };
  
  // Set up event listeners for inspection
  useEffect(() => {
    if (inspectionEnabled && inspectMode) {
      document.addEventListener('click', handleInspectClick, true);
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('mouseleave', handleMouseLeave, true);
      
      // Add instruction message
      const message = document.createElement('div');
      message.id = 'inspector-message';
      message.style.position = 'fixed';
      message.style.top = '50%';
      message.style.left = '50%';
      message.style.transform = 'translate(-50%, -50%)';
      message.style.padding = '16px';
      message.style.background = 'rgba(0, 0, 0, 0.8)';
      message.style.color = 'white';
      message.style.borderRadius = '4px';
      message.style.zIndex = '99999';
      message.style.pointerEvents = 'none';
      message.textContent = 'Click on any element to inspect';
      document.body.appendChild(message);
      
      return () => {
        document.removeEventListener('click', handleInspectClick, true);
        document.removeEventListener('mousemove', handleMouseMove, true);
        document.removeEventListener('mouseleave', handleMouseLeave, true);
        
        // Remove message
        const msgElement = document.getElementById('inspector-message');
        if (msgElement) {
          document.body.removeChild(msgElement);
        }
      };
    }
  }, [inspectionEnabled, inspectMode]);
  
  // Disable inspection when the component is unmounted
  useEffect(() => {
    return () => {
      setInspectMode(false);
    };
  }, []);
  
  // Don't render anything if component inspection is not enabled
  if (!inspectionEnabled) {
    return null;
  }
  
  // Render component tree view
  const renderComponentTree = () => {
    return componentTree.map(component => (
      <ComponentTreeItem 
        key={component.id}
        isSelected={selectedComponent?.id === component.id}
        onClick={() => setSelectedComponent(component)}
        onMouseEnter={() => component.domNode && setHighlightedElement(component.domNode)}
        onMouseLeave={() => setHighlightedElement(null)}
      >
        <ComponentName>{component.name}</ComponentName>
        <ComponentRenderInfo>
          {component.renderCount}x | {component.renderDuration.toFixed(2)}ms
        </ComponentRenderInfo>
      </ComponentTreeItem>
    ));
  };
  
  // Render selected component details
  const renderComponentDetails = () => {
    if (!selectedComponent) return null;
    
    return (
      <ComponentDetails>
        <h4>{selectedComponent.name}</h4>
        
        <DetailSection>
          <DetailSectionTitle>Props</DetailSectionTitle>
          <pre>
            {JSON.stringify(selectedComponent.props, null, 2)}
          </pre>
        </DetailSection>
        
        <DetailSection>
          <DetailSectionTitle>State</DetailSectionTitle>
          <pre>
            {JSON.stringify(selectedComponent.state, null, 2)}
          </pre>
        </DetailSection>
        
        <DetailSection>
          <DetailSectionTitle>Performance</DetailSectionTitle>
          <DetailItem>
            <DetailLabel>Render Count:</DetailLabel>
            <DetailValue>{selectedComponent.renderCount}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Last Render Duration:</DetailLabel>
            <DetailValue>{selectedComponent.renderDuration.toFixed(2)}ms</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Last Rendered:</DetailLabel>
            <DetailValue>
              {new Date(selectedComponent.lastRenderTime).toLocaleTimeString()}
            </DetailValue>
          </DetailItem>
        </DetailSection>
      </ComponentDetails>
    );
  };
  
  // Create the component inspector UI
  return (
    <>
      {/* Overlay for highlighting elements */}
      <ElementOverlay ref={overlayRef} />
      
      {/* Main inspector panel */}
      <DarkInspectorPanel ref={inspectorPanelRef} style={positionStyles[position]}>
        <DarkInspectorHeader onClick={() => setIsExpanded(!isExpanded)}>
          <span>🔍 Component Inspector</span>
          <span>{isExpanded ? '▼' : '▶'}</span>
        </DarkInspectorHeader>
        
        {isExpanded && (
          <DarkInspectorContent>
            <InspectorToolbar>
              <DarkInspectorButton 
                onClick={toggleInspection}
                active={inspectMode}
              >
                {inspectMode ? 'Stop Inspecting' : 'Start Inspecting'}
              </DarkInspectorButton>
              <DarkInspectorButton onClick={() => setSelectedComponent(null)}>
                Clear Selection
              </DarkInspectorButton>
            </InspectorToolbar>
            
            <InspectorSplitView>
              <ComponentTreeView>
                <h4>Component Tree</h4>
                {renderComponentTree()}
              </ComponentTreeView>
              
              <ComponentDetailsView>
                {selectedComponent ? (
                  renderComponentDetails()
                ) : (
                  <EmptyState>
                    {inspectMode
                      ? 'Click on any element on the page to inspect it'
                      : 'Click "Start Inspecting" to begin'
                    }
                  </EmptyState>
                )}
              </ComponentDetailsView>
            </InspectorSplitView>
          </DarkInspectorContent>
        )}
      </DarkInspectorPanel>
    </>
  );
};

// Component info interface
interface ComponentInfo {
  name: string;
  type: string;
  props: Record<string, any>;
  state: any;
  elementType: string;
}

// Component to display information about the selected component
const ComponentInfoDisplay: React.FC<{ info: ComponentInfo }> = ({ info }) => {
  const [activeTab, setActiveTab] = useState<'props' | 'state'>('props');
  
  return (
    <div>
      <ComponentTitle>
        <strong>{info.name}</strong>
        <ComponentType>{info.type}</ComponentType>
      </ComponentTitle>
      
      <ElementType>HTML Element: {info.elementType}</ElementType>
      
      <TabButtons>
        <TabButton
          active={activeTab === 'props'}
          onClick={() => setActiveTab('props')}
        >
          Props
        </TabButton>
        <TabButton
          active={activeTab === 'state'}
          onClick={() => setActiveTab('state')}
        >
          State
        </TabButton>
      </TabButtons>
      
      <TabContent>
        {activeTab === 'props' ? (
          info.props && Object.keys(info.props).length > 0 ? (
            <JSONTree data={info.props} />
          ) : (
            <EmptyMessage>No props found</EmptyMessage>
          )
        ) : (
          info.state ? (
            <JSONTree data={info.state} />
          ) : (
            <EmptyMessage>No state found</EmptyMessage>
          )
        )}
      </TabContent>
    </div>
  );
};

// Simple JSON tree visualization
const JSONTree: React.FC<{ data: any }> = ({ data }) => {
  if (data === null || data === undefined) {
    return <span className="json-null">null</span>;
  }
  
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return (
      <span className={`json-${typeof data}`}>
        {JSON.stringify(data)}
      </span>
    );
  }
  
  if (typeof data === 'function') {
    return <span className="json-function">Function</span>;
  }
  
  if (Array.isArray(data)) {
    return (
      <div className="json-array">
        <span>Array({data.length})</span>
        <ul>
          {data.map((item, i) => (
            <li key={i}>
              <span className="json-key">{i}: </span>
              <JSONTree data={item} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  // Handle object
  return (
    <div className="json-object">
      <span>Object</span>
      <ul>
        {Object.keys(data).map(key => (
          <li key={key}>
            <span className="json-key">{key}: </span>
            <JSONTree data={data[key]} />
          </li>
        ))}
      </ul>
    </div>
  );
};

// Styled components - Dark theme version
const DarkInspectorPanel = styled.div`
  position: fixed;
  z-index: 10000;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  max-width: 90vw;
  max-height: 80vh;
  font-family: monospace;
  font-size: 12px;
  backdrop-filter: blur(10px);
`;

const DarkInspectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const DarkInspectorContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: 70vh;
`;

const InspectorToolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DarkInspectorButton = styled.button<{ active?: boolean }>`
  background-color: ${props => props.active ? '#2196f3' : '#333'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#1976d2' : '#444'};
  }
`;

const InspectorSplitView = styled.div`
  display: flex;
  flex-grow: 1;
  overflow: hidden;
`;

const ComponentTreeView = styled.div`
  width: 40%;
  padding: 10px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  
  h4 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #ccc;
  }
`;

const ComponentDetailsView = styled.div`
  width: 60%;
  padding: 10px;
  overflow-y: auto;
`;

const ComponentTreeItem = styled.div<{ isSelected?: boolean }>`
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? 'rgba(33, 150, 243, 0.3)' : 'transparent'};
  border-left: 2px solid ${props => props.isSelected ? '#2196f3' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(33, 150, 243, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const ComponentName = styled.div`
  font-weight: bold;
  font-size: 11px;
`;

const ComponentRenderInfo = styled.div`
  color: #999;
  font-size: 10px;
  margin-top: 2px;
`;

const ComponentDetails = styled.div`
  h4 {
    margin: 0 0 15px 0;
    color: #2196f3;
    font-size: 14px;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
    overflow-x: auto;
    color: #ddd;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 20px;
`;

const DetailSectionTitle = styled.h5`
  margin: 0 0 8px 0;
  color: #ccc;
  font-size: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const DetailLabel = styled.div`
  width: 120px;
  color: #999;
`;

const DetailValue = styled.div`
  color: #eee;
`;

const EmptyState = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
  font-size: 12px;
`;

const ElementOverlay = styled.div`
  position: fixed;
  pointer-events: none;
  border: 2px solid #4a90e2;
  background-color: rgba(74, 144, 226, 0.1);
  z-index: 99998;
  display: none;
`;

// Styled components - Light theme version
const LightInspectorPanel = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 350px;
  max-width: 90vw;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 500px;
`;

const LightInspectorHeader = styled.div`
  background-color: #4a90e2;
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const LightInspectorButton = styled.button<{ active?: boolean }>`
  background-color: ${props => props.active ? '#2c5282' : 'rgba(255, 255, 255, 0.25)'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active ? '#2a4365' : 'rgba(255, 255, 255, 0.35)'};
  }
`;

const LightInspectorContent = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const NoSelection = styled.div`
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 20px;
`;

const ComponentTitle = styled.div`
  font-size: 16px;
  margin-bottom: 4px;
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const ComponentType = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: normal;
`;

const ElementType = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4a90e2' : 'transparent'};
  color: ${props => props.active ? '#4a90e2' : '#64748b'};
  padding: 8px 12px;
  font-weight: ${props => props.active ? '600' : 'normal'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #4a90e2;
  }
`;

const TabContent = styled.div`
  font-family: monospace;
  font-size: 13px;
  
  .json-key {
    color: #8250df;
  }
  
  .json-string {
    color: #0a3069;
  }
  
  .json-number {
    color: #116329;
  }
  
  .json-boolean {
    color: #0550ae;
  }
  
  .json-null {
    color: #cf222e;
  }
  
  .json-function {
    color: #953800;
    font-style: italic;
  }
  
  ul {
    list-style: none;
    margin: 0 0 0 20px;
    padding: 0;
  }
`;

const EmptyMessage = styled.div`
  color: #64748b;
  font-style: italic;
`;

// Update window declaration to include __DEV_COMPONENTS__ 
declare global {
  interface Window {
    __DEV_COMPONENTS__?: Record<string, {
      __DEBUG_INFO__?: {
        props: Record<string, any>;
        state: Record<string, any>;
        renderCount: number;
        lastRenderTime: number;
        renderDuration: number;
        domRef: React.RefObject<HTMLElement>;
      };
      [key: string]: any;
    }>;
  }
}

export default ComponentInspector; 