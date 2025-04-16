import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeConfig } from '../types';
import { ThemeEditor } from './ThemeEditor';
import './theme-manager.css';

export const ThemeManager: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load themes from storage
    const loadThemes = async () => {
      const storedThemes = localStorage.getItem('themes');
      if (storedThemes) {
        const parsedThemes = JSON.parse(storedThemes).map((theme: ThemeConfig) => ({
          ...theme,
          createdAt: new Date(theme.createdAt),
          updatedAt: new Date(theme.updatedAt),
        }));
        setThemes(parsedThemes);
      }
    };
    loadThemes();
  }, []);

  const handleThemeSelect = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
    setTheme(theme);
  };

  const handleThemeEdit = (theme: ThemeConfig) => {
    setSelectedTheme(theme);
    setIsEditing(true);
  };

  const handleThemeDelete = (theme: ThemeConfig) => {
    const updatedThemes = themes.filter(t => t.id !== theme.id);
    setThemes(updatedThemes);
    localStorage.setItem('themes', JSON.stringify(updatedThemes));
    if (selectedTheme?.id === theme.id) {
      setSelectedTheme(null);
    }
  };

  const handleThemeCreate = () => {
    setSelectedTheme(null);
    setIsCreating(true);
  };

  const handleThemeSave = (theme: ThemeConfig) => {
    const updatedThemes = isEditing
      ? themes.map(t => (t.id === theme.id ? theme : t))
      : [...themes, theme];
    setThemes(updatedThemes);
    localStorage.setItem('themes', JSON.stringify(updatedThemes));
    setIsEditing(false);
    setIsCreating(false);
    setSelectedTheme(theme);
  };

  const handleThemeCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedTheme(null);
  };

  return (
    <div className="theme-manager">
      <div className="theme-manager-header">
        <h2>Theme Manager</h2>
        <button
          className="create-theme-button"
          onClick={handleThemeCreate}
          data-testid="create-theme-button"
        >
          Create New Theme
        </button>
      </div>
      <div className="theme-list">
        {themes.map(t => (
          <div
            key={t.id}
            className={`theme-card ${t.id === theme?.id ? 'active' : ''}`}
            data-testid={`theme-card-${t.id}`}
          >
            <div className="theme-card-header">
              <h3>{t.name}</h3>
              <div className="theme-card-actions">
                <button
                  className="preview-button"
                  onClick={() => handleThemeSelect(t)}
                  data-testid={`preview-button-${t.id}`}
                >
                  Preview
                </button>
                <button
                  className="edit-button"
                  onClick={() => handleThemeEdit(t)}
                  data-testid={`edit-button-${t.id}`}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleThemeDelete(t)}
                  data-testid={`delete-button-${t.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
            <p>{t.description}</p>
          </div>
        ))}
      </div>
      {(isEditing || isCreating) && (
        <ThemeEditor
          theme={selectedTheme}
          onSave={handleThemeSave}
          onCancel={handleThemeCancel}
          data-testid="theme-editor"
        />
      )}
    </div>
  );
};
