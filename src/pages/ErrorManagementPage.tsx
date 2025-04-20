/**
 * Error Management Page
 * 
 * A development page for viewing and managing application errors.
 * This page provides tools for filtering, analyzing, and debugging errors.
 */
import React from 'react';
import { ErrorManagementDashboard } from '../core/error/ErrorManager';
import { ErrorBoundary } from '../core/error/ErrorBoundary';

const ErrorManagementPage: React.FC = () => {
  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '20px' }}>Error Management Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>
          This dashboard provides tools for viewing, filtering, and debugging application errors.
          All errors caught by error boundaries or explicitly logged will appear here.
        </p>
      </div>
      
      <ErrorBoundary title="Error Management Dashboard Error">
        <ErrorManagementDashboard />
      </ErrorBoundary>
    </div>
  );
};

export default ErrorManagementPage; 