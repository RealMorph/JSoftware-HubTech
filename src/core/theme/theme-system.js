function setNestedCSSVariables(root, prefix, obj) {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object') {
      setNestedCSSVariables(root, `${prefix}-${key}`, value);
    } else {
      root.style.setProperty(`--${prefix}-${key}`, String(value));
    }
  });
}
export function applyTheme(theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
    if (typeof colorValue === 'object') {
      Object.entries(colorValue).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, String(value));
      });
    }
  });
  Object.entries(theme.typography.scale).forEach(([size, value]) => {
    root.style.setProperty(`--font-size-${size}`, String(value));
  });
  Object.entries(theme.typography.weights).forEach(([weight, value]) => {
    root.style.setProperty(`--font-weight-${weight}`, String(value));
  });
  Object.entries(theme.typography.lineHeights).forEach(([name, value]) => {
    root.style.setProperty(`--line-height-${name}`, String(value));
  });
  Object.entries(theme.typography.letterSpacing).forEach(([name, value]) => {
    root.style.setProperty(`--letter-spacing-${name}`, String(value));
  });
  Object.entries(theme.spacing).forEach(([size, value]) => {
    if (size !== 'semantic') {
      root.style.setProperty(`--spacing-${size}`, String(value));
    }
  });
  setNestedCSSVariables(root, 'spacing-semantic', theme.spacing.semantic);
  Object.entries(theme.breakpoints).forEach(([name, value]) => {
    if (name !== 'containers') {
      root.style.setProperty(`--breakpoint-${name}`, `${value}px`);
    }
  });
  Object.entries(theme.breakpoints.containers).forEach(([name, value]) => {
    root.style.setProperty(`--container-${name}`, String(value));
  });
}
