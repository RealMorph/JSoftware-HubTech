import { DefaultStateManager } from './state-manager';
export * from './state-manager';
export function initializeStateManager() {
  return new DefaultStateManager();
}
