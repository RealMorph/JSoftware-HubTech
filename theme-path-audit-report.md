# Theme Property Path Audit Report

Generated on: 4/9/2025, 5:19:55 AM

Total issues found: 28

## Issues by File

### src\components\base\TimePicker.tsx

- **Line 174**: Use typography.family instead of typography.fontFamily
  `font-family: ${props => themeValue('typography.fontFamily')(props) ||`
  Should use `typography.family` instead

### src\components\feedback\Modal.tsx

- **Line 219**: Use typography.scale instead of typography.fontSize
  `font-size: ${themeValue('typography.fontSize.lg', '18px')};`
  Should use `typography.scale` instead

### src\core\theme\services\ThemeService.ts

- **Line 292**: Use typography.family instead of typography.fontFamily
  `if (!config.typography.fontFamily.primary) {`
  Should use `typography.family` instead

- **Line 295**: Use typography.scale instead of typography.fontSize
  `if (!config.typography.fontSize.base) {`
  Should use `typography.scale` instead

### src\core\theme\styled.js

- **Line 160**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.md': 'borderRadius.md',`
  Should use `borderRadius` instead

- **Line 161**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.sm': 'borderRadius.sm',`
  Should use `borderRadius` instead

- **Line 162**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.lg': 'borderRadius.lg',`
  Should use `borderRadius` instead

- **Line 163**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.base': 'borderRadius.base',`
  Should use `borderRadius` instead

- **Line 164**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.xl': 'borderRadius.xl',`
  Should use `borderRadius` instead

- **Line 165**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.full': 'borderRadius.full',`
  Should use `borderRadius` instead

- **Line 166**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.borderRadius.none': 'borderRadius.none',`
  Should use `borderRadius` instead

- **Line 168**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.sm': 'shadows.sm',`
  Should use `shadows` instead

- **Line 169**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.base': 'shadows.base',`
  Should use `shadows` instead

- **Line 170**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.md': 'shadows.md',`
  Should use `shadows` instead

- **Line 171**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.lg': 'shadows.lg',`
  Should use `shadows` instead

- **Line 172**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.none': 'shadows.none',`
  Should use `shadows` instead

- **Line 173**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.xl': 'shadows.xl',`
  Should use `shadows` instead

- **Line 174**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.2xl': 'shadows.2xl',`
  Should use `shadows` instead

- **Line 175**: Shadows should be accessed at the root level, not inside colors
  `'colors.shadows.inner': 'shadows.inner',`
  Should use `shadows` instead

- **Line 178**: BorderRadius should be accessed at the root level, not inside colors
  `'borderRadius': 'colors.borderRadius',`
  Should use `borderRadius` instead

- **Line 179**: Shadows should be accessed at the root level, not inside colors
  `'shadows': 'colors.shadows',`
  Should use `shadows` instead

- **Line 182**: Use typography.family instead of typography.fontFamily
  `'typography.fontFamily.primary': 'typography.family.primary',`
  Should use `typography.family` instead

- **Line 183**: Use typography.family instead of typography.fontFamily
  `'typography.fontFamily.secondary': 'typography.family.secondary',`
  Should use `typography.family` instead

- **Line 184**: Use typography.family instead of typography.fontFamily
  `'typography.fontFamily.monospace': 'typography.family.monospace',`
  Should use `typography.family` instead

- **Line 186**: Use typography.scale instead of typography.fontSize
  `'typography.fontSize': 'typography.scale',`
  Should use `typography.scale` instead

- **Line 187**: Use typography.scale instead of typography.fontSize
  `'typography.fontSizes': 'typography.scale',`
  Should use `typography.scale` instead

- **Line 335**: BorderRadius should be accessed at the root level, not inside colors
  `'colors.background.paper', 'shadows.sm', 'colors.borderRadius.md', 'colors.shadows.sm'`
  Should use `borderRadius` instead

- **Line 335**: Shadows should be accessed at the root level, not inside colors
  `'colors.background.paper', 'shadows.sm', 'colors.borderRadius.md', 'colors.shadows.sm'`
  Should use `shadows` instead

## Recommendations

1. Update components to use the correct theme property paths
2. Use the `getThemeValue` function from `src/core/theme/styled.js` which has built-in path correction
3. Prefer direct property access for borderRadius and shadows: `theme.borderRadius.md` instead of `theme.colors.borderRadius.md`
4. Refer to the theme structure documentation for the correct property paths