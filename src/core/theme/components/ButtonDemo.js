import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import styled from '@emotion/styled';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { Button } from './Button';
import { themed, mixins } from '../styled';
import { useTheme } from '../theme-context';
const DemoContainer = styled.div`
  ${({ theme }) =>
    themed(theme => ({
      ...mixins.padding('8')(theme),
      maxWidth: '800px',
      margin: '0 auto',
    }))(theme)}
`;
const Section = styled.div`
  ${({ theme }) =>
    themed(theme => ({
      ...mixins.margin('6')(theme),
      '& > h2': {
        ...mixins.text('xl')(theme),
        ...mixins.margin('4')(theme),
      },
      '& > div': {
        ...mixins.flex()(theme),
        gap: theme.spacing['4'],
        flexWrap: 'wrap',
      },
    }))(theme)}
`;
export function ButtonDemo() {
  const { currentTheme } = useTheme();
  if (!currentTheme) {
    return _jsx('div', { children: 'Loading theme...' });
  }
  return _jsx(EmotionThemeProvider, {
    theme: currentTheme,
    children: _jsxs(DemoContainer, {
      children: [
        _jsx('h1', { children: 'Button Component Demo' }),
        _jsxs(Section, {
          children: [
            _jsx('h2', { children: 'Button Variants' }),
            _jsxs('div', {
              children: [
                _jsx(Button, { variant: 'primary', children: 'Primary Button' }),
                _jsx(Button, { variant: 'secondary', children: 'Secondary Button' }),
                _jsx(Button, { variant: 'outline', children: 'Outline Button' }),
              ],
            }),
          ],
        }),
        _jsxs(Section, {
          children: [
            _jsx('h2', { children: 'Button Sizes' }),
            _jsxs('div', {
              children: [
                _jsx(Button, { size: 'sm', children: 'Small Button' }),
                _jsx(Button, { size: 'md', children: 'Medium Button' }),
                _jsx(Button, { size: 'lg', children: 'Large Button' }),
              ],
            }),
          ],
        }),
        _jsxs(Section, {
          children: [
            _jsx('h2', { children: 'Full Width Buttons' }),
            _jsxs('div', {
              style: { width: '100%' },
              children: [
                _jsx(Button, { fullWidth: true, children: 'Full Width Button' }),
                _jsx(Button, {
                  fullWidth: true,
                  variant: 'secondary',
                  children: 'Full Width Secondary',
                }),
                _jsx(Button, {
                  fullWidth: true,
                  variant: 'outline',
                  children: 'Full Width Outline',
                }),
              ],
            }),
          ],
        }),
        _jsxs(Section, {
          children: [
            _jsx('h2', { children: 'Disabled State' }),
            _jsxs('div', {
              children: [
                _jsx(Button, { disabled: true, children: 'Disabled Primary' }),
                _jsx(Button, {
                  disabled: true,
                  variant: 'secondary',
                  children: 'Disabled Secondary',
                }),
                _jsx(Button, { disabled: true, variant: 'outline', children: 'Disabled Outline' }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
