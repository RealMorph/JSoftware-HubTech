import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from '@emotion/styled';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { ThemeServiceProvider } from './core/theme/ThemeServiceProvider';
import { inMemoryThemeService } from './core/theme/theme-context';
import { ErrorBoundary } from './core/error/ErrorBoundary';
import { AuthProvider } from './core/auth/AuthProvider';
import RouteGenerator from './core/routing/RouteGenerator';
import Navigation from './core/routing/Navigation';

// Loading fallback component
const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
    align-items: center;
  height: 100vh;
  width: 100%;
  font-size: 1.2rem;
  color: #666;
`;

// Main Router component
const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ThemeServiceProvider themeService={inMemoryThemeService}>
        <DirectThemeProvider>
          <ErrorBoundary>
              <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
                <Navigation showIcons={true} />
                <RouteGenerator />
              </Suspense>
          </ErrorBoundary>
        </DirectThemeProvider>
      </ThemeServiceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
