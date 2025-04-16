import { Theme } from '../types';

export interface ThemeDatabase {
  /**
   * Save a new theme to the database
   * @param theme The theme to save
   * @returns Promise that resolves when the theme is saved
   */
  saveTheme(theme: Theme): Promise<Theme>;

  /**
   * Update an existing theme in the database
   * @param id The ID of the theme to update
   * @param theme The partial theme to update
   * @returns Promise that resolves when the theme is updated
   */
  updateTheme(id: string, theme: Partial<Theme>): Promise<Theme>;

  /**
   * Delete a theme from the database
   * @param id The ID of the theme to delete
   * @returns Promise that resolves when the theme is deleted
   */
  deleteTheme(id: string): Promise<void>;

  /**
   * Get a theme by its ID
   * @param id The ID of the theme to retrieve
   * @returns Promise that resolves to the theme, or null if not found
   */
  getThemeById(id: string): Promise<Theme | null>;

  /**
   * Get all themes from the database
   * @returns Promise that resolves to an array of all themes
   */
  getAllThemes(): Promise<Theme[]>;
}
