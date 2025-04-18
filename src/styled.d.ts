import 'styled-components';
import { ThemeConfig } from './core/theme/consolidated-types';

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeConfig {}
} 