function setNestedCSSVariables(root, prefix, obj) {
  if (!obj || typeof obj !== 'object') return;
  
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object') {
      setNestedCSSVariables(root, `${prefix}-${key}`, value);
    } else {
      root.style.setProperty(`--${prefix}-${key}`, String(value));
    }
  });
}

export function applyTheme(theme) {
  if (!theme || typeof theme !== 'object') return;
  
  const root = document.documentElement;
  
  // Apply colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'object') {
        Object.entries(colorValue).forEach(([shade, value]) => {
          root.style.setProperty(`--color-${colorName}-${shade}`, String(value));
        });
      } else {
        root.style.setProperty(`--color-${colorName}`, String(colorValue));
      }
    });
  }

  // Apply typography
  if (theme.typography) {
    if (theme.typography.scale) {
      Object.entries(theme.typography.scale).forEach(([size, value]) => {
        root.style.setProperty(`--font-size-${size}`, String(value));
      });
    }
    if (theme.typography.weights) {
      Object.entries(theme.typography.weights).forEach(([weight, value]) => {
        root.style.setProperty(`--font-weight-${weight}`, String(value));
      });
    }
    if (theme.typography.lineHeights) {
      Object.entries(theme.typography.lineHeights).forEach(([name, value]) => {
        root.style.setProperty(`--line-height-${name}`, String(value));
      });
    }
    if (theme.typography.letterSpacing) {
      Object.entries(theme.typography.letterSpacing).forEach(([name, value]) => {
        root.style.setProperty(`--letter-spacing-${name}`, String(value));
      });
    }
  }

  // Apply spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([size, value]) => {
      if (size !== 'semantic') {
        root.style.setProperty(`--spacing-${size}`, String(value));
      }
    });
    if (theme.spacing.semantic) {
      setNestedCSSVariables(root, 'spacing-semantic', theme.spacing.semantic);
    }
  }

  // Apply breakpoints
  if (theme.breakpoints) {
    Object.entries(theme.breakpoints).forEach(([name, value]) => {
      if (name !== 'containers') {
        root.style.setProperty(`--breakpoint-${name}`, `${value}px`);
      }
    });
    if (theme.breakpoints.containers) {
      Object.entries(theme.breakpoints.containers).forEach(([name, value]) => {
        root.style.setProperty(`--container-${name}`, String(value));
      });
    }
  }
}
