import { applyTheme } from './theme';
import { DefaultTabManager } from './tabs';
import { DefaultStateManager } from './state';
export function createApp(config) {
  return {
    theme: config.theme,
    tabs: config.tabs || new DefaultTabManager(),
    state: config.state || new DefaultStateManager(),
    async initialize() {
      const defaultTheme = await this.theme.getDefaultTheme();
      if (defaultTheme) {
        applyTheme(defaultTheme);
      }
      await this.tabs.initialize();
      await this.state.initialize();
    },
  };
}
