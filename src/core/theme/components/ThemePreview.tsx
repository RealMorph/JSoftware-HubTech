import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../theme-persistence';
import { applyTheme } from '../theme-system';
import { Button } from './Button';

// Define styles as objects instead of using styled-components
const previewContainerStyles = {
  padding: '1rem',
  borderRadius: '0.5rem',
  border: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  marginBottom: '1rem',
};

interface ThemePreviewProps {
  theme: ThemeConfig;
  onClose: () => void;
  onApply: () => void;
}

export function ThemePreview({ theme, onClose, onApply }: ThemePreviewProps) {
  const [originalTheme, setOriginalTheme] = useState<ThemeConfig | null>(null);

  // Store the original theme and apply the preview theme
  useEffect(() => {
    // Get the current theme from CSS variables
    const currentTheme = getCurrentThemeFromCSS();
    setOriginalTheme(currentTheme);

    // Apply the preview theme
    const themeWithShadows = {
      ...theme,
      shadows: theme.shadows || {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      }
    };
    applyTheme(themeWithShadows);

    // Restore the original theme when component unmounts
    return () => {
      if (originalTheme) {
        const originalWithShadows = {
          ...originalTheme,
          shadows: originalTheme.shadows || {
            none: 'none',
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
          }
        };
        applyTheme(originalWithShadows);
      }
    };
  }, [theme]);

  // Helper function to extract current theme from CSS variables
  const getCurrentThemeFromCSS = (): ThemeConfig => {
    // This is a simplified version - in a real implementation,
    // you would need to extract all CSS variables and reconstruct the theme object
    return {
      id: 'current',
      name: 'Current Theme',
      colors: {} as any,
      typography: {} as any,
      spacing: {} as any,
      breakpoints: {} as any,
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      transitions: {
        duration: {
          fast: '100ms',
          normal: '200ms',
          slow: '300ms',
        },
        timing: {
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          linear: 'linear',
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // Mock data for the theme preview
  const themeData = {
    id: theme.id,
    name: theme.name,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
    borderRadius: theme.borderRadius || {
      none: '0',
      sm: '0.125rem',
      base: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px'
    },
    transitions: theme.transitions || {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      timing: {
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
      }
    },
    createdAt: theme.createdAt,
    updatedAt: theme.updatedAt
  };

  return (
    <div style={previewContainerStyles}>
      <h3>Preview: {themeData.name}</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Button onClick={onApply} variant="primary">
          Apply Theme
        </Button>
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>

      <div className="theme-preview-content">
        <div className="theme-preview-section">
          <h4>Colors</h4>
          <div className="color-palette">
            {Object.entries(themeData.colors).map(([name, value]) => (
              <div key={name} className="color-sample">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: typeof value === 'string' ? value : value[500] }}
                />
                <span className="color-name">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="theme-preview-section">
          <h4>Typography</h4>
          <div className="typography-samples">
            <div
              style={{
                fontSize: themeData.typography.fontSize['4xl'],
                fontWeight: themeData.typography.fontWeight.bold,
                lineHeight: themeData.typography.lineHeight.tight,
              }}
            >
              Heading 1
            </div>
            <div
              style={{
                fontSize: themeData.typography.fontSize.md,
                fontWeight: themeData.typography.fontWeight.normal,
                lineHeight: themeData.typography.lineHeight.normal,
              }}
            >
              Body text
            </div>
            <div
              style={{
                fontSize: themeData.typography.fontSize.sm,
                fontWeight: themeData.typography.fontWeight.medium,
                lineHeight: themeData.typography.lineHeight.loose,
              }}
            >
              Small text
            </div>
          </div>
        </div>

        <div className="theme-preview-section">
          <h4>Components</h4>
          <div className="component-samples">
            <button className="sample-button">Button</button>
            <input className="sample-input" placeholder="Input field" />
            <div className="sample-card">
              <h5>Card Title</h5>
              <p>Card content with some text to demonstrate the theme.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
