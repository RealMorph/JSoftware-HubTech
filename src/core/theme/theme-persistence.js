import { colors, semanticColors, stateColors } from './colors';
import {
  typographyScale,
  fontWeights,
  lineHeights,
  letterSpacing,
  fontFamilies,
} from './typography';
import { spacingScale, semanticSpacing } from './spacing';
import { breakpointValues, containerMaxWidths } from './breakpoints';
export class ThemeService {
  constructor(db) {
    Object.defineProperty(this, 'db', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: db,
    });
  }
  async getThemeById(id) {
    return this.db.findThemeById(id);
  }
  async getAllThemes() {
    return this.db.findAllThemes();
  }
  async getDefaultTheme() {
    return this.db.findDefaultTheme();
  }
  async createTheme(theme) {
    return this.db.createTheme(theme);
  }
  async updateTheme(id, theme) {
    return this.db.updateTheme(id, theme);
  }
  async deleteTheme(id) {
    return this.db.deleteTheme(id);
  }
  async setDefaultTheme(id) {
    return this.db.setDefaultTheme(id);
  }
}
export const defaultTheme = {
  id: 'default',
  name: 'Default Theme',
  description: 'Default application theme',
  colors: {
    ...colors,
    ...semanticColors,
    ...stateColors,
  },
  typography: {
    scale: typographyScale,
    weights: fontWeights,
    lineHeights: lineHeights,
    letterSpacing: letterSpacing,
    family: fontFamilies,
  },
  spacing: {
    ...spacingScale,
    semantic: semanticSpacing,
  },
  breakpoints: {
    ...breakpointValues,
    containers: containerMaxWidths,
  },
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
export class InMemoryThemeDatabase {
  constructor() {
    Object.defineProperty(this, 'themes', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: [defaultTheme],
    });
  }
  async findThemeById(id) {
    const theme = this.themes.find(t => t.id === id);
    return theme || null;
  }
  async findAllThemes() {
    return [...this.themes];
  }
  async findDefaultTheme() {
    const theme = this.themes.find(t => t.isDefault === true);
    return theme || null;
  }
  async createTheme(theme) {
    const newTheme = {
      ...theme,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.themes.push(newTheme);
    return newTheme;
  }
  async updateTheme(id, updates) {
    const index = this.themes.findIndex(t => t.id === id);
    if (index === -1) return null;
    const theme = this.themes[index];
    const updatedTheme = {
      ...theme,
      ...updates,
      updatedAt: new Date(),
    };
    this.themes[index] = updatedTheme;
    return updatedTheme;
  }
  async deleteTheme(id) {
    const index = this.themes.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.themes.splice(index, 1);
    return true;
  }
  async setDefaultTheme(id) {
    const themeIndex = this.themes.findIndex(t => t.id === id);
    if (themeIndex === -1) return false;
    this.themes.forEach(t => (t.isDefault = false));
    this.themes[themeIndex].isDefault = true;
    return true;
  }
}
const inMemoryDb = new InMemoryThemeDatabase();
export const inMemoryThemeService = new ThemeService(inMemoryDb);
