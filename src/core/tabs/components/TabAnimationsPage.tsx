import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { useTheme } from '../../theme';
import { TabAnimationCustomizer } from './TabAnimationCustomizer';
import { TabAnimationsDemo } from '../theme/AnimatedTab';
import { TabAnimationOptions, defaultTabThemeExtension } from '../theme/tab-theme-extension';

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 8px;
`;

const PageDescription = styled.p`
  font-size: 16px;
  color: #666;
  max-width: 800px;
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
  background-color: #fafafa;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
`;

const CustomizerContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
  background-color: #fff;
`;

export const TabAnimationsPage: React.FC = () => {
  const theme = useTheme();
  const [animationOptions, setAnimationOptions] = useState<TabAnimationOptions>(
    defaultTabThemeExtension.tabs.animation
  );
  
  const [previewTheme, setPreviewTheme] = useState<any>({
    currentTheme: {
      ...theme.currentTheme,
      tabs: {
        ...((theme.currentTheme as any)?.tabs || {}),
        animation: animationOptions
      }
    }
  });
  
  const handleApplyAnimations = (newAnimations: TabAnimationOptions) => {
    setAnimationOptions(newAnimations);
    setPreviewTheme({
      currentTheme: {
        ...theme.currentTheme,
        tabs: {
          ...((theme.currentTheme as any)?.tabs || {}),
          animation: newAnimations
        }
      }
    });
  };
  
  // Apply CSS custom properties for animations
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--tab-animation-duration', `${animationOptions.duration}ms`);
    root.style.setProperty('--tab-animation-easing', animationOptions.easing);
    
    if (animationOptions.slideDistance) {
      root.style.setProperty('--tab-animation-slide-distance', animationOptions.slideDistance);
    }
    
    root.style.setProperty('--tab-animation-fade-opacity', 
      animationOptions.fadeOpacity ? animationOptions.fadeOpacity.toString() : '0.8');
    root.style.setProperty('--tab-animation-scale-effect', 
      animationOptions.scaleEffect ? animationOptions.scaleEffect.toString() : '0.97');
    
    return () => {
      // Clean up custom properties
      root.style.removeProperty('--tab-animation-duration');
      root.style.removeProperty('--tab-animation-easing');
      root.style.removeProperty('--tab-animation-slide-distance');
      root.style.removeProperty('--tab-animation-fade-opacity');
      root.style.removeProperty('--tab-animation-scale-effect');
    };
  }, [animationOptions]);
  
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Tab Animation System</PageTitle>
        <PageDescription>
          Customize tab animations and transitions with the controls below. 
          Changes will be immediately reflected in the preview panel.
        </PageDescription>
      </PageHeader>
      
      <ContentLayout>
        <CustomizerContainer>
          <TabAnimationCustomizer onApplyAnimations={handleApplyAnimations} />
        </CustomizerContainer>
        
        <PreviewContainer>
          <PreviewHeader>
            <h2>Live Preview</h2>
          </PreviewHeader>
          
          <ThemeProvider theme={previewTheme}>
            <TabAnimationsDemo />
          </ThemeProvider>
        </PreviewContainer>
      </ContentLayout>
      
      <div style={{ marginTop: '40px' }}>
        <h2>Animation System Guide</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Using Animated Tabs</h3>
            <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
{`import { 
  AnimatedTab, 
  AnimatedTabContent, 
  AnimatedTabGroup 
} from 'src/core/tabs/components';

// Animated tab with entrance animation
<AnimatedTab 
  id="tab1" 
  label="Dashboard" 
  active={true}
  isNew={true} 
/>

// Animated tab content
<AnimatedTabContent 
  id="tab1" 
  active={true}
>
  <p>Tab content goes here</p>
</AnimatedTabContent>

// Animated tab group
<AnimatedTabGroup 
  id="group1" 
  collapsed={false}
>
  <div>Group content here</div>
</AnimatedTabGroup>`}
            </pre>
          </div>
          
          <div>
            <h3>Animation Properties</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Property</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>duration</td>
                  <td style={{ padding: '8px' }}>Animation duration in milliseconds</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>easing</td>
                  <td style={{ padding: '8px' }}>CSS easing function (ease, ease-in-out, etc.)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>slideDistance</td>
                  <td style={{ padding: '8px' }}>Distance for slide animations (e.g. "10px")</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>fadeOpacity</td>
                  <td style={{ padding: '8px' }}>Target opacity for fade animations (0-1)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>scaleEffect</td>
                  <td style={{ padding: '8px' }}>Scale factor for scale animations (0-1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}; 