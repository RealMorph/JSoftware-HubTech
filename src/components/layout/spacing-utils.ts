/**
 * Helper function to get spacing values from theme or direct CSS values
 * @param value The spacing value (theme key or direct CSS)
 * @param themeGetSpacing The theme's getSpacing function
 * @param defaultValue Default value to use if value is undefined
 * @returns Properly formatted spacing value
 */
export const getSpacingValue = (
  value: number | string | undefined,
  themeGetSpacing: (key: string, fallback?: string) => string,
  defaultValue: string = '0'
): string => {
  if (value === undefined) return defaultValue;

  if (typeof value === 'number') {
    return `${value}px`;
  }

  if (typeof value === 'string') {
    // Check if value is a theme spacing key (like 'md', 'lg', etc.)
    // Use the value itself as the fallback to ensure it's always returned correctly
    // This allows values like '10px', '1rem', etc. to be used directly
    const result = themeGetSpacing(value, value);
    return result || value || defaultValue;
  }

  return defaultValue;
};
