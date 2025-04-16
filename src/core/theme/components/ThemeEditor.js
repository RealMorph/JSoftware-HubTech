import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import './theme-editor.css';
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};
export const ThemeEditor = ({ theme, onSave, onCancel }) => {
  const [editedTheme, setEditedTheme] = useState({
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
  const handleColorChange = (colorKey, value) => {
    setEditedTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };
  const handleTypographyChange = (category, key, value) => {
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
  const handleSpacingChange = (key, value) => {
    setEditedTheme(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }));
  };
  const handleBreakpointChange = (key, value) => {
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
  return _jsxs('div', {
    className: 'theme-editor',
    'data-testid': 'theme-editor',
    children: [
      _jsxs('div', {
        className: 'theme-editor-header',
        children: [
          _jsx('h2', { children: theme ? 'Edit Theme' : 'Create New Theme' }),
          _jsxs('div', {
            className: 'theme-editor-actions',
            children: [
              _jsx('button', { className: 'save-button', onClick: handleSave, children: 'Save' }),
              _jsx('button', { className: 'cancel-button', onClick: onCancel, children: 'Cancel' }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        className: 'theme-editor-content',
        children: [
          _jsxs('div', {
            className: 'theme-editor-section',
            children: [
              _jsx('h3', { children: 'Basic Information' }),
              _jsxs('div', {
                className: 'form-group',
                children: [
                  _jsx('label', { htmlFor: 'theme-name', children: 'Name' }),
                  _jsx('input', {
                    id: 'theme-name',
                    type: 'text',
                    value: editedTheme.name,
                    onChange: e => setEditedTheme(prev => ({ ...prev, name: e.target.value })),
                  }),
                ],
              }),
              _jsxs('div', {
                className: 'form-group',
                children: [
                  _jsx('label', { htmlFor: 'theme-description', children: 'Description' }),
                  _jsx('textarea', {
                    id: 'theme-description',
                    value: editedTheme.description,
                    onChange: e =>
                      setEditedTheme(prev => ({ ...prev, description: e.target.value })),
                  }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'theme-editor-section',
            children: [
              _jsx('h3', { children: 'Colors' }),
              Object.entries(editedTheme.colors).map(([key, value]) =>
                _jsxs(
                  'div',
                  {
                    className: 'form-group',
                    children: [
                      _jsx('label', { htmlFor: `color-${key}`, children: key }),
                      _jsx('input', {
                        id: `color-${key}`,
                        type: 'color',
                        value: value,
                        onChange: e => handleColorChange(key, e.target.value),
                      }),
                    ],
                  },
                  key
                )
              ),
            ],
          }),
          _jsxs('div', {
            className: 'theme-editor-section',
            children: [
              _jsx('h3', { children: 'Typography' }),
              Object.entries(editedTheme.typography).map(([category, values]) =>
                _jsxs(
                  'div',
                  {
                    className: 'typography-category',
                    children: [
                      _jsx('h4', { children: category }),
                      Object.entries(values).map(([key, value]) =>
                        _jsxs(
                          'div',
                          {
                            className: 'form-group',
                            children: [
                              _jsx('label', {
                                htmlFor: `typography-${category}-${key}`,
                                children: key,
                              }),
                              _jsx('input', {
                                id: `typography-${category}-${key}`,
                                type: 'text',
                                value: value,
                                onChange: e =>
                                  handleTypographyChange(category, key, e.target.value),
                              }),
                            ],
                          },
                          key
                        )
                      ),
                    ],
                  },
                  category
                )
              ),
            ],
          }),
          _jsxs('div', {
            className: 'theme-editor-section',
            children: [
              _jsx('h3', { children: 'Spacing' }),
              Object.entries(editedTheme.spacing).map(([key, value]) =>
                _jsxs(
                  'div',
                  {
                    className: 'form-group',
                    children: [
                      _jsx('label', { htmlFor: `spacing-${key}`, children: key }),
                      _jsx('input', {
                        id: `spacing-${key}`,
                        type: 'text',
                        value: value,
                        onChange: e => handleSpacingChange(key, e.target.value),
                      }),
                    ],
                  },
                  key
                )
              ),
            ],
          }),
          _jsxs('div', {
            className: 'theme-editor-section',
            children: [
              _jsx('h3', { children: 'Breakpoints' }),
              Object.entries(editedTheme.breakpoints).map(([key, value]) =>
                _jsxs(
                  'div',
                  {
                    className: 'form-group',
                    children: [
                      _jsx('label', { htmlFor: `breakpoint-${key}`, children: key }),
                      _jsx('input', {
                        id: `breakpoint-${key}`,
                        type: 'number',
                        value: value,
                        onChange: e => handleBreakpointChange(key, parseInt(e.target.value)),
                      }),
                    ],
                  },
                  key
                )
              ),
            ],
          }),
        ],
      }),
    ],
  });
};
