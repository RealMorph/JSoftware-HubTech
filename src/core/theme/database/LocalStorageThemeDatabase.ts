import { Theme } from '../types';
import { ThemeDatabase } from '../interfaces/ThemeDatabase';

export class LocalStorageThemeDatabase implements ThemeDatabase {
  private readonly STORAGE_KEY = 'themes';

  async getThemes(): Promise<Theme[]> {
    const themesJson = localStorage.getItem(this.STORAGE_KEY);
    if (!themesJson) {
      return [];
    }

    const themes = JSON.parse(themesJson);
    return themes.map((theme: any) => ({
      ...theme,
      createdAt: new Date(theme.createdAt),
      updatedAt: new Date(theme.updatedAt),
    }));
  }

  async getThemeById(id: string): Promise<Theme | null> {
    const themes = await this.getThemes();
    const theme = themes.find(t => t.id === id);
    return theme || null;
  }

  async getAllThemes(): Promise<Theme[]> {
    return this.getThemes();
  }

  async saveTheme(theme: Theme): Promise<Theme> {
    const themes = await this.getThemes();
    const existingIndex = themes.findIndex(t => t.id === theme.id);

    if (existingIndex >= 0) {
      themes[existingIndex] = theme;
    } else {
      themes.push(theme);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(themes));
    return theme;
  }

  async deleteTheme(id: string): Promise<void> {
    const themes = await this.getThemes();
    const filteredThemes = themes.filter(theme => theme.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredThemes));
  }

  async updateTheme(id: string, updates: Partial<Theme>): Promise<Theme> {
    const themes = await this.getThemes();
    const themeIndex = themes.findIndex(theme => theme.id === id);

    if (themeIndex === -1) {
      throw new Error(`Theme with id ${id} not found`);
    }

    const updatedTheme = {
      ...themes[themeIndex],
      ...updates,
      updatedAt: new Date(),
    };

    themes[themeIndex] = updatedTheme;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(themes));
    return updatedTheme;
  }
}
