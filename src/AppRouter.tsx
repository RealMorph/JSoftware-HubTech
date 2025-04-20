import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DirectThemeProvider } from './core/theme/DirectThemeProvider';
import { ThemeServiceProvider } from './core/theme/ThemeServiceProvider';
import { inMemoryThemeService } from './core/theme/theme-context';
import { ProtectedRoute } from './core/router/ProtectedRoute';
import { ErrorBoundary } from './core/error/ErrorBoundary';
import { LayoutProvider } from './core/layout/LayoutContext';
import { AppLayout } from './components/layout/AppLayout';
import { AnimatedRoutes, pageTransitionVariants } from './core/router/AnimatedRoutes';
import { NavigationHistoryProvider } from './core/router/NavigationHistory';
import { NavigationAnalytics } from './core/router/NavigationAnalytics';
import { FeatureFlagProvider } from './core/feature-flags';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactsListPage from './pages/ContactsListPage';
import DashboardPage from './pages/DashboardPage';
import ErrorManagementPage from './pages/ErrorManagementPage';

// Demo pages
import { FormDemo } from './components/base/FormDemo';
import { DataDisplayDemo } from './components/base/DataDisplayDemo';
import DatePickerDemoPage from './pages/DatePickerDemoPage';
import TimePickerDemoPage from './pages/TimePickerDemoPage';
import { LayoutDemo } from './components/layout/LayoutDemo';
import FeedbackDemoPage from './pages/FeedbackDemoPage';
import TabsDemoPage from './pages/TabsDemoPage';
import NavigationDemoPage from './pages/NavigationDemoPage';
import { DataVisualizationDemo } from './components/data-visualization';
import { MultiSelectDemo } from './components/base/MultiSelectDemo';
import { TypeaheadDemo } from './components/base/TypeaheadDemo';
import FileUploadIntegrationDemo from './components/demos/FileUploadIntegrationDemo';
import CSVImportDemo from './components/demos/CSVImportDemo';

// Route metadata for generating navigation and breadcrumbs
export interface RouteMetadata {
  path: string;
  title: string;
  icon?: React.ReactNode;
  children?: RouteMetadata[];
}

// Feature flag configuration
const featureFlagConfig = {
  apiHost: process.env.REACT_APP_GROWTHBOOK_API_HOST || 'https://cdn.growthbook.io',
  clientKey: process.env.REACT_APP_GROWTHBOOK_CLIENT_KEY || 'sdk-dummy-key',
  enableDevMode: process.env.NODE_ENV !== 'production',
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ThemeServiceProvider themeService={inMemoryThemeService}>
        <DirectThemeProvider>
          <FeatureFlagProvider config={featureFlagConfig}>
            <LayoutProvider>
              <NavigationHistoryProvider>
                <NavigationAnalytics>
                  <ErrorBoundary>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      
                      {/* Protected Application Routes */}
                      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                      
                      <Route path="/app/*" element={
                        <ProtectedRoute>
                          <AppLayout>
                            <AnimatedRoutes variants={pageTransitionVariants}>
                              <Routes>
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="contacts" element={<ContactsListPage />} />
                                <Route path="settings" element={<div>Settings Page</div>} />
                                <Route path="deals" element={<div>All Deals</div>} />
                                <Route path="deals/active" element={<div>Active Deals</div>} />
                                <Route path="deals/closed" element={<div>Closed Deals</div>} />
                                <Route path="*" element={<div>Not Found</div>} />
                              </Routes>
                            </AnimatedRoutes>
                          </AppLayout>
                        </ProtectedRoute>
                      } />
                      
                      {/* Legacy route - redirect to new location */}
                      <Route path="/contacts" element={
                        <ProtectedRoute>
                          <Navigate to="/app/contacts" replace />
                        </ProtectedRoute>
                      } />
                      
                      {/* Demo Routes - Publicly Accessible */}
                      <Route path="/demos/*" element={
                        <AppLayout hideHeader={false}>
                          <AnimatedRoutes variants={pageTransitionVariants}>
                            <Routes>
                              <Route path="" element={<div>Demo Home</div>} />
                              <Route path="form" element={<FormDemo />} />
                              <Route path="data-display" element={<DataDisplayDemo />} />
                              <Route path="date-picker" element={<DatePickerDemoPage />} />
                              <Route path="time-picker" element={<TimePickerDemoPage />} />
                              <Route path="layout" element={<LayoutDemo />} />
                              <Route path="feedback" element={<FeedbackDemoPage />} />
                              <Route path="tabs" element={<TabsDemoPage />} />
                              <Route path="navigation" element={<NavigationDemoPage />} />
                              <Route path="data-visualization" element={<DataVisualizationDemo />} />
                              <Route path="visualization" element={<DataVisualizationDemo />} />
                              <Route path="multi-select" element={<MultiSelectDemo />} />
                              <Route path="typeahead" element={<TypeaheadDemo />} />
                              <Route path="file-upload" element={<FileUploadIntegrationDemo />} />
                              <Route path="csv-import" element={<CSVImportDemo />} />
                              <Route path="*" element={<div>Demo Not Found</div>} />
                            </Routes>
                          </AnimatedRoutes>
                        </AppLayout>
                      } />
                      
                      {/* Debug Tools */}
                      <Route path="/debug/errors" element={<ErrorManagementPage />} />
                      
                      {/* Catch-all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </ErrorBoundary>
                </NavigationAnalytics>
              </NavigationHistoryProvider>
            </LayoutProvider>
          </FeatureFlagProvider>
        </DirectThemeProvider>
      </ThemeServiceProvider>
    </BrowserRouter>
  );
};

export default AppRouter; 