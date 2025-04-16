import { ThemeConfig } from './theme-persistence';

/**
 * Exports a theme to a JSON file
 * @param theme The theme to export
 * @param filename Optional filename (defaults to theme name)
 */
export function exportTheme(theme: ThemeConfig, filename?: string): void {
  // Create a clean copy of the theme without internal properties
  const exportData = {
    ...theme,
    id: undefined, // Remove internal ID
    createdAt: undefined,
    updatedAt: undefined,
    isDefault: undefined,
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create a blob and download link
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports a theme from a JSON file
 * @param file The file to import
 * @returns Promise that resolves to the imported theme
 */
export function importTheme(file: File): Promise<ThemeConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }

        // Parse the JSON
        const themeData = JSON.parse(event.target.result as string);

        // Validate the theme data
        if (!isValidThemeData(themeData)) {
          throw new Error('Invalid theme data format');
        }

        // Create a new theme with required properties
        // We'll use type assertion here since we've validated the data
        const importedTheme = {
          ...themeData,
          id: generateThemeId(), // Generate a new ID
          createdAt: new Date(),
          updatedAt: new Date(),
        } as ThemeConfig;

        resolve(importedTheme);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Validates that the imported data has the required theme properties
 * @param data The data to validate
 * @returns Whether the data is a valid theme
 */
function isValidThemeData(data: any): boolean {
  // Check for required properties
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for name
  if (!data.name || typeof data.name !== 'string') {
    return false;
  }

  // Check for colors
  if (!data.colors || typeof data.colors !== 'object') {
    return false;
  }

  // Check for typography
  if (!data.typography || typeof data.typography !== 'object') {
    return false;
  }

  // Check for spacing
  if (!data.spacing || typeof data.spacing !== 'object') {
    return false;
  }

  // Check for breakpoints
  if (!data.breakpoints || typeof data.breakpoints !== 'object') {
    return false;
  }

  return true;
}

/**
 * Generates a unique ID for a theme
 * @returns A unique theme ID
 */
function generateThemeId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
