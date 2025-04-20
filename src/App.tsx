import React, { useEffect } from 'react';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { defaultTheme } from './core/theme/theme-persistence';
import AnimationProvider from './core/animation/AnimationProvider';
import AppRouter from './Router';
import { app } from './core/firebase';
import { AuthProvider } from './core/hooks/useAuth';
import { QueryProvider } from './core/providers/QueryProvider';
import { ErrorBoundary } from 'react-error-boundary';
import NetworkStatusProvider from './components/NetworkStatusProvider';
import OfflineNotification from './components/OfflineNotification';
import { initOfflineSync } from './utils/offlineSync';

// Fallback component for error boundary
const GlobalErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div role="alert">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    // Firebase is initialized through the import of firebase-config
    console.log('Firebase initialized with app:', app.name);
    
    // Initialize offline sync
    initOfflineSync();
  }, []);

  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <DirectThemeProvider initialTheme={defaultTheme}>
        <AnimationProvider>
          <NetworkStatusProvider>
            <AuthProvider>
              <QueryProvider>
                <div data-testid="app-root">
                  <AppRouter />
                  <OfflineNotification />
                </div>
              </QueryProvider>
            </AuthProvider>
          </NetworkStatusProvider>
        </AnimationProvider>
      </DirectThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
