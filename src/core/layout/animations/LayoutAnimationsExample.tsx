import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../theme/ThemeContext';
import AnimatedGrid, { AnimatedGridItem } from './AnimatedGrid';
import AnimatedTabPanel from './AnimatedTabPanel';
import { AnimationType, DurationType } from '../../animation/types';

// Define a color object type to use with the theme
interface ColorObject {
  main: string;
  contrastText: string;
}

interface AnimationControlProps {
  label: string;
  animationType: AnimationType;
  setAnimationType: (type: AnimationType) => void;
  animationDuration: DurationType;
  setAnimationDuration: (duration: DurationType) => void;
}

const AnimationControls: React.FC<AnimationControlProps> = ({
  label,
  animationType,
  setAnimationType,
  animationDuration,
  setAnimationDuration
}) => {
  const theme = useTheme();
  
  return (
    <div>
      <h3>{label} Animation Controls</h3>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label htmlFor={`${label}-animationType`} style={{ marginRight: '10px' }}>
            Animation Type:
          </label>
          <select 
            id={`${label}-animationType`}
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
          <label htmlFor={`${label}-animationDuration`} style={{ marginRight: '10px' }}>
            Duration:
          </label>
          <select 
            id={`${label}-animationDuration`}
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

// Styled components for the examples
const ExampleContainer = styled.div`
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
`;

const ExampleSection = styled.section`
  margin-bottom: 60px;
  padding: 30px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const GridItemContent = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  color: white;
  padding: 20px;
  border-radius: 8px;
  height: 100%;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TabContent = styled.div`
  padding: 20px;
  border-radius: 0 0 8px 8px;
  min-height: 200px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 10px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: ${({ isActive, theme }) => 
    isActive ? 'none' : `1px solid ${theme.colors.border}`};
  background-color: ${({ isActive, theme }) => 
    isActive ? theme.colors.background : theme.colors.surface};
  border-radius: ${({ isActive }) => 
    isActive ? '8px 8px 0 0' : '8px 8px 0 0'};
  margin-right: 4px;
  margin-bottom: -1px;
  position: relative;
  z-index: ${({ isActive }) => isActive ? 1 : 0};
  cursor: pointer;
  font-weight: ${({ isActive }) => isActive ? 'bold' : 'normal'};
  color: ${({ isActive, theme }) => 
    isActive ? theme.colors.text.primary : theme.colors.text.secondary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 30px;
`;

// Main Example Component
export const LayoutAnimationsExample: React.FC = () => {
  const theme = useTheme();
  
  // Helper function to safely get color values
  const getColorValue = (colorObj: any, fallback: {main: string, contrastText: string}): ColorObject => {
    if (typeof colorObj === 'object' && colorObj !== null) {
      return {
        main: colorObj.main || fallback.main,
        contrastText: colorObj.contrastText || fallback.contrastText
      };
    }
    return fallback;
  };
  
  // Default color objects
  const primaryColor = getColorValue(theme.colors.primary, {main: '#1976d2', contrastText: '#ffffff'});
  const errorColor = getColorValue(theme.colors.error, {main: '#f44336', contrastText: '#ffffff'});
  const secondaryColor = getColorValue(theme.colors.secondary, {main: '#9c27b0', contrastText: '#ffffff'});
  
  // State for grid example
  const [gridItems, setGridItems] = useState<string[]>([
    'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6'
  ]);
  const [gridAnimationType, setGridAnimationType] = useState<AnimationType>('fade');
  const [gridAnimationDuration, setGridAnimationDuration] = useState<DurationType>('standard');
  
  // State for tabs example
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabsAnimationType, setTabsAnimationType] = useState<AnimationType>('fade');
  const [tabsAnimationDuration, setTabsAnimationDuration] = useState<DurationType>('standard');
  const [tabOrientation, setTabOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  
  // Colors for grid items
  const colors = [
    '#1E88E5', '#43A047', '#E53935', '#FB8C00', '#8E24AA', '#3949AB',
    '#00ACC1', '#7CB342', '#C0CA33', '#FFB300', '#F4511E', '#5D4037'
  ];
  
  // Grid functions
  const addGridItem = () => {
    setGridItems([...gridItems, `Item ${gridItems.length + 1}`]);
  };
  
  const removeGridItem = () => {
    if (gridItems.length > 0) {
      setGridItems(gridItems.slice(0, -1));
    }
  };
  
  const shuffleGridItems = () => {
    setGridItems([...gridItems].sort(() => Math.random() - 0.5));
  };
  
  return (
    <ExampleContainer>
      <h1>Layout Animation Examples</h1>
      <p>This example showcases various layout animations using our animation system.</p>
      
      {/* Grid Animation Example */}
      <ExampleSection>
        <h2>Animated Grid</h2>
        <p>Demonstrates smooth animations when grid items are added, removed, or reordered.</p>
        
        <AnimationControls 
          label="Grid"
          animationType={gridAnimationType}
          setAnimationType={setGridAnimationType}
          animationDuration={gridAnimationDuration}
          setAnimationDuration={setGridAnimationDuration}
        />
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={addGridItem}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: primaryColor.main,
              color: primaryColor.contrastText,
              border: 'none'
            }}
          >
            Add Item
          </button>
          
          <button 
            onClick={removeGridItem}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: errorColor.main,
              color: errorColor.contrastText,
              border: 'none'
            }}
          >
            Remove Item
          </button>
          
          <button 
            onClick={shuffleGridItems}
            style={{ 
              padding: '8px 16px',
              borderRadius: theme.borderRadius.sm,
              backgroundColor: secondaryColor.main,
              color: secondaryColor.contrastText,
              border: 'none'
            }}
          >
            Shuffle Items
          </button>
        </div>
        
        <AnimatedGrid
          columns={3}
          gap={16}
          animationType={gridAnimationType}
          animationDuration={gridAnimationDuration}
          animateChanges={true}
          animateOnMount={true}
        >
          {gridItems.map((item, index) => (
            <AnimatedGridItem key={item} colSpan={1}>
              <GridItemContent color={colors[index % colors.length]}>
                {item}
              </GridItemContent>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </ExampleSection>
      
      {/* Tab Panel Animation Example */}
      <ExampleSection>
        <h2>Animated Tab Panels</h2>
        <p>Demonstrates smooth transitions between tab panels.</p>
        
        <AnimationControls 
          label="Tabs"
          animationType={tabsAnimationType}
          setAnimationType={setTabsAnimationType}
          animationDuration={tabsAnimationDuration}
          setAnimationDuration={setTabsAnimationDuration}
        />
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Orientation:</label>
          <select
            value={tabOrientation}
            onChange={(e) => setTabOrientation(e.target.value as 'horizontal' | 'vertical')}
            style={{
              padding: '8px',
              borderRadius: theme.borderRadius.sm,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
        
        <TabsContainer>
          {['First Tab', 'Second Tab', 'Third Tab'].map((tab, index) => (
            <TabButton
              key={index}
              isActive={activeTabIndex === index}
              onClick={() => setActiveTabIndex(index)}
            >
              {tab}
            </TabButton>
          ))}
        </TabsContainer>
        
        <AnimatedTabPanel
          activeIndex={activeTabIndex}
          animationType={tabsAnimationType}
          animationDuration={tabsAnimationDuration}
          orientation={tabOrientation}
        >
          <TabContent>
            <h3>First Tab Content</h3>
            <p>This is the content of the first tab. It demonstrates the AnimatedTabPanel component.</p>
            <p>The current animation type is <strong>{tabsAnimationType}</strong> with a duration of <strong>{tabsAnimationDuration}</strong>.</p>
          </TabContent>
          
          <TabContent>
            <h3>Second Tab Content</h3>
            <p>This content is different from the first tab, allowing you to see the animation in action.</p>
            <p>Try switching between tabs to see how the content transitions smoothly.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {[1, 2, 3].map((num) => (
                <div 
                  key={num}
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    backgroundColor: colors[num + 2],
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  {num}
                </div>
              ))}
            </div>
          </TabContent>
          
          <TabContent>
            <h3>Third Tab Content</h3>
            <p>This is the third tab panel. The transition to this content is animated based on your selected settings.</p>
            <p>The AnimatedTabPanel component respects user motion preferences for accessibility.</p>
            <button
              style={{ 
                padding: '8px 16px',
                marginTop: '20px',
                borderRadius: theme.borderRadius.sm,
                backgroundColor: primaryColor.main,
                color: primaryColor.contrastText,
                border: 'none'
              }}
              onClick={() => setActiveTabIndex(0)}
            >
              Go to First Tab
            </button>
          </TabContent>
        </AnimatedTabPanel>
      </ExampleSection>
      
      {/* Info about Route Transitions */}
      <ExampleSection>
        <h2>Animated Route Transitions</h2>
        <p>The AnimatedRouteTransition component provides smooth transitions between routes in your application.</p>
        <p>To use this component:</p>
        <ol>
          <li>Wrap your application routes with the AnimatedRouteTransition component</li>
          <li>Configure animation type, duration, and transition mode</li>
          <li>Optionally specify paths to skip animation</li>
        </ol>
        <pre style={{ 
          backgroundColor: theme.colors.surface, 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`// Example usage in your Router component
<Routes>
  <Route path="/" element={
    <AnimatedRouteTransition 
      animationType="fade"
      animationDuration="standard"
      mode="out-in"
    />
  }>
    <Route index element={<HomePage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="contact" element={<ContactPage />} />
  </Route>
</Routes>`}
        </pre>
        <p>The component handles keeping track of the previous and current routes to create a smooth transition effect.</p>
      </ExampleSection>
    </ExampleContainer>
  );
};

export default LayoutAnimationsExample; 