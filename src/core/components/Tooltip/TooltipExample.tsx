import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import AnimatedTooltip from './AnimatedTooltip';

/**
 * Example component showing different ways to use the AnimatedTooltip
 */
const TooltipExample: React.FC = () => {
  const theme = useTheme();
  
  const buttonStyle: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    margin: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: theme.spacing.lg }}>Tooltip Examples</h1>
      
      {/* Basic tooltip */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Basic Tooltip (hover)</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AnimatedTooltip content="This is a basic tooltip that appears on hover">
            <button style={buttonStyle}>Hover me</button>
          </AnimatedTooltip>
        </div>
      </section>
      
      {/* Different placements */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Different Placements</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <AnimatedTooltip 
            content="Tooltip on top" 
            placement="top"
          >
            <button style={buttonStyle}>Top</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Tooltip on bottom" 
            placement="bottom"
          >
            <button style={buttonStyle}>Bottom</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Tooltip on left" 
            placement="left"
          >
            <button style={buttonStyle}>Left</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Tooltip on right" 
            placement="right"
          >
            <button style={buttonStyle}>Right</button>
          </AnimatedTooltip>
        </div>
      </section>
      
      {/* Animation types */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Animation Types</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <AnimatedTooltip 
            content="Fade animation" 
            animationType="fade"
          >
            <button style={buttonStyle}>Fade</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Scale animation" 
            animationType="scale"
          >
            <button style={buttonStyle}>Scale</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Slide animation" 
            animationType="slide"
          >
            <button style={buttonStyle}>Slide</button>
          </AnimatedTooltip>
        </div>
      </section>
      
      {/* Trigger types */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Trigger Types</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <AnimatedTooltip 
            content="Appears on hover" 
            triggerOn="hover"
          >
            <button style={buttonStyle}>Hover Trigger</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Appears on click" 
            triggerOn="click"
          >
            <button style={buttonStyle}>Click Trigger</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Appears on focus" 
            triggerOn="focus"
          >
            <button style={{ ...buttonStyle, outline: 'none' }}>Focus Trigger (Tab to it)</button>
          </AnimatedTooltip>
        </div>
      </section>
      
      {/* Rich content */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Rich Content</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AnimatedTooltip 
            content={
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: theme.colors.primary }}>Rich Content</h3>
                <p style={{ margin: '0 0 8px 0' }}>Tooltips can contain rich HTML content.</p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Including lists</li>
                  <li>And other elements</li>
                </ul>
              </div>
            } 
            maxWidth="300px"
          >
            <button style={{...buttonStyle, backgroundColor: theme.colors.secondary}}>Rich Content Tooltip</button>
          </AnimatedTooltip>
        </div>
      </section>
      
      {/* No arrow variant */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>No Arrow</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AnimatedTooltip 
            content="This tooltip has no arrow" 
            arrow={false}
          >
            <button style={buttonStyle}>No Arrow</button>
          </AnimatedTooltip>
        </div>
      </section>
      
      {/* Custom delay */}
      <section>
        <h2 style={{ marginBottom: theme.spacing.md }}>Custom Delay</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          <AnimatedTooltip 
            content="Appears instantly" 
            delay={0}
          >
            <button style={buttonStyle}>No Delay</button>
          </AnimatedTooltip>
          
          <AnimatedTooltip 
            content="Takes 1 second to appear" 
            delay={1000}
          >
            <button style={buttonStyle}>Long Delay (1s)</button>
          </AnimatedTooltip>
        </div>
      </section>
    </div>
  );
};

export default TooltipExample; 