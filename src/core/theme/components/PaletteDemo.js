import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import {
  generateThemePalette,
  generateSemanticColors,
  generateStateColors,
  getContrastText,
} from '../palette-generator';
import { useTheme } from '../theme-context';
const ColorBlock = ({ color, name, size = 'md' }) => {
  const textColor = getContrastText(color);
  const sizeClasses = {
    sm: { width: '4rem', height: '4rem', fontSize: '0.75rem' },
    md: { width: '6rem', height: '6rem', fontSize: '0.875rem' },
    lg: { width: '8rem', height: '8rem', fontSize: '1rem' },
  };
  const { width, height, fontSize } = sizeClasses[size];
  return _jsxs('div', {
    style: {
      backgroundColor: color,
      color: textColor,
      width,
      height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '0.25rem',
      margin: '0.25rem',
      padding: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      fontSize,
    },
    children: [
      _jsx('div', { children: name }),
      _jsx('div', { style: { fontSize: '0.7em', opacity: 0.8 }, children: color }),
    ],
  });
};
const ColorRow = ({ colors, title }) => {
  return _jsxs('div', {
    style: { marginBottom: '2rem' },
    children: [
      _jsx('h3', { style: { marginBottom: '0.5rem' }, children: title }),
      _jsx('div', {
        style: { display: 'flex', flexWrap: 'wrap' },
        children: Object.entries(colors).map(([name, color]) =>
          _jsx(ColorBlock, { color: color, name: name }, name)
        ),
      }),
    ],
  });
};
const ColorScaleRow = ({ scale, title }) => {
  return _jsxs('div', {
    style: { marginBottom: '2rem' },
    children: [
      _jsx('h3', { style: { marginBottom: '0.5rem' }, children: title }),
      _jsx('div', {
        style: { display: 'flex', flexWrap: 'wrap' },
        children: Object.entries(scale).map(([shade, color]) =>
          _jsx(ColorBlock, { color: color, name: shade, size: 'sm' }, shade)
        ),
      }),
    ],
  });
};
export const PaletteDemo = ({ initialColor = '#3B82F6' }) => {
  const { currentTheme } = useTheme();
  const [baseColor, setBaseColor] = useState(initialColor);
  const palette = generateThemePalette({ primary: baseColor });
  const semanticColors = generateSemanticColors(palette);
  const stateColors = generateStateColors(palette);
  const presetColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
  ];
  const backgroundColor = '#FFFFFF';
  const textColor = '#000000';
  return _jsxs('div', {
    style: {
      fontFamily: 'sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor,
      color: textColor,
    },
    children: [
      _jsx('h1', { style: { marginBottom: '1rem' }, children: 'Color Palette Generator' }),
      _jsx('p', {
        style: { marginBottom: '2rem' },
        children: 'Generate a complete theme color palette from a single base color.',
      }),
      _jsxs('div', {
        style: { marginBottom: '2rem' },
        children: [
          _jsx('label', {
            htmlFor: 'colorInput',
            style: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
            children: 'Base Color:',
          }),
          _jsxs('div', {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              _jsx('input', {
                id: 'colorInput',
                type: 'color',
                value: baseColor,
                onChange: e => setBaseColor(e.target.value),
                style: { marginRight: '1rem', width: '5rem', height: '2.5rem' },
              }),
              _jsx('input', {
                type: 'text',
                value: baseColor,
                onChange: e => setBaseColor(e.target.value),
                style: { marginRight: '1rem', padding: '0.5rem', width: '8rem' },
              }),
              _jsx('div', {
                style: { display: 'flex', gap: '0.5rem' },
                children: presetColors.map(color =>
                  _jsx(
                    'button',
                    {
                      onClick: () => setBaseColor(color.value),
                      style: {
                        backgroundColor: color.value,
                        width: '2rem',
                        height: '2rem',
                        border: color.value === baseColor ? '2px solid black' : '1px solid #ccc',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      },
                      title: color.name,
                    },
                    color.name
                  )
                ),
              }),
            ],
          }),
        ],
      }),
      _jsxs('div', {
        style: { marginBottom: '2rem' },
        children: [
          _jsx('h2', { style: { marginBottom: '1rem' }, children: 'Base Color Palette' }),
          _jsx(ColorScaleRow, { title: 'Primary', scale: palette.primary }),
          _jsx(ColorScaleRow, { title: 'Secondary', scale: palette.secondary }),
          _jsx(ColorScaleRow, { title: 'Accent', scale: palette.accent }),
          _jsx(ColorScaleRow, { title: 'Gray', scale: palette.gray }),
        ],
      }),
      _jsxs('div', {
        style: { marginBottom: '2rem' },
        children: [
          _jsx('h2', { style: { marginBottom: '1rem' }, children: 'Semantic Colors' }),
          _jsx(ColorRow, { title: 'Semantic Colors', colors: semanticColors }),
        ],
      }),
      _jsxs('div', {
        style: { marginBottom: '2rem' },
        children: [
          _jsx('h2', { style: { marginBottom: '1rem' }, children: 'State Colors' }),
          _jsx(ColorRow, { title: 'State Colors', colors: stateColors }),
        ],
      }),
    ],
  });
};
