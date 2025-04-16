import { DefaultStateManager } from './state-manager';
export * from './state-manager';

// Initialize state system
export function initializeStateManager() {
  return new DefaultStateManager();
}
