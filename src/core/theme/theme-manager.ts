import { Theme, ThemeState } from './types';

export class ThemeManager {
  private state: ThemeState;
  private subscribers: ((theme: ThemeState) => void)[] = [];

  constructor(defaultTheme: Theme) {
    this.state = {
      mode: 'light',
      currentScheme: defaultTheme.config.colors as any,
      config: defaultTheme.config,
    };
  }

  async initialize(): Promise<void> {
    // Load saved theme preferences from localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      this.setMode(savedMode as 'light' | 'dark' | 'custom');
    }
  }

  setMode(mode: 'light' | 'dark' | 'custom'): void {
    this.state = {
      ...this.state,
      mode,
    };
    localStorage.setItem('themeMode', mode);
    this.notifySubscribers();
  }

  setCustomScheme(scheme: Theme['config']['colors']): void {
    this.state = {
      ...this.state,
      mode: 'custom',
      currentScheme: scheme as any,
    };
    this.notifySubscribers();
  }

  getCurrentScheme(): Theme['config']['colors'] {
    return this.state.currentScheme as any;
  }

  subscribe(callback: (theme: ThemeState) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}
