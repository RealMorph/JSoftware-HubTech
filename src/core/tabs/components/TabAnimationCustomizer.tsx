import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '../../theme';
import { TabAnimationOptions, defaultTabThemeExtension } from '../theme/tab-theme-extension';
import { TabAnimationsDemo } from '../theme/AnimatedTab';
import './tab-theme-customizer.css';

const CustomizerContainer = styled.div`
  margin-bottom: 20px;
`;

const AnimationControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ControlField = styled.div`
  margin-bottom: 10px;
`;

const ControlLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
`;

const NumberInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  
  input {
    margin-right: 8px;
  }
`;

const ButtonRow = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #40a9ff;
  }
  
  &.secondary {
    background: #f0f0f0;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  }
`;

interface TabAnimationCustomizerProps {
  onApplyAnimations?: (animations: TabAnimationOptions) => void;
}

export const TabAnimationCustomizer: React.FC<TabAnimationCustomizerProps> = ({
  onApplyAnimations
}) => {
  const theme = useTheme();
  const [animationOptions, setAnimationOptions] = useState<TabAnimationOptions>({
    ...(theme.currentTheme as any)?.tabs?.animation || defaultTabThemeExtension.tabs.animation
  });
  
  const handleAnimationChange = <K extends keyof TabAnimationOptions>(
    key: K, 
    value: TabAnimationOptions[K]
  ) => {
    setAnimationOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleApplyAnimations = () => {
    if (onApplyAnimations) {
      onApplyAnimations(animationOptions);
    }
  };
  
  const handleResetAnimations = () => {
    setAnimationOptions(defaultTabThemeExtension.tabs.animation);
  };
  
  return (
    <CustomizerContainer>
      <h3>Tab Animation Customizer</h3>
      
      <AnimationControlsGrid>
        <div>
          <h4>Timing</h4>
          
          <ControlField>
            <ControlLabel>Duration (ms)</ControlLabel>
            <NumberInput 
              type="number" 
              value={animationOptions.duration}
              onChange={(e) => handleAnimationChange('duration', parseInt(e.target.value))}
              min={0}
              max={2000}
            />
          </ControlField>
          
          <ControlField>
            <ControlLabel>Easing Function</ControlLabel>
            <TextInput 
              type="text" 
              value={animationOptions.easing}
              onChange={(e) => handleAnimationChange('easing', e.target.value)}
              placeholder="ease-in-out"
            />
          </ControlField>
        </div>
        
        <div>
          <h4>Animation Effects</h4>
          
          <ControlField>
            <ControlLabel>Slide Distance</ControlLabel>
            <TextInput 
              type="text" 
              value={animationOptions.slideDistance || ''}
              onChange={(e) => handleAnimationChange('slideDistance', e.target.value)}
              placeholder="10px"
            />
          </ControlField>
          
          <ControlField>
            <ControlLabel>Fade Opacity</ControlLabel>
            <NumberInput 
              type="number" 
              value={animationOptions.fadeOpacity || 0}
              onChange={(e) => handleAnimationChange('fadeOpacity', parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.1}
            />
          </ControlField>
          
          <ControlField>
            <ControlLabel>Scale Effect</ControlLabel>
            <NumberInput 
              type="number" 
              value={animationOptions.scaleEffect || 0}
              onChange={(e) => handleAnimationChange('scaleEffect', parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.01}
            />
          </ControlField>
        </div>
        
        <div>
          <h4>Feature Toggles</h4>
          
          <ControlField>
            <Checkbox>
              <input 
                type="checkbox" 
                checked={animationOptions.enableTabSwitch}
                onChange={(e) => handleAnimationChange('enableTabSwitch', e.target.checked)}
                id="enable-tab-switch"
              />
              <ControlLabel htmlFor="enable-tab-switch">Enable Tab Switch Animation</ControlLabel>
            </Checkbox>
          </ControlField>
          
          <ControlField>
            <Checkbox>
              <input 
                type="checkbox" 
                checked={animationOptions.enableGroupCollapse}
                onChange={(e) => handleAnimationChange('enableGroupCollapse', e.target.checked)}
                id="enable-group-collapse"
              />
              <ControlLabel htmlFor="enable-group-collapse">Enable Group Collapse Animation</ControlLabel>
            </Checkbox>
          </ControlField>
          
          <ControlField>
            <Checkbox>
              <input 
                type="checkbox" 
                checked={animationOptions.enableDragPreview}
                onChange={(e) => handleAnimationChange('enableDragPreview', e.target.checked)}
                id="enable-drag-preview"
              />
              <ControlLabel htmlFor="enable-drag-preview">Enable Drag Preview Animation</ControlLabel>
            </Checkbox>
          </ControlField>
        </div>
      </AnimationControlsGrid>
      
      <div>
        <h4>Animation Preview</h4>
        <div className="animation-preview">
          {/* Custom provider to preview animations with current settings */}
          <TabAnimationsDemo />
        </div>
      </div>
      
      <ButtonRow>
        <Button onClick={handleApplyAnimations}>Apply Animations</Button>
        <Button className="secondary" onClick={handleResetAnimations}>Reset to Default</Button>
      </ButtonRow>
    </CustomizerContainer>
  );
}; 