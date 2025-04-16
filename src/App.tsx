import React from 'react';
import { UnifiedThemeProvider } from './core/theme/theme-wrapper';
import { TabsDemo } from './components/navigation/TabsDemo';

const App: React.FC = () => {
  return (
    <UnifiedThemeProvider>
      <TabsDemo />
    </UnifiedThemeProvider>
  );
};

export default App; 