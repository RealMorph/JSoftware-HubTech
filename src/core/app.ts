import { ThemeManager, initializeTheme } from './theme';
import { TabManager, DefaultTabManager, TabStorage } from './tabs';
import { StateManager, DefaultStateManager } from './state';

interface AppConfig {
  theme: ThemeManager;
  tabs?: TabManager;
  state?: StateManager;
}

interface App {
  theme: ThemeManager;
  tabs: TabManager;
  state: StateManager;
  initialize(): Promise<void>;
}

export function createApp(config: AppConfig): App {
  return {
    theme: config.theme,
    tabs: config.tabs || new DefaultTabManager(new TabStorage()),
    state: config.state || new DefaultStateManager(),
    async initialize(): Promise<void> {
      // Initialize theme system
      await this.theme.initialize();

      // Initialize tab system
      await this.tabs.initialize();

      // Initialize state management
      await this.state.initialize();
    },
  };
}
