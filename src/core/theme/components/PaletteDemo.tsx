import React, { useState } from 'react';
import {
  generateThemePalette,
  generateSemanticColors,
  generateStateColors,
  getContrastText,
  ColorScale,
} from '../palette-generator';

interface ColorBlockProps {
  color: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const ColorBlock: React.FC<ColorBlockProps> = ({ color, name, size = 'md' }) => {
  const textColor = getContrastText(color);

  const sizeClasses = {
    sm: { width: '4rem', height: '4rem', fontSize: '0.75rem' },
    md: { width: '6rem', height: '6rem', fontSize: '0.875rem' },
    lg: { width: '8rem', height: '8rem', fontSize: '1rem' },
  };

  const { width, height, fontSize } = sizeClasses[size];

  return (
    <div
      style={{
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
      }}
    >
      <div>{name}</div>
      <div style={{ fontSize: '0.7em', opacity: 0.8 }}>{color}</div>
    </div>
  );
};

interface ColorRowProps {
  colors: Record<string, string>;
  title: string;
}

const ColorRow: React.FC<ColorRowProps> = ({ colors, title }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Object.entries(colors).map(([name, color]) => (
          <ColorBlock key={name} color={color} name={name} />
        ))}
      </div>
    </div>
  );
};

interface ColorScaleRowProps {
  scale: ColorScale;
  title: string;
}

const ColorScaleRow: React.FC<ColorScaleRowProps> = ({ scale, title }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {Object.entries(scale).map(([shade, color]) => (
          <ColorBlock key={shade} color={color as string} name={shade} size="sm" />
        ))}
      </div>
    </div>
  );
};

interface PaletteDemoProps {
  initialColor?: string;
}

export const PaletteDemo: React.FC<PaletteDemoProps> = ({ initialColor = '#3B82F6' }) => {
  const [baseColor, setBaseColor] = useState(initialColor);

  // Generate a palette from the base color
  const palette = generateThemePalette({ primary: baseColor });
  const semanticColors = generateSemanticColors(palette);
  const stateColors = generateStateColors(palette);

  // Predefined colors for quick selection
  const presetColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
  ];

  // Use default colors for background and text
  const backgroundColor = '#FFFFFF';
  const textColor = '#000000';

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        backgroundColor,
        color: textColor,
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>Color Palette Generator</h1>
      <p style={{ marginBottom: '2rem' }}>
        Generate a complete theme color palette from a single base color.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <label
          htmlFor="colorInput"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}
        >
          Base Color:
        </label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            id="colorInput"
            type="color"
            value={baseColor}
            onChange={e => setBaseColor(e.target.value)}
            style={{ marginRight: '1rem', width: '5rem', height: '2.5rem' }}
          />
          <input
            type="text"
            value={baseColor}
            onChange={e => setBaseColor(e.target.value)}
            style={{ marginRight: '1rem', padding: '0.5rem', width: '8rem' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {presetColors.map(color => (
              <button
                key={color.name}
                onClick={() => setBaseColor(color.value)}
                style={{
                  backgroundColor: color.value,
                  width: '2rem',
                  height: '2rem',
                  border: color.value === baseColor ? '2px solid black' : '1px solid #ccc',
                  borderRadius: '50%',
                  cursor: 'pointer',
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Base Color Palette</h2>
        <ColorScaleRow title="Primary" scale={palette.primary} />
        <ColorScaleRow title="Secondary" scale={palette.secondary} />
        <ColorScaleRow title="Accent" scale={palette.accent} />
        <ColorScaleRow title="Gray" scale={palette.gray} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Semantic Colors</h2>
        <ColorRow title="Semantic Colors" colors={semanticColors} />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>State Colors</h2>
        <ColorRow title="State Colors" colors={stateColors} />
      </div>
    </div>
  );
};
