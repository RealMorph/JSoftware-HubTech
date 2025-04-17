import React, { useState } from 'react';
import { TabThemeCustomizer } from './TabThemeCustomizer';
import { TabsDemo } from '../theme/StyledTab';
import {
  defaultTabThemeExtension,
  TabStyleOptions,
  TabThemeExtension,
} from '../theme/tab-theme-extension';
import { ThemeProvider } from '@emotion/react';
import { useTheme } from '../../theme';
import styled from '@emotion/styled';

// Styled components for the custom tab styles page
const Container = styled.div`
  padding: 20px;
`;

const Layout = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 20px;
`;

const CustomizerPanel = styled.div`
  flex: 1;
  min-width: 300px;
`;

const PreviewPanel = styled.div`
  flex: 2;
  min-width: 500px;
`;

const CodeExample = styled.div`
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const CodeBlock = styled.pre`
  overflow-x: auto;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
`;

/**
 * Component that combines the TabThemeCustomizer with the StyledTab demo
 * to showcase custom tab styles in action
 */
export const CustomTabStyles: React.FC = () => {
  const themeContext = useTheme();
  const [customTheme, setCustomTheme] = useState<any>({
    currentTheme: themeContext.currentTheme,
    tabs: defaultTabThemeExtension.tabs,
  });

  const handleApplyTheme = (newTheme: any) => {
    setCustomTheme({
      ...customTheme,
      tabs: newTheme.tabs,
    });

    // Apply theme to CSS variables for traditional styling
    applyTabThemeToCssVars(newTheme.tabs);
  };

  /**
   * Applies tab theme styles to CSS variables
   */
  const applyTabThemeToCssVars = (tabTheme: TabThemeExtension['tabs']) => {
    const root = document.documentElement;
    const defaultStyles = tabTheme.styles.default;
    const activeStyles = tabTheme.styles.active;
    const hoverStyles = tabTheme.styles.hover;

    // Apply default styles
    Object.entries(defaultStyles).forEach(([key, value]) => {
      if (value !== undefined) {
        root.style.setProperty(`--tab-${kebabCase(key)}`, value.toString());
      }
    });

    // Apply active styles
    Object.entries(activeStyles).forEach(([key, value]) => {
      if (value !== undefined) {
        root.style.setProperty(`--tab-active-${kebabCase(key)}`, value.toString());
      }
    });

    // Apply hover styles
    Object.entries(hoverStyles).forEach(([key, value]) => {
      if (value !== undefined) {
        root.style.setProperty(`--tab-hover-${kebabCase(key)}`, value.toString());
      }
    });

    // Apply animation styles
    root.style.setProperty('--tab-transition-duration', `${tabTheme.animation.duration}ms`);
    root.style.setProperty('--tab-transition-easing', tabTheme.animation.easing);
  };

  /**
   * Converts camelCase to kebab-case
   */
  const kebabCase = (str: string) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  };

  return (
    <Container>
      <h2>Custom Tab Styles</h2>
      <p>Customize the appearance of tabs using the controls below.</p>

      <Layout>
        <CustomizerPanel>
          <TabThemeCustomizer onApplyTheme={handleApplyTheme} />
        </CustomizerPanel>

        <PreviewPanel>
          <h3>Live Preview</h3>

          <ThemeProvider theme={customTheme}>
            <TabsDemo />
          </ThemeProvider>

          <CodeExample>
            <h4>Usage Example</h4>
            <CodeBlock>
              {`import { Tab, StyledTabContainer } from '../theme/StyledTab';

// Basic usage
<StyledTabContainer>
  <Tab id="tab1" label="Dashboard" active={true} />
  <Tab id="tab2" label="Reports" />
  <Tab id="tab3" label="Settings" />
</StyledTabContainer>

// With custom styles
<Tab 
  id="tab4" 
  label="Custom Tab" 
  customStyles={{
    borderRadius: '8px',
    height: '42px',
    fontWeight: 600,
    textTransform: 'uppercase'
  }}
/>

// Different tab shapes
<Tab id="tab5" label="Pill Tab" tabShape="pill" />
<Tab id="tab6" label="Underlined Tab" tabShape="underlined" />

// With separators
<Tab id="tab7" label="With Separator" separatorStyle="line" />`}
            </CodeBlock>
          </CodeExample>
        </PreviewPanel>
      </Layout>
    </Container>
  );
};
