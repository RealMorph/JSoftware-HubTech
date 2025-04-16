import { jsx as _jsx } from 'react/jsx-runtime';
import styled from '@emotion/styled';
import { themed, mixins } from '../styled';
const StyledButton = styled.button(props => {
  const { theme, variant = 'primary', size = 'md', fullWidth } = props;
  const t = theme;
  return themed(theme => ({
    ...mixins.text(size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base')(theme),
    ...mixins.padding(size === 'sm' ? '2' : size === 'lg' ? '6' : '4')(theme),
    ...mixins.textColor(variant === 'outline' ? 'primary.500' : 'white')(theme),
    backgroundColor:
      variant === 'primary'
        ? theme.colors.primary[500]
        : variant === 'secondary'
          ? theme.colors.gray[200]
          : 'transparent',
    border: variant === 'outline' ? `1px solid ${theme.colors.primary[500]}` : 'none',
    borderRadius: '0.375rem',
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    '&:hover': {
      backgroundColor:
        variant === 'primary'
          ? theme.colors.primary[600]
          : variant === 'secondary'
            ? theme.colors.gray[300]
            : theme.colors.primary[50],
      borderColor: variant === 'outline' ? theme.colors.primary[600] : 'transparent',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${theme.colors.primary[200]}`,
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }))(t);
});
export const Button = ({ children, ...props }) => {
  return _jsx(StyledButton, { ...props, children: children });
};
