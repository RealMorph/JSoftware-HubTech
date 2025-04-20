/**
 * Demo Registry System
 * 
 * This module provides a centralized registry for all demo components in the application.
 * It allows for easy discovery, categorization, and search of demo components.
 */

// Import registry types and implementation
import demoRegistry, { 
  DemoComponent, 
  DemoCategory, 
  DemoStatus
} from './demoRegistry';

// Import demo data
import { 
  allDemoComponents,
  baseComponentDemos,
  feedbackComponentDemos,
  dataVisualizationDemos,
  navigationComponentDemos
} from './demoData';

// Initialize registry with all demo components
if (allDemoComponents && allDemoComponents.length > 0) {
  allDemoComponents.forEach(demo => demoRegistry.registerDemo(demo));
}

// Export everything for use in other modules
export {
  demoRegistry,
  DemoComponent,
  DemoCategory,
  DemoStatus,
  baseComponentDemos,
  feedbackComponentDemos,
  dataVisualizationDemos,
  navigationComponentDemos,
  allDemoComponents
};

// Export default registry instance
export default demoRegistry; 