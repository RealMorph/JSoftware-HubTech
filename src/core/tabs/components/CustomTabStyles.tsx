import React, { useState } from 'react';
import { TabThemeCustomizer } from './TabThemeCustomizer';
import { TabsDemo } from '../theme/StyledTab';
import {
  defaultTabThemeExtension,
  TabStyleOptions,
  TabThemeExtension,
} from '../theme/tab-theme-extension';
import { ThemeProvider } from '@emotion/react';
import { useDirectTheme } from '../../theme/DirectThemeProvider';
import styled from '@emotion/styled';

interface ThemeStyles {
  colors: {
    background: {
      primary: string;
      secondary: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      small: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
  };
  borders: {
    radius: {
      sm: string;
      md: string;
    };
  };
}

// Styled components for the custom tab styles page
const Container = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: ${({ $themeStyles }) => $themeStyles.spacing.lg};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background.primary};
  color: ${({ $themeStyles }) => $themeStyles.colors.text.primary};
  font-family: ${({ $themeStyles }) => $themeStyles.typography.fontFamily};
`;

const Layout = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ $themeStyles }) => $themeStyles.spacing.lg};
  margin-top: ${({ $themeStyles }) => $themeStyles.spacing.lg};
`;

const CustomizerPanel = styled.div<{ $themeStyles: ThemeStyles }>`
  flex: 1;
  min-width: 300px;
  padding: ${({ $themeStyles }) => $themeStyles.spacing.md};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background.secondary};
  border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.md};
`;

const PreviewPanel = styled.div<{ $themeStyles: ThemeStyles }>`
  flex: 2;
  min-width: 500px;
  padding: ${({ $themeStyles }) => $themeStyles.spacing.md};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background.secondary};
  border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.md};
`;

const CodeExample = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-top: ${({ $themeStyles }) => $themeStyles.spacing.lg};
  padding: ${({ $themeStyles }) => $themeStyles.spacing.md};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background.primary};
  border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.sm};
`;

const CodeBlock = styled.pre<{ $themeStyles: ThemeStyles }>`
  overflow-x: auto;
  padding: ${({ $themeStyles }) => $themeStyles.spacing.md};
  background-color: ${({ $themeStyles }) => $themeStyles.colors.background.secondary};
  border-radius: ${({ $themeStyles }) => $themeStyles.borders.radius.sm};
  font-family: monospace;
  font-size: ${({ $themeStyles }) => $themeStyles.typography.fontSize.small};
`;

/**
 * Component that combines the TabThemeCustomizer with the StyledTab demo
 * to showcase custom tab styles in action
 */
export const CustomTabStyles: React.FC = () => {
  const { theme, getColor, getTypography, getSpacing, getBorderRadius } = useDirectTheme();
  const [customTheme, setCustomTheme] = useState<any>({
    currentTheme: theme,
    tabs: defaultTabThemeExtension.tabs,
  });

  const themeStyles: ThemeStyles = {
    colors: {
      background: {
        primary: getColor('background.main'),
        secondary: getColor('background.light'),
      },
      text: {
        primary: getColor('text.primary'),
        secondary: getColor('text.secondary'),
      },
      border: getColor('border'),
    },
    typography: {
      fontFamily: String(getTypography('family.base')),
      fontSize: {
        base: String(getTypography('size.base')),
        small: String(getTypography('size.sm')),
      },
      fontWeight: {
        normal: Number(getTypography('weight.normal')),
        medium: Number(getTypography('weight.medium')),
        bold: Number(getTypography('weight.bold')),
      },
    },
    spacing: {
      xs: getSpacing('1'),
      sm: getSpacing('2'),
      md: getSpacing('4'),
      lg: getSpacing('6'),
    },
    borders: {
      radius: {
        sm: getBorderRadius('sm'),
        md: getBorderRadius('md'),
      },
    },
  };

  const handleApplyTheme = (newTheme: TabThemeExtension) => {
    setCustomTheme({
      ...customTheme,
      tabs: newTheme.tabs,
    });

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
    <Container $themeStyles={themeStyles}>
      <h2>Custom Tab Styles</h2>
      <p>Customize the appearance of tabs using the controls below.</p>

      <Layout $themeStyles={themeStyles}>
        <CustomizerPanel $themeStyles={themeStyles}>
          <TabThemeCustomizer onApplyTheme={handleApplyTheme} />
        </CustomizerPanel>

        <PreviewPanel $themeStyles={themeStyles}>
          <h3>Live Preview</h3>

          <ThemeProvider theme={customTheme}>
            <TabsDemo />
          </ThemeProvider>

          <CodeExample $themeStyles={themeStyles}>
            <h4>Usage Example</h4>
            <CodeBlock $themeStyles={themeStyles}>
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
