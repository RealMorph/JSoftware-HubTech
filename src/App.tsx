import React from 'react';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { defaultTheme } from './core/theme/theme-persistence';
import AppRouter from './Router';

const App: React.FC = () => {
  return (
    <div data-testid="app-root">
      <DirectThemeProvider initialTheme={defaultTheme}>
        <AppRouter />
      </DirectThemeProvider>
    </div>
  );
};

export default App;
