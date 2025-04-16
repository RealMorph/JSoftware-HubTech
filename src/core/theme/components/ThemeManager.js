import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeEditor } from './ThemeEditor';
import './theme-manager.css';
export const ThemeManager = () => {
  const { theme, setTheme } = useTheme();
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  useEffect(() => {
    const loadThemes = async () => {
      const storedThemes = localStorage.getItem('themes');
      if (storedThemes) {
        const parsedThemes = JSON.parse(storedThemes).map(theme => ({
          ...theme,
          createdAt: new Date(theme.createdAt),
          updatedAt: new Date(theme.updatedAt),
        }));
        setThemes(parsedThemes);
      }
    };
    loadThemes();
  }, []);
  const handleThemeSelect = theme => {
    setSelectedTheme(theme);
    setTheme(theme);
  };
  const handleThemeEdit = theme => {
    setSelectedTheme(theme);
    setIsEditing(true);
  };
  const handleThemeDelete = theme => {
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
  const handleThemeSave = theme => {
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
  return _jsxs('div', {
    className: 'theme-manager',
    children: [
      _jsxs('div', {
        className: 'theme-manager-header',
        children: [
          _jsx('h2', { children: 'Theme Manager' }),
          _jsx('button', {
            className: 'create-theme-button',
            onClick: handleThemeCreate,
            'data-testid': 'create-theme-button',
            children: 'Create New Theme',
          }),
        ],
      }),
      _jsx('div', {
        className: 'theme-list',
        children: themes.map(t =>
          _jsxs(
            'div',
            {
              className: `theme-card ${t.id === theme?.id ? 'active' : ''}`,
              'data-testid': `theme-card-${t.id}`,
              children: [
                _jsxs('div', {
                  className: 'theme-card-header',
                  children: [
                    _jsx('h3', { children: t.name }),
                    _jsxs('div', {
                      className: 'theme-card-actions',
                      children: [
                        _jsx('button', {
                          className: 'preview-button',
                          onClick: () => handleThemeSelect(t),
                          'data-testid': `preview-button-${t.id}`,
                          children: 'Preview',
                        }),
                        _jsx('button', {
                          className: 'edit-button',
                          onClick: () => handleThemeEdit(t),
                          'data-testid': `edit-button-${t.id}`,
                          children: 'Edit',
                        }),
                        _jsx('button', {
                          className: 'delete-button',
                          onClick: () => handleThemeDelete(t),
                          'data-testid': `delete-button-${t.id}`,
                          children: 'Delete',
                        }),
                      ],
                    }),
                  ],
                }),
                _jsx('p', { children: t.description }),
              ],
            },
            t.id
          )
        ),
      }),
      (isEditing || isCreating) &&
        _jsx(ThemeEditor, {
          theme: selectedTheme,
          onSave: handleThemeSave,
          onCancel: handleThemeCancel,
          'data-testid': 'theme-editor',
        }),
    ],
  });
};
