import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';
import './theme-editor.css';

interface ThemeEditorProps {
  theme: ThemeConfig | null;
  onSave: (theme: ThemeConfig) => void;
  onCancel: () => void;
}

// Fallback for environments where crypto.randomUUID is not available
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onSave, onCancel }) => {
  const [editedTheme, setEditedTheme] = useState<ThemeConfig>({
    id: theme?.id || generateId(),
    name: theme?.name || '',
    description: theme?.description || '',
    colors: theme?.colors || {
      primary: '#000000',
      secondary: '#ffffff',
      accent: '#ff0000',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#000000',
      error: '#ff0000',
      warning: '#ffff00',
      success: '#00ff00',
      info: '#0000ff',
    },
    typography: theme?.typography || {
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      family: {
        sans: 'system-ui, -apple-system, sans-serif',
        serif: 'Georgia, serif',
        mono: 'monospace',
      },
    },
    spacing: theme?.spacing || {
      component: {
        padding: '1rem',
        margin: '1rem',
        gap: '0.5rem',
      },
      layout: {
        padding: '2rem',
        margin: '2rem',
        gap: '1rem',
      },
      section: {
        padding: '4rem',
        margin: '4rem',
        gap: '2rem',
      },
      container: {
        padding: '1rem',
        margin: '0 auto',
        maxWidth: '1280px',
      },
    },
    breakpoints: theme?.breakpoints || {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    isDefault: theme?.isDefault || false,
    createdAt: theme?.createdAt || new Date(),
    updatedAt: new Date(),
  });

  const handleColorChange = (colorKey: keyof typeof editedTheme.colors, value: string) => {
    setEditedTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const handleTypographyChange = (
    category: keyof typeof editedTheme.typography,
    key: string,
    value: string
  ) => {
    setEditedTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [category]: {
          ...prev.typography[category],
          [key]: value,
        },
      },
    }));
  };

  const handleSpacingChange = (key: string, value: string) => {
    setEditedTheme(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };

  const handleBreakpointChange = (key: string, value: number) => {
    setEditedTheme(prev => ({
      ...prev,
      breakpoints: {
        ...prev.breakpoints,
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(editedTheme);
  };

  return (
    <div className="theme-editor" data-testid="theme-editor">
      <div className="theme-editor-header">
        <h2>{theme ? 'Edit Theme' : 'Create New Theme'}</h2>
        <div className="theme-editor-actions">
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <div className="theme-editor-content">
        <div className="theme-editor-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="theme-name">Name</label>
            <input
              id="theme-name"
              type="text"
              value={editedTheme.name}
              onChange={e => setEditedTheme(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="theme-description">Description</label>
            <textarea
              id="theme-description"
              value={editedTheme.description}
              onChange={e => setEditedTheme(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="theme-editor-section">
          <h3>Colors</h3>
          {Object.entries(editedTheme.colors).map(([key, value]) => (
            <div key={key} className="form-group">
              <label htmlFor={`color-${key}`}>{key}</label>
              <input
                id={`color-${key}`}
                type="color"
                value={value}
                onChange={e =>
                  handleColorChange(key as keyof typeof editedTheme.colors, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className="theme-editor-section">
          <h3>Typography</h3>
          {Object.entries(editedTheme.typography).map(([category, values]) => (
            <div key={category} className="typography-category">
              <h4>{category}</h4>
              {Object.entries(values).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label htmlFor={`typography-${category}-${key}`}>{key}</label>
                  <input
                    id={`typography-${category}-${key}`}
                    type="text"
                    value={value}
                    onChange={e =>
                      handleTypographyChange(
                        category as keyof typeof editedTheme.typography,
                        key,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="theme-editor-section">
          <h3>Spacing</h3>
          {Object.entries(editedTheme.spacing).map(([key, value]) => (
            <div key={key} className="form-group">
              <label htmlFor={`spacing-${key}`}>{key}</label>
              <input
                id={`spacing-${key}`}
                type="text"
                value={value}
                onChange={e => handleSpacingChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="theme-editor-section">
          <h3>Breakpoints</h3>
          {Object.entries(editedTheme.breakpoints).map(([key, value]) => (
            <div key={key} className="form-group">
              <label htmlFor={`breakpoint-${key}`}>{key}</label>
              <input
                id={`breakpoint-${key}`}
                type="number"
                value={value}
                onChange={e => handleBreakpointChange(key, parseInt(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
