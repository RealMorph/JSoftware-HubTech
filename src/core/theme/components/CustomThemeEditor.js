import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { applyTheme } from '../theme-system';
export function CustomThemeEditor({ onSave, onCancel, initialTheme }) {
  const [theme, setTheme] = useState(() => {
    if (initialTheme) {
      return initialTheme;
    }
    return {
      id: '',
      name: 'Custom Theme',
      description: 'A custom theme created by the user',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        surface: '#F3F4F6',
        text: '#1F2937',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
      },
      typography: {
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
          sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
          mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
        48: '12rem',
        56: '14rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
        semantic: {
          layout: {
            page: '2rem',
            section: '1.5rem',
            container: '1rem',
          },
          component: {
            padding: '1rem',
            margin: '1rem',
            gap: '0.5rem',
          },
        },
      },
      breakpoints: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
        containers: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  const [previewTheme, setPreviewTheme] = useState(null);
  useEffect(() => {
    const preview = {
      ...theme,
      id: 'preview',
      name: `${theme.name} (Preview)`,
      isDefault: false,
    };
    setPreviewTheme(preview);
    applyTheme(preview);
  }, [theme]);
  const handleColorChange = (colorName, value) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorName]: value,
      },
    }));
  };
  const handleNameChange = value => {
    setTheme(prev => ({
      ...prev,
      name: value,
    }));
  };
  const handleDescriptionChange = value => {
    setTheme(prev => ({
      ...prev,
      description: value,
    }));
  };
  const handleSave = () => {
    onSave(theme);
  };
  return _jsxs('div', {
    className: 'custom-theme-editor',
    children: [
      _jsxs('div', {
        className: 'editor-header',
        children: [
          _jsx('h2', { children: 'Custom Theme Editor' }),
          _jsxs('div', {
            className: 'editor-actions',
            children: [
              _jsx('button', {
                onClick: handleSave,
                className: 'save-button',
                children: 'Save Theme',
              }),
              _jsx('button', { onClick: onCancel, className: 'cancel-button', children: 'Cancel' }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        className: 'editor-content',
        children: [
          _jsxs('div', {
            className: 'theme-info',
            children: [
              _jsxs('div', {
                className: 'form-group',
                children: [
                  _jsx('label', { htmlFor: 'theme-name', children: 'Theme Name' }),
                  _jsx('input', {
                    id: 'theme-name',
                    type: 'text',
                    value: theme.name,
                    onChange: e => handleNameChange(e.target.value),
                  }),
                ],
              }),
              _jsxs('div', {
                className: 'form-group',
                children: [
                  _jsx('label', { htmlFor: 'theme-description', children: 'Description' }),
                  _jsx('textarea', {
                    id: 'theme-description',
                    value: theme.description,
                    onChange: e => handleDescriptionChange(e.target.value),
                  }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'color-editor',
            children: [
              _jsx('h3', { children: 'Colors' }),
              _jsx('div', {
                className: 'color-grid',
                children: Object.entries(theme.colors).map(([name, value]) =>
                  _jsxs(
                    'div',
                    {
                      className: 'color-input',
                      children: [
                        _jsx('label', { htmlFor: `color-${name}`, children: name }),
                        _jsxs('div', {
                          className: 'color-picker',
                          children: [
                            _jsx('input', {
                              id: `color-${name}`,
                              type: 'color',
                              value: value,
                              onChange: e => handleColorChange(name, e.target.value),
                            }),
                            _jsx('input', {
                              type: 'text',
                              value: value,
                              onChange: e => handleColorChange(name, e.target.value),
                            }),
                          ],
                        }),
                      ],
                    },
                    name
                  )
                ),
              }),
            ],
          }),
          _jsxs('div', {
            className: 'theme-preview',
            children: [
              _jsx('h3', { children: 'Preview' }),
              _jsxs('div', {
                className: 'preview-content',
                children: [
                  _jsxs('div', {
                    className: 'preview-section',
                    children: [
                      _jsx('h4', { children: 'Sample Text' }),
                      _jsx('p', {
                        style: { color: 'var(--color-text)' },
                        children: 'This is a sample text to preview the theme colors.',
                      }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'preview-section',
                    children: [
                      _jsx('h4', { children: 'Sample Button' }),
                      _jsx('button', {
                        style: {
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '0.25rem',
                        },
                        children: 'Sample Button',
                      }),
                    ],
                  }),
                  _jsxs('div', {
                    className: 'preview-section',
                    children: [
                      _jsx('h4', { children: 'Sample Card' }),
                      _jsxs('div', {
                        style: {
                          backgroundColor: 'var(--color-surface)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--color-border)',
                        },
                        children: [
                          _jsx('h5', {
                            style: { color: 'var(--color-text)' },
                            children: 'Card Title',
                          }),
                          _jsx('p', {
                            style: { color: 'var(--color-text-secondary)' },
                            children: 'This is a sample card to preview the theme.',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
