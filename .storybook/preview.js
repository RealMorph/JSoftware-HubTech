import React from 'react';
import { DirectThemeProvider } from '../src/core/theme/DirectThemeProvider';
import { ThemeServiceProvider } from '../src/core/theme/ThemeServiceProvider';
import { inMemoryThemeService } from '../src/core/theme/theme-context';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeServiceProvider themeService={inMemoryThemeService}>
        <DirectThemeProvider>
          <Story />
        </DirectThemeProvider>
      </ThemeServiceProvider>
    ),
  ],
};

export default preview; 