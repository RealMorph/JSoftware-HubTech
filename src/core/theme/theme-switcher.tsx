import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

export function ThemeSwitcher() {
  const { currentTheme, themes, isLoading, error, setTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle theme switching with transition
  const handleThemeChange = (themeId: string) => {
    setIsTransitioning(true);
    setTheme(themeId);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match this with the CSS transition duration
  };

  if (isLoading) {
    return <div>Loading themes...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={`theme-switcher ${isTransitioning ? 'transitioning' : ''}`}>
      <h3>Current Theme: {currentTheme?.name || 'None'}</h3>
      <select
        value={currentTheme?.id || ''}
        onChange={e => handleThemeChange(e.target.value)}
        disabled={isTransitioning}
      >
        <option value="">Select a theme</option>
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>

      {isTransitioning && <div className="theme-transition-indicator">Switching theme...</div>}
    </div>
  );
}
