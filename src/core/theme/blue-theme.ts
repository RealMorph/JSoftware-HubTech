import { ThemeConfig } from './consolidated-types';
import { themeDefaults } from './theme-defaults';

export const blueTheme: ThemeConfig = {
  ...themeDefaults,
  id: 'blue',
  name: 'Blue Theme',
  description: 'A cool blue theme',
  colors: {
    ...themeDefaults.colors,
    primary: '#2563eb',
    secondary: '#3b82f6',
    background: '#f0f9ff',
    surface: '#ffffff',
    border: '#bfdbfe',
    text: {
      primary: '#1e3a8a',
      secondary: '#3b82f6'
    },
    private: {
      buttonBg: '#2563eb',
      buttonHover: '#1d4ed8',
      googleButton: '#fff'
    }
  }
}; 