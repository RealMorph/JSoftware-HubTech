import React, { useState } from 'react';
import { useTheme } from '../../theme';
import { defaultTabThemeExtension, TabAnimationOptions, TabStyleOptions } from '../theme/tab-theme-extension';
import './tab-theme-customizer.css';

interface TabCustomizerFieldProps {
  label: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'color' | 'select' | 'checkbox';
  options?: string[];
}

const TabCustomizerField: React.FC<TabCustomizerFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = []
}) => {
  return (
    <div className="tab-customizer-field">
      <label>{label}</label>
      {type === 'select' ? (
        <select 
          value={value as string} 
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <input 
          type="checkbox" 
          checked={value as boolean} 
          onChange={(e) => onChange(e.target.checked)} 
        />
      ) : type === 'number' ? (
        <input 
          type="number" 
          value={value as number} 
          onChange={(e) => onChange(parseFloat(e.target.value))} 
        />
      ) : type === 'color' ? (
        <input 
          type="color" 
          value={value as string} 
          onChange={(e) => onChange(e.target.value)} 
        />
      ) : (
        <input 
          type="text" 
          value={value as string} 
          onChange={(e) => onChange(e.target.value)} 
        />
      )}
    </div>
  );
};

interface TabThemeCustomizerProps {
  onApplyTheme?: (theme: any) => void;
}

export const TabThemeCustomizer: React.FC<TabThemeCustomizerProps> = ({
  onApplyTheme
}) => {
  const theme = useTheme();
  const [tabStyles, setTabStyles] = useState<TabStyleOptions>({
    ...defaultTabThemeExtension.tabs.styles.default
  });
  
  const [tabAnimation, setTabAnimation] = useState<TabAnimationOptions>({
    ...defaultTabThemeExtension.tabs.animation
  });

  const [selectedTab, setSelectedTab] = useState<'default' | 'active' | 'hover' | 'animation'>('default');
  
  const handleStyleChange = (property: keyof TabStyleOptions, value: any) => {
    setTabStyles(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  const handleAnimationChange = (property: keyof TabAnimationOptions, value: any) => {
    setTabAnimation(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  const handleApplyTheme = () => {
    if (onApplyTheme) {
      const customTheme = {
        ...theme,
        tabs: {
          ...defaultTabThemeExtension.tabs,
          styles: {
            ...defaultTabThemeExtension.tabs.styles,
            default: tabStyles
          },
          animation: tabAnimation
        }
      };
      onApplyTheme(customTheme);
    }
  };
  
  const renderStyleFields = () => (
    <>
      <TabCustomizerField 
        label="Border Radius" 
        value={tabStyles.borderRadius || ''} 
        onChange={(value) => handleStyleChange('borderRadius', value)} 
      />
      <TabCustomizerField 
        label="Height" 
        value={tabStyles.height || ''} 
        onChange={(value) => handleStyleChange('height', value)} 
      />
      <TabCustomizerField 
        label="Min Width" 
        value={tabStyles.minWidth || ''} 
        onChange={(value) => handleStyleChange('minWidth', value)} 
      />
      <TabCustomizerField 
        label="Max Width" 
        value={tabStyles.maxWidth || ''} 
        onChange={(value) => handleStyleChange('maxWidth', value)} 
      />
      <TabCustomizerField 
        label="Padding" 
        value={tabStyles.padding || ''} 
        onChange={(value) => handleStyleChange('padding', value)} 
      />
      <TabCustomizerField 
        label="Font Weight" 
        value={tabStyles.fontWeight?.toString() || ''} 
        onChange={(value) => handleStyleChange('fontWeight', value)} 
      />
      <TabCustomizerField 
        label="Shadow" 
        value={tabStyles.shadow || ''} 
        onChange={(value) => handleStyleChange('shadow', value)} 
      />
      <TabCustomizerField 
        label="Tab Shape" 
        value={tabStyles.tabShape || 'rounded'} 
        type="select"
        options={['rectangle', 'rounded', 'pill', 'underlined']}
        onChange={(value) => handleStyleChange('tabShape', value)} 
      />
      <TabCustomizerField 
        label="Text Transform" 
        value={tabStyles.textTransform || 'none'} 
        type="select"
        options={['none', 'uppercase', 'lowercase', 'capitalize']}
        onChange={(value) => handleStyleChange('textTransform', value)} 
      />
      <TabCustomizerField 
        label="Separator Style" 
        value={tabStyles.separatorStyle || 'none'} 
        type="select"
        options={['none', 'line', 'dot', 'space']}
        onChange={(value) => handleStyleChange('separatorStyle', value)} 
      />
      <TabCustomizerField 
        label="Icon Size" 
        value={tabStyles.iconSize || ''} 
        onChange={(value) => handleStyleChange('iconSize', value)} 
      />
      <TabCustomizerField 
        label="Close Button Size" 
        value={tabStyles.closeButtonSize || ''} 
        onChange={(value) => handleStyleChange('closeButtonSize', value)} 
      />
    </>
  );
  
  const renderAnimationFields = () => (
    <>
      <TabCustomizerField 
        label="Duration (ms)" 
        value={tabAnimation.duration} 
        type="number"
        onChange={(value) => handleAnimationChange('duration', value)} 
      />
      <TabCustomizerField 
        label="Easing" 
        value={tabAnimation.easing} 
        onChange={(value) => handleAnimationChange('easing', value)} 
      />
      <TabCustomizerField 
        label="Slide Distance" 
        value={tabAnimation.slideDistance || ''} 
        onChange={(value) => handleAnimationChange('slideDistance', value)} 
      />
      <TabCustomizerField 
        label="Fade Opacity" 
        value={tabAnimation.fadeOpacity || 0.8} 
        type="number"
        onChange={(value) => handleAnimationChange('fadeOpacity', value)} 
      />
      <TabCustomizerField 
        label="Scale Effect" 
        value={tabAnimation.scaleEffect || 0.97} 
        type="number"
        onChange={(value) => handleAnimationChange('scaleEffect', value)} 
      />
      <TabCustomizerField 
        label="Enable Tab Switch Animation" 
        value={tabAnimation.enableTabSwitch} 
        type="checkbox"
        onChange={(value) => handleAnimationChange('enableTabSwitch', value)} 
      />
      <TabCustomizerField 
        label="Enable Group Collapse Animation" 
        value={tabAnimation.enableGroupCollapse} 
        type="checkbox"
        onChange={(value) => handleAnimationChange('enableGroupCollapse', value)} 
      />
      <TabCustomizerField 
        label="Enable Drag Preview Animation" 
        value={tabAnimation.enableDragPreview} 
        type="checkbox"
        onChange={(value) => handleAnimationChange('enableDragPreview', value)} 
      />
    </>
  );
  
  // Get theme colors safely from currentTheme
  const themeColors = {
    backgroundColor: theme.currentTheme?.colors?.primary?.[100] || '#f5f5f5',
    textColor: theme.currentTheme?.colors?.primary?.[800] || '#333333',
    borderColor: theme.currentTheme?.colors?.primary?.[500] || '#0078d7'
  };

  // Convert tabStyles to safe CSS properties
  const previewStyles = {
    borderRadius: tabStyles.borderRadius,
    height: tabStyles.height,
    minWidth: tabStyles.minWidth,
    maxWidth: tabStyles.maxWidth,
    padding: tabStyles.padding,
    margin: tabStyles.margin,
    fontWeight: tabStyles.fontWeight,
    boxShadow: tabStyles.shadow,
    textTransform: tabStyles.textTransform as 'none' | 'capitalize' | 'uppercase' | 'lowercase' | undefined,
    // Theme colors
    backgroundColor: themeColors.backgroundColor,
    color: themeColors.textColor,
    borderBottom: `2px solid ${themeColors.borderColor}`
  };
  
  return (
    <div className="tab-theme-customizer">
      <h3>Tab Theme Customizer</h3>
      
      <div className="tab-customizer-sections">
        <div className="tab-customizer-sections-tabs">
          <button 
            className={selectedTab === 'default' ? 'active' : ''} 
            onClick={() => setSelectedTab('default')}
          >
            Default Style
          </button>
          <button 
            className={selectedTab === 'active' ? 'active' : ''} 
            onClick={() => setSelectedTab('active')}
          >
            Active Style
          </button>
          <button 
            className={selectedTab === 'hover' ? 'active' : ''} 
            onClick={() => setSelectedTab('hover')}
          >
            Hover Style
          </button>
          <button 
            className={selectedTab === 'animation' ? 'active' : ''} 
            onClick={() => setSelectedTab('animation')}
          >
            Animation
          </button>
        </div>
        
        <div className="tab-customizer-fields">
          {selectedTab === 'animation' ? renderAnimationFields() : renderStyleFields()}
        </div>
      </div>
      
      <div className="tab-customizer-preview">
        <h4>Preview</h4>
        <div className="tab-preview">
          <div className="tab-preview-item" style={previewStyles}>
            Dashboard
          </div>
          <div className="tab-preview-item">Settings</div>
          <div className="tab-preview-item">Reports</div>
        </div>
      </div>
      
      <div className="tab-customizer-controls">
        <button 
          className="tab-customizer-apply"
          onClick={handleApplyTheme}
        >
          Apply Theme
        </button>
        <button 
          className="tab-customizer-reset"
          onClick={() => {
            setTabStyles({...defaultTabThemeExtension.tabs.styles.default});
            setTabAnimation({...defaultTabThemeExtension.tabs.animation});
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}; 