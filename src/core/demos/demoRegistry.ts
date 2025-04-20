/**
 * Demo Component Registry
 * 
 * This file maintains a central registry of all demo components in the application.
 * It provides metadata and access to demo components for the demo landing page
 * and navigation system.
 */

// Import React for lazy loading components
import React from 'react';

/**
 * Demo component status options
 */
export enum DemoStatus {
  COMPLETE = 'complete',
  IN_PROGRESS = 'in-progress',
  PLANNED = 'planned'
}

/**
 * Demo component category options
 */
export enum DemoCategory {
  BASE = 'base',
  FEEDBACK = 'feedback',
  DATA_VISUALIZATION = 'data-visualization',
  NAVIGATION = 'navigation',
  FORM = 'form',
  LAYOUT = 'layout'
}

/**
 * Interface for demo component metadata
 */
export interface DemoComponent {
  /** Unique identifier for the component */
  id: string;
  /** Display name for UI */
  name: string;
  /** Component category */
  category: DemoCategory;
  /** Path to access the demo */
  path: string;
  /** Description of the component */
  description: string;
  /** Current development status */
  status: DemoStatus;
  /** React component (lazy loaded) */
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  /** Optional tags for filtering/searching */
  tags?: string[];
  /** Optional documentation link */
  documentationUrl?: string;
  /** Optional API reference link */
  apiReferenceUrl?: string;
  /** Optional icon for menu display */
  menuIcon?: string;
  /** Optional order in the menu (lower numbers first) */
  menuOrder?: number;
  /** Whether to show in navigation menus */
  showInMenu?: boolean;
}

/**
 * Interface for demo category metadata
 */
export interface CategoryInfo {
  /** Category identifier */
  id: DemoCategory;
  /** Display name */
  name: string;
  /** Category description */
  description: string;
  /** Optional icon name */
  icon?: string;
}

// Define category information
export const categories: Record<DemoCategory, CategoryInfo> = {
  [DemoCategory.BASE]: {
    id: DemoCategory.BASE,
    name: 'Base Components',
    description: 'Fundamental building blocks of the UI',
    icon: 'components'
  },
  [DemoCategory.FEEDBACK]: {
    id: DemoCategory.FEEDBACK,
    name: 'Feedback Components',
    description: 'Components that provide feedback to users',
    icon: 'feedback'
  },
  [DemoCategory.DATA_VISUALIZATION]: {
    id: DemoCategory.DATA_VISUALIZATION,
    name: 'Data Visualization',
    description: 'Components for visualizing and analyzing data',
    icon: 'chart'
  },
  [DemoCategory.NAVIGATION]: {
    id: DemoCategory.NAVIGATION,
    name: 'Navigation Components',
    description: 'Components for user navigation and wayfinding',
    icon: 'navigation'
  },
  [DemoCategory.FORM]: {
    id: DemoCategory.FORM,
    name: 'Form Components',
    description: 'Components for user input and data collection',
    icon: 'form'
  },
  [DemoCategory.LAYOUT]: {
    id: DemoCategory.LAYOUT,
    name: 'Layout Components',
    description: 'Components for structuring page layouts',
    icon: 'layout'
  }
};

// Initialize the demo registry
const demoRegistry: DemoComponent[] = [
  // Base Components
  {
    id: 'button',
    name: 'Button',
    category: DemoCategory.BASE,
    path: '/demos/base/button',
    description: 'Standard button component with variants',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/ButtonDemo')),
    tags: ['button', 'interactive', 'control', 'UI']
  },
  {
    id: 'text-field',
    name: 'Text Field',
    category: DemoCategory.BASE,
    path: '/demos/base/text-field',
    description: 'Text input component with validation',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/TextFieldDemo')),
    tags: ['input', 'form', 'text', 'UI']
  },
  {
    id: 'card',
    name: 'Card',
    category: DemoCategory.BASE,
    path: '/demos/base/card',
    description: 'Container for related content and actions',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/CardDemo')),
    tags: ['container', 'layout', 'UI']
  },
  
  // Feedback Components
  {
    id: 'alert',
    name: 'Alert',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/alert',
    description: 'Informative message with contextual styles',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/AlertDemo')),
    tags: ['notification', 'feedback', 'message', 'UI']
  },
  {
    id: 'toast',
    name: 'Toast',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/toast',
    description: 'Temporary notifications for user feedback',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/ToastDemo')),
    tags: ['notification', 'feedback', 'message', 'UI']
  },
  {
    id: 'modal',
    name: 'Modal',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/modal',
    description: 'Dialog window for focused user interaction',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/ModalDemo')),
    tags: ['dialog', 'popup', 'overlay', 'UI']
  },
  
  // Data Visualization Components
  {
    id: 'charts',
    name: 'Charts',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-visualization/charts',
    description: 'Data visualization with various chart types',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/ChartsDemo')),
    tags: ['chart', 'graph', 'data', 'visualization']
  },
  {
    id: 'data-grid',
    name: 'Data Grid',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-visualization/data-grid',
    description: 'Interactive table for data display and manipulation',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/DataGridDemo')),
    tags: ['table', 'grid', 'data', 'visualization']
  },
  {
    id: 'maps',
    name: 'Maps',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-visualization/maps',
    description: 'Geographic data visualization',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/MapsDemo')),
    tags: ['map', 'geography', 'location', 'visualization']
  },
  
  // Navigation Components
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/breadcrumbs',
    description: 'Navigation path indicator',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/BreadcrumbsDemo')),
    tags: ['navigation', 'path', 'location', 'UI']
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/tabs',
    description: 'Tabbed interface for content organization',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/TabsDemo')),
    tags: ['navigation', 'tabs', 'panels', 'UI']
  },
  {
    id: 'menu',
    name: 'Menu',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/menu',
    description: 'Menu system for navigation and commands',
    status: DemoStatus.COMPLETE,
    component: React.lazy(() => import('../../components/demos/MenuDemo')),
    tags: ['navigation', 'dropdown', 'options', 'UI']
  },
  
  // Tree Component
  {
    id: 'tree',
    name: 'Tree',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/tree',
    description: 'Hierarchical tree view for nested data',
    status: DemoStatus.IN_PROGRESS,
    component: React.lazy(() => import('../../components/demos/TreeDemo')),
    tags: ['navigation', 'tree', 'hierarchy', 'UI']
  }
];

/**
 * Get all registered demo components
 * @returns Array of all demo components
 */
export const getAllDemos = (): DemoComponent[] => {
  return [...demoRegistry];
};

/**
 * Get demos by category
 * @param category The category to filter by
 * @returns Array of demos in the specified category
 */
export const getDemosByCategory = (category: DemoCategory): DemoComponent[] => {
  return demoRegistry.filter(demo => demo.category === category);
};

/**
 * Get a specific demo by ID
 * @param id The demo ID to lookup
 * @returns The demo component if found, undefined otherwise
 */
export const getDemoById = (id: string): DemoComponent | undefined => {
  return demoRegistry.find(demo => demo.id === id);
};

/**
 * Search demos by text query
 * @param query The search query
 * @returns Array of demos matching the search query
 */
export const searchDemos = (query: string): DemoComponent[] => {
  const lowercaseQuery = query.toLowerCase();
  return demoRegistry.filter(demo => {
    return (
      demo.name.toLowerCase().includes(lowercaseQuery) ||
      demo.description.toLowerCase().includes(lowercaseQuery) ||
      (demo.tags && demo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
    );
  });
};

/**
 * Get demos by status
 * @param status The status to filter by
 * @returns Array of demos with the specified status
 */
export const getDemosByStatus = (status: DemoStatus): DemoComponent[] => {
  return demoRegistry.filter(demo => demo.status === status);
};

/**
 * Register a single demo component
 * @param demo The demo component to register
 */
export const registerDemo = (demo: DemoComponent): void => {
  // Check if demo with the same ID already exists
  const existingIndex = demoRegistry.findIndex(d => d.id === demo.id);
  if (existingIndex >= 0) {
    // Replace existing demo
    demoRegistry[existingIndex] = demo;
  } else {
    // Add new demo
    demoRegistry.push(demo);
  }
};

/**
 * Register multiple demo components at once
 * @param demos Array of demo components to register
 */
export const registerMany = (demos: DemoComponent[]): void => {
  demos.forEach(demo => registerDemo(demo));
};

/**
 * Alias for getDemoById to match expected method name
 * @param id The demo ID to lookup
 * @returns The demo component if found, undefined otherwise
 */
export const getDemo = getDemoById;

/**
 * Alias for getDemosByCategory to match expected method name
 * @param category The category to filter by
 * @returns Array of demos in the specified category
 */
export const getByCategory = getDemosByCategory;

/**
 * Alias for getDemosByStatus to match expected method name
 * @param status The status to filter by
 * @returns Array of demos with the specified status
 */
export const getByStatus = getDemosByStatus;

// Export as a combined object with all methods
export default {
  getAllDemos,
  getDemosByCategory,
  getDemoById,
  searchDemos,
  getDemosByStatus,
  registerDemo,
  categories,
  registerMany,
  getDemo,
  getByCategory,
  getByStatus
}; 