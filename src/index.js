import { createApp } from './core/app';
import { initializeTheme } from './core/theme';
import { initializeTabManager } from './core/tabs';
import { initializeStateManager } from './core/state';
const app = createApp({
  theme: initializeTheme(),
  tabs: initializeTabManager(),
  state: initializeStateManager(),
});
export default app;
