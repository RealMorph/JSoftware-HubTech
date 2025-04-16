import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useTheme } from './theme-context';
export function ThemeSwitcher() {
  const { currentTheme, availableThemes, isLoading, error, switchTheme } = useTheme();
  if (isLoading) {
    return _jsx('div', { children: 'Loading themes...' });
  }
  if (error) {
    return _jsxs('div', { children: ['Error: ', error.message] });
  }
  return _jsxs('div', {
    children: [
      _jsxs('h3', { children: ['Current Theme: ', currentTheme?.name || 'None'] }),
      _jsxs('select', {
        value: currentTheme?.id || '',
        onChange: e => switchTheme(e.target.value),
        children: [
          _jsx('option', { value: '', children: 'Select a theme' }),
          availableThemes.map(theme =>
            _jsx('option', { value: theme.id, children: theme.name }, theme.id)
          ),
        ],
      }),
    ],
  });
}
