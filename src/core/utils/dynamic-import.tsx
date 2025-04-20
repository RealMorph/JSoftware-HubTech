/**
 * Utility for dynamically importing components with better error handling
 * and consistent naming for better debugging in the bundle analyzer
 */

import * as React from 'react';
import { lazy, Suspense } from 'react';

interface ErrorComponentProps {
  error: Error;
  retry: () => void;
}

// Default loading component that can be overridden
export const DefaultLoadingComponent = () => {
  return <div className="dynamic-import-loading">Loading...</div>;
};

// Default error component that can be overridden
export const DefaultErrorComponent = ({ error, retry }: ErrorComponentProps) => {
  return (
    <div className="dynamic-import-error">
      <p>Failed to load component: {error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );
};

interface DynamicComponentOptions {
  chunkName?: string;
  LoadingComponent?: React.ComponentType;
  ErrorComponent?: React.ComponentType<ErrorComponentProps>;
}

/**
 * Creates a dynamically imported component with loading and error handling
 * 
 * @param importFactory Function that returns the dynamic import
 * @param options Configuration options
 */
export function createDynamicComponent<T extends React.ComponentType<any>>(
  importFactory: () => Promise<{ default: T }>,
  options: DynamicComponentOptions = {}
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
      return <ErrorComponent error={error} retry={retry} />;
    }

    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
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