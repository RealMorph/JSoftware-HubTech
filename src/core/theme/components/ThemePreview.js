import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { applyTheme } from '../theme-system';
export function ThemePreview({ theme, onClose, onApply }) {
  const [originalTheme, setOriginalTheme] = useState(null);
  useEffect(() => {
    const currentTheme = getCurrentThemeFromCSS();
    setOriginalTheme(currentTheme);
    applyTheme(theme);
    return () => {
      if (originalTheme) {
        applyTheme(originalTheme);
      }
    };
  }, [theme]);
  const getCurrentThemeFromCSS = () => {
    return {
      id: 'current',
      name: 'Current Theme',
      colors: {},
      typography: {},
      spacing: {},
      breakpoints: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  return _jsxs('div', {
    className: 'theme-preview-container',
    children: [
      _jsxs('div', {
        className: 'theme-preview-header',
        children: [
          _jsxs('h3', { children: ['Preview: ', theme.name] }),
          _jsxs('div', {
            className: 'theme-preview-actions',
            children: [
              _jsx('button', {
                onClick: onApply,
                className: 'apply-button',
                children: 'Apply Theme',
              }),
              _jsx('button', { onClick: onClose, className: 'cancel-button', children: 'Cancel' }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        className: 'theme-preview-content',
        children: [
          _jsxs('div', {
            className: 'theme-preview-section',
            children: [
              _jsx('h4', { children: 'Colors' }),
              _jsx('div', {
                className: 'color-palette',
                children: Object.entries(theme.colors).map(([name, value]) =>
                  _jsxs(
                    'div',
                    {
                      className: 'color-sample',
                      children: [
                        _jsx('div', {
                          className: 'color-swatch',
                          style: {
                            backgroundColor: typeof value === 'string' ? value : value[500],
                          },
                        }),
                        _jsx('span', { className: 'color-name', children: name }),
                      ],
                    },
                    name
                  )
                ),
              }),
            ],
          }),
          _jsxs('div', {
            className: 'theme-preview-section',
            children: [
              _jsx('h4', { children: 'Typography' }),
              _jsxs('div', {
                className: 'typography-samples',
                children: [
                  _jsx('div', {
                    style: {
                      fontSize: theme.typography.scale['4xl'],
                      fontWeight: theme.typography.weights.bold,
                      lineHeight: theme.typography.lineHeights.tight,
                    },
                    children: 'Heading 1',
                  }),
                  _jsx('div', {
                    style: {
                      fontSize: theme.typography.scale.base,
                      fontWeight: theme.typography.weights.normal,
                      lineHeight: theme.typography.lineHeights.normal,
                    },
                    children: 'Body text',
                  }),
                  _jsx('div', {
                    style: {
                      fontSize: theme.typography.scale.sm,
                      fontWeight: theme.typography.weights.medium,
                      lineHeight: theme.typography.lineHeights.loose,
                    },
                    children: 'Small text',
                  }),
                ],
              }),
            ],
          }),
          _jsxs('div', {
            className: 'theme-preview-section',
            children: [
              _jsx('h4', { children: 'Components' }),
              _jsxs('div', {
                className: 'component-samples',
                children: [
                  _jsx('button', { className: 'sample-button', children: 'Button' }),
                  _jsx('input', { className: 'sample-input', placeholder: 'Input field' }),
                  _jsxs('div', {
                    className: 'sample-card',
                    children: [
                      _jsx('h5', { children: 'Card Title' }),
                      _jsx('p', {
                        children: 'Card content with some text to demonstrate the theme.',
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
