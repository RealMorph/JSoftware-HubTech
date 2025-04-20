/**
 * Utility for dynamically importing components with better error handling
 * and consistent naming for better debugging in the bundle analyzer
 */

import React, { lazy, Suspense } from 'react';

// Default loading component that can be overridden
export const DefaultLoadingComponent: React.FC = () => {
  return React.createElement('div', { className: "dynamic-import-loading" }, "Loading...");
};

// Default error component that can be overridden
export const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => {
  return React.createElement(
    'div', 
    { className: "dynamic-import-error" },
    React.createElement('p', null, `Failed to load component: ${error.message}`),
    React.createElement('button', { onClick: retry }, "Retry")
  );
};

/**
 * Creates a dynamically imported component with loading and error handling
 * 
 * @param importFactory Function that returns the dynamic import
 * @param chunkName Optional name for the chunk for better debugging
 * @param LoadingComponent Custom loading component
 * @param ErrorComponent Custom error component
 */
export function createDynamicComponent<T extends React.ComponentType<any>>(
  importFactory: () => Promise<{ default: T }>,
  options: {
    chunkName?: string;
    LoadingComponent?: React.ComponentType;
    ErrorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  } = {}
) {
  const {
    LoadingComponent = DefaultLoadingComponent,
    ErrorComponent = DefaultErrorComponent,
    chunkName
  } = options;

  // Use named chunk if provided for better debugging
  const LazyComponent = chunkName
    ? lazy(() => 
        importFactory().catch(error => {
          console.error(`Failed to load chunk "${chunkName}":`, error);
          return Promise.reject(error);
        })
      )
    : lazy(importFactory);

  // Return a wrapped component that handles loading and errors
  return function DynamicComponent(props: React.ComponentProps<T>) {
    const [error, setError] = React.useState<Error | null>(null);

    const retry = React.useCallback(() => {
      setError(null);
    }, []);

    if (error) {
      return React.createElement(ErrorComponent, { error, retry });
    }

    return React.createElement(
      Suspense, 
      { fallback: React.createElement(LoadingComponent) },
      React.createElement(LazyComponent, props)
    );
  };
}

/**
 * Create a dynamic component with a custom loading indicator and standard naming
 * 
 * @example
 * const DynamicDataGrid = createDynamicImport(() => import('./DataGrid'), 'data-grid');
 */
export const createDynamicImport = <T extends React.ComponentType<any>>(
  importFactory: () => Promise<{ default: T }>,
  name: string
) => 
  createDynamicComponent(importFactory, {
    chunkName: name
  }); 