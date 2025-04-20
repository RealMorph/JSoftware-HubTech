import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDevTools } from './DevToolsProvider';

interface ComponentHighlighterProps {
  componentName: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

// Generate a deterministic color based on the component name
const getHighlightColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue from 0-360 degrees
  const hue = hash % 360;
  
  // Use pastel colors with high saturation but muted lightness
  return `hsla(${hue}, 80%, 65%, 0.3)`;
};

const HighlightContainer = styled.div<{ highlightColor: string; isActive: boolean }>`
  position: relative;
  
  &::before {
    content: attr(data-component-name);
    position: absolute;
    top: 0;
    left: 0;
    padding: 2px 5px;
    background-color: ${props => props.highlightColor};
    color: #000;
    font-family: monospace;
    font-size: 10px;
    z-index: 9999;
    pointer-events: none;
    border-radius: 2px;
    opacity: ${props => (props.isActive ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px dashed ${props => props.highlightColor};
    background-color: ${props => `${props.highlightColor}`};
    pointer-events: none;
    z-index: 9998;
    border-radius: 2px;
    opacity: ${props => (props.isActive ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
  
  &:hover::before,
  &:hover::after {
    opacity: ${props => (props.isActive ? 1 : 0.7)};
  }
`;

const ComponentHighlighter: React.FC<ComponentHighlighterProps> = ({
  componentName,
  className,
  style,
  children,
}) => {
  const { isEnabled, config, highlightedComponent, setHighlightedComponent } = useDevTools();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const highlightColor = getHighlightColor(componentName);

  // Auto-show highlighting if the components are being highlighted
  useEffect(() => {
    if (!isEnabled || !config.componentHighlighting) {
      setShowHighlight(false);
      return;
    }
    
    // Determine if this component should be highlighted
    const shouldHighlight = 
      highlightedComponent === componentName || 
      !highlightedComponent; // If no specific component is highlighted, show all
    
    setShowHighlight(shouldHighlight);
  }, [isEnabled, config.componentHighlighting, componentName, highlightedComponent]);

  // Handle clicks on component for dev purposes
  const handleClick = (e: React.MouseEvent) => {
    if (!isEnabled || !config.componentHighlighting) return;
    
    // Only handle click if Alt key is pressed (dev mode interaction)
    if (e.altKey) {
      e.stopPropagation();
      setHighlightedComponent(componentName);
      
      // Log component info to console
      console.info(
        `%c[DevTools] %c${componentName}`,
        'color: #61dafb; font-weight: bold;',
        `color: ${highlightColor}; font-weight: bold;`,
        containerRef.current
      );
    }
  };

  if (!isEnabled || !config.componentHighlighting) {
    // When dev tools are disabled, just render children without highlighting
    return <>{children}</>;
  }

  return (
    <HighlightContainer
      ref={containerRef}
      data-component-name={componentName}
      highlightColor={highlightColor}
      isActive={showHighlight}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </HighlightContainer>
  );
};

export default ComponentHighlighter; 