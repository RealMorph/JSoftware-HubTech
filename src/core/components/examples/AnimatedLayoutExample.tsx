import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import AnimatedDrawer from '../Drawer/AnimatedDrawer';
import AnimatedAccordion from '../Accordion/AnimatedAccordion';
import { AnimationType, DurationType } from '../../animation/types';

interface AnimationControlProps {
  animationType: AnimationType;
  setAnimationType: (type: AnimationType) => void;
  animationDuration: DurationType;
  setAnimationDuration: (duration: DurationType) => void;
}

const AnimationControls: React.FC<AnimationControlProps> = ({
  animationType,
  setAnimationType,
  animationDuration,
  setAnimationDuration
}) => {
  const theme = useTheme();
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Animation Controls</h3>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
        <div>
          <label htmlFor="animationType" style={{ marginRight: '10px' }}>
            Animation Type:
          </label>
          <select 
            id="animationType"
            value={animationType}
            onChange={(e) => setAnimationType(e.target.value as AnimationType)}
            style={{
              padding: '8px',
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="scale">Scale</option>
            <option value="rotate">Rotate</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="animationDuration" style={{ marginRight: '10px' }}>
            Duration:
          </label>
          <select 
            id="animationDuration"
            value={animationDuration}
            onChange={(e) => setAnimationDuration(e.target.value as DurationType)}
            style={{
              padding: '8px',
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <option value="shortest">Shortest</option>
            <option value="shorter">Shorter</option>
            <option value="short">Short</option>
            <option value="standard">Standard</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
            <option value="longer">Longer</option>
            <option value="longest">Longest</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const AnimatedLayoutExample: React.FC = () => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPosition, setDrawerPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [drawerAnimationType, setDrawerAnimationType] = useState<AnimationType>('slide');
  const [drawerAnimationDuration, setDrawerAnimationDuration] = useState<DurationType>('standard');
  
  const [accordionAnimationType, setAccordionAnimationType] = useState<AnimationType>('fade');
  const [accordionAnimationDuration, setAccordionAnimationDuration] = useState<DurationType>('standard');
  
  const primaryColor = typeof theme.colors.primary === 'object' && theme.colors.primary !== null 
    ? (theme.colors.primary as Record<string, string>).main || '#1976d2'
    : '#1976d2';
    
  const primaryTextColor = typeof theme.colors.primary === 'object' && theme.colors.primary !== null
    ? (theme.colors.primary as Record<string, string>).contrastText || '#ffffff'
    : '#ffffff';
    
  const successColor = typeof theme.colors.success === 'object' && theme.colors.success !== null
    ? (theme.colors.success as Record<string, string>).main || '#4caf50'
    : '#4caf50';
  
  const buttonStyle = {
    padding: '10px 15px',
    margin: '5px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: primaryColor,
    color: primaryTextColor,
    border: 'none',
    cursor: 'pointer',
    boxShadow: theme.shadows.sm,
  };
  
  const sectionStyle = {
    marginBottom: '40px',
    padding: '20px',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    boxShadow: theme.shadows.sm,
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const accordionItems = [
    {
      title: 'What is an Animated Accordion?',
      children: (
        <div>
          <p>Animated accordions are expandable/collapsible containers that include smooth animations when toggling between open and closed states.</p>
          <p>This implementation supports different animation types and durations through the animation system.</p>
        </div>
      )
    },
    {
      title: 'How do animations work?',
      children: (
        <div>
          <p>Animations are powered by CSS transitions, managed through our animation system that provides:</p>
          <ul>
            <li>Different animation types (fade, slide, scale, rotate)</li>
            <li>Customizable durations</li>
            <li>Respect for user motion preferences</li>
            <li>Seamless integration with the theme system</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Can I customize individual item animations?',
      children: (
        <div>
          <p>Yes! Each accordion item can have its own animation type and duration.</p>
          <p>This allows for creative sequential animations and varying effects within the same accordion group.</p>
        </div>
      ),
      animationType: 'scale' as AnimationType,
      animationDuration: 'medium' as DurationType
    }
  ];
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Animated Layout Components</h1>
      <p>This example demonstrates the animated drawer and accordion components with various animation options.</p>
      
      {/* Drawer Example */}
      <section style={sectionStyle}>
        <h2>Animated Drawer</h2>
        <AnimationControls 
          animationType={drawerAnimationType}
          setAnimationType={setDrawerAnimationType}
          animationDuration={drawerAnimationDuration}
          setAnimationDuration={setDrawerAnimationDuration}
        />
        
        <div>
          <h3>Position:</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: drawerPosition === 'left' ? successColor : primaryColor,
              }}
              onClick={() => setDrawerPosition('left')}
            >
              Left
            </button>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: drawerPosition === 'right' ? successColor : primaryColor,
              }}
              onClick={() => setDrawerPosition('right')}
            >
              Right
            </button>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: drawerPosition === 'top' ? successColor : primaryColor,
              }}
              onClick={() => setDrawerPosition('top')}
            >
              Top
            </button>
            <button 
              style={{
                ...buttonStyle,
                backgroundColor: drawerPosition === 'bottom' ? successColor : primaryColor,
              }}
              onClick={() => setDrawerPosition('bottom')}
            >
              Bottom
            </button>
          </div>
          
          <button 
            style={buttonStyle} 
            onClick={handleDrawerToggle}
          >
            {drawerOpen ? 'Close Drawer' : 'Open Drawer'}
          </button>
        </div>
        
        <AnimatedDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          position={drawerPosition}
          animationType={drawerAnimationType}
          animationDuration={drawerAnimationDuration}
          header={<h2>Drawer Example</h2>}
          footer={
            <div style={{ textAlign: 'right' }}>
              <button 
                style={buttonStyle}
                onClick={() => setDrawerOpen(false)}
              >
                Close
              </button>
            </div>
          }
        >
          <div>
            <h3>Drawer Content</h3>
            <p>This is an example of the animated drawer component.</p>
            <p>Current animation: <strong>{drawerAnimationType}</strong></p>
            <p>Duration: <strong>{drawerAnimationDuration}</strong></p>
            <p>Position: <strong>{drawerPosition}</strong></p>
          </div>
        </AnimatedDrawer>
      </section>
      
      {/* Accordion Example */}
      <section style={sectionStyle}>
        <h2>Animated Accordion</h2>
        <AnimationControls 
          animationType={accordionAnimationType}
          setAnimationType={setAccordionAnimationType}
          animationDuration={accordionAnimationDuration}
          setAnimationDuration={setAccordionAnimationDuration}
        />
        
        <AnimatedAccordion
          items={accordionItems}
          animationType={accordionAnimationType}
          animationDuration={accordionAnimationDuration}
          variant="bordered"
          size="medium"
        />
        
        <h3 style={{ marginTop: '30px' }}>Using Accordion with Custom Children</h3>
        <AnimatedAccordion
          allowMultiple={true}
          animationType={accordionAnimationType}
          animationDuration={accordionAnimationDuration}
          variant="filled"
        >
          <AnimatedAccordion.Item 
            title="Custom Item 1"
            animationType="fade"
          >
            <p>This is a custom accordion item with a specific animation type.</p>
          </AnimatedAccordion.Item>
          
          <AnimatedAccordion.Item 
            title="Custom Item 2"
            animationType="scale"
            animationDuration="short"
          >
            <p>This item has both custom animation type and duration.</p>
          </AnimatedAccordion.Item>
          
          <AnimatedAccordion.Item title="Custom Item 3">
            <p>This item inherits the accordion's animation settings.</p>
          </AnimatedAccordion.Item>
        </AnimatedAccordion>
      </section>
    </div>
  );
};

export default AnimatedLayoutExample; 