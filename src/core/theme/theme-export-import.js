export function exportTheme(theme, filename) {
  const exportData = {
    ...theme,
    id: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    isDefault: undefined,
  };
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
export function importTheme(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        if (!event.target?.result) {
          throw new Error('Failed to read file');
        }
        const themeData = JSON.parse(event.target.result);
        if (!isValidThemeData(themeData)) {
          throw new Error('Invalid theme data format');
        }
        const importedTheme = {
          ...themeData,
          id: generateThemeId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
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
function isValidThemeData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  if (!data.name || typeof data.name !== 'string') {
    return false;
  }
  if (!data.colors || typeof data.colors !== 'object') {
    return false;
  }
  if (!data.typography || typeof data.typography !== 'object') {
    return false;
  }
  if (!data.spacing || typeof data.spacing !== 'object') {
    return false;
  }
  if (!data.breakpoints || typeof data.breakpoints !== 'object') {
    return false;
  }
  return true;
}
function generateThemeId() {
  return `theme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
