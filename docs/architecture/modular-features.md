# Modular Feature Architecture

This document outlines the principles, patterns, and best practices for building modular, self-contained frontend features within our application.

## Core Principles

1. **Independent Activation**: Each feature must be independently enable/disable-able at runtime without breaking other features
2. **Loose Coupling**: Features should communicate through well-defined interfaces, not direct dependencies
3. **Feature Isolation**: Each feature should maintain its own state, UI components, and business logic
4. **Consistent API Boundaries**: All features must expose consistent public APIs
5. **Independent Testing**: Each feature must be testable in isolation from other features

## Feature Module Structure

Every feature module should follow this standard structure:

```
src/features/[feature-name]/
├── components/         # Feature-specific UI components
├── hooks/              # React hooks for the feature
├── context/            # Context providers and consumers
├── state/              # Feature-specific state management
├── utils/              # Utility functions for the feature
├── types/              # TypeScript types for the feature
├── constants.ts        # Feature-specific constants
├── index.ts            # Public API of the feature
└── README.md           # Feature documentation
```

## Module Lifecycle

Every feature module must implement a standard lifecycle interface:

```typescript
interface FeatureModule {
  // Required lifecycle methods
  init(): Promise<void>;             // Initialize the module
  activate(): void;                  // Activate the module
  deactivate(): void;                // Deactivate the module
  cleanup(): Promise<void>;          // Clean up module resources

  // Optional methods
  getAPIProvider(): APIProvider;     // Get API provider for other modules
  getDependencies(): string[];       // Get module dependencies
  getStatus(): FeatureStatus;        // Get module status
}
```

## Feature Registration

Features must register themselves with the FeatureRegistry:

```typescript
// In src/features/my-feature/index.ts
import { FeatureRegistry } from '@core/features';
import { MyFeatureModule } from './my-feature-module';

// Register the feature module
FeatureRegistry.register('my-feature', () => new MyFeatureModule());

// Export public API
export { useMyFeature } from './hooks/use-my-feature';
export type { MyFeatureConfig } from './types';
```

## Inter-Feature Communication

Features should communicate through these approved patterns:

1. **Events**: Use the EventBus for decoupled communication
2. **APIs**: Expose and consume well-defined APIs
3. **Shared state**: Use the shared state service for cross-feature state
4. **Tab Messaging**: Use the tab messaging system for tab-specific communication

```typescript
// Publishing events
import { EventBus } from '@core/events';

// Inside a feature
EventBus.publish('myFeature:dataUpdated', { id: '123', value: 'new data' });

// Subscribing to events in another feature
EventBus.subscribe('myFeature:dataUpdated', (data) => {
  // Handle the data update
});
```

## Feature Dependencies

Features may depend on other features, but dependencies must be:

1. **Explicit**: Clearly declared in the module's `getDependencies()` method
2. **Optional when possible**: Features should gracefully handle missing dependencies
3. **Versioned**: Dependencies should specify version requirements

```typescript
// Feature dependency declaration
class MyFeatureModule implements FeatureModule {
  getDependencies(): string[] {
    return [
      'core:theme@^1.0.0',
      'core:tabs@^2.0.0',
      '?advanced-charting@^1.0.0'  // Optional dependency (note the ? prefix)
    ];
  }
}
```

## Feature Initialization

Feature initialization should follow these steps:

1. **Registration**: The feature registers with the FeatureRegistry
2. **Dependency Validation**: The system verifies that all dependencies are available
3. **Initialization**: The feature's `init()` method is called
4. **Activation**: The feature's `activate()` method is called if the feature is enabled

```typescript
// Example initialization
class MyFeatureModule implements FeatureModule {
  async init(): Promise<void> {
    // Load configuration
    await this.loadConfig();
    
    // Set up state
    this.initState();
    
    // Register API provider
    FeatureRegistry.registerAPIProvider('my-feature', this.getAPIProvider());
  }
  
  activate(): void {
    // Register event handlers
    this.registerEventHandlers();
    
    // Initialize UI components
    this.initUIComponents();
  }
}
```

## Feature Testing

Features should include these levels of testing:

1. **Unit Tests**: Test individual components and utilities
2. **Integration Tests**: Test feature in isolation
3. **System Tests**: Test feature with dependencies (using mocks)
4. **Feature Toggle Tests**: Test enabling/disabling the feature

## Best Practices

1. **Use Lazy Loading**: Features should be lazy-loaded when possible
2. **Minimize Dependencies**: Keep dependencies to a minimum
3. **Handle Missing Features**: Gracefully handle cases when dependent features are disabled
4. **Expose a Minimal API**: Only expose what's necessary for other features
5. **Use Feature Flags**: Support runtime enabling/disabling through feature flags
6. **Document Public API**: Clearly document the public API of your feature
7. **Implement Error Boundaries**: Each feature should have its own error boundaries
8. **Follow the Interface Segregation Principle**: Expose multiple specific interfaces rather than one general-purpose interface

## Examples

### Basic Feature Module

```typescript
// src/features/theme-switcher/theme-switcher-module.ts
import { FeatureModule, FeatureStatus } from '@core/features';
import { EventBus } from '@core/events';
import { ThemeSwitcherAPIProvider } from './theme-switcher-api';

export class ThemeSwitcherModule implements FeatureModule {
  private status: FeatureStatus = FeatureStatus.INACTIVE;
  private apiProvider: ThemeSwitcherAPIProvider;
  private eventHandlers: Array<() => void> = [];

  constructor() {
    this.apiProvider = new ThemeSwitcherAPIProvider();
  }

  async init(): Promise<void> {
    // Initialize module resources
    this.status = FeatureStatus.INITIALIZED;
  }

  activate(): void {
    // Set up event handlers
    const unsubscribe = EventBus.subscribe('theme:changed', this.handleThemeChanged);
    this.eventHandlers.push(unsubscribe);
    
    this.status = FeatureStatus.ACTIVE;
  }

  deactivate(): void {
    // Clean up event handlers
    this.eventHandlers.forEach(handler => handler());
    this.eventHandlers = [];
    
    this.status = FeatureStatus.INACTIVE;
  }

  async cleanup(): Promise<void> {
    // Clean up resources
    this.deactivate();
    this.status = FeatureStatus.UNINITIALIZED;
  }

  getAPIProvider(): ThemeSwitcherAPIProvider {
    return this.apiProvider;
  }

  getDependencies(): string[] {
    return ['core:theme@^1.0.0'];
  }

  getStatus(): FeatureStatus {
    return this.status;
  }

  private handleThemeChanged = (themeData: any) => {
    // Handle theme changed event
  };
}
```

## Migration Guide

If you're converting an existing non-modular feature to follow this architecture:

1. **Identify Boundaries**: Determine the feature's natural boundaries
2. **Isolate State**: Move feature-specific state to the feature module
3. **Create a Public API**: Define the feature's public interface
4. **Implement Lifecycle Methods**: Add proper init, activate, deactivate, and cleanup methods
5. **Register the Feature**: Register with the FeatureRegistry
6. **Add Feature Flag Support**: Make the feature enable/disable-able
7. **Update Dependencies**: Modify how the feature interacts with dependencies
8. **Test Independence**: Verify the feature works when enabled/disabled independently 