import '@emotion/react';
import { ThemeConfig } from './consolidated-types';

declare module '@emotion/react' {
  export interface Theme {
    colors: ThemeConfig['colors'];
    typography: ThemeConfig['typography'];
    spacing: ThemeConfig['spacing'];
    breakpoints: ThemeConfig['breakpoints'];
    borderRadius: ThemeConfig['borderRadius'];
    shadows: ThemeConfig['shadows'];
    transitions: ThemeConfig['transitions'];
  }
} 