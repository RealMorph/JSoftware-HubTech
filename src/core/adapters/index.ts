/**
 * Data Adapters
 * 
 * This file exports all data adapter components for easy import throughout the application.
 */

// Core interfaces and base classes
export * from './DataAdapter';

// Adapter implementations
export * from './RestApiAdapter';

// Factory and utilities
export * from './AdapterFactory';

// Re-export the hooks for convenience
export { useDataAdapter, createModelAdapter } from '../hooks/useDataAdapter'; 