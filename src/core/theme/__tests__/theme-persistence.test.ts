import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { ThemeService, ThemeDatabase, ThemeConfig } from '../theme-persistence';
import { colors, semanticColors, stateColors } from '../colors';
import { typographyScale, fontWeights, lineHeights, letterSpacing } from '../typography';
import { spacingScale, semanticSpacing } from '../spacing';
import { breakpointValues, containerMaxWidths } from '../breakpoints';

export class MockThemeDatabase implements ThemeDatabase {
  private themes: Map<string, ThemeConfig> = new Map();
  private defaultThemeId: string | null = null;

  async findThemeById(id: string): Promise<ThemeConfig | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    return this.themes.get(id) || null;
  }

  async findAllThemes(): Promise<ThemeConfig[]> {
    // Simulate async operation and return a new array
    await new Promise(resolve => setTimeout(resolve, 0));
    return [...this.themes.values()];
  }

  async findDefaultTheme(): Promise<ThemeConfig | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    if (!this.defaultThemeId) return null;
    return this.themes.get(this.defaultThemeId) || null;
  }

  async createTheme(
    theme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ThemeConfig> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    const id = `theme-${Date.now()}`;
    const now = new Date();
    const newTheme: ThemeConfig = {
      ...theme,
      id,
      createdAt: now,
      updatedAt: now,
      isDefault: false,
    };
    this.themes.set(id, newTheme);
    return newTheme;
  }

  async updateTheme(
    id: string,
    theme: Partial<Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ThemeConfig | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    const existingTheme = this.themes.get(id);
    if (!existingTheme) return null;

    const updatedTheme: ThemeConfig = {
      ...existingTheme,
      ...theme,
      updatedAt: new Date(Date.now() + 1),
    };
    this.themes.set(id, updatedTheme);
    return updatedTheme;
  }

  async deleteTheme(id: string): Promise<boolean> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    if (id === this.defaultThemeId) return false;
    return this.themes.delete(id);
  }

  async setDefaultTheme(id: string): Promise<boolean> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    const theme = this.themes.get(id);
    if (!theme) return false;

    // First, remove default from previous default theme
    if (this.defaultThemeId) {
      const currentDefault = this.themes.get(this.defaultThemeId);
      if (currentDefault) {
        const updatedPrevious: ThemeConfig = {
          ...currentDefault,
          isDefault: false,
          updatedAt: new Date(Date.now() + 1),
        };
        this.themes.set(this.defaultThemeId, updatedPrevious);
      }
    }

    // Then set the new default theme
    const updatedTheme: ThemeConfig = {
      ...theme,
      isDefault: true,
      updatedAt: new Date(Date.now() + 2),
    };
    this.themes.set(id, updatedTheme);
    this.defaultThemeId = id;
    return true;
  }
}

describe('Theme Persistence', () => {
  let mockDb: MockThemeDatabase;
  let themeService: ThemeService;
  let defaultTheme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>;

  beforeEach(async () => {
    mockDb = new MockThemeDatabase();
    themeService = new ThemeService(mockDb);
    defaultTheme = {
      name: 'Default Theme',
      description: 'The default theme for testing',
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
      },
      spacing: {
        ...spacingScale,
        semantic: semanticSpacing,
      },
      breakpoints: {
        ...breakpointValues,
        containers: containerMaxWidths,
      },
    };
  });

  describe('Theme Creation', () => {
    it('should create a new theme', async () => {
      const theme = await themeService.createTheme(defaultTheme);
      expect(theme.id).toBeDefined();
      expect(theme.name).toBe(defaultTheme.name);
      expect(theme.createdAt).toBeDefined();
      expect(theme.updatedAt).toBeDefined();
      expect(theme.isDefault).toBe(false);
    });
  });

  describe('Theme Retrieval', () => {
    it('should get theme by id', async () => {
      const created = await themeService.createTheme(defaultTheme);
      const retrieved = await themeService.getThemeById(created.id);
      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent theme', async () => {
      const theme = await themeService.getThemeById('non-existent');
      expect(theme).toBeNull();
    });

    it('should get all themes', async () => {
      const first = await themeService.createTheme(defaultTheme);
      await new Promise(resolve => setTimeout(resolve, 1)); // Ensure different timestamps
      const second = await themeService.createTheme({
        ...defaultTheme,
        name: 'Another Theme',
      });
      const themes = await themeService.getAllThemes();
      expect(themes).toHaveLength(2);
      expect(themes.map(t => t.id)).toContain(first.id);
      expect(themes.map(t => t.id)).toContain(second.id);
    });
  });

  describe('Theme Updates', () => {
    it('should update existing theme', async () => {
      const created = await themeService.createTheme(defaultTheme);
      await new Promise(resolve => setTimeout(resolve, 1)); // Ensure different timestamps
      const updated = await themeService.updateTheme(created.id, {
        name: 'Updated Theme',
      });
      expect(updated?.name).toBe('Updated Theme');
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should return null when updating non-existent theme', async () => {
      const result = await themeService.updateTheme('non-existent', {
        name: 'Updated Theme',
      });
      expect(result).toBeNull();
    });
  });

  describe('Theme Deletion', () => {
    it('should delete existing theme', async () => {
      const created = await themeService.createTheme(defaultTheme);
      const deleted = await themeService.deleteTheme(created.id);
      expect(deleted).toBe(true);
      const retrieved = await themeService.getThemeById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent theme', async () => {
      const result = await themeService.deleteTheme('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Default Theme', () => {
    it('should set default theme', async () => {
      const created = await themeService.createTheme(defaultTheme);
      const result = await themeService.setDefaultTheme(created.id);
      expect(result).toBe(true);
      const retrievedTheme = await themeService.getDefaultTheme();
      expect(retrievedTheme?.id).toBe(created.id);
      expect(retrievedTheme?.isDefault).toBe(true);
    });

    it('should return false when setting non-existent theme as default', async () => {
      const result = await themeService.setDefaultTheme('non-existent');
      expect(result).toBe(false);
    });

    it('should update previous default theme when setting new default', async () => {
      const first = await themeService.createTheme(defaultTheme);
      await themeService.setDefaultTheme(first.id);

      await new Promise(resolve => setTimeout(resolve, 1)); // Ensure different timestamps
      const second = await themeService.createTheme({
        ...defaultTheme,
        name: 'Second Theme',
      });
      await themeService.setDefaultTheme(second.id);

      const firstTheme = await themeService.getThemeById(first.id);
      const secondTheme = await themeService.getThemeById(second.id);

      expect(firstTheme?.isDefault).toBe(false);
      expect(secondTheme?.isDefault).toBe(true);
    });
  });
});
