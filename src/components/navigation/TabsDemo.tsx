import React from 'react';
import styled from '@emotion/styled';
import { Tabs } from './Tabs';
import { getThemeValue } from '../../core/theme/styled';
import { ThemeConfig } from '../../core/theme/theme-persistence';

const DemoContainer = styled.div`
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.6')};
  background-color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.background.default')};
`;

const DemoSection = styled.div`
  margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.6')};
  padding: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.4')};
  background-color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.background.paper')};
  border-radius: ${props => getThemeValue(props.theme as ThemeConfig, 'borderRadius.md')};
  box-shadow: ${props => getThemeValue(props.theme as ThemeConfig, 'shadows.sm')};
`;

const DemoTitle = styled.h3`
  margin-bottom: ${props => getThemeValue(props.theme as ThemeConfig, 'spacing.3')};
  color: ${props => getThemeValue(props.theme as ThemeConfig, 'colors.text.primary')};
  font-family: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.family.primary')};
  font-size: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.scale.lg')};
  font-weight: ${props => getThemeValue(props.theme as ThemeConfig, 'typography.weights.semibold')};
`;

const tabs = [
  {
    id: 'tab1',
    label: 'Overview',
    content: <div>Overview content with detailed information about the system.</div>
  },
  {
    id: 'tab2',
    label: 'Settings',
    content: <div>Settings panel with various configuration options.</div>
  },
  {
    id: 'tab3',
    label: 'Analytics',
    content: <div>Analytics dashboard with charts and metrics.</div>
  }
];

export const TabsDemo: React.FC = () => {
  return (
    <DemoContainer>
      <DemoSection>
        <DemoTitle>Default Tabs</DemoTitle>
        <Tabs tabs={tabs} />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Pill Tabs</DemoTitle>
        <Tabs tabs={tabs} variant="pills" />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Underline Tabs</DemoTitle>
        <Tabs tabs={tabs} variant="underline" />
      </DemoSection>

      <DemoSection>
        <DemoTitle>Tab Sizes</DemoTitle>
        <Tabs tabs={tabs} size="small" />
        <Tabs tabs={tabs} size="medium" />
        <Tabs tabs={tabs} size="large" />
      </DemoSection>
    </DemoContainer>
  );
}; 