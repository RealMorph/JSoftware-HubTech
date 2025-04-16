# Color Palette Generator

The Color Palette Generator is a utility that allows for dynamic creation of complete color palettes based on a single base color. This makes it easy to create and customize themes for your application.

## Features

- Generate a complete color palette from a single base color
- Create consistent and accessible color scales
- Automatically generate semantic and state colors
- Calculate contrast colors for text
- Utility functions for color manipulation (lighten, darken, etc.)

## Usage

### Basic Usage

```tsx
import { generateThemePalette, generateSemanticColors } from '@/core/theme';

// Generate a palette from a base color
const palette = generateThemePalette({ 
  primary: '#3B82F6' // Blue
});

// Generate semantic colors from the palette
const semanticColors = generateSemanticColors(palette);
```

### Palette Structure

The generated palette includes multiple color scales:

- **Primary**: Based on the provided base color
- **Secondary**: Complementary color scale
- **Accent**: Accent color scale for highlights
- **Gray**: Neutral gray scale for backgrounds, borders, etc.

Each scale contains multiple shades (50-900) for different usage contexts.

### Semantic Colors

Semantic colors are derived from the palette and provide consistent colors for common UI elements:

- **text**: Primary text color
- **background**: Page background color
- **primary**: Primary brand color
- **secondary**: Secondary brand color
- **accent**: Accent color for highlights
- **muted**: Muted color for less important elements

### State Colors

State colors are used to indicate different states in the UI:

- **info**: Information state
- **success**: Success state
- **warning**: Warning state
- **error**: Error state

## Demo Component

The `PaletteDemo` component provides an interactive way to explore and visualize color palettes:

```tsx
import { PaletteDemo } from '@/core/theme';

function App() {
  return (
    <div>
      <h1>Theme Color Palette</h1>
      <PaletteDemo initialColor="#3B82F6" />
    </div>
  );
}
```

## API Reference

### Color Conversion

- **rgbToHex(r, g, b)**: Convert RGB values to hex string
- **hexToRgb(hex)**: Convert hex string to RGB object
- **hslToRgb(h, s, l)**: Convert HSL values to RGB object
- **rgbToHsl(r, g, b)**: Convert RGB values to HSL object

### Color Manipulation

- **lightenColor(color, amount)**: Lighten a color by a percentage
- **darkenColor(color, amount)**: Darken a color by a percentage
- **getContrastText(backgroundColor)**: Get appropriate text color (black/white) for a background

### Palette Generation

- **generateColorScale(baseColor)**: Generate a color scale from a base color
- **generateThemePalette(options)**: Generate a complete theme palette
- **generateSemanticColors(palette)**: Generate semantic colors from a palette
- **generateStateColors(palette)**: Generate state colors from a palette

## Implementation Details

The palette generator uses HSL color space for manipulations, which provides more intuitive control over lightness and saturation than RGB. For the generated scales, the base color is placed at the 500 position, with lighter variants going down to 50 and darker variants up to 900.

The contrast ratio calculation follows the WCAG 2.0 guidelines to ensure text remains readable on any background color.

## Customization

You can customize the palette generation by providing your own base colors:

```tsx
const customPalette = generateThemePalette({
  primary: '#FF0000', // Red
  secondary: '#00FF00', // Green (optional)
  accent: '#0000FF', // Blue (optional)
});
```

If you only provide the primary color, the secondary and accent colors will be automatically generated as complementary colors. 